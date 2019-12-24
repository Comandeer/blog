---
layout: post
title:  "HTML w Node.js"
author: Comandeer
date:   2019-12-24 16:27:00 +0100
categories: javascript
comments: true
permalink: /html-w-node.html
---

Czasami można używać pewnej technologii od lat i nie zorientować się, że gdzieś tam głęboko chowa pewną małą, acz diabelnie przydatną funkcję. Tak jest też w przypadku Node.js i jego `require`.

## HTML w Node.js?!

Wyobraźmy sobie, że tworzymy skomplikowaną aplikację webową i stwierdziliśmy w pewnym momencie, że zdecydowanie za dużo czasu spędzamy na obsłudze szablonów HTML. No bo trzeba taki plik HTML wczytać, przerobić na szablon i dopiero można podstawiać dane. A co jeśli można byłoby zrobić coś takiego:

```javascript
const template = require( './templates/hello.html' );

console.log( template.render( {
	user: 'Comandeer'
} ) );
```

Zamiast tworzyć oddzielnie szablony dla każdego pliku HTML, po prostu importujemy plik HTML i dostajemy od razu obiekt szablonu (np. [Hogana](https://github.com/twitter/hogan.js)). Prosto i przyjemnie, w duchu tego, co umożliwia webpack – tyle że w środowisku produkcyjnym. Byłoby fajnie, gdyby się tak dało, prawda?

## Rozszerzanie `require`

Na szczęście się da! Przy użyciu mało znanej własności `require` – [obiektu rozszerzeń](https://nodejs.org/api/modules.html#modules_require_extensions). Koncepcja działania jest bardzo prosta: do tego obiektu dodajemy, jakie rozszerzenie pliku chcemy obsługiwać, a następnie po prostu dopisujemy funkcję do obsługi tego typu plików. Zatem obsługa plików HTML sprowadzać się będzie do dodania do tego obiektu jednej funkcji:

```javascript
require.extensions[ '.html' ] = () => {};
```

Ta funkcja przyjmuje dwa parametry: obiekt reprezentujący wczytywany moduł oraz jego ścieżkę.

Każdy wczytywany moduł przed wykorzystaniem go w Node.js musi zostać skompilowany do kodu JS. W Node.js jest za to odpowiedzialna metoda `_compile` wczytywanego modułu. Dopiero tak przygotowany kod jest przez Node.js traktowany jako pełnoprawny moduł JS. Jak dokładnie to przebiega, można zobaczyć w [kodzie źródłowym Node.js](https://github.com/nodejs/node/blob/db109e85d678faf581433250bb1442f5eb24de61/lib/internal/modules/cjs/loader.js#L1205-L1217). W podobny sposób będzie wyglądał nasz hook:

```javascript
const { readFileSync } = require( 'fs' );

require.extensions[ '.html' ] = ( module, path ) => {
	const html = readFileSync( path, 'utf8' ); // 1
	const code = `const hogan = require( 'hogan.js' );
const template = hogan.compile( \`${ html }\` );

module.exports = template;`; // 2

	module._compile( code, path ); // 3
};
```

Nasz hook na sam początek pobiera zawartość pliku HTML (1). Następnie jest ona umieszczana wewnątrz kodu bardzo prostego modułu JS, który tworzy z niego pełnoprawny szablon Hogana i go eksportuje (2). Tak przygotowany kod kompilujemy przy pomocy `module._compile` (3). I już, nasza aplikacja JS może wczytywać pliki HTML!

### Arrgh!

Oczywiście w rzeczywistym świecie hooki często są bardziej skomplikowane, jak np. `@babel/register`, transpilujący kod JS w locie. Dlatego dla takich przypadków powstała [biblioteka `pirates`](https://github.com/ariporad/pirates), która ułatwia dodawanie hooków:

```javascript
const { readFileSync } = require( 'fs' );
const { addHook } = require( 'pirates' );

addHook(
	( code, path ) => {
		const html = readFileSync( path, 'utf8' );

		return `const hogan = require( 'hogan.js' );
const template = hogan.compile( \`${ html }\` );

module.exports = template;`;
	},
	{ exts: [ '.html' ] } // 2
);
```

W przypadku tej biblioteki hooki dodaje się przy pomocy funkcji `addHook`. Jako pierwszy parametr przyjmuje ona funkcję, która zwraca przerobiony kod wczytywanego modułu. Drugi parametr to obiekt opcji (2). Nas interesuje jedynie opcja `exts`, pozwalająca wskazać, dla jakich rozszerzeń plików dany hook ma działać. Istnieje jednak także opcja `matcher`, która przyjmuje funkcję. Jest ona odpowiedzialna za sprawdzenie, czy dla pliku o danej ścieżce chcemy użyć naszego hooku, czy nie. W naszym wypadku chcemy używać naszego hooku dla wszystkich plików HTML, więc nie musimy jej używać.

### Ale zaraz, zaraz…

Czy aby na pewno rozszerzanie `require` to dobry pomysł? Wszak dokumentacja twierdzi, że to opcja przestarzała – i to od wersji 0.10.0…

Cóż, tak, ale nie. Nie, ponieważ im więcej różnych dziwnych rzeczy będziemy robić w czasie wczytywania modułów (doklejanie fragmentów kodu, transpilacja, obsługa plików graficznych itp., itd.), tym dłużej będzie trwało dołączanie kolejnych modułów. Tak, bo… po prostu nie ma innej możliwości. Mimo że ta opcja nie jest opisana w oficjalnej dokumentacji, a jej używanie jest niezalecane, to opiera się na niej naprawdę spory kawał ekosystemu i najzwyczajniej w świecie _nie może zostać to usunięte_. Zwłaszcza, że alternatywy naprawdę nie ma.

## A co z modułami ES?

Najnowsze wersje Node'a (12+) doczekały się – eksperymentalnej na chwilę obecną – obsługi modułów ES. Nie da się ukryć, że ich składnia jest przyjemniejsza od tej, która jest dostępna w modułach CJS. Dodatkowo specjalnie dla ESM powstał [oficjalny sposób rozszerzania mechanizmu wczytującego moduły](https://nodejs.org/docs/latest-v12.x/api/esm.html#esm_experimental_loader_hooks). Przy jego wykorzystaniu możemy w prosty sposób stworzyć obsługę plików JS. Zacznijmy od stworzenia pliku `html-loader.mjs`.

<p class="note">Przy tworzeniu modułów ES trzeba pamiętać, że powinny mieć one rozszerzenie <code>.mjs</code>. To standardowe rozszerzenie dla modułów, a w dodatku wymagane przez Node.js, by dany plik był w ogóle parsowany jako moduł.</p>

Będzie on zawierał dwie funkcje asynchroniczne: `resolve` oraz `dynamicInstantiate`. Pierwsza z funkcji służy do poinformowania Node.js, gdzie dokładnie szukać konkretnego modułu oraz z jakim typem pliku ma do czynienia. Druga funkcja służy do stworzenia modułu w locie. Dopiero połączenie tych dwóch funkcji daje nam ekwiwalent hooków dla `require`.

Zacznijmy zatem od pierwszej funkcji, `resolve`:

```javascript
import { URL, pathToFileURL } from 'url';

const baseURL = pathToFileURL( process.cwd() ).href; // 1

export async function resolve( path, parentModuleURL = baseURL, defaultResolve ) {
	if ( !path.endsWith( '.html' ) ) {
		return defaultResolve( path, parentModuleURL ); // 2
	}

	const url = new URL( path, parentModuleURL ).href; // 3

	return { // 4
		url,
		format: 'dynamic'
	};
};
```

Funkcja przyjmuje trzy parametry: ścieżkę do modułu (w dokładnie takiej formie, w jakiej została użyta w kodzie aplikacji), ścieżkę do modułu nadrzędnego (w postaci URL-a) oraz domyślną funkcję wyszukującą moduły. W przypadku gdy ścieżki do modułu nadrzędnego nie ma (bo np. jest to główny moduł aplikacji), używamy zamiast niego ścieżki (w postaci URL-a) do obecnego katalogu roboczego (1), czyli do katalogu, z poziomu którego uruchomiliśmy naszą aplikację node'ową. Na samym początku funkcji `resolve` sprawdzamy, czy na pewno mamy do czynienia z plikiem HTML; w przeciwnym wypadku wykorzystujemy natywną implementację do wczytania danego modułu (2). Następnie tworzymy URL dla naszego modułu HTML (3). Dostajemy URL rozwiązany względem `parentModuleURL`, np. `./templates/hello.html` rozwiązane względem `file:///katalog/application/` da nam ostatecznie `file:///katalog/application/templates/hello.html`. Na końcu zwracamy obiekt (4) zawierający URL modułu oraz jego format ustawiony na `'dynamic'`. To umożliwi nam podstawienie zawartości modułu w funkcji `dynamicInstantiate`.

Przejdźmy zatem do funkcji `dynamicInstantiate`:

```javascript
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import hogan from 'hogan.js';

const { readFile } = fs;

export async function dynamicInstantiate( url ) {
	const path = fileURLToPath( url ); // 1
	const html = await readFile( path, 'utf8' ); // 2
	const template = hogan.compile( html ); // 3

	return {
		exports: [ 'default' ], // 4
		execute( exports ) {
			exports.default.set( template ); // 5
		}
	};
}
```

Na samym początku przerabiany URL modułu z powrotem na ścieżkę (1). Następnie używamy jej do wczytania zawartości pliku HTML (2). Wykorzystujemy w tym celu obiecankową wersję modułu `fs`. Wczytany kod HTML kompilujemy do szablonu Hogana (3). Następnie zwracamy moduł. We własności `exports` określamy, jakie nazwy będą miały eksportowane wartości (4). W naszym wypadku będzie to tylko `default` – a więc domyślny eksport modułu ES. W metodzie `execute` ustalamy dla naszego eksportu wartość (5). W przeciwieństwie do hooku dla `require` tutaj używamy obiektu JS zamiast stringu z kodem JS.

Wypada teraz stworzyć plik aplikacji, `index.mjs`, który będzie mógł skorzystać z naszych hooków:

```javascript
import template from './templates/hello.html';

console.log( template.render( {
	user: 'Comandeer'
} ) );
```

Sprawdźmy zatem, czy działa:

```bash
node --experimental-modules --experimental-loader html-loader.mjs index.mjs
```

Flaga `--experimental-modules` jest obecnie potrzebna, by w ogóle włączyć obsługę modułów w Node.js 12+, natomiast flaga `--experimental-loader` wskazuje plik, w którym znajdują się nasze hooki. Na samym końcu podajemy ścieżkę do aplikacji.

Jeśli wszystko się powiedzie, powinniśmy zobaczyć ostrzeżenie o tym, że funkcja niestandardowych funkcji wczytujących modułów jest eksperymentalna i może się zmienić w każdej chwili, oraz kod HTML naszego szablonu.

Osobiście uważam, że hooki dla ESM są o wiele przyjaźniejsze w używaniu niż hooki dla `require` – głównie dlatego, że nie opierają się na dziwnej magii tylko na oficjalnie udokumentowanych funkcjach. Dodatkowo nie jesteśmy zmuszeni do operowania na stringach, a na normalnych wartościach JS-owych.

## Demo

Wersje demonstracyjne wszystkich trzech sposobów ("ręczny" hook dla `require`, hook przy pomocy `pirates` oraz hook dla ESM) znajdują się w [przykładowym repozytorium na GitHubie](https://github.com/Comandeer/html-import-example). Pliki `require.js` i `require-pirates.js` zawierają hooki dla `require`, podczas gdy `esm.mjs` – dla ESM.

A tak przy okazji: wesołych świąt 🎄!