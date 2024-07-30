---
layout: post
title:  "Tworzymy własny bundler typów"
description: "Krótki poradnik, jak stworzyć narzędzie, które bundle'uje TS-owe deklaracj typów."
author: Comandeer
date: 2022-10-29T19:00:00+0200
tags:
    - javascript
    - eksperymenty
comments: true
permalink: /tworzymy-wlasny-bundler-typow.html
---

Nieco ponad rok temu opisałem [proces tworzenia prymitywnego bundlera](https://blog.comandeer.pl/tworzymy-wlasny-bundler.html). Nie tak dawno zacząłem się zastanawiać, czy dałoby się go w prosty sposób dostosować do bundle'owania plików z [definicjami typów TS-a](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html). A że to wciąż jest [faktyczny problem](https://github.com/Microsoft/TypeScript/issues/4433#issuecomment-1183981387), postanowiłem to sprawdzić.<!--more-->

## Teoria

W teorii pliki `.d.ts` wyglądają bardzo podobnie do zwykłych modułów ES. Definicje typów są podzielone na pliki, które odzwierciedlają podział plików źródłowych aplikacji. Dla przykładu, jeśli mamy takie pliki z kodem:

```
src/
|- index.ts
|- tools.ts
|- SomeClass.ts
```

to TS wygeneruje nam takie pliki z definicjami typów:

```
types/
|- index.d.ts
|- tools.d.ts
|- SomeClass.d.ts
```

Jeśli przyjrzymy się [losowemu plikowi `.d.ts`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/lodash/assignWith.d.ts) (ten jest akurat dla [lodashowej funkcji `assignWith()`](https://lodash.com/docs/4.17.15#assignWith)), zauważymy znajomą składnię importów i eksportów. Więc z perspektywy bundlera zmienia się na dobrą sprawę głównie rozszerzenie pliku i pojawia się nieco inna składnia (TS zamiast czystego JS-a). Niemniej zdecydowana większość logiki bundlera powinna być możliwa do ponownego użycia bez żadnych zmian.

## Przykład

Stwórzmy sobie więc przykład, który będziemy chcieli bundle'ować. Składać się on będzie z trzech plików:

* `index.d.ts`,
* `Fixture.d.ts`,
* `Test.d.ts`.

Główny plik, `index.d.ts`, będzie eksportował wszystkie pozostałe typy:

```typescript
import { Test } from   './Test'; // 1

export { Test }; // 2
export { Fixture } from   './Fixture'; // 3
```

Żeby było ciekawie, zastosowałem tutaj dwie metody eksportu – import (1) a następnie eksport (2) oraz eksport połączony z importem (3).

Plik `Fixture.d.ts` zawiera interfejs `Fixture`:

```typescript
interface Fixture { // 1
	name: string;
	path: string;
}

export { Fixture }; // 2
```

Najpierw definiuje on interfejs (1) a następnie go eksportuje (2).

Z kolei plik `Test.d.ts` eksportuje interfejs `Test`:

```typescript
import { Fixture } from './Fixture'; // 2

export interface Test { // 3
	readonly name: string;
	createFixture( name: string ): Fixture; // 1
}
```

Wykorzystuje on interfejs `Fixture` (1), który importuje z pliku `Fixture.d.ts` (2). Natomiast eksport jest tutaj bezpośrednio połączony z deklaracją interfejsu (3).

Spróbujmy zatem zbundle'ować te trzy pliki razem!

## Obsługa składni TypeScriptu

[Babel](https://babeljs.io/) jest parserem JS-a, więc nie ma wbudowanej obsługi składni TS-a. Niemniej istnieje [oficjalny plugin](https://babeljs.io/docs/en/babel-plugin-transform-typescript), który taką obsługę dodaje. Wystarczy go zainstalować:

```shell
npm i @babel/plugin-transform-typescript
```

a następnie dołączyć do naszego parsera w bundlerze:

```javascript
function processModule( path, isMain = false ) {
    […]

	const ast = parse( code, {
		sourceType: 'module',
		plugins: [ // 1
			[
				'typescript', // 2
				{
					dts: true // 3
				}
			]
		]
	} );

    […]
}
```

Do parsera dodajemy opcję `plugins` (1), która pobiera tablicę pluginów  wraz z opcjami dla nich. Dodajemy do niej plugin `typescript` (2) wraz z [opcją `dts`](https://babeljs.io/docs/en/babel-plugin-transform-typescript#dts) ustawioną na `true` (3), która pozwala na parsowanie właśnie plików `.d.ts`.

Yay, nasz bundler JS-a właśnie stał się bundlerem plików `.d.ts`!

## Ścieżki do plików bez rozszerzeń

I choć nasz bundler już w teorii powinien radzić sobie z plikami `.d.ts`, to TS ma kilka przypadłości składniowych, które uniemożliwiają mu sensowne działanie. Jedną z nich jest omijanie rozszerzeń plików w importach, np:

```typescript
import { Fixture } from './Fixture';
```

Tak naprawdę import odbywa się z pliku `Fixture.d.ts`, nie zaś – `Fixture`. Musimy wziąć na to poprawkę i przygotować prostą funkcję, która będzie nam zamieniać ścieżki z importów na poprawne ścieżki do plików:

```javascript
function createFilePath( importSpecifier ) {
	if ( !importSpecifier.endsWith( '.d.ts' ) ) { // 1
		return `${ importSpecifier }.d.ts`; // 2
	}

	return importSpecifier; // 3
}
```

Sprawdzamy, czy ścieżka kończy się rozszerzeniem `.d.ts` (1) i jeśli nie, to po prostu je dodajemy i zwracamy tak zmodyfikowaną ścieżką (2). W innym wypadku zwracamy oryginalną ścieżkę (3).

Teraz wypada dodać tę zmianę do kodu bundlera. Należy podmienić [dwie linijki odpowiadające za wczytanie importowanego pliku](https://github.com/Comandeer/simple-bundler-example/blob/e906ab8821934ab384e0731a70043d53954dac7f/index.js#L40-L41) na poniższy kod:

```javascript
const importRelativePath = createFilePath( node.source.value );
const depPath = resolvePath( dir, importRelativePath );

modules.push( ...processModule( depPath ) );
```

A że tę logikę będziemy wykorzystywać też w innym miejscu ([spoilers…](https://www.youtube.com/watch?v=vQTp8Ozj1JQ)), to wyciągnijmy sobie ją od razu do osobnej funkcji, `processImport()`:

```javascript
function processImport( node, dir, modules ) {
	const importRelativePath = createFilePath( node.source.value );
	const depPath = resolvePath( dir, importRelativePath );

	modules.push( ...processModule( depPath ) );
}
```

Przekazywane parametry to:

* `node` – czyli węzeł AST z importem,
* `dir` – katalog pliku importującego (wzięty z funkcji `processModule()`),
* `modules` – tablica modułów (wzięta z funkcji `processModule()`).

## Lepsza obsługa eksportów

Pliki z definicjami typów raczej eksportują typy, więc byłoby miło, gdyby nasz bundler nie wycinał eksportów – ale tylko w głównym pliku (czyli tym, od którego zaczynamy bundle'owanie), bo inaczej dostaniemy niepoprawny składniowo plik, np:

```typescript
export interface Test {
	[…]
}

export { Test };
```

Potrzebujemy więc sposobu, aby rozpoznawać, czy aktualnie obsługiwany plik jest tym głównym, czy nie. W tym celu wystarczy dodać parametr `isMain` do `processModule()`:

```javascript
function processModule( path, isMain = false ) {
	[…]
}
```

W chwili, gdy będziemy zaczynać całe bundle'owanie, ustawimy go na `true`, a we wszystkich innych przypadkach – na `false` (lub całkowicie pominiemy i pozwolimy przyjąć mu domyślną wartość, czyli właśnie `false`).

Jednak proste wycinanie wszystkich eksportów z importowanych plików nie zadziała, ponieważ wytnie też konstrukcje typu `export interface Test {}`, w których deklaracja jest bezpośrednio w eksporcie. Z tego też powodu trzeba zastąpić [usuwanie eksportu](https://github.com/Comandeer/simple-bundler-example/blob/e906ab8821934ab384e0731a70043d53954dac7f/index.js#L33) funkcją `handleExport()`:

```javascript
function handleExport( path, { isMain, dir, modules } ) {
	const node = path.node;

	if ( node.source ) {
		processImport( node, dir, modules );
	}

	if ( isMain && node.source ) {
		path.replaceWith( exportNamedDeclaration( node.declaration, node.specifiers ) );

		return;
	}

	if ( isMain ) {
		return;
	}

	if ( node.declaration ) {
		path.replaceWith( node.declaration );

		return;
	}

	path.remove();
}
```

Trochę się tu dzieje, więc przyjrzyjmy się po kolei poszczególnym fragmentom. Na sam początek jest obsługa sytuacji, w których eksport jest połączony z importem (`export { Something } from './file'`):

```javascript
const node = path.node; // 1

if ( node.source ) { // 2
	processImport( node, dir, modules ); // 3
}
```

Na początku pobieramy sobie węzeł eksportu do zmiennej (1), następnie sprawdzamy, czy ma ustawioną własność `source` (2). To właśnie ona wskazuje na plik, z którego eksportujemy. Jeśli tak, odpalamy na tym eksporcie opisaną już wcześniej funkcję `processImport()` (3). Wszystkie potrzebne parametry dostajemy z zewnątrz, z funkcji `processModule()`.

Następny fragment dodaje dodatkową logikę dla takich eksportów w głównym pliku. Jest to spowodowane tym, że musimy w nich zamienić eksport z zewnętrznego pliku na eksport lokalnego typu:

```typescript
export { Fixture } from './Fixture';
// trzeba zmienić na:
export { Fixture };
```

W tym celu używamy `path.replaceWith()`:

```javascript
if ( isMain && node.source ) {
	path.replaceWith( exportNamedDeclaration( node.declaration, node.specifiers ) ); // 1

	return; // 2
}
```

Funkcja `exportNamedDeclaration()` (1) pochodzi z [pakietu `@babel/types`](https://babeljs.io/docs/en/babel-types) i służy do tworzenia nowych deklaracji nazwanych eksportów. Przekazujemy do niej dane ze starego eksportu, dzięki czemu powstaje taki sam eksport, ale już bez informacji o zewnętrznym pliku. Z kolei `return` (2) pozwala zakończyć obsługę tego eksportu w tym miejscu, co pozwala zmniejszyć liczbę zagłębień i `else`-ów w reszcie funkcji `handleExport()`.

To jest też cała logika dla głównego pliku, więc jeśli w nim jesteśmy, teraz jest pora, by wyjść:

```javascript
if ( isMain ) {
	return;
}
```

Następny fragment dotyczy obsługi eksportów połączonych z deklaracją (`export interface Test {}`) w importowanych plikach (w głównym takich eksportów nie ruszamy, bo i nie ma po co – główny plik powinien bez przeszkód eksportować):

```javascript
if ( node.declaration ) { // 1
	path.replaceWith( node.declaration ); // 2

	return; // 3
}
```

Żeby wykryć taki eksport, sprawdzamy, czy zawiera deklarację (1). Jeśli tak, podmieniamy eksport na tę deklarację (2) i wychodzimy z funkcji `handleExport()` (3).

I w końcu, gdy mamy do czynienia z jakimkolwiek innym rodzajem eksportu, najzwyczajniej w świecie go usuwamy:

```javascript
path.remove();
```

To pozwoli pozbyć się z importowanych plików konstrukcji typu `export { Fixture }`.

I to tyle, stworzyliśmy prymitywny bundler typów!

## Możliwe ścieżki rozwoju

Podobnie do "normalnego" bundlera, który był dość prymitywny, tak i bundler typów jest mocno prymitywny i radzi sobie tylko z najprostszymi konstrukcjami. Istnieje zatem szereg możliwych usprawnień, np:

* obsługa aliasów w eksportach – często eksporty zawierają aliasy typu `export { default as someName } from './File';` i obecnie bundler całkowicie sobie nie radzi z takimi aliasami (zostawia je bez zmian),
* obsługa składni `export = SomeThing;` – obecnie ta składnia działa częściowo; po prostu nie jest traktowana jako eksport, więc jest zostawiana bez zmian, co powinno działać w głównym pliku, ale już nie w importowanych,
* dodanie tree shakingu – wiedząc, jakich typów potrzebujemy, możemy importować tylko te potrzebne z poszczególnych plików `.d.ts`,
* dodanie zabezpieczenia przed konfliktami w importach – niektóre importowane typy mogą mieć takie same nazwy (np. `Node` z modułu obsługującego HTML i `Node` z modułu obsługującego SVG), więc warto byłoby się przed tym zabezpieczyć, choćby generując unikatowe nazwy dla wszystkich niepublicznych typów.

To oczywiście nie wszystkie możliwości, jedynie kilka luźnych propozycji. W żadnym razie bundler, jaki stworzyłem, nie jest produkcyjny i przy każdym bardziej zaawansowanym pliku `.d.ts` wyglebi się na pierwszej nierówności. Do poważnych zastosowań wypadałoby wybrać coś bardziej sprawdzonego, np. [`rollup-plugin-dts`](https://github.com/Swatinem/rollup-plugin-dts).

[Bundler jest dostępny na GitHubie](https://github.com/Comandeer/simple-type-bundler-example).
