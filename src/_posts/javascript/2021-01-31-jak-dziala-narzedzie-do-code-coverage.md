---
layout: post
title:  "Jak działa narzędzie do code coverage?"
description: "Krótkie spojrzenie wgłąb narzędzi do sprawdzania pokrycia kodu testami."
author: Comandeer
date: 2021-01-31T23:20:00+0100
tags:
    - javascript
    - eksperymenty
comments: true
permalink: /jak-dziala-narzedzie-do-code-coverage.html
---

Dzisiaj kontynuujemy zabawy z AST. Tym razem padło na narzędzie do code coverage!<!--more-->

## Zasada działania

Zacznijmy od szybkiego wyjaśnienia, czym jest code coverage (pokrycie kodu)? To wskażnik informujący nas o tym, ile kodu faktycznie zostało _pokrytych_ testami automatycznymi. Jeśli jakiś kod (np. funkcja `bakeCake`) nie został wykonany w czasie testów, to znaczy, że jest tak naprawdę nieprzetestowany (trudno przetestować ciasto bez jego wcześniejszego upieczenia!). Stąd też code coverage pozwala wyłapać tego typu sytuacje i dopisać brakujące testy.

Ale jak to dokładnie działa? Bodaj najpopularniejszym narzędziem do code coverage w światku JS jest [IstanbulJS](https://github.com/istanbuljs/istanbuljs) i to właśnie jemu się przyjrzymy. Standardowo używa się go przy pomocy narzędzia CLI, [`nyc`](https://github.com/istanbuljs/nyc), które "dokłada się" do polecenia testującego, np. `nyc mocha tests/*.js`. W ten sposób dokładamy do naszych testów uruchamianych przy pomocy [Mocha](https://mochajs.org/) ładne zliczanie pokrycia kodu. Od kuchni jednak Istanbula podzielić można na 3 podstawowe części:

* **instrumenter** – przerabiającą kod źródłowy tak, by dało się wyliczyć pokrycie kodu;
* **hook** – podpinającą instrumenter do każdego wczytywanego w Node.js przez `require` modułu (analogicznie do tego, jak [opisywałem to kiedyś na blogu](https://blog.comandeer.pl/html-w-node.html));
* **reporter** – przerabiający wyniki uzyskane dzięki instrumenterowi na format zrozumiały dla maszyn i/lub ludzi.

Najciekawszy jest zdecydowanie instrumenter, bo to w nim odbywa się cała magia związana z wyliczaniem pokrycia kodu. Zainstalujmy go zatem i zobaczmy, co robi z kodem źródłowym:

```bash
npm install istanbul-lib-instrument
```

Teraz stwórzmy prosty skrypt, który będzie z niego korzystał:

```javascript
const { createInstrumenter } = require( 'istanbul-lib-instrument' ); // 1

const instrumenter = createInstrumenter(); // 2
const instrumentedCode = instrumenter.instrumentSync( `const hello = () => { // 3
    console.log( 'Hello, world!' );
};

hello();`, 'virtual-file.js' ); // 4

console.log( instrumentedCode ); // 5
```

Na początku importujemy funkcję `createInstrumenter` (1) , która jest [fabryką](https://refactoring.guru/design-patterns/factory-method) instrumenterów. Następnie tworzymy jeden z domyślnymi opcjami (2). Dzięki temu możemy wywołać jego metodę `instrumentSync` i przerobić podany kod JS (3). Warto przy tym zauważyć, że kod podajemy jako string. Wynika to z tego, że instrumenter jest w zdecydowanej większości przypadków wywoływany przy pomocy hooka, a hooki dostają kod wczytywanych modułów jako string. W naszym przypadku przykładowy kod do pokrycia to:

```javascript
const hello = () => {
    console.log( 'Hello, world!' );
};

hello();
```

Drugi parametr (4) to nazwa pliku, z jakiego pochodzi kod i najczęściej zostaje pobrana przez hook. W naszym wypadku nazwa pliku jest nieistotna, więc można tu wpisać cokolwiek. Na samym końcu wyświetlamy otrzymany kod (5).

Odpalmy zatem nasz skrypt:

```bash
node nazwa-pliku-ze-skryptem
```

Powinniśmy uzyskać coś takiego:

```javascript
function cov_2mvg7hpc0f(){var path="virtual-file.js";var hash="c0f42c29fc01993cc28c18384ed0d61fa827b717";var global=new Function("return this")();var gcv="__coverage__";var coverageData={path:"virtual-file.js",statementMap:{"0":{start:{line:1,column:14},end:{line:3,column:1}},"1":{start:{line:2,column:4},end:{line:2,column:35}},"2":{start:{line:5,column:0},end:{line:5,column:8}}},fnMap:{"0":{name:"(anonymous_0)",decl:{start:{line:1,column:14},end:{line:1,column:15}},loc:{start:{line:1,column:20},end:{line:3,column:1}},line:1}},branchMap:{},s:{"0":0,"1":0,"2":0},f:{"0":0},b:{},_coverageSchema:"1a1c01bbd47fc00a2c39e90264f33305004495a9",hash:"c0f42c29fc01993cc28c18384ed0d61fa827b717"};var coverage=global[gcv]||(global[gcv]={});if(!coverage[path]||coverage[path].hash!==hash){coverage[path]=coverageData;}var actualCoverage=coverage[path];{// @ts-ignore
cov_2mvg7hpc0f=function(){return actualCoverage;};}return actualCoverage;}cov_2mvg7hpc0f();cov_2mvg7hpc0f().s[0]++;const hello=()=>{cov_2mvg7hpc0f().f[0]++;cov_2mvg7hpc0f().s[1]++;console.log('Hello, world!');};cov_2mvg7hpc0f().s[2]++;hello();
```

Jak widać, kod został mocno przerobiony. Co się jednak tak właściwie dzieje? Otóż Istanbul dorzucił do każdego wyrażenia w naszym kodzie JS licznik, w postaci `mapaPokrycia.s[ numerWyrażenia ]`. Na początku `mapaPokrycia` zawiera listę wszystkich występujących w kodzie wyrażeń wraz z liczbą ich wywołań w trakcie testów (na start wynoszącą `0`). Jeśli po zakończeniu testów przy danym wyrażeniu w mapie wciąż będzie widnieć `0`, to znaczy, że nie zostało ono przetestowane.

Sprawdzanie natomiast, które wyrażenie zostało wykonane, odbywa się poprzez "doklejenie" do wyrażenia odpowiedniej inkrementacji licznika, np.:

```javascript
mapaPokrycia.s[ 1 ]++;console.log('Hello, world!');
```

Tym sposobem, gdy test dojdzie do linijki z `console.log`, równocześnie zmieni się wartośc licznika dla tego `console.log`. Dostawienie inkrementacji bezpośrednio przed sprawdzanym wyrażeniem pozwala także na sprawdzanie wyrażeń wewnątrz `if`–ów i innych bloków (np. funkcji).

Osobne liczniki istnieją dla funkcji czy odgałęzień `if`–ów. I połączenie tych wszystkich liczników daje nam pełny obraz pokrycia kodu w danym pliku. Znając liczbę wszystkich wyrażeń w danym pliku i wiedząc, które z nich nie zostały wywołane ani razu, obliczenie procentowego pokrycia kodu testami jest już proste.

Warto tutaj także dodać, w jaki sposób Istanbul po zakończeniu testów jest w stanie zebrać dane ze wszystkich plików. Wszystkie mapy pokrycia przechowywane są bowiem w… zmiennej globalnej (w przypadku Node.js to zmienna doczepiona do `global`). To tak naprawdę jedyny sposób, żeby zebrać w jednym miejscu dane z wielu modułów, które w innym wypadku są od siebie całkowicie odizolowane. Zatem jeśli szukacie dobrego wykorzystania zmiennych globalnych, to właśnie ono – zbieranie informacji o code coverage.

## Implementacja

Skoro wiemy już, jak działa narzędzie do code coverage, zabierzmy się do napisania własnego! Oczywiście będzie ono o wiele prostsze od Istanbula i będzie zliczać wyłącznie pokrycie funkcji.

### Przygotowanie środowiska

Na sam początek trzeba sobie przygotować środowisko pracy. Stwórzmy zatem katalog `coverage-sample` i wygenerujmy plik `package.json` przy pomocy komendy:

```bash
npm init -y
```

Z racji tego, że nasze rozwiązanie będzie działać podobnie do pokazanego wcześniej `nyc`, musimy dodać jeszcze pole `bin` do wygenerowanego `package.json`:

```json
"bin": "index.js"
```

Teraz pora na zainstalowanie zależności. Będą nam potrzebne trzy:

* [`@babel/core`](https://www.npmjs.com/package/@babel/core) – zajmująca się dodawaniem liczników do kodu;
* [`pirates`](https://www.npmjs.com/package/pirates) – zajmująca się dodawaniem dodawania przez Babela;
* [`@babel/types`](https://www.npmjs.com/package/@babel/types) – zawierająca typy dla Babela, bo stwierdzili, że trzymanie ich osobno będzie wygodniejsze.

Wypada je zatem zainstalować:

```bash
npm install @babel/core pirates @babel/types
```

### Główny plik

Mając już postawione środowisko, możemy przystąpić do pisania kodu. Zaczniemy od pliku `index.js`, który będzie równocześnie programem wykonywalnym (odpowiednikiem `nyc`):

```javascript
#!/usr/bin/env node
// ↑1
const { resolve: resolvePath } = require( 'path' ); // 8
const addHook = require( './src/hook' ); // 2
const instrument = require( './src/instrumenter' ); // 3
const report = require( './src/reporter' ); // 4

global.__coverage__ = {}; // 5

addHook( instrument ); // 6

const entryPath = resolvePath( process.cwd(), process.argv[ 2 ] ); // 7

require( entryPath ); // 9

report( global.__coverage__ ); // 10
```

Na samym początku wstawiamy [shebang](https://en.wikipedia.org/wiki/Shebang_(Unix)) (1), który informuje terminal, jaki program powinien być użyty do uruchomienia tego pliku (w tym wypadku Node.js). Następnie załączamy poszczególne elementy naszego narzędzia (do ich tworzenia przystąpimy za chwilę): hook (2), instrumenter (3) oraz reporter (4). Tworzymy też globalny obiekt, który będzie przechowywał informacje o pokryciu kodu (5). Cała magia ukryta jest za dodaniem hooka (6). Funkcja ta jako argument przyjmuje instrumenter – bo chcemy, żeby wszystkie załączane pliki były instrumentowane. Następnie ustalamy ścieżkę do modułu z testami (7) przy użyciu funkcji `resolve` z wbudowanego modułu `path` (8). Ścieżkę tworzymy łącząc ścieżkę do katalogu roboczego (a więc katalogu, z którego ktoś odpalił nasze narzędzie) oraz ścieżkę przekazaną do samego programu. Tablica `process.argv` zawiera wszystkie argumenty z linii poleceń:

```bash
coverage-sample /ścieżka
```

W tym wypadku `/ścieżka` jest 3 elementem tej tablicy (po ścieżce Node'a oraz nazwie samego programu) – stąd w kodzie wykorzystujemy `process.argv[ 2 ]`.

Następnie po prostu wczytujemy moduł z testami (9), co powoduje wykonanie się zawartego w nim kodu, a przy okazji – liczników wstrzykniętych przez nasze narzędzie. Na samym końcu wyświetlamy wyniki zebrane w zmiennej globalnie w przyjaznej użytkownikowi formie (10).

### Reporter

Przejdźmy zatem do pliku reportera – `src/reporter.js` – bo jest najmniej ciekawy i w sumie istnieje tylko po to, żeby całość _spełniała normę estetyczną_. Plik wygląda tak:

```javascript
module.exports = ( coverageData ) => { // 1
	const { all, covered } = Object.entries( coverageData ).reduce( ( data, [ , { functions } ] ) => { // 2
		data.all += functions.length;
		data.covered += functions.reduce( ( covered, func ) => {
			return covered + func;
		}, 0 );

		return data;
	}, { all: 0, covered: 0 } );

	console.log( `All functions: ${ all }
Covered functions: ${ covered }
Coverage: ${ Math.round( covered / all * 100 ) }%` ); // 3
};
```

Cały plik składa się z eksportowanej funkcji (1), która jako argument przyjmuje zmienną globalną z danymi pokrycia. Wyciągamy z niej potrzebne nam dane przy pomocy `Object.entries` + `[].reduce` (2), formatujemy i wyświetlamy w konsoli (3). W sumie tyle – nic ciekawego się tutaj nie dzieje.

### Hook

Przejdźmy zatem do hooka (w pliku `src/hook.js`), bo ten jest już zdecydowanie bardziej ciekawy:

```javascript
const { addHook } = require( 'pirates' ); // 3

module.exports = ( instrument ) => { // 1
	addHook( ( code, path ) => { // 2
		if ( path.includes( '/tests/' ) ) { // 5
			return code; // 6
		}

		const instrumentedCode = instrument( code, path ); // 7

		return instrumentedCode; // 8
	}, { exts: [ '.js' ] } ); // 4
};
```

Cały plik to znowu eksportowana funkcja (1), która jako argument tym razem przyjmuje instrumenter. W jej środku wywołujemy funkcję `addHook` (2) z biblioteki `pirates` (3). Nasz hook będzie działał tylko na pliki z rozszerzeniem `.js` (4). Na samym początku odsiewamy wszystkie pliki testów (5). Dodanie liczników do plików testów nie ma sensu. Nie dość, że nie interesuje nas pokrycie kodu w testach a jedynie w samym kodzie aplikacji, to dodatkowo może to zaciemniać obraz. Stąd kod testów zostawiamy w spokoju i zwracamy go niezmieniony (6). Natomiast całą resztę kodu traktujemy naszym instrumenterem (7) i tak zmodyfikowany kod zwracamy (8). Dzięki temu każde wczytanie dowolnego modułu wczyta kod z dodanymi licznikami.

### Instrumenter

W końcu przyszła pora na danie główne – instrumenter! Zacznijmy od stworzenia pliku `src/instrumenter.js`.  Jego główną częścią będzie funkcja `instrument`, którą będziemy eksportować, a która przyjmuje dwa parametry – kod do przetworzenia i ścieżkę do pliku, z którego kod pochodzi:

```javascript
function instrument( code, filePath) {}

module.exports = instrument;
```

Wewnątrz tej funkcji będziemy chcieli pobrać wszystkie deklaracje funkcji i wstawić do nich licznik. W przeciwieństwie do [mojego wcześniejszego artykułu o AST](https://blog.comandeer.pl/bujajac-sie-na-galezi-ast.html), tym razem posłużymy się API wyższego poziomu, jakie jest udostępniane przez pakiet `@babel/core` – funkcją `transformSync`:

```javascript
const { transformSync } = require( '@babel/core' ); // 1

function instrument( code, filePath ) {
	const instrumentedCode = transformSync( code, { // 2
		plugins: [ // 3
			function codeCoverage() { // 4
				return { // 5
					visitor: { // 6
						FunctionDeclaration( path ) { // 7
						}
					}
				};
			}
		]
	} );

	return instrumentedCode.code; // 8
}
```

Na samym początku importujemy tę funkcję (1). Następnie, wewnątrz `instrument`, wywołujemy ją, przekazując jej jako 1. parametr kod do przetworzenia (2). Drugi parametr to obiekt opcji. W naszym wypadku chcemy tam przekazać plugin, który będzie dodawał liczniki do kodu. W tym celu musimy dorzucić opcję `plugins` (3) i sam plugin w formie funkcji (4). Babel pozwala pluginom używać [wzorcu Wizytatora](https://en.wikipedia.org/wiki/Visitor_pattern). Innymi słowy: można stworzyć funkcję, która będzie "wizytować" każdy węzeł w AST.  Co więcej, można wybrać typ węzłów dla naszego wizytatora, dzięki czemu odwiedzi tylko odpowiednie węzły. Żeby stworzyć wizytatora, nasz plugin musi zwróci obiekt (5) z własnością `visitor` (6). Natomiast sam wizytator musi mieć nazwę taką samą, jak typ węzła, który chcemy "wizytować" – w naszym wypadku `FunctionDeclaration` (7). Od tej chwili nasz wizytator będzie wywoływany za każdym razem, gdy Babel natrafi na deklarację funkcji. Na samym końcu zwracamy przetworzony kod (8).

Funkcja `transformSync` zawiera w sobie wszystko to, co wcześniej robiliśmy przy pomocy odpowiednich pakietów Babela, a więc: parsuje kod do AST, trawersuje go i modyfikuje, a na końcu na powrót generuje kod JS. To w połączeniu ze wzorcem Wizytatora tworzy przyjemny sposób na modyfikowanie AST.

Co jednak dokładnie będzie robił nasz wizytator? Wiemy, że ma dodawać liczniki do funkcji – tak, aby zliczać, czy są wywoływane. Najpewniej będzie to zrobić, dodając go jako pierwsze wyrażenie w ciele funkcji:

```javascript
function deklaracjaFunkcji() {
    // Tutaj chcemy umieścić licznik.
    […]
}
```

Umieszczenie licznika w ciele funkcji gwarantuje nam, że zostanie uruchomiony jedynie wówczas, gdy sama funkcja zostanie wywołana. Natomiast umieszczenie go na samym początku ciała funkcji pozwala ominąć nam wszystkie klauzule strażnicze i inne potencjalne problemy, które mogłyby zaciemnić obraz. Co więcej, sam początek ciała nie nastręcza trudności związanych choćby z potrzebą wstawiania licznika przed `return`, jeśli chcielibyśmy go umieszczać na końcu ciała funkcji (bo znajdując się po `return` nigdy nie zostałby uruchomiony).

Zatem kod naszego wizytatora powinien wyglądać tak:

```javascript
FunctionDeclaration( path ) {
    const counter = createCounter( filePath ); // 1

    path.get( 'body' ).unshiftContainer( 'body', counter ); // 2
}
```

Na samym początku tworzymy licznik (1), a następnie wstawiamy go na początek ciała funkcji (2).

Zanim przejdziemy do funkcji tworzącej licznik, wypada też zadbać o to, by nasz instrumenter zapisywał informacje o funkcjach i ich pokryciu dla każdego pliku, jaki przetwarza. W tym celu stwórzmy tablicę `functions`, która później będzie lądować w zmiennej globalnej:

```javascript
function instrument( code, filePath ) {
	const functions = []; // 1

	const instrumentedCode = transformSync( code, {
		plugins: [
			function codeCoverage() {
				return {
					visitor: {
						FunctionDeclaration( path ) {
							const counter = createCounter( filePath, functions.length ); // 3

							path.get( 'body' ).unshiftContainer( 'body', counter );
							functions.push( 0 ); // 2
						}
					}
				};
			}
		]
	} );

	global.__coverage__[ filePath ] = { // 4
		functions
	};

	return instrumentedCode.code;
}
```

Na samym początku funkcji instrumentującej tworzymy pustą tablicę `functions` (1). Za każdym razem, gdy wizytator natrafia na kolejną funkcję, wrzucamy do tej tablicy liczbę wywołań dla kolejnej funkcji (2). Natomiast sama funkcja tworząca liczniki powinna też wiedzieć, dla której konkretnie funkcji go tworzy – a więc dostawać indeks tej funkcji w tablicy `functions`. W tym celu zastosowane zostało `functions.length` (3). Działa to, ponieważ długość tablicy jest zawsze o jeden większa niż numer ostatniego indeksu. A to oznacza, że nowo dodawana funkcja ma indeks równy długości tablicy. Na samym końcu dorzucamy tablicę `functions` do globalnej zmiennej `__coverage__` pod kluczem stworzonym ze ścieżki do pliku modułu (4).

Przejdźmy zatem do funkcji tworzącej sam licznik:

```javascript
const {
	expressionStatement,
	identifier,
	stringLiteral,
	numericLiteral,
	memberExpression,
	updateExpression } = require( '@babel/types' ); // 3

[…]

function createCounter( fileName, index ) {
	return expressionStatement(
		updateExpression( '++', // 1
			memberExpression(
				memberExpression(
					memberExpression(
						memberExpression(
							identifier( 'global' ),
							identifier( '__coverage__' ),
							false // 2
						),
						stringLiteral( fileName ),
						true
					),
					identifier( 'functions' ),
					false
				),
				numericLiteral( index ),
				true
			)
		)
	);
}
```

Wygląda ona przerażająco, ale głównie z powodu sporej liczby zagnieżdżeń.

{% note %}W przypadku Reacta istnieje bardzo podobny problem: węzły potomne w <a href="https://reactjs.org/docs/faq-internals.html" hreflang="en" rel="noreferrer noopener">vDOM</a> tworzy się przy pomocy zagnieżdżenia w węźle-rodzicu. Tam jednak problem ten został rozwiązany przy pomocy <a href="https://reactjs.org/docs/introducing-jsx.html" hreflang="en" rel="noreferrer noopener">JSX</a>. Niemniej można łatwo sprawdzić, że <a href="https://babeljs.io/repl#?browsers=&build=&builtIns=false&spec=false&loose=false&code_lz=GYVwdgxgLglg9mABAQQA6oBQEpEG8BQiiATgKZQjFIA8AJjAG4B8hRi1AFgIxPUDOqAIZhefKMQQBzXqQC2TAHKCAVnwCE1APRzemsRLDStA4bu4siW-swDc-AL758aTFhtA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=es2015%2Creact%2Cstage-2&prettier=false&targets=&version=7.12.12&externalPlugins=">JSX faktycznie jest transpilowany do zagnieżdżeń</a>. Niestety, z tego, co mi wiadomo, nikt jeszcze nie przystosował JSX na potrzeby generowania AST.{% endnote %}

Tak naprawdę jedyne, co ten kod robi, to tworzy inkrementację zmiennej globalnej w postaci `global.__coverage__[ 'ścieżka/do/pliku' ].functions[ 0 ]++`. Sama inkrementacja to `updateExpression` (1). Natomiast odwołania do poszczególnych własności to kolejne `memberExpression`. Warto zwrócić tutaj uwagę na trzeci parametr tej funkcji (2). Określa on, czy dana własność ma być zapisana z kropką, czy z nawiasem. Dla ścieżki do pliku oraz liczby przyjmuje on wartość `true`, wymuszając nawias. Gdybyśmy zastosowali w tych wypadkach `false`, prowadziłoby to do błędu składniowego (`global.__coverage__.'ścieżka/do/pliku'.functions.0++`), stąd Babel dla takiego przypadku rzuca błędem. Wszystkie funkcje generujące nowe węzły pochodzą z pakietu `@babel/types` (3).

Cały kod instrumentera wygląda następująco:

```javascript
const {
	expressionStatement,
	identifier,
	stringLiteral,
	numericLiteral,
	memberExpression,
	updateExpression } = require( '@babel/types' );

const { transformSync } = require( '@babel/core' );

function instrument( code, filePath ) {
	const functions = [];

	const instrumentedCode = transformSync( code, {
		plugins: [
			function codeCoverage() {
				return {
					visitor: {
						FunctionDeclaration( path ) {
							const counter = createCounter( filePath, functions.length );

							path.get( 'body' ).unshiftContainer( 'body', counter );
							functions.push( 0 );
						}
					}
				};
			}
		]
	} );

	global.__coverage__[ filePath ] = {
		functions
	};

	return instrumentedCode.code;
}

function createCounter( fileName, index ) {
	return expressionStatement(
		updateExpression( '++',
			memberExpression(
				memberExpression(
					memberExpression(
						memberExpression(
							identifier( 'global' ),
							identifier( '__coverage__' ),
							false
						),
						stringLiteral( fileName ),
						true
					),
					identifier( 'functions' ),
					false
				),
				numericLiteral( index ),
				true
			)
		)
	);
}

module.exports = instrument;
```

### Testowanie narzędzia

W celu przetestowania narzędzia najlepiej będzie stworzyć przykładowy projekt. Stwórzmy zatem wewnątrz katalogu `coverage-sample` dodatkowy katalog – `sample-project` – i otwórzmy go w terminalu, by wygenerować dla niego plik `package.json`:

```bash
npm init -y
```

Do tak wygenerowanego pliku musimy dodać dwie rzeczy: nasz pakiet `coverage-sample` w formie zależności oraz wykorzystujący nasz pakiet skrypt testujący. Cały plik `package.json` powinien po zmianach wyglądać mniej więcej tak:

```javascript
{
  "name": "sample-project",
  "version": "1.0.0",
  "description": "",
  "main": "src/index.js",
  "directories": {
    "test": "tests"
  },
  "scripts": {
    "test": "coverage-sample ./tests/" // 4
  },
  "devDependencies": { // 1
    "coverage-sample": ".." // 2
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

Nasze narzędzie znalazło się w sekcji `devDependencies` (1). Zamiast wersji użyjemy `..`, żeby wskazać miejsce na dysku, w którym znajduje się nasz pakiet (2). W tym wypadku znajduje się on katalog wyżej. Natomiast w sekcji `scripts` (3) znalazł się skrypt `test`, który wykorzystuje nasz pakiet jako program wykonywalny (4). Jest to możliwe, ponieważ w `coverage-sample` dodaliśmy pole `bin` do `package.json`.

Teraz wystarczy "zainstalować" nasz pakiet:

```bash
npm install
```

 Dzięki tej komendzie npm utworzy odpowiednie linki symboliczne do naszego `coverage-sample` i będzie można go bez przeszkód wykorzystywać w przykładowym projekcie.

Natomiast sam projekt składać się będzie z dwóch plików: `src/index.js`, zawierającego kod aplikacji, oraz `tests/index.js`, zawierającego testy.

Plik `src/index.js` prezentuje się następująco:

```javascript
function main() {
	console.log( 'Hello, world!' );
}

function notMain() {
	console.log( 'Whatever' );
}

module.exports = {
	main,
	notMain
};
```

Z kolei plik `tests/index.js` wygląda tak:

```javascript
const { main } = require( '../src' );

main();
```

Jak widać, "testy" wykonują tylko jedną funkcję – `main`. Ten brak pokrycia powinien zostać wykazany przez nasze narzędzie do code coverage. Sprawdźmy, czy faktycznie tak się stanie:

```bash
npm test
```

Jeśli wszystko poszło zgodnie z planem, w terminalu powinna się pokazać następująca informacja:

```
All functions: 2
Covered functions: 1
Coverage: 50%
```

---

I to by było na tyle! Mam nadzieję, że artykuł choć trochę przybliżył działanie narzędzi pokroju IstanbulJS. Oczywiście [cały kod źródłowy dostępny jest na GitHubie](https://github.com/Comandeer/coverage-sample). Miłej zabawy!

PS wygląda, że zapomniałem o ważnej rocznicy: 9 stycznia 2021 mój [tutorial o semantycznym blogu w HTML](https://tutorials.comandeer.pl/html5-blog.html) obchodził swoje 10 urodziny! Nigdy nie sądziłem, że będzie żył tak długo, a już tym bardziej, że będę dbał o to, by był jak najbardziej aktualny.

