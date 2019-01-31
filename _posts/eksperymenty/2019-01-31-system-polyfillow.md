---
layout: post
title:  "System polyfillów"
author: Comandeer
date:   2019-01-31 02:45:00 +0100
categories: eksperymenty javascript
comments: true
---

Pod koniec tamtego roku trafiłem na artykuł o [leniwym wczytywaniu polyfillów](https://itnext.io/lazy-loading-polyfills-4b85c4951e73). Były one wczytywane w kodzie aplikacji przy pomocy `import`. Niemniej zupełnie nie zgodziłem się wówczas z wizją autora i postanowiłem stworzyć własną wersję takiego systemu. W końcu znalazłem na to chwilę.

## Założenia

Zastanówmy się, jak taki system powinien działać, by wiedzieć, co tak naprawdę chcemy kodzić:

* aplikacja nie powinna nic wiedzieć o polyfillach,
* sposób wczytywania polyfillów powinien być jak najprostszy,
* polyfille powinny być dobierane na podstawie feature detection,
* cały system powinien bez problemów współpracować z CSP,
* nie chcemy opierać się na zewnętrznej usłudze.

Przyjrzyjmy się poszczególnym założeniom nieco bliżej.

### Aplikacja nie powinna nic wiedzieć o polyfillach

To jest w sumie mój największy problem ze wspomnianym artykułem. Gdy spojrzymy na [kod aplikacji](https://github.com/pkuczynski/medium-lazy-load-polyfills/blob/79b530e8d18d999d235e2c6af0c17c1c558868a3/src/index.js), zauważymy, że jej publiczne API tak naprawdę zostało nagięte pod potrzebę wczytywania polyfillów. A przecież tak nie powinno być.

Wyobraźmy sobie, że w końcu w naszym życiu pojawia się upragnione dziecko. Przywozimy je więc ze szpitala do domu i wsadzamy do pustego pokoju, w którym ze ścian wystają gwoździe, a na podłodze rozsypane jest szkło. W tym pokoju nie ma przy okazji ani jednej zabawki, dziecięcego łóżeczka czy jakiejkolwiek rzeczy wskazującej na to, że to pokój małego dziecka, a nie masochistycznego psychopaty. Jeśli wsadzimy nasze dziecko do takiego pokoju, naiwnie twierdząc, że przecież powinno się dostosować, to najprawdopodobniej kolejne 10-15 lat będziemy oglądać świat zza więziennych krat.

Skoro zatem nie oczekujemy od dziecka, że dostosuje się do swojego nowego środowiska, ale dostosowujemy je pod nie, czemu tego samego nie robimy z aplikacjami? To nie nasza aplikacja powinna się martwić tym, że jest uruchamiana w przeglądarce, której brakuje jakichś funkcji. Ona powinna założyć, że wszystko zostało dla niej przygotowane i radośnie się odpalić. A jeśli jednak zawiedliśmy w przygotowaniach, powinniśmy dostać soczysty, dokładny błąd, co zawiodło.

Dlatego kod zajmujący się wczytywaniem polyfillów powinien być jak najbardziej oddzielony od kodu samej aplikacji, tak, aby jej logika nie była niepotrzebnie komplikowana. Wystarczy bowiem wyobrazić sobie, że piszemy jedną wersję logiki, która ma działać zarówno w IE 11, jak i najnowszym Chrome. To oznacza, że musielibyśmy pisać kod jak dla IE, otaczając naprawdę sporą ilość kodu w odpowiednie warunki i pisać wszystko w oparciu o obiecanki, które mogłyby zaciągać odpowiednie polyfille (lub całość kodu wepchać w jeden, spory warunek). Problem pogłębiałby się w chwili, gdyby nasz kod był podzielony na mniejsze moduły, które zajmowałyby się różnymi elementami aplikacji, potrzebując do tego – rzecz jasna – różnych polyfillów. Tworzyłoby to piętrowe wczytywanie plików: najpierw trzon aplikacji musiałby leniwie wczytać moduł, który następnie musiałby doczytać swoje polyfille. A to tworzyłoby problemy podobne do [problemów z `@import` w CSS](https://www.stevesouders.com/blog/2009/04/09/dont-use-import/). Oczywiście, dałoby się rozwiązać to poprzez wczytanie wszystkich polyfillów dla wszystkich modułów na samym początku, ale to niejako zabijałoby sens całego pomysłu.

Jeśli oddzielimy kod przygotowujący środowisko przeglądarki i wczytujący polyfille od kodu samej aplikacji, te problemy przestają być problemami aplikacji. Wczytywanie polyfillów zachodzi gdzieś w tle, a aplikacja ma pewność, że zawsze odpali się w gotowym, przygotowanym dla niej środowisku. Można wówczas optymalizować wczytywanie polyfillów na różne sposoby (nawet na tak karkołomne, jak wykorzystanie uczenia maszynowego do zgadywania, jakich polyfillów dany użytkownik będzie potrzebował) czy spróbować rozwiązać leniwe wczytywanie polyfillów dla poszczególnych modułów. I sposób rozwiązania tych problemów będzie całkowicie dowolny, bo logika aplikacji i jej złożoność nie będą nas ograniczać w żadnym stopniu.

### Sposób wczytywania polyfillów powinien być jak najprostszy

W najprostszym przypadku wczytanie polyfillów odbywałoby się przed wczytaniem kodu aplikacji, z zachowaniem kolejności wczytywania: najpierw powinny wczytać się polyfille, a potem aplikacja. Można to zrobić przy pomocy następujących po sobie `import`, niemniej w tym wypadku musielibyśmy poczekać z wczytywaniem aplikacji, aż się nie wczytają polyfille (inaczej nie dałoby się zachować kolejności wczytywania). Można wykorzystać loadery typu [Require.js](https://requirejs.org/), ale wówczas całość z automatu przestaje być prosta. A można też po prostu… stworzyć dwa skrypty z [atrybutem `[defer]`](https://html.spec.whatwg.org/multipage/scripting.html#attr-script-defer).

Skrypty takie mają dwie pomocne właściwości: zawsze wczytują się w takiej kolejności, w jakiej zostały dodane do kodu oraz wykonują się zawsze po wczytaniu DOM. Zatem najprostszy skrypt do wczytywania polyfillów, niezależny od aplikacji, wyglądałby tak:

```javascript
( function() {
	createScript( 'polyfills.js' );
	createScript( 'app.js' );

	function createScript( src ) {
		const script = document.createElement( 'script' );

		script.defer = true;
		script.async = false;
		script.src = src;

		document.head.appendChild( script );
	}
}() );
```

I tak upewniliśmy się, że polyfille zostaną zawsze wczytane przed aplikacją.

<p class="note">Innym sposobem jest wykorzystanie faktu, że moduły ES (<code>script[type=module]</code>) domyślnie zachowują się jak <code>script[defer]</code>. Jeśli zatem nasza aplikacja to moduł, nic nie stoi na przeszkodzie, by wykorzystać tę nowszą metodę.</p>

### Polyfille powinny być dobierane na podstawie feature detection

Chodzi głównie o to, by nie wczytywać niepotrzebnie wszystkich polyfillów, a listy potrzebnych nie tworzyć przez zgadywanie na podstawie informacji o wersji przeglądarki – zwłaszcza, że te [mogą w przyszłości zniknąć](https://groups.google.com/a/chromium.org/forum/#!msg/blink-dev/WQ0eC_Gf8bw/dhWMhCYYDwAJ).

Najlepszym przykładem działania feature detection jest [biblioteka Modernizr](https://modernizr.com/). Na podstawie prostych testów sprawdza, czy przeglądarka obsługuje daną rzecz, a jeśli nie, informuje o tym developera. W naszym wypadku możemy przeprowadzić takie proste testy, a następnie – wczytać polyfille przy pomocy przedstawionej wyżej metody.

### Cały system powinien bez problemów współpracować z CSP

[CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) zdecydowanie podwyższa poziom bezpieczeństwa strony, stąd wypadałoby, żeby nasz system wczytywania polyfillów w pełni z nim współdziałał. Nie jest to trudne, zwłaszcza, jeśli wykorzystamy najnowszą wersję CSP 3, w której można wykorzystać słowo kluczowe [`'strict-dynamic'`](<https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src#strict-dynamic>). To słówko kluczowe pozwala nam "delegować" zaufanie. Oznacza to tyle, że jeśli na naszej stronie znajduje się zaufany skrypt (czyli zidentyfikowany albo przez hash zawartości, albo przez wartość atrybutu `[nonce]`), to informujemy przeglądarkę, żeby automatycznie ufała wszystkim skryptom wczytanym przez ten skrypt. A to brzmi wręcz dokładnie jak to, co chcemy zrobić!

### Nie chcemy opierać się na zewnętrznej usłudze

Choć większość opisanych założeń spełnia [usługa polyfill.io](https://polyfill.io/v3/), to nie chcemy się na niej opierać. Każda zewnętrzna usługa to tak naprawdę kolejna zależność naszej aplikacji. W tym momencie działanie naszej aplikacji uzależnialibyśmy od działania zewnętrznej usługi wczytującej polyfille. Gdyby zaliczyła ona pada, nasza aplikacja również by klęknęła i to całkowicie nie z naszej winy.

I choć można zastosować polyfill.io lokalnie, na potrzeby tego artykułu stworzymy prymitywny skrypt wczytujący polyfille.

### Dodatkowe założenie

Żeby uprościć sobie nieco zadanie na potrzeby tego artykułu, dorzucę dodatkowe założenie: aplikacja musi działać w najnowszych wersjach przeglądarek, z wyłączeniem Internet Explorera. Dzięki temu nie będę musiał się martwić o transpilację ES6 do ES5 i inne tego typu rzeczy.

## Co będziemy tworzyć?

Stworzymy obrażającą ludzkość swą banalnością aplikację. Jej zadaniem będzie wczytanie pliku JSON i wyświetlenie jego zawartości w `div#app`. Na potrzeby tego zadanka wykorzystamy jednak dwa nieistniejące sieciowe API – co to by mieć co polyfillować: `fetch.JSON` (do pobierania JSON-a) oraz `JSON.render` (do umieszczania zawartości JSON-a w danym elemencie HTML). I to tyle.

Z racji tego, że chcemy od razu sprawdzić, czy całość będzie działać z CSP (a zatem: po ustawieniu odpowiedniego nagłówka HTTP), musimy postawić sobie prosty serwer WWW. Ja do tego celu wykorzystam Node.js i paczkę [Express.js](https://expressjs.com/) wraz z systemem szablonów [Whiskers.js](https://github.com/gsf/whiskers.js/) (🐈). Jedynym zadaniem tego serwera będzie serwowanie pliku HTML, w którym zostanie wczytana nasza aplikacja, oraz kodu polyfillów, jak i samej aplikacji.

## Stawiamy środowisko

Postawienie środowiska pracy sprowadza się do stworzenia katalogu o dowolnej nazwie, a następnie wywołaniu w konsoli dwóch komend:

* `npm init -y` – to wygeneruje nam domyślny plik `package.json` dla danego projektu; będzie nam potrzebny w sumie wyłącznie po to, by zapisać gdzieś zależności;
* `npm install express whiskers --save` – ta komenda zainstaluje nam Express.js i system szablonów Whiskers.

Żeby ułatwić sobie pracę, dodajmy też dodatkowy skrypt do pliku `package.json`:

```json
"scripts": {
  "start": "node index"
},
```

Teraz, gdy będziemy chcieli uruchomić nasz serwer, po prostu wpiszemy w konsolę `npm start`. Wówczas zostanie odpalony kod z pliku `index.js`. Oczywiście musimy go stworzyć. Najprostszy sposób to skopiowanie [tradycyjnego "Witaj, świecie!" z dokumentacji Express.js](https://expressjs.com/en/starter/hello-world.html), zapisanie tego kodu jako `index.js` i wywołanie `npm start` w konsoli. Jeśli pojawi się w niej napis "Example app listening on port 3000!", to znaczy, że wszystko działa, a nasza aplikacja dostępna jest pod adresem `http://localhost:3000`. Żeby wyłączyć serwer, wystarczy nacisnąć <kbd>Ctrl</kbd>+<kbd>C</kbd>.

Ok, przejdźmy do mięska.

## Nasze polyfille

Jak już wspomniałem, na potrzeby tego artykułu stworzymy dwa wydumane API: `fetch.JSON` oraz `JSON.render`. Obydwie funkcje są banalne, a ich implementacje pokazane są poniżej. Użyjemy ich równocześnie jako polyfillów.

### `fetch.JSON`

```javascript
fetch.JSON = function( URL ) {
    return fetch( URL ).then( ( res ) => {
        return res.json();
    } );
};
```

Kod jest na tyle prosty, że nie bardzo jest tutaj nawet co omawiać. Dodajemy nową metodę statyczną do globalnego `fetch`, która po prostu pobiera zasób znajdujący się pod adresem podanym jako parametr `URL` i przerabia go na JSON. I tyle, nic więcej się tutaj nie dzieje.

### `JSON.render`

```javascript
JSON.render = function( json, selector ) {
	document.querySelector( selector ).innerHTML = JSON.stringify( json );
};
```

To API jest z kolei jeszcze prostsze. Przerabia obiekt podany jako parametr `json` na ciąg tekstowy i wstawia go do elementu pasującego do selektora `selector`. Oczywiście ktoś w W3C nie pomyślał o bezpieczeństwie, stąd JSON ostatecznie jest parsowany jako HTML, co [umożliwia wyrafinowane ataki XSS](https://www.owasp.org/index.php/DOM_based_XSS_Prevention_Cheat_Sheet#RULE_.237_-_Fixing_DOM_Cross-site_Scripting_Vulnerabilities). Ale to nie nasz problem, my tu tylko polyfilla piszemy!

## Podstawowa wersja

### Kod aplikacji

Zacznijmy od stworzenia kodu aplikacji. Zapiszemy go jako plik `public/app.js`:

```javascript
fetch.JSON( 'data.json' ).then( ( data ) => {
	JSON.render( data, '#app' );
} );
```

Jak mówiłem, jest to najprostsza aplikacja świata: pobiera plik JSON i wyświetla jego zawartość. Używa do tego dwóch wymyślonych wyżej APIs. I znów nie bardzo jest o czym mówić.

Dodatkowo musimy w tym samym katalogu `public` stworzyć plik `data.json`, który powinien zawierać dowolne dane w tym formacie. Są potrzebne tylko po to, by można było coś wyświetlić. W moim wypadku plik ten wygląda następująco:

```json
{
    "author": "Comandeer"
}
```

OK, to aplikację mamy już z głowy i więcej do tych plików nie zaglądniemy. Teraz wypada zająć się serwowaniem tego użytkownikowi.

### Serwowanie aplikacji użytkownikowi

Żeby zaserwować aplikację użytkownikowi, trzeba wskazać Express.js, gdzie powinien szukać wszystkich statycznych plików strony. Dodatkowo samą stronę HTML będziemy chcieli generować przy pomocy naszego systemu szablonów, Whiskersa. Przyda nam się to później, przy dodawaniu obsługi CSP.

Zacznijmy od dodania obsługi szablonów:

```javascript
const whiskers = require( 'whiskers' ); // 1
const path = require( 'path' ); // 2

[…]

app.engine( '.html', whiskers.__express ); // 3
app.set( 'views', path.join( __dirname, 'views' ) ); // 4
```

Na samym początku pliku dołączamy zarówno pakiet `whiskers` (1), jak i wbudowany w Node moduł `path` (2). Następnie, przed wszystkimi `app.get`, informujemy Express.js, jakiego systemu szablonów ma używać (3) oraz gdzie znajdzie szablony (4). Ścieżkę podajemy przy wykorzystaniu funkcji `path.join`, która bierze poszczególne parametry i łączy je w sposób charakterystyczny dla danego systemu operacyjnego.

Mając już załadowany system szablonów, możemy stworzyć podstawowy szablon aplikacji. W tym celu stworzymy prosty plik `views/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="ie=edge">
	<script src="/app.js" defer="defer"></script> <!-- 1 -->
	<title>My super hiper web app</title>
</head>
<body>
	<div id="app"></div> <!-- 2 -->
</body>
</html>
```

Ot, prosty plik HTML. Widzimy, że wczytujemy w nim plik `app.js` (1) oraz że pusty `div` jest dodany od początku (2).

Teraz wystarczy dodać generowanie strony z tego szablonu, gdy użytkownik wejdzie na główny adres naszej aplikacji (czyli `http://localhost:3000`). W tym celu musimy podmienić istniejącą w kodzie obsługę ścieżki `/` (czyli kod `app.get( '/', callback )`):

```javascript
app.get( '/', ( req, res ) => {
	res.render( 'index.html' ); // 1
} );
```

Metoda `res.render` (1) odpowiedzialna jest za przerobienie szablonu na ostateczną stronę.

Musimy jeszcze poinformować Express o tym, gdzie znajdują się pliki statyczne (czyli w tym m.in. plik naszej aplikacji). W tym celu tuż przed `app.listen` umieszczamy następującą linię:

```javascript
app.use( express.static( 'public' ) );
```

Nie jest to kurs tworzenia backendu w Express.js, więc jedynie wspomnę, że `express.static` to tzw. [middleware](https://expressjs.com/en/guide/using-middleware.html), czyli specjalna funkcja do obsługi konkretnych typów żądań. Dzięki niemu żądania typu `/app.js` zostaną "złapane" i przerobione na wczytanie odpowiedniego pliku z katalogu `public`.

Cały kod serwera na ten moment powinien wyglądać mniej więcej tak:

```javascript
const express = require( 'express' );
const whiskers = require( 'whiskers' );
const path = require( 'path' );
const app = express();
const port = 3000;

app.engine( '.html', whiskers.__express );
app.set( 'views', path.join( __dirname, '/views' ) );

app.get( '/', ( req, res ) => {
	res.render( 'index.html' );
} );

app.use( express.static( 'public' ) );

app.listen( port, () => {
	console.log( `Example app listening on port ${port}!` );
} );
```

Możemy zatem uruchomić teraz serwer, wywołując w konsoli komendę `npm start`/`node index`, a następnie przejść w przeglądarce pod adres http://localhost:3000. Gdy otworzymy konsolę przeglądarki, naszym oczom powinien ukazać się taki oto błąd:

> Uncaught TypeError: fetch.JSON is not a function

Nie ma w tym nic niezwykłego, na razie w końcu nie wczytujemy w żaden sposób polyfillów. Ale to za chwilę się zmieni!

### Wczytywanie polyfillów – kod w przeglądarce

Kod do wczytywania polyfillów w przeglądarce będzie się opierał na [kodzie zaprezentowanym przy omawianiu jednego z założeń](#sposób-wczytywania-polyfillów-powinien-być-jak-najprostszy):

```javascript
( function() {
	createScript( 'polyfills.js' ); // 6
	createScript( 'app.js' ); // 7

	function createScript( src ) { // 1
		const script = document.createElement( 'script' ); // 2

		script.defer = true; // 4
		script.async = false; // 3
		script.src = src;

		document.head.appendChild( script ); // 5
	}
}() );
```

Tworzymy zatem funkcję `createScript` (1), która jako parametr przyjmuje URL skryptu, który chcemy wczytać. Tworzymy zatem nowy element `script` (2) i ustawiamy mu odpowiednie własności: wyłączamy własność `async` (3) i włączamy `defer` (4). Robimy to, ponieważ dynamicznie stworzone skrypty mają `async` dodawane domyślnie. Zachowanie z nim związane nam jednak nie odpowiada, bo nie pozwala na zachowanie kolejności wczytywanych skryptów. Stąd "przełączamy się" na `defer`. Ostatecznie dodajemy tak stworzony skrypt do dokumentu (5). Następnie przy pomocy funkcji `createScript` wczytujemy polyfille (6) i samą aplikację (7). Aplikacja musi zostać dołączona w ten sam sposób co polyfille, bo dynamicznie dodawane do strony skrypty są wykonywane zawsze na końcu. Tym sposobem, gdybyśmy wyciągnęli dodawanie aplikacji poza skrypt ładujący polyfille, aplikacja wczytałaby się przed nimi, powodując błąd.

OK, ale przecież nie mamy żadnego pliku `polyfiils.js` – wszak całe te podchody robimy po to, by móc wykryć, jakie polyfille potrzebujemy! Dlatego musimy dodać na sam początek tego [IIFE](http://benalman.com/news/2010/11/immediately-invoked-function-expression/) wspomniane już feature detection. W naszym wypadku testy nowych API można sprowadzić do prostego sprawdzenia, czy dane metody występują w danych obiektach:

```javascript
'JSON' in fetch;
'render' in JSON;
```

Niemniej przygotujemy sobie przy okazji mały "framework", do którego łatwo będzie dodać nowe testy. Proponuję stworzyć obiekt, w którym kluczami będą nazwy poszczególnych ficzerów, a wartościami – funkcje je testujące. W naszym wypadku taki obiekt mógłby wyglądać tak:

```javascript
const features = {
	[ 'JSON.render' ]() {
		return 'render' in JSON;
	},

	[ 'fetch.JSON' ]() {
		return 'JSON' in fetch;
	}
};
```

Zatem sprawdzenie, czy przeglądarka wspiera `JSON.render`, sprowadzać się będzie do wywołania funkcji `features[ 'JSON.render' ]` i sprawdzenia, jaką wartość zwraca: `false` oznacza, że dany ficzer nie jest wspierany, a `true` – że jest.

Wystarczy zatem przejechać pętlą po tym obiekcie i wywołać wszystkie testy:

```javascript
const toLoad = Object.entries( features ).reduce( ( toLoad, [ feature, test ] ) => { // 1
	if ( !test() ) { // 2
		toLoad.push( feature ); // 3
	}

	return toLoad;
}, [] );
```

[`Object.entries`](<https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries>) (1) z przekazanego obiektu tworzy nam wielowymiarową tablicę, w której każdy element to tablica o kształcie `[ klucz, wartość ]`. Mając tę tablicę, wywołujemy na niej `reduce`, gdyż chcemy stworzyć na jej podstawie nową tablicę, zawierającą jedynie nazwy nieobsługiwanych ficzerów. Jeśli dany test nie przechodzi (2), wpisujemy dany ficzer do tablicy nieobsługiwanych (3).

Można by tutaj alternatywnie użyć `forEach`:

```javascript
const toLoad = [];
Object.entries( features ).forEach( ( [ feature, test ] ) => {
	if ( !test() ) {
		toLoad.push( feature );
	}
} );
```

<p class="note">Warto jednak zauważyć, że w tym wypadku nie zadziała <code>map</code>, ponieważ tworzy on nową tablicę o tej samej długości, co pierwotna. A to oznacza, że nawet dla obsługiwanych ficzerów tworzyłby elementy tablicy, nawet jeśli miałoby się tam znaleźć <code>undefined</code>.</p>

Mając już tablicę wszystkich nieobsługiwanych ficzerów, można skonstruować odpowiedni znacznik `script` do wczytania ich polyfillów:

```javascript
if ( toLoad.length > 0 ) { // 1
	createScript( `/polyfills?features=${ encodeURIComponent( toLoad.join( ',' ) ) }` ); // 2
}
```

Najpierw sprawdzamy, czy na pewno jest co wczytywać (1), a następnie tworzymy URL, do którego na końcu dodajemy tablicę `toLoad` (2) przerobioną na ciąg tekstowy (każdy element oddzieliliśmy po prostu przecinkiem), zakodowany dodatkowo przy pomocy `encodeURIComponent`, aby być na pewno poprawnym linkiem.

Cały kod do wczytywania aplikacji wraz z polyfillami wygląda następująco:

```javascript
( function() {
	const features = {
		[ 'JSON.render' ]() {
			return 'render' in JSON;
		},

		[ 'fetch.JSON' ]() {
			return 'JSON' in fetch;
		}
	};
	const toLoad = Object.entries( features ).reduce( ( toLoad, [ feature, test ] ) => {
		if ( !test() ) {
			toLoad.push( feature );
		}

		return toLoad;
	}, [] );

	if ( toLoad.length > 0 ) {
		createScript( `/polyfills?features=${ encodeURIComponent( toLoad.join( ',' ) ) }` );
	}

	createScript( '/app.js' );

	function createScript( src ) {
		const script = document.createElement( 'script' );

		script.defer = true;
		script.async = false;
		script.src = src;

		document.head.appendChild( script );
	}
}() );
```

Wystarczy go teraz umieścić w znaczniku `script` wewnątrz `head` naszego szablonu (usuwając równocześnie wcześniejszy skrypt wczytujący aplikację) i dorobić ostatnią część układanki: wczytywanie polyfillów po stronie serwera!

### Wczytywanie polyfillów – kod na serwerze

W przeglądarce odwoływaliśmy się do adresu `/polyfills`. Trzeba zatem dodać obsługę tego adresu po stronie serwera:

```javascript
app.get( '/polyfills', ( req, res ) => { // 1
	res.set( 'Content-Type', 'application/javascript' ); // 2
	res.send( '// Oops'); // 3
} );
```

Informujemy Express.js, że dla każdego żądania `GET` pod adres `/polyfills` (1) ma zwrócić zasób o typie MIME `application/javascript` (2) – czyli skrypt JS – i zawartości `// Oops` (3). Oczywiście "Oops" jest tylko zaślepką, a prawdziwa funkcja generująca kod skryptu z polyfillami znajduje się w pliku `buildPolyfillLib.js`:

```javascript
const availablePolyfills = { // 1
	'fetch.JSON': `( function() {
		fetch.JSON = function( URL ) {
			return fetch( URL ).then( ( res ) => {
				return res.json();
			} );
		};
	}() );`,

	'JSON.render': `( function() {
		JSON.render = function( json, selector ) {
			document.querySelector( selector ).innerHTML = JSON.stringify( json );
		};
	}() );`
};
module.exports = function( features ) { // 2
	return features.reduce( ( code, feature ) => {
		return code + availablePolyfills[ feature ]; // 3
	}, '' );
};
```

Jak widać, sama funkcja jest bardzo mała, większą część pliku zajmuje tablica z polyfillami dla poszczególnych ficzerów (1). Sama funkcja z kolei dostaje tablicę ficzerów (2), dla których ma wygenerować skrypt i następnie po prostu pobiera kod polyfilla z tablicy `availablePolyfiils` i dorzuca do wynikowego kodu (3). Tyle.

Teraz wystarczy to tylko podpiąć pod nasz serwer:

```javascript
const buildPolyfillLib = require( './buildPolyfillLib' ); // 1

[…]


app.get( '/polyfills', ( req, res ) => {
	const features = req.query.features.split( ',' ); // 3

	res.set( 'Content-Type', 'application/javascript' );
	res.send( buildPolyfillLib( features ) ); // 2
} );
```

Na górę dorzucamy dołączanie pliku `buildPolyfillLib.js` (1), a do obsługi ścieżki `/polyfills` – wywołanie funkcji `buildPolyfillLib` (2). Jako parametr przekazujemy tej funkcji rozbity na tablicę ciąg tekstowy wyciągnięty z obiektu żądania (3). Express.js parsuje dla nas zapytania z żądanych przez użytkowników URL-i, stąd nazwy ficzerów oddzielone przecinkami znalazły się w `req.query.features`.

Cały kod po stronie serwera powinien wyglądać mniej więcej tak:

```javascript
const express = require( 'express' );
const whiskers = require( 'whiskers' );
const path = require( 'path' );
const buildPolyfillLib = require( './buildPolyfillLib' );
const app = express();
const port = 3000;

app.engine( '.html', whiskers.__express );
app.set( 'views', path.join( __dirname, '/views' ) );

app.get( '/', ( req, res ) => {
	res.render( 'index.html' );
} );
app.get( '/polyfills', ( req, res ) => {
	const features = req.query.features.split( ',' );

	res.set( 'Content-Type', 'application/javascript' );
	res.send( buildPolyfillLib( features ) );
} );

app.use( express.static( 'public' ) );

app.listen( port, () => {
	console.log( `Example app listening on port ${port}!` );
} );
```

Gdy teraz odpalimy serwer i odświeżymy stronę, nasza aplikacja po raz pierwszy _ożyje_, a naszym oczom ukaże się tekst na białym tle:

> {"author":"Comandeer"}

<i lang="fr">Voilà</i>, wszystko działa!

## Dodanie CSP

Jedno z założeń głosiło, że nasz kod ma współpracować z CSP. W tym celu użyjemy [atrybutu `[nonce]`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/nonce), który dodamy do elementu z kodem ładującym aplikację wraz z polyfillami. Niemniej wartość tego atrybutu musi być losowa i przy każdym odświeżeniu strony – inna. I tutaj na ratunek przychodzi nam Whiskers! Zacznijmy od dodania zaślepki do naszego szablonu:

```html
<script nonce="{nonce}">
<!-- tutaj kod ładujący -->
</script>
```

Jak nietrudno się domyślić, pod `{nonce}` będzie podstawiana faktyczna wartość, generowana każdorazowo przez serwer. Żeby uzyskać losowy ciąg znaków, posłużymy się wbudowanym w Node [modułem `crypto`](https://nodejs.org/api/crypto.html):

```javascript
const crypto = require( 'crypto' ); // 1

[…]

app.get( '/', ( req, res ) => {
	const nonce = crypto.randomBytes( 20 ).toString( 'hex' ); // 2

	res.render( 'index.html', {
		nonce // 3
	} );
} );
```

Dołączamy zatem moduł `crypto` na początku (1), a następnie podmieniamy obsługę ścieżki `/`. Generujemy losowy ciąg znaków przy pomocy metody `crypto.randomBytes` (2). Jak sama nazwa wskazuje, losuje ona losowe bajty, które następnie zamieniamy na ciąg tekstowy. Tak wygenerowany losowy ciąg przekazujemy do naszego szablonu jako zmienną `nonce` (3). Tym sposobem nasz skrypt za każdym razem otrzyma inną wartość atrybutu `[nonce]`.

Został nam zatem ostatni element układanki – nagłówek CSP:

```javascript
app.get( '/', ( req, res ) => {
	const nonce = crypto.randomBytes( 20 ).toString( 'hex' );

	res.set( 'Content-Security-Policy',
		`default-src 'none'; connect-src http://localhost:3000/data.json; script-src 'nonce-${ nonce }' 'strict-dynamic'` );
	res.render( 'index.html', {
		nonce
	} );
} );
```

Nagłówek ten oznacza w skrócie:

* domyślnie nie zezwalaj na nic (`default-src 'none'`);
* dopuść skrypty tylko z odpowiednimi atrybutami `[nonce]` (`script-src 'nonce-${ nonce }'`), ale ufaj też skryptom przez nie wczytanym (`'strict-dynamic'`);
* pozwól `fetch` pobrać wyłącznie plik znajdujący się pod adresem `http://localhost:3000/data.json` (`connect-src`).

Tym sposobem stworzyliśmy naprawdę restrykcyjną politykę CSP, która jednak całkowicie nie przeszkadza naszemu systemowi w działaniu. Jeśli uruchomilibyśmy teraz serwer od nowa, zauważylibyśmy, że absolutnie nic się nie zmieniło – wszystko ciągle działa.

## Możliwe kierunki rozwoju

Nie da się ukryć, że rozwiązanie przedstawione w tym artykule, choć działające, jest mocno prymitywne. Niemniej jest też dość łatwe do dalszego rozwoju. Przypatrzmy się zatem, co można z tym dalej zrobić.

### Modularyzacja

Bez problemu można wydzielić tablicę `availablePolyfills` z pliku `buildPolyfillLib.js`. Można też posunąć się o krok dalej i stworzyć katalog `features`, w którym znajdowałyby się pliki z polyfillami dla poszczególnych ficzerów. Wówczas tablicę `availablePolyfills` można byłoby budować poprzez pobranie nazw wszystkich plików z katalogu `features`. Zdecydowanie ułatwiłoby to dalszy rozwój i równocześnie odchudziło sam plik z funkcją.

Można pójść o krok dalej i wydzielić `buildPolyfillLib.js` jako osobny pakiet npm, dzięki czemu nie byłoby problemu z przenoszeniem go pomiędzy różnymi projektami. Dodatkowo możliwość łatwego użycia takiego modułu zapewnić by mogło przygotowanie middleware'u dla Express.js, dzięki czemu można będzie go używać podobnie do `express.static`:

```javascript
app.use( '/polyfills', buildPolyfillLib() );
```

A jeśli komuś jeszcze mało modularności, wyodrębnijmy do osobnych pakietów npm poszczególne polyfille! Być może przydadzą się nie tylko nam. Dobrym miejscem na ich umieszczenie może być [projekt ungap](https://github.com/ungap). Można też zdecydować się na odwrotny krok: nie tworzyć własnej biblioteki polyfillów, ale korzystać z już dostępnych na npm, jak choćby właśnie tych z projektu ungap.

### Generowanie kodu i lepsza heurystyka

Obecnie kod testujący poszczególne ficzery w przeglądarce jest niezależny od kodu tworzącego paczkę z polyfillami. A przecież można tak zmodyfikować bibliotekę, żeby kod testujący ficzery też był generowany przez naszą usługę polyfillowania. Jeśli mamy już katalog `features`, to dla każdego ficzera można stworzyć podkatalog, w którym znajdowałyby się dwa pliki: `test.js`, zawierający kod testu w przeglądarce, oraz `polyfill.js`, zawierający kod polyfilla. Wówczas usługa polyfillowania dostawałaby listę ficzerów używanych w aplikacji i generowała na tej podstawie potrzebny kod.

Można pójść o krok dalej i wykorzystać AST do analizy kodu aplikacji, by usługa polyfillowania sama wykryła, jakich ficzerów aplikacja używa. Następnie można wykorzystać narzędzia pokroju [Browserlist](https://github.com/browserslist/browserslist) i [Can I Use?](https://github.com/Fyrd/caniuse), by ustalić, jakie przeglądarki wspieramy, a tym samym – jakich polyfillów możemy potrzebować. Tym samym usługa polyfillowania zautomatyzuje dla nas niemal cały żmudny proces konfigurowania.

### Optymalizacja wydajności

Ten nagłówek mówi sam za siebie. Tutaj można podziałać naprawdę sporo. Można np. wczytywać polyfille w tle, cache'ować je za pomocą Service Workera i następnym razem wczytywać je bez potrzeby odpytywania o nie serwera i budowania paczki od nowa. Sam serwer też może mieć wewnętrzny cache i nie generować paczki na nowo, gdy już taką wcześniej budował. No i nie trzeba chyba wspominać, że generowanie kodu testującego ficzery powinno się odbywać tylko raz dla danej wersji aplikacji – w końcu częściej nie ma potrzeby.

Można też skupić się na optymalizacji testowania ficzerów, np. testować tylko raz na danej wersji przeglądarki użytkownika, a następnie zapisywać informacje o wyniku w `localStorage`/cookie i na jego podstawie przygotowywać polyfille. A jak się wersja zmieni – przetestować na nowo.

### Obsługa wielu modułów

Obecna wersja sprawdza się znakomicie w przypadku, gdy aplikacja składa się z jednego modułu, wczytywanego na początku. W przypadku jednak aplikacji wielomodułowych trzeba by było przemyśleć koncepcję wczytywania polyfillów. Przy najprostszym podejściu funkcja wczytująca aplikację z polyfillami stałaby się po prostu modułem aplikacji odpowiedzialnym za wczytywanie innych modułów. Nie byłoby to pogwałcenie zasady rozdziału kodu wczytującego od samej aplikacji, ponieważ wszystkie dane potrzebne do wczytywania modułów pozostawałyby wewnątrz modułu wczytującego. Można go też traktować jako osobną zależność aplikacji i po prostu wstrzykiwać ją do niej.

Warto też się zastanowić, w jaki sposób powiązać poszczególne moduły z ich polyfillami. Czy moduł wczytujący powinien sobie generować odpowiednią mapę takich polyfillów? Kiedy powinny być wczytywane? Kiedy powinny być przeprowadzane testy dla nich? I dlaczego te rozważania brzmią, jakby miały się zakończyć kolejnym Require.js…

---

Tym sposobem dobrnęliśmy do końca naszej krótkiej wyprawy po złote runo polyfillów. Udało się nam spełnić wszystkie założenia, a kod aplikacji pozostał do końca niewinny w swej niewiedzy na temat istnienia brutalnego środowiska przeglądarki… [Całość przykładu dostępna jest na GitHubie](https://github.com/Comandeer/polyfills-example).



