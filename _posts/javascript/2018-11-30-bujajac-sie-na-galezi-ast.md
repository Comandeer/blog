---
layout: post
title:  "Bujając się na gałęzi AST"
author: Comandeer
date:   2018-11-30 01:59:00 +0100
categories: javascript
comments: true
---

Istnieją rzeczy, na które zwykle nie zwracamy jakiejkolwiek uwagi, po prostu przyjmując ich istnienie za pewnik lub nie musząc się nimi całkowicie przejmować. Wiele takich rzeczy jest i w JS-ie – rzeczy, o które nie musimy się martwić w czasie codziennej pracy (no, chyba że rozwijasz Babela czy innego Rollupa; wówczas te rzeczy _są_ Twoją pracą…). Przyjrzymy się dzisiaj jednej z takich rzeczy – AST.

## Co to jest AST?

Operowanie na ciągach tekstowych nie należy do najprzyjemniejszych rzeczy pod słońcem i raczej nie trzeba nikogo o tym przekonywać. Owszem, istnieje coś takiego jak wyrażenia regularne, ale do najczytelniejszych nie należą (zwłaszcza, jeśli język – tak jak JS – nie ma wielu potrzebnych funkcji do ich obsługi), a ich używanie na dłuższą metę może być dość błędogenne i nieczytelne.

Chyba sztandarowym już przykładem rzeczy, do których ciągi tekstowe i wyrażenia regularne średnio się nadają, jest [parsowanie HTML-a](https://stackoverflow.com/a/1732454). Wyobraźmy sobie, że chcemy pobrać zawartość akapitu z klasą `.myClass`:

```html
<p class="myClass">content</p>
```

Nie powinno stanowić to większego problemu:

```javascript
pageContent.match( /<p.*?class="myClass".*?>(.+?)<\/p>/g )
```

Proste i przyjemne, prawda? Otóż nie do końca, bo poniższy kod również jest w pełni poprawnym HTML-em:

```html
<P cLaSs = 'myClass'>content
```

A nie doszliśmy jeszcze do przypadków błędnych, których [mechanizm obsługi jest w pełni opisany](https://html.spec.whatwg.org/multipage/parsing.html#parse-errors) i wymagany w silnikach przeglądarek:

```html
<p class="otherClass" class="myClass">content</p>
```

Najczęściej nie mamy żadnej pewności, że źródło, z którego pobieramy dane, jest poprawne składniowo. Ba, nawet jeśli jest poprawne składniowo, nie oznacza to, że używa oczekiwanej przez nas odmiany składni HTML-a. A nawet jeśli używa jej aktualnie, to jaka pewność, że jutro nie pojawi się nowa wersja aplikacji, która nie zacznie wypluwać nowej wersj HTML-a (choćby z powodu jego minifikacji)?

I taki jest właśnie problem z wyrażeniami regularnymi: ściśle dopasowują się do tekstu. Jak choćby jeden znaczek nie pasuje, to po ptokach. Przez to praca z bardziej skomplikowanymi ciągami tekstowymi staje się mocno upierdliwa. Dodatkowo same ciągi tekstowe są bardzo słabe w przekazywaniu dodatkowych informacji, np, o relacjach pomiędzy poszczególnymi elementami HTML. Dlatego też stwierdzono, że trzeba stworzyć sensowniejszą strukturę, która pokazywałaby, co tak naprawdę dzieje się w kodzie HTML i jak przeglądarka go widzi. I tym sposobem powstał DOM, czyli drzewko zawierające informacje o tym, jakie elementy znajdują się na stronie i jakie są między nimi relacje. Dzięki temu pobranie zawartości elementu `p.myClass` sprowadza się do:

```javascript
document.querySelector( 'p.myClass' ).innerHTML;
```

I tyle. Nie musimy się martwić różnicami składniowymi czy wręcz błędami – przeglądarka robi to za nas, _normalizując_ kod HTML do sensownej, spójnej postaci. Postaci, która dodatkowo pozwala nam określić, gdzie dokładnie w strukturze strony znajduje się dany element:

```javascript
p.parentNode; // <body>
p.previousElementSibling; // <p>
p.nextElementSibling; // null
```

Tym sposobem przeszliśmy od prostego ciągu tekstowego do przestrzennej struktury drzewiastej.

Niemniej taki pomysł sprawdza się nie tylko w przypadku HTML-a, równie dobrze można go zastosować także do innych języków, jak choćby naszego kochanego JavaScriptu. Tego typu strukturę drzewiastą, powstałą po przemieleniu kodu (czyli ciągu tekstowego) i ukazującą poszczególne węzły (powstałe z instrukcji, bloków, wyrażeń itp.) oraz zależności pomiędzy nimi, nazywa się <abbr>AST</abbr> – <span lang="en">Abstract Syntax Tree</span> (Abstrakcyjne Drzewko Składni). Jego zadanie jest bardzo podobne do zadania DOM: sprawne poruszanie się po kodzie programu i możliwość jego analizowania czy wręcz modyfikowania na żywo, bez potrzeby uciekania się do wyrażeń regularnych. Z tego też powodu jest najczęściej wykorzystywane przez kompilatory i inne narzędzia, które muszą analizować kod programów.

## AST w JavaScripcie

AST w JavaScripcie jest używane tak naprawdę w dwóch różnych światach. Z jednej strony jest integralną częścią pracy silników JS (np. [V8](https://github.com/v8/v8/blob/master/src/ast/ast.h)), które każdy kod parsują właśnie do postaci AST, z drugiej – narzędzi napisanych w samym JavaScripcie, a mających na celu rozszerzenie możliwości tego języka ([Babel](https://babeljs.io/) jest chyba najlepszym przykładem). W tym wpisie nie będziemy się zajmować tym, jaką magię na podstawie AST wykonują następnie silniki JS (a mowa tutaj choćby o [spekulatywnych optymalizacjach](https://benediktmeurer.de/2017/12/13/an-introduction-to-speculative-optimization-in-v8/)). Przyjrzymy się za to, jak całkowicie normalny programista JS, dla którego silnik JS jest jednolitą platformą, może AST wykorzystać do bardziej przyziemnych celów.

Narzędzi, które mogą dla nas wyprodukować AST, jest względnie dużo. Do najpopularniejszych parserów należą:

* [`@babel/parser`](https://babeljs.io/docs/en/babel-parser) – parser wykorzystywany przez Babela ([niespodzianka!](https://www.youtube.com/watch?v=_bSEfx6D8mA));
* [Esprima](http://esprima.org/) – związany wcześniej z jQuery, obecnie projekt JS Foundation;
* [Espree](https://github.com/eslint/espree) – parser wykorzystywany przez ESLinta;
* [Acorn](https://github.com/acornjs/acorn) – modularny parser, na którym oparte jest Espree i wzorowane `@babel/parser`.

Jak widać, najważniejsi gracze na rynku są do siebie podobni lub wręcz pochodzą od tego samego projektu (powiedzmy se szczerze: jak Marijn Haverbeke się za coś bierze, to praktycznie zawsze wychodzi coś naprawdę dobrego). Niemniej istnieją też inne parsery (np. ten w [UglifyJS](https://github.com/mishoo/UglifyJS2)/[Terserze](https://github.com/terser-js/terser)), a te już niekoniecznie grają według tych samych zasad. Dlatego postanowiono stworzyć standard jednego, wspólnego AST, opartego na składni AST z silnika SpiderMonkey (silnika JS w Firefoksie) – [ESTree](https://github.com/estree/estree). Większość parserów powinno już ten standard obsługiwać w pełni albo przynajmniej pozwalać na importowanie takiego AST, które zostanie następnie zamienione na własne AST parsera (jak ma to miejsce właśnie w UglifyJS/Terserze).

Niemniej to nudna teoria. Jak takie AST wygląda w praktyce? Weźmy sobie prosty program w JS:

```javascript
console.log( 'Hello world!' );
```

W celu ładnego zobaczenia AST posłużymy się z kolei narzędziem [AST Explorer](https://astexplorer.net/#/gist/1949675494fdec32df10f7a6029714a4/30bc3c550ef219f3f5a0fdc2521b12d2073bd921). Jak widać, dla tak prostego kodu drzewko wcale nie jest aż tak proste. Ba, na pierwszy rzut oka wydaje się strasznie skomplikowane.

Można zauważyć, że tak jak w przypadku `document` w DOM, w AST JS-a mamy do czynienia z `File` (rozważam to z punktu widzenia Babela; w innych parserach – pomimo istnienia jednego, wspólnego standardu – wygląda to nieco inaczej), w nim z kolei znajduje się `Program` (odpowiednik `document.documentElement` w DOM). Idąc dalej zauważymy, że cała nasza linijka kodu (wraz ze średnikiem) jest traktowana jako węzeł typu `ExpressionStatement`, a zatem – wyrażenie będące równocześnie instrukcją. Natomiast fragment bez średnika stanowi z kolei `CallExpression` – czyli wyrażenie zawierające wywołanie funkcji, itd. itp.

<p class="note">Instrukcja posiada wewnątrz sobie średnik, bo <a href="https://tc39.github.io/ecma262/#prod-ExpressionStatement">zgodnie ze specyfikacją ECMAScript jest to znak kończący instrukcję</a>. Teoretycznie kod bez średnika na końcu byłby niepoprawny składniowo, gdyby nie <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#Automatic_semicolon_insertion">mechanizm automatycznego wstawiania średników</a>.</p>

Każdy węzeł AST zawiera informacje o węźle poprzedzającym (`left`) i następującym po nim (`right`). Co ciekawe, każdy węzeł AST posiada też informację odnośnie tego, w którym miejscu kodu źródłowego się znajdował (`loc`). Średnio przydatne do większości zastosowań, ale np. przy tworzeniu sourcemap może się przydać.

## Modyfikujemy kod!

### Problem

Dobrze, ale to wciąż sucha teoria! Wyobraźmy sobie zatem jakiś praktyczny problem, jaki można rozwiązać przy pomocy AST. Otóż mamy program składający się z kilku plików JS, w których znajduje się kilkanaście wywołań `console.log`. Chcemy je wszystkie zamienić na `customLog`. I zanim ktoś zdąży stwierdzić, że wyrażenia regularne sprawdzą się tu doskonale, to lojalnie uprzedzam, że w kodzie mogą być takie oto niespodzianki:

```javascript
console.log( `console.log( 'Hello world!' ) najlepsiejsze jest na świecie!` );
```

A w ogóle to szef zakazał używać wyrażeń regularnych i trzeba znaleźć inny sposób. I tu na scenę wkracza AST! Nasze zadanie wygląda następująco:

1. Wczytać skrypt, który trzeba przerobić.
2. Zamienić ten skrypt na AST.
3. Wyszukać w AST odpowiednie węzły.
4. Podmienić te węzły na nowe.
5. Wygenerować nowy kod JS.
6. Zapisać nowy kod do pliku.

Posłużą nam do tego 4 pakiety Babela:

* [`@babel/parser`](https://babeljs.io/docs/en/babel-parser) w celu zamiany kodu na AST,
* [`@babel/traverse`](https://babeljs.io/docs/en/babel-traverse) w celu wyszukania i podmiany odpowiednich węzłów,
* [`@babel/generator`](https://babeljs.io/docs/en/babel-generator) w celu zamienienia zmienionego AST z powrotem na kod,
* [`@babel/types`](https://babeljs.io/docs/en/babel-types) w celu… erm… to po prostu zbiór typów węzłów, który Babel stwierdził, że umieści osobno ¯\\\_(ツ)\_/¯.

Z kolei przykładowy plik, który chcemy przerobić, zapisany jest jako `input.js` i wygląda tak:

```javascript
function someFunction() {
	if ( true ) {
		console.log( `console.log( 'Hello world!' ) najfajowsze jest na świecie!` );
	}
}

console.log( 'NAPRZÓÓÓÓÓD!!!' );
other.call( 'whatever' );

someFunction();

```

### Parsowanie kodu

Załóżmy, że jesteśmy już po fazie instalacji zależności:

```bash
npm install @babel/parse @babel/traverse @babel/generator @babel/types
```

Pierwszy krok, jaki musimy wykonać, to zamiana kodu na AST. W tym celu musimy wczytać treść tego pliku, a następnie skorzystać z metody `parse` pakietu `@babel/parse`:

```javascript
const { join: joinPath} = require( 'path' ); // 3
const { readFileSync } = require( 'fs' ); // 2
const { parse } = require( '@babel/parse' ); // 5

const path = joinPath( __dirname, 'input.js' );
const code = readFileSync( path, 'utf8' ); // 1
const ast = parse( code ); // 4
```

Do wczytania pliku (1) używamy metody `readFileSync` z wbudowanego modułu `fs` (2). By mieć pewność, że ścieżka do pliku będzie prawidłowa, skorzystamy z kolei z metody `join` z wbudowanego modułu `path` (3). Gdy już mamy kod z pliku zapisany do zmiennej, wystarczy przepuścić go przez metodę `parse` (4), która pochodzi z pakietu `@babel/parse` (5). Tyle – mamy AST!

### Przeczesywanie drzewka

Na tym rola modułu `@babel/parse` się kończy, a na scenę wkracza `@babel/traverse`, umożliwiający poruszanie się po całym drzewku i pobieranie każdego węzła. Przekażmy mu zatem AST:

```javascript
const { default: traverse } = require( '@babel/traverse' );

[…]

traverse( ast, { // 1
	enter( path ) { // 2

	}
} );
```

Jak widać, moduł ten ma domyślny eksport będący funkcją (1), który jako argument przyjmuje AST oraz obiekt ustawień. Metoda `enter` (2) tego obiektu oznacza, że chcemy odpalać jakąś akcję przy wejściu do danego węzła. Istnieje też metoda `exit`, odpalana przy wychodzeniu z węzła. Dla nas ta różnica nie jest obecnie istotna, więc pozwolę sobie ją pominąć.

<p class="note">Jeśli zastanawiasz się, czemu domyślny eksport modułu wymaga odwołania się bezpośrednio do <code>default</code>, to jest to <a href="http://2ality.com/2017/01/babel-esm-spec-mode.html">efekt transpilacji modułu ES do formatu CJS, z zachowaniem semantyki opisanej w specyfikacji ECMAScript</a>.</p>

Parametr `path`, przekazywany do `enter`, to z kolei obiekt opakowujący węzeł AST. Zawiera on dodatkowe metody i własności, pozwalające ustalić, z kim sąsiaduje dany węzeł, ale także pozwalające zmienić sam węzeł. Wszystkie operacje są wykonywane na przekazanym drzewie `ast`, które jest w pełni żywe i mutowalne.

<p class="note">Niestety, nigdzie nie udało mi się znaleźć dokumentacji obiektu <code>path</code>. Najbliżej tego znajduje się <a href="https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md">Babel Plugin Handbook</a>.</p>

Spróbujmy zatem odsiać te węzły, które nas nie interesują. My potrzebujemy tylko wywołań `console.log`, a zatem na pewno potrzebujemy znaleźć `CallExpression`. Dodatkowo powinno ono w sobie zawierać `MemberExpression`, czyli odwołanie do własności obiektu (którym `console.log` bez wątpienia jest). Napiszmy zatem odpowiedni kod z perspektywy `console.log`:

```javascript
const { isMemberExpression, isCallExpression } = require( '@babel/types' ); // 5

[…]

traverse( ast, {
	enter( path ) {
		const { node, parentPath } = path; // 1

		if ( !parentPath ) { // 2
			return;
		}

		const { node: parentNode } = parentPath; // 3

		if ( !isMemberExpression( node ) || !isCallExpression( parentNode ) ) { // 4
			return;
		}
	}
} );
```

Z parametru `path` wyciągamy własności `node` i `parentPath` (1). Pierwsza to oczywiście opakowany węzeł, z kolei druga to ścieżka rodzica aktualna węzła (i znów: podobnie jak w DOM, węzły w AST mają swoich rodziców). Jeśli węzeł nie ma rodzica (2), to znaczy, że mamy do czynienia z węzłem typu `File` lub `Program`. Jeśli z kolei ma, to możemy go odpakować ze ścieżki (3). Następnie sprawdzamy, czy aktualny węzeł jest typu `MemberExpression`, a jego rodzic – `CallExpression` (4). Pomogą nam w tym metody zaciągnięte z `@babel/types` (5).

Ok, skoro odsialiśmy już węzły, które nas nie interesują, czas zająć się tymi, które nas interesują! Chcemy podmienić wywołania `console.log` na wywołanie `customLog`, czyli chcemy podmienić węzeł typu `MemberExpression` na węzeł typu `Identifier` (`customLog` to nazwa funkcji, a zatem – identyfikator). Nie jest to jakaś niezwykle skomplikowana operacja:

```javascript
const { […], identifier } = require( '@babel/types' ); // 1

[…]

traverse( ast, {
	enter( path ) {
		[…]

		path.replaceWith( // 3
			identifier( 'customLog' ) // 2
		);
	}
} );
```

Korzystamy z kolejnego typu, `identifier` (1). Dzięki niemu tworzymy identyfikator dla `customLog` (2) i wykorzystujemy go do podmiany obecnego węzła (3).

I już! Właśnie pozbyliśmy się z kodu wywołań `console.log` na rzecz `customLog`.

### Generowanie i zapis kodu

Teraz zostało nam już tylko wygenerować kod na podstawie zmienionego AST i zapisać go do pliku:

```javascript
const { […], writeFileSync } = require( 'fs' ); // 4
const { default: generate } = require( '@babel/generator' ); // 2

[…]

const { code:transformedCode } = generate( ast ); // 1

const outputPath = joinPath( __dirname, 'output.js' );
writeFileSync( outputPath, transformedCode, 'utf8' ); // 3
```

Wygenerowanie nowego kodu sprowadza się do wywołania funkcji `generate` (1), będącej domyślnym eksportem `@babel/generator` (2). Zapisanie do pliku (3) to z kolei zadanie `writeFileSync` z wbudowanego modułu `fs` (4).

### Dodatkowe filtrowanie węzłów

Gdybyśmy teraz otworzyli tak zapisany plik z kodem, zauważylibyśmy 2 rzeczy:

* formatowanie kodu nie jest takie jak w oryginale;
* również wywołanie `other.call` zostało zmienione na `customLog`.

Pierwszy "błąd" jest dość prosty do wytłumaczenia: AST nie zawiera informacji o białych znakach, bo są one całkowicie nieistotne z punktu widzenia działania programu. Dlatego tego typu informacje w trakcie transformacji do i z AST są najczęściej tracone. Na szczęście na takie problemy pomoże tandem [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/).

Drugi błąd jest spowodowany tym, że niezbyt dokładnie filtrujemy węzły, które chcemy zmienić. Wypada się upewnić, czy faktycznie mamy do czynienia z wywołaniem `console.log`. W tym celu napiszmy sobie prostą funkcję `isConsoleLog`:

```javascript
const { […], isIdentifier, identifier } = require( '@babel/types' ); // 1

[…]

function isConsoleLog( { object, property } ) { // 3
	return isIdentifier( object ) && isIdentifier( property ) && object.name === 'console' && property.name === 'log';
}

traverse( ast, {
	enter( path ) {
		[…]

		if ( !isMemberExpression( node ) || !isCallExpression( parentNode ) || !isConsoleLog( node ) ) { // 2
			return;
		}

		[…]
	}
} );
```

Wykorzystujemy kolejną funkcję z `@babel/types` – `isIdentifier` (1). Naszą funkcję `isConsoleLog` z kolei umieszczamy wewnątrz warunku odsiewającego węzły w `traverse` (2). Przekazujemy jej nasz węzeł. Interesują  nas tak naprawdę dwie jego właściwości – `object` i `property` (3). Pierwsza określa, do jakiego obiektu dane wyrażenie się odwołuje, a druga – do jakiej własności tego obiektu. Sprawdzamy, czy obydwie własności są identyfikatorami oraz czy ich nazwy (`name`) to odpowiednio `console` i `log`. I dopiero po takim sprawdzeniu mamy pewność, że mamy do czynienia z wywołaniem `console.log`.

Tym oto sposobem stworzyliśmy prosty skrypt, który pozwala zmodyfikować nam kod JS bez potrzeby uciekania się do wyrażeń regularnych, w oparciu o przyjazną strukturę drzewiastą. A to przecież raptem ułamek możliwości AST! Dzięki umiejętnemu wykorzystaniu parsera można choćby rozszerzać składnię JS-a (co doskonale pokazuje przykład [JSX-a](https://reactjs.org/docs/introducing-jsx.html)).

[Przykład do tego artykułu znajduje się na GitHubie](https://github.com/Comandeer/ast-example).
