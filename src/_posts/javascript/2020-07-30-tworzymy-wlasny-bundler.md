---
layout: post
title:  "Tworzymy własny bundler"
description: "Krótki poradnik o tworzeniu własnego bundlera JS-a."
author: Comandeer
date: 2020-07-30T23:06:00+0200
tags:
    - javascript
    - eksperymenty
comments: true
permalink: /tworzymy-wlasny-bundler.html
---

Bądźmy szczerzy: praktycznie wszyscy używamy jakiegoś bundlera, ale prawie nikt z nas swojego bundlera nie lubi (na Ciebie patrzę, webpack…). Może by tak zatem… stworzyć swój własny bundler?<!--more-->

## Zasada działania

Zasada działania prostego bundlera jest… cóż, prosta:

1. Znajdź wszystkie `import`y z zewnętrznych plików.
2. Podmień je na zawartość tych plików.

I w sumie to tyle. Jedyny haczyk polega na tym, że importowane pliki mogą importować inne pliki, więc dla nich również musimy powtórzyć cały proces. Trzeba przy tym pamiętać, że zależności naszych zależności należy dorzucić do bundle'a przed naszymi zależnościami. Wyobraźmy sobie prostą aplikację składającą się z trzech plików: `input.js` (będącego głównym plikiem aplikacji), `Test.js` oraz `tools.js`. Zawartość tych plików prezentuje się następująco:

* `input.js`

    ```javascript
    import Test from './Test.js';
    import { render } from './tools.js';

    render( Test.msg );
    ```

* `Test.js`

    ```javascript
    import { createClass } from './tools.js';

    const Test = createClass( {
    	msg: 'Test'
    } );

    export default Test;
    ```

* `tools.js`

    ```javascript
    function createClass( obj ) {
    	return obj;
    }

    function render( string ) {
    	console.log( string );
    }

    export { createClass };
    export { render };
    ```

Nasz bundler zacząłby poszukiwanie `import`ów od pliku `input.js`. Znalazłby dwa: `./Test.js` i `./tools.js`. Następnie szukałby importów w kolejnych plikach. Znalazłby jeszcze tylko jeden, `./tools.js` w `./Test.js`. Dzięki temu wiemy, że `input.js` wymaga wcześniejszego dołączenia `./Test.js` a `./Test.js` – `./tools.js`. Tym sposobem ustaliliśmy kolejność plików w naszym bundle'u:

1. `./tools.js`,
2. `./Test.js`,
3. `input.js`.

Spróbujmy zatem napisać kod, który faktycznie te pliki złączy.

## Bundler

Większość kodu bundlera będzie znajdować się w funkcji `processModule`, co ułatwi nam później pracę z zależnościami. Stwórzmy sobie więc na początku taką funkcję w pliku `index.js`:

```javascript
function processModule() {
}
```

Warto też wspomnieć, że wszystkie przykłady w tym artykule zakładają, że struktura plików w katalogu z bundlerem wygląda następująco:

```
| - example
| |
| | - input.js
| | - Test.js
| | - tools.js
|
| -index.js
```

Ok, teraz możemy przejść do ciekawszych rzeczy.

### Wczytywanie modułów

Wczytywanie plików najłatwiej wykonać przy pomocy wbudowanego w Node.js modułu `fs`. Udostępnia on m.in. [funkcję `readFileSync`](https://nodejs.org/api/fs.html#fs_fs_readfilesync_path_options). Jednak nasza funkcja `processModule` musi wiedzieć, jaki moduł ma dokładnie wczytać. Najprościej ją o tym poinformować, przekazując ścieżkę do pliku jako parametr:

```javascript
const { readFileSync } = require( 'fs' ); // 1

processModule( 'example/input.js' ); // 2

function processModule( path ) {
	const code = readFileSync( path, 'utf8' ); // 3
}
```

Na samym początku importujemy odpowiednią funkcję z modułu `fs` (1). Wykorzystujemy ją w funkcji `processModule` (2), żeby wczytać kod ze wskazanego pliku do zmiennej (3). Określenie kodowania w `readFileSync` sprawia, że zawartość pliku jest przekształcana od razu do ciągu tekstowego zamiast do [bufora](https://nodejs.org/api/buffer.html).

Możemy przetestować, czy nasz kod faktycznie działa, odpalając terminal w katalogu z bundlerem i wywołując komendę:

```bash
node .
```

Jeśli w terminalu nie pojawi się żaden błąd, to znaczy, że plik został wczytany poprawnie. Oczywiście możesz też sprawdzić, czy zmienna `code` faktycznie zawiera odpowiedni kod JS, przy pomocy choćby `console.log`.

Obecny kod ma pewną wadę: posiadamy jedynie relatywną ścieżkę do pliku, a zdecydowanie przydatniejsza byłaby ścieżka bezwzględna. Dlatego też posłużymy się tutaj dodatkowo [funkcją `resolve` z modułu `path`](https://nodejs.org/api/path.html#path_path_resolve_paths) oraz [zmienną `__dirname`](https://nodejs.org/api/modules.html#modules_dirname), zawierającą ścieżkę, w której znajduje się aktualnie uruchomiony plik JS:

```javascript
const { readFileSync } = require( 'fs' );
const { resolve: resolvePath } = require( 'path' ); // 1

const inputPath = resolvePath( __dirname, 'example/input.js' ); // 2

processModule( inputPath ); // 3
```

Najpierw importujemy `resolve` z modułu `path` jako `resolvePath` (1), a następnie używamy tej funkcji, żeby stworzyć ścieżkę do pliku `examples/input.js` (2). Na samym końcu tak utworzoną ścieżkę przekazujemy jako parametr do funkcji `processModule` (3).

Jeśli po odpaleniu naszego kodu dalej nie pokazał się żaden błąd, to można założyć, że wczytywanie modułów mamy już zrobione!

### Wyszukiwanie importów

Przed nami najbardziej skomplikowana część zadania: wyszukanie importów. "Zaraz, zaraz" – zakrzyknie w tym momencie Co Bardziej Rozgarnięty Czytelnik – "przecież coś podobnego na tym blogu już było!". Dziękuję Ci, Co Bardziej Rozgarnięty Czytelniku, to prawda – było w [artykule poświęconym AST](https://blog.comandeer.pl/bujajac-sie-na-galezi-ast.html). W przypadku bundlera kod jest bardzo podobny, różni się głównie wyszukiwana przez nas rzecz. Pozwolę sobie zatem na ominięcie wytłumaczenia całego mechanizmu AST i przejdę od razu do kodu wyszukującego `import`y:

```javascript
[…]
const { parse } = require( '@babel/parser' );
const { default: traverse } = require( '@babel/traverse' );
const { default: generate } = require( '@babel/generator' );
const { isImportDeclaration } = require( '@babel/types' );

[…]

function processModule( path ) {
	const code = readFileSync( path, 'utf8' );

	const ast = parse( code, { // 1
		sourceType: 'module' // 2
	} );

	traverse( ast, { //3
		enter( path ) {
			if ( !isImportDeclaration( path.node ) ) { // 4
				return;
			}

			console.log( path.node.source.value ); // 5
		}
	} );

	const { code: transformedCode } = generate( ast ); // 6
}

```

Pojawiło się sporo nowych importów, związanych z Babelem i jego parserem kodu JS. Dzięki nim jesteśmy w stanie sparsować kod modułu do AST (1)  – pamiętając, że musimy zaznaczyć, że parsowany jest kod modułów (2). Mając AST, przechodzimy po każdym węźle w drzewie (3)  i szukamy tylko tych, które stanowią `import`y, odsiewając wszystkie przez specjalną klauzulę strażniczą (4). Dla każdego `import`u wyświetlamy ścieżkę modułu, do którego odsyła (5). Na samym końcu generujemy z powrotem kod (6). Co prawda obecnie tak stworzony kod będzie taki sam jak ten z pliku (chociaż możliwe, że będzie się różnił liczbą i rozłożeniem białych znaków), jednak na późniejszym etapie prac się to zmieni.

Każda deklaracja importu składa się z dwóch głównych części w AST:

* określenia, co jest importowane – jest to przechowywane w tablicy `node.specifiers`,
* określenia, z jakiego pliku jest to importowane – jest to przechowywane jako ścieżka w `node.source`.

My posłużymy się jedynie tą drugą informacją, bo nasz bundler będzie po prostu dołączał do bundle'a całe moduły, nie będzie robił [tree shakingu](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking).

Jeśli odpalisz teraz nasz bundler, zauważysz, że wyświetlone są tylko dwa `import`y – z głównego pliku `input.js`. A przecież `Test.js` również zawiera `import`! Wypada zatem odpalić naszą funkcję `processModule` także dla każdej zależności:

```javascript
[…]
traverse( ast, {
		enter( path ) {
			if ( !isImportDeclaration( path.node ) ) {
				return;
			}

			console.log( path.node.source.value );

			processModule( path.node.source.value );
		}
	} );
[…]
```

Odpalenie teraz programu pokazuje jednak błąd, że plik `Test.js` nie istnieje:

```
Error: ENOENT: no such file or directory, open './Test.js'
```

To w sumie prawda – plik ten przecież znajduje się w katalogu `example`. Problem w tym wypadku polega na tym, że ścieżka wyciągnięta z `import`u jest względna względem pliku zawierającego `import`. Trzeba zatem w jakiś sposób stworzyć z niej ścieżkę bezwzględną. Tutaj z pomocą przyjdzie nam kolejna funkcja z modułu `path` – [`dirname`](https://nodejs.org/api/path.html#path_path_dirname_path), która z podanej ścieżki wyciągnie ścieżkę do katalogu:

```javascript
const { readFileSync } = require( 'fs' );
const { resolve: resolvePath } = require( 'path' );
const { dirname } = require( 'path' ); // 1
[…]

function processModule( path ) {
	const dir = dirname( path ); // 2
	[…]

	traverse( ast, {
		enter( path ) {
			if ( !isImportDeclaration( path.node ) ) {
				return;
			}

			console.log( path.node.source.value );

			const depPath = resolvePath( dir, path.node.source.value ); // 3
			processModule( depPath ); // 4
		}
	} );

  […]
}

```

Dodajemy import dla funkcji `dirname` (1), a następnie używamy jej wewnątrz `processModule`, by wyciągnąć ścieżkę do katalogu zawierającego aktualnie procesowany moduł (2). Następnie używamy tej ścieżki do stworzenia ścieżki bezwzględnej do naszej zależności (3). Tę ścieżkę przekazujemy do rekurencyjnego wywołania `processModule`  (4).

Gdy teraz odpalimy naszego bundlera, zobaczymy, że wyświetlone zostają wszystkie trzy `import`y:

```
./Test.js
./tools.js
./tools.js
```

### Składanie bundle'a

No dobrze, wyciągnęliśmy `import`y, ale nic z tym dalej nie zrobiliśmy! Trzeba jakoś złożyć te pliki razem do kupy. Najprostszym podejściem byłoby wrzucenie kodu wszystkich wczytanych modułów do tablicy i następnie wywołanie na niej `join`. Zmodyfikujmy zatem nieco nasz kod:

```javascript
[…]
const inputPath = resolvePath( __dirname, 'example/input.js' );
const modules = processModule( inputPath ); // 5

console.log( modules.join( '\n' ) ); // 6

function processModule( path ) {
	const dir = dirname( path );
	const code = readFileSync( path, 'utf8' );
	const modules = []; // 1
	[…]
	traverse( ast, {
		enter( path ) {
			if ( !isImportDeclaration( path.node ) ) {
				return;
			}

			const depPath = resolvePath( dir, path.node.source.value );
			modules.push( ...processModule( depPath ) ); // 3
		}
	} );

	const { code: transformedCode } = generate( ast );

	modules.push( transformedCode ); // 4

	return modules; // 2
}

```

Wewnątrz `processModule` stworzyliśmy tablicę `modules` (1). Będziemy do niej wrzucać kod każdego przetworzonego modułu, a następnie będziemy tę tablicę zwracać z `processModule` (2). Najpierw wrzucamy do tej tablicy kod wszystkich przetworzonych zależności (3). Dzięki rekurencji każda zależność zwróci tablicę zawierającą także kod swoich zależności, kod zależności swoich zależności itd. Żeby mieć ładną, płaską tablicę tych kodów, używamy tutaj [składni spread](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax). Na sam koniec dorzucamy do tej tablicy także kod modułu, od którego zaczęliśmy przetwarzanie (4). Dzięki takiej kolejności mamy pewność, że na początku tablicy `modules` znajdą się wszystkie potrzebne zależności, a dopiero na końcu – kod z nich korzystający. To, co zwróci nam wywołanie funkcji `processModule` dla naszego głównego pliku aplikacji, zapisujemy do zmiennej (5), a następnie wyświetlamy wynik połączenia tych wszystkich kodów w jeden, przy pomocy `join` (6).

Jeśli teraz uruchomimy nasz bundler, powinniśmy zobaczyć taki kod:

```javascript
function createClass(obj) {
  return obj;
}

function render(string) {
  console.log(string);
}

export { createClass };
export { render };
import { createClass } from './tools.js';
const Test = createClass({
  msg: 'Test'
});
export default Test;
function createClass(obj) {
  return obj;
}

function render(string) {
  console.log(string);
}

export { createClass };
export { render };
import Test from './Test.js';
import { render } from './tools.js';
render(Test.msg);
```

Nie do końca o to nam chodziło… Nie dość, że w kodzie jest pełno niepotrzebnych `import`ów i `export`ów, to dodatkowo moduł `tools.js` został dołączony podwójnie (bo był importowany zarówno w `input.js`, jak i w `Test.js`). Zajmijmy się tym zatem w kolejnych krokach.

### Usuwanie `import`ów i `export`ów

W przypadku `import`ów sprawa jest prosta – po wywołaniu `processModule` dla zależności można usunąć ten `import`:

```javascript
[…]
traverse( ast, {
		enter( path ) {
			if ( !isImportDeclaration( path.node ) ) {
				return;
			}

			const depPath = resolvePath( dir, path.node.source.value );
			modules.push( ...processModule( depPath ) );

			path.remove(); // 1
		}
	} );
[…]
```

Usuwanie węzła sprowadza się do wywołania `path.remove` (1).

W przypadku `export`ów musimy dodać ich rozpoznawanie i dopiero wtedy możemy je usunąć:

```javascript
[…]
const { isExportDeclaration } = require( '@babel/types' ); // 1

[…]

	traverse( ast, {
		enter( path ) {
			if ( isExportDeclaration( path.node ) ) { // 2
				return path.remove(); // 3
			}

			if ( !isImportDeclaration( path.node ) ) {
				return;
			}

			const depPath = resolvePath( dir, path.node.source.value );
			modules.push( ...processModule( depPath ) );

			path.remove();
		}
	} );
[…]
```

Na początku musimy zaimportować funkcję `isExportDeclaration` z `@babel/types` (1), a następnie używamy jej w klauzuli strażniczej do wykrycia `export`u (2) i jego usunięcia (3).

Po odpaleniu naszego bundlera ukaże nam się kod bez `import`ów i `export`ów:

```javascript
function createClass(obj) {
  return obj;
}

function render(string) {
  console.log(string);
}
const Test = createClass({
  msg: 'Test'
});
function createClass(obj) {
  return obj;
}

function render(string) {
  console.log(string);
}
render(Test.msg);
```

### Deduplikacja modułów

Wciąż jednak moduł `tools.js` jest dołączany podwójnie. Wypada zatem znaleźć sposób, by móc rozróżniać, które moduły już załączyliśmy, a których wciąż nie. Pomóc nam mogą w tym ścieżki do modułów – w końcu to ich unikalne identyfikatory! W tym celu wypada zmienić format tablicy, jaką zwraca `processModule` na tablicę dwuwymiarową: w pierwszym elemencie będzie ścieżka, w drugim – kod:

```javascript
function processModule( path ) {
	[…]
	const { code: transformedCode } = generate( ast );

	modules.push( [ path, transformedCode ] ); // 1

	return modules;
}
```

Po zamianie kodu na tablicę zawierającą ścieżkę i kod (1) dostajemy ładną dwuwymiarową tablicę modułów.

Teraz możemy przystąpić do deduplikacji i wyświetlenia zdeduplikowanego kodu:

```javascript
[…]
const modules = processModule( inputPath );
const deduplicatedModules = new Map( modules ); // 1

console.log( [ ...deduplicatedModules.values() ].join( '\n' ) ); // 2
[…]
```

Z tego, co zwraca nam główne wywołanie `processModule`, robimy `Map`. Dzięki temu wszystkie zduplikowane pary klucz + wartość zostaną automatycznie usunięte. Następnie robimy z tej mapy z powrotem tablicę z samym kodem, dzięki iteratorowi zwracanemu przez `Map.prototype.values`, i stosujemy `join` (2) – tak jak wcześniej.

### Zapisywanie bundle'a

Kolejny krok to zapisanie bundle'a do pliku. To umożliwi nam kolejna funkcja z modułu `fs` – [`writeFileSync`](https://nodejs.org/api/fs.html#fs_fs_writefilesync_file_data_options):

```javascript
const { readFileSync } = require( 'fs' );
const { writeFileSync } = require( 'fs' ); // 1
[…]

const inputPath = resolvePath( __dirname, 'example/input.js' );
const outputPath = resolvePath( __dirname, 'example/bundle.js' ); // 3
const modules = processModule( inputPath );
const deduplicatedModules = new Map( modules );
const bundleContent = [ ...deduplicatedModules.values() ].join( '\n' ); // 4

writeFileSync( outputPath, bundleContent, 'utf8' ); // 2
```

Importujemy potrzebną nam funkcję (1), a następnie podmieniamy nią wcześniejszy `console.log` (2). Ścieżkę do pliku bundle'a tworzymy analogicznie jak ścieżkę do pliku wejściowego (3). Dodatkowo wyciągnąłem połączony kod modułów do osobnej zmiennej, `bundleContent` (4), dla zwiększenia czytelności.

Jeśli teraz odpalimy nasz bundler, to w katalogu `example` powinien pojawić się plik `bundle.js` z całym kodem naszej aplikacji.

### Interfejs użytkownika

Niby działa, ale tak nie do końca… W końcu w każdym porządnym bundlerze musi być konfiguracja – _tona niezrozumiałej dla nikogo konfiguracji_… No, może nie aż tak, ale przynajmniej powinna być możliwość wskazania pliku wejściowego i wyjściowego. Można do tego użyć linii poleceń:

```bash
node . plik-wejsciowy.js plik-wyjsciowy.js
```

Żeby pobrać argumenty przekazane w taki sposób, trzeba użyć wartości zmiennej `process.argv`:

```javascript
[…]
const [ , , input, output ] = process.argv; // 1
const cwd = process.cwd(); // 4
const inputPath = resolvePath( cwd, input ); // 2
const outputPath = resolvePath( cwd, output ); // 3
const modules = processModule( inputPath );
[…]
```

Wyciągamy potrzebne nam dane wprost z `process.argv` (1). Trzeba to zrobić w taki sposób, ponieważ pierwsze dwa elementy w tej tablicy to ścieżka odpalonego programu (w naszym wypadku będzie to ścieżka do Node'a) oraz ścieżka do aktualnie wykonywanego skryptu (czyli bundlera). Nas interesuje dopiero trzeci element (czyl nasz plik wejściowy) oraz czwarty (plik wyjściowy). Mając te dane można odpowiednio zmodyfikować `inputPath` (2) oraz `outputPath` (3). Dodatkowo zamiast `__dirname`, czyli odniesienia do ścieżki wykonywanego skryptu, używamy tzw. <i lang="en">current working directory</i> (4), czyli ścieżki do katalogu, w którym użytkownik się znajduje, odpalając nasz program w terminalu. W końcu logiczne jest, że gdy wpisuje np. `./test.js`, to oczekuje, że chodzi o plik w katalogu, w którym jest, a nie o plik w katalogu programu, który jest na drugim krańcu dysku.

Uff, zrobiliśmy już nawet interfejs użytkownika. Wypada zatem sprawdzić, czy wszystko działa:

```bash
node . example/input.js example/bundle.js
```

Jeśli wszystko działa poprawnie, takie wywołanie bundlera powinno stworzyć plik `bundle.js` w katalogu `example` (oczywiście warto przed tą próbą skasować poprzednio stworzony plik `bundle.js`).

### Pełny kod

A oto tak się prezentuje nasz cały bundler:

```javascript
const { readFileSync } = require( 'fs' );
const { writeFileSync } = require( 'fs' );
const { resolve: resolvePath } = require( 'path' );
const { dirname } = require( 'path' );
const { parse } = require( '@babel/parser' );
const { default: traverse } = require( '@babel/traverse' );
const { default: generate } = require( '@babel/generator' );
const { isImportDeclaration } = require( '@babel/types' );
const { isExportDeclaration } = require( '@babel/types' );

const [ , , input, output ] = process.argv;
const cwd = process.cwd();
const inputPath = resolvePath( cwd, input );
const outputPath = resolvePath( cwd, output );
const modules = processModule( inputPath );
const deduplicatedModules = new Map( modules );
const bundleContent = [ ...deduplicatedModules.values() ].join( '\n' );

writeFileSync( outputPath, bundleContent, 'utf8' );

function processModule( path ) {
	const dir = dirname( path );
	const code = readFileSync( path, 'utf8' );
	const modules = [];

	const ast = parse( code, {
		sourceType: 'module'
	} );

	traverse( ast, {
		enter( path ) {
			if ( isExportDeclaration( path.node ) ) {
				return path.remove();
			}

			if ( !isImportDeclaration( path.node ) ) {
				return;
			}

			const depPath = resolvePath( dir, path.node.source.value );
			modules.push( ...processModule( depPath ) );

			path.remove();
		}
	} );

	const { code: transformedCode } = generate( ast );

	modules.push( [ path, transformedCode ] );

	return modules;
}
```

## Możliwe ścieżki rozwoju

Nie ma się co oszukiwać, nasz bundler jest prosty, by nie powiedzieć – prymitywny. Dlatego też istnieje wiele różnych ścieżek jego dalszego rozwoju, m.in.:

* dodanie tree shakingu – wiedząc, co jest importowane i z których modułów, jesteśmy w stanie wycinać z nich tylko to, co potrzebne,
* dodanie zabezpieczenia przed konfliktami w importach – niektóre moduły mogą mieć takie same nazwy eksportów, co może powodować problemy przy połączeniu tych plików w jeden; można to rozwiązać choćby przez generowanie unikalnych nazw dla wszystkich importów,
* dodanie minifikacji kodu JS – obecnie kod jest łączony, ale przydałaby się jeszcze minifikacja.

To oczywiście nie wszystkie możliwości, jedynie te, które wpadają do głowy na pierwszy rzut oka.

[Bundler jest dostępny na GitHubie](https://github.com/Comandeer/simple-bundler-example).
