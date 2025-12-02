---
layout: post
title:  "W labiryncie żądań"
description: "Krótko o tym, jak przy pomocy URLPatternu zrobić prymitywnego Expressa"
author: Comandeer
date: 2025-12-03T00:27:00+0100
tags:
    - adwent-2025
    - javascript
    - standardy-sieciowe
comments: true
permalink: /w-labiryncie-zadan.html
---

Praktycznie od samego początku istnienia Node'a towarzyszył mu framework [Express.js](https://expressjs.com/), który pozwala tworzyć backend. I ma też jeden ficzer, który dzisiaj jest w światku backendowego JS-a standardem: [ścieżki (routing)](https://expressjs.com/en/starter/basic-routing.html).<!--more-->

<p class="note">Nie twierdzę, że Express.js wynalazł ścieżki. Niemniej zdecydowanie przyczynił się do tego, jak wyglądają w ekosystemie JS-a.</p>

## Ścieżki

Zerknijmy na [najprostszy przykład użycia Expressa](https://expressjs.com/en/starter/hello-world.html). Jest tam wykorzystana jedna ścieżka:

```javascript
app.get( '/', ( req, res ) => { // 1
	res.send( 'Hello World!' ); // 2
} );
```

Powyższy kod oznacza, że jeśli ktoś wejdzie na stronę główną, czyli ścieżkę `/` (1), to dostanie w odpowiedzi tekst <q lang="en">Hello World!</q> (2). Nazwa metody `#get()` również nie jest przypadkowa, bo odpowiada [metodzie HTTP `GET`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/GET). Jeśli z kolei chcielibyśmy dodać funkcję, która obsługiwałaby wysyłkę formularza, to możemy użyć [metody HTTP `POST`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/POST):

```javascript
app.post( '/', ( req, res ) => {
	res.send( 'Hello World!' );
} );
```

Express obsługuje w taki sposób wszystkie najbardziej popularne metody HTTP oraz [sporo mniej popularnych](https://expressjs.com/en/5x/api.html#routing-methods). Dla porządku dodam jeszcze, że parametr `req` to [żądanie wysłane z przeglądarki](https://expressjs.com/en/5x/api.html#req), a `res` – [odpowiedź, jaką odsyłamy](https://expressjs.com/en/5x/api.html#res).

Natomiast bohaterem dzisiejszego odcinka są ścieżki. W tym przykładzie mieliśmy do czynienia z najprostszą, `/`. Niemniej można tworzyć też o wiele bardziej skomplikowane, np.:

```javascript
app.get( '/user/:id', ( req, res ) => {
	res.send( `User ${req.params.id}` );
} );
```

Ta obsługa żądań odpali się tylko dla adresów pasujących do wzoru `/user/:id`, a więc np. `/user/100`, `/user/Comandeer` itd. Ale już nie `/user`. Można też część ścieżki oznaczyć jako opcjonalną:

```javascript
app.get( '/article/:id{/:title}', ( req, res ) => {
    res.send( 'Super artykuł' );
} );
```

Id artykułu jest wymagane, natomiast jego tytuł – już nie. Stąd ta ścieżka pasuje zarówno do adresu `/article/1618/comandeer-jest-sexy`, jak i `/article/67`.

Można też skorzystać z `*`, żeby zastąpić dowolną liczbę znaków, np `/user/*` będzie pasować do `/user/Comandeer`, ale też `/user/to/chyba/nie/powinno/tak/dzialac`.

Samymi ścieżkami, bez całej reszty Expressa, można się pobawić, instalując [pakiet npm `path-to-regexp`](https://www.npmjs.com/package/path-to-regexp). Liczba ściągnięć dobrze pokazuje, że praktycznie wszyscy z niego korzystają. Stał się na tyle dobrze zakorzenionym <i lang="la">de facto</i> standardem, że… powstał na jego podstawie faktyczny standard.

## `URLPattern`

[`URLPattern`](https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API) to API [standaryzowane przez WHATWG](https://urlpattern.spec.whatwg.org/). Specyfikacja wprost zaznacza, że [składnia wzorów jest oparta na bibliotece `path-to-regexp`](https://urlpattern.spec.whatwg.org/#pattern-strings:~:text=This%20pattern%20syntax%20is%20directly%20based%20on%20the%20syntax%20used%20by%20the%20popular%20path%2Dto%2Dregexp%20JavaScript%20library). Niemniej samo API jest zdecydowanie bardziej… przeglądarkowe, Przyjrzyjmy się, w jaki sposób przenieść do `URLPattern`u przykład z artykułem:

```javascript
const pattern = new URLPattern({ // 1
  pathname: '/article/:id{/:title}*', // 2
});

console.log( pattern.exec( '/article/1618/jakis-tytul' ) ); // null
console.log( pattern.exec( '/article/67' ) ); // null
```

Na początku tworzymy nowy [obiekt `URLPattern`](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern/URLPattern) (1), do którego przekazujemy obiekt z opcjami. Tak naprawdę obiekt ten może mieć wszystkie własności [obiektu `URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) – a zatem nic nie stoi na przeszkodzie, żeby np. stworzyć… walidator [schematu](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes), odrzucający URL-e bez HTTPS. W naszym przykładzie chcemy jedynie porównać samą [ścieżkę URL-a](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Path) (czyli to, co następuje po domenie), zatem używamy [własności `pathname`](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern/pathname) (2). Warto zwrócić uwagę, że składnia standardu jest _oparta_ na bibliotece `path-to-regexp`, ale nie jest _identyczna_. W tym wypadku opcjonalną grupę musimy oznaczyć dodatkowo `*` (jak w wyrażeniach regularnych!). Następnie taki wzorzec testujemy na dwóch ścieżkach i… dostajemy `null` w obydwu przypadkach.

Dzieje się tak, ponieważ `URLPattern` działa z URL-ami i wymaga _pełnego_ URL-a, nie relatywnego, jak w naszym przykładzie. Można ten problem rozwiązać na trzy sposoby:

```javascript
console.log( pattern.exec( 'https://blog.comandeer.pl/article/1618' ) ) // 1
console.log( pattern.exec( '/article/67', 'https://blog.comandeer.pl' ) ); // 2
console.log( pattern.exec( {
    pathname: '/article/1618/dziala' // 3
} ) );
```

Najbardziej oczywisty to podanie pełnego URL-a (1). Można też podać samą ścieżkę, a jako drugi argument podać tzw. bazowy URL (2). Wówczas przeglądarka sama rozwiąże pełny adres (czyli po prostu doklei ścieżkę do bazowego URL-a). W końcu można przekazać obiekt z własnością `pathname` (3) – czyli podobny do tego, który przekazaliśmy do konstruktora. Warto też zauważyć, że w tym przykładzie jest całkowicie nieistotne, jaką domenę dodamy do ścieżki – bo ostatecznie tylko ścieżkę chcemy porównywać.

Konstruktor również przyjmuje te trzy rodzaje opcji:

```javascript
new URLPattern( {
    pathname: '/article/:id{/:title}*'
} );
// vs
new URLPattern( 'https://blog.comandeer.pl/article/:id{/:title}*' );
// vs
new URLPattern( '/article/:id{/:title}*', 'https://blog.comandeer.pl' );
```

W przypadku konstruktora dobrany URL ma jednak spore znaczenie. Podanie pełnego URL-a sprawi, że będzie on używany do dopasowania, więc tylko URL-e z originu `https://blog.comandeer.pl` będą brane pod uwagę.

Spójrzmy na [rezultat metody `URLPattern#exec()`](https://urlpattern.spec.whatwg.org/#dictdef-urlpatternresult):

```json
{
	"hash": {
		"groups": {
			"0": ""
		},
		"input": ""
	},
	"hostname": {
		"groups": {
			"0": "blog.comandeer.pl"
		},
		"input": "blog.comandeer.pl"
	},
	"inputs": [
		"https://blog.comandeer.pl/article/1618"
	],
	"password": {
		"groups": {
			"0": ""
		},
		"input": ""
	},
	"pathname": {
		"groups": {
			"id": "1618"
		},
		"input": "/article/1618"
	},
	"port": {
		"groups": {
			"0": ""
		},
		"input": ""
	},
	"protocol": {
		"groups": {
			"0": "https"
		},
		"input": "https"
	},
	"search": {
		"groups": {
			"0": ""
		},
		"input": ""
	},
	"username": {
		"groups": {
			"0": ""
		},
		"input": ""
	}
}
```

Wygląda strasznie na pierwszy rzut oka, ale takie nie jest w rzeczywistości! Po raz kolejny mamy tutaj wszystkie własności URL-a. Do tego tablicę `inputs`, zawierającą tablicę URL-i, na których `URLPattern#exec()` zostało wywołane. Jeśli któryś z elementów URL-a został dopasowany, to znajduje się w odpowiedniej własności, np. [`hostname`](https://developer.mozilla.org/en-US/docs/Web/API/URL/hostname):

```json
{
	"hostname": {
		"groups": {
			"0": "blog.comandeer.pl"
		},
		"input": "blog.comandeer.pl"
	}
}
```

Z racji tego, że domenę dopasowywaliśmy w całości, we własności `groups` jest tylko jedna, domyślna grupa `0`, która zawiera to samo, co własność `input`. Natomiast we własności `pathname` robi się już ciekawiej:

```json
{
	"pathname": {
		"groups": {
			"id": "1618"
		},
		"input": "/article/1618"
	}
}
```

We własności `input` wciąż jest pełne dopasowanie, niemniej pojawiła się grupa o nazwie, jaką mieliśmy we wzorze – `id`; A w niej: poprawnie dopasowany id artykułu!

I tak, porównując to do ścieżek w Expressie, wydaje się to wszystko niepotrzebnie skomplikowane. I _prawdopodobnie takie jest_. Ale nie można zapominać przy tym, że to musi się dobrze wpisywać w ekosystem przeglądarki, w której URL-e istnieją od zawsze. I każdy nowy element musi pasować do tych już istniejących. Dodatkowo, myślę, że `URLPattern` można z powodzeniem zaliczyć do tych niskopoziomowych API, które niekoniecznie warto używać bezpośrednio, ale warto na nich budować swoje własne rozwiązania.

No i umyślnie w przypadku `URLPattern`u używałem terminu "wzorzec" zamiast "ścieżka" (tę zostawiając dla URL-i). Dzięki temu, że `URLPattern` dopasowuje całe URL-e, można go zastosować do wielu innych rzeczy, niż tylko do ścieżek (jak np. wspomniany wyżej walidator). Zresztą to API [oryginalnie powstało na potrzeby Service Workerów](https://github.com/whatwg/urlpattern/blob/main/explainer.md#introduction), przy okazji rozwiązując też inne problemy.

## Prymitywny Express.js

Choć `URLPattern` zaczynał jako API przeglądarkowe, to obecnie jest dostępny także w środowiskach backendowych – w tym w Node.js (od wersji 23). A to oznacza, że można go wykorzystać do stworzenia własnej wersji Express.js!

Na początku stwórzmy plik `server.mjs`, z którego wyeksportujemy odpowiednik funkcji `express()` – funkcję `server()`:

```javascript
export function server() {}
```

Funkcja ta zwróci obiekt z API naszego "frameworka":

```javascript
export function server() {
	return {
		get() { // 1
			return this; // 4
		},
		post() { // 2
			return this; // 5
		},
		listen() { // 3
			return this; // 6
		}
	};
};
```

Nasz framework będzie miał tylko trzy metody – `#get()` (1) do obsługi żądań GET, `#post()` (2) do obsługi żądań POST oraz `#listen()` (3) do odpalenia serwera na wybranym porcie. Każda z funkcji zwraca `this` (4, 5, 6), dzięki czemu można tworzyć łańcuchy wywołań.

Żeby jednak móc odpalić serwer, trzeba najpierw go mieć. Tutaj na ratunek przychodzi wbudowany w Node [moduł `node:http`](https://nodejs.org/api/http.html):

```javascript
import { createServer } from 'node:http'; // 1

export function server() {
	const server = createServer(); // 2

	return {
		get() {
			return this;
		},
		post() {
			return this;
		},
		listen( port = 3000 ) {
			server.listen( port ); // 3

			return this;
		}
	};
};
```

Na początku importujemy funkcję `createServer()` z modułu `node:http` (1). Następnie tworzymy przy jej pomocy nowy serwer (2), a następnie w metodzie `#listen()` odpalamy go na podanym porcie (3).

Niemniej serwer, który nic nie robi, jest mało użyteczny. Dodajmy zatem obsługę żądań:

```javascript
[…]
export function server() {
	const server = createServer();
	const handlers = []; // 3

	server.on( 'request', ( request, response ) => { // 1
		for ( const handler of handlers ) { // 2
			if ( handler( request, response ) ) { // 4
				return; // 5
			}
		}

		response.writeHead( 404 ); // 6
		response.end(); // 7
	} );

    […]
}
```

Do naszego serwera dodajemy obsługę [zdarzenia `request`](https://nodejs.org/api/http.html#event-request) (1).  Nasłuchiwacz dostaje dwa argumenty: żądanie (`request`) oraz odpowiedź (`response`). Zatem bardzo podobnie do tego, jak działa to w Express.js. Iterujemy po wszystkich handlerach (2) w tablicy `handlers` (3) i wywołujemy każdy, przekazując do niego żądanie i odpowiedź (4). Jeśli handler zwróci `true`, kończymy całą obsługę żądania (5). Natomiast jeśli obsługa nie zostanie zakończona w tym miejscu, to znak, że żaden handler nie obsłużył żądania (nie zwrócił `true`). Dlatego też ustawiamy [status 404](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/404) przy pomocy [metody `response#writeHead()`](https://nodejs.org/api/http.html#responsewriteheadstatuscode-statusmessage-headers) (6), a następnie wysyłamy pustą odpowiedź przy pomocy [metody `response#end()`](https://nodejs.org/api/http.html#responseenddata-encoding-callback) (7).

W tym momencie serwer dla dowolnego żądania zwróci błąd 404. Nie jest to mocno użyteczne, więc wypada dodać dodawanie handlerów:

```javascript
[…]

export function server() {
	[…]

	return {
		get( path, handler ) {
			const internalHandler = createHandler( 'GET', path, handler ); // 1

			handlers.push( internalHandler ); // 3

			return this;
		},
		post( path, handler ) {
			const internalHandler = createHandler( 'POST', path, handler ); // 2

			handlers.push( internalHandler ); // 4

			return this;
		}

		[…]
	};
}
```

W metodach `#get()` i `#post()` pojawiły się wywołania funkcji `createHandler()` (1, 2). Tak powstałe handlery są następnie dodawane do tablicy `handlers` (3, 4).

Sama funkcja `createHandler()` wygląda z kolei tak:

```javascript
function createHandler( method, path, handler ) { // 1
	const pattern = new URLPattern( { // 2
		pathname: path // 3
	} );

	return ( request, response ) => { // 4
		if ( request.method !== method ) { // 5
			return false; // 6
		}

		const matchedUrl = pattern.exec( request.url ); // 7

		if ( matchedUrl === null ) { // 8
			return false; // 9
		}

		handler( toHandlerRequest( request. matchedUrl ), toHandlerResponse( response ) ); // 10

		return true;
	};
}

function toHandlerRequest( request, matchedUrl ) {
	return {
		url: request.url, // 11
		params: matchedUrl.pathname.groups // 12
	};
}

function toHandlerResponse( response ) {
	return {
		send( content ) { // 13
			response.writeHead( 200, { 'Content-Type': 'application/json' } ); // 14
			response.end( JSON.stringify( content ) ); // 15
		}
	};
}
```

Funkcja przyjmuje trzy parametry (1):

1. `method` – nazwę metody HTTP (w tym przypadku `GET` albo `POST`),
2. `path` – ścieżkę,
3. `handler` – funkcję do obsługi żądania.

Następnie tworzymy nowy `URLPattern` (2) i przekazujemy do niego naszą ścieżkę (3). Potem tworzymy funkcję, którą na koniec zwrócimy (4). Przyjmuje ona dwa parametry: żądanie (`request`) oraz odpowiedź (`response`). Wewnątrz tej funkcji na samym początku sprawdzamy, czy żądanie przyszło przy pomocy interesującej nas metody (5). Jeśli nie, kończymy obsługę tego żądania i zwracamy `false` (6). Jeśli tak, dopasowujemy URL żądania do naszego wzorca (7). Jeśli nie udało się dopasować (8), kończymy obsługę żądania i zwracamy `false` (9). Dzięki tym dwóm sprawdzeniom jesteśmy w stanie poprawnie obsługiwać błędy 404 w głównym nasłuchiwaczu serwera. Jeśli żądanie zostało dopasowane, wywołujemy przekazany `handler()` (10) wraz ze specjalnie spreparowanymi żądaniem i odpowiedzią.

Żądanie, jakie dostanie `handler`, ma tak naprawdę tylko dwie własności – oryginalny URL (11) jako `url` oraz dopasowane grupy (12) jako `params`. Z kolei odpowiedź ma tylko jedną metodę, `#send()` (13), która przyjmuje jeden parametr – zawartość odpowiedzi (`content`). Ta metoda ustawia [status 200](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/200) oraz [nagłówek `Content-Type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Type) na `application/json` , sygnalizując, że odpowiedź będzie JSON-em (14). Następnie [serializuje](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) `content` i wysyła tak powstały ciąg znaków do przeglądarki (15).

Pora przetestować nasz serwer! Stwórzmy w tym celu plik `app.mjs`:

```javascript
import { server } from './server.mjs'; // 1

const app = server(); // 2

app.get( '/', ( request, response ) => { // 3
	response.send( {
		version: '1.0.0' // 4
	} );
} );
app.get( '/user/:id', ( request, response ) => { // 5
	response.send( {
		id: request.params.id // 6
	} );
} );

app.listen( 3000 ); // 7
console.log( 'Server is listening on port 3000' ); // 8
```

Na początku importujemy funkcję `server()` z pliku `./server.mjs` (1). Następnie tworzymy nowy serwer i przypisujemy go do zmiennej `app` (2). Potem dodajemy obsługę żądań do strony głównej, `/` (3). W odpowiedzi wysyłamy obiekt z wersją naszego "API" (4). Potem dodajemy obsługę dla ścieżki `/user/:id` (5). Żeby przetestować, czy ich obsługa działa poprawnie, zwracamy przekazany parametr `id` (6). Na sam koniec odpalamy serwer na porcie 3000 (7) oraz wyświetlamy w konsoli informację, że serwer działa (8).

Teraz można odpalić serwer:

```sh
node ./app.mjs
```

A następnie przejść do przeglądarki i sprawdzić, czy dostaniemy poprawną odpowiedź. Jeśli wejdziemy pod adres `http://localhost:3000`, to powinniśmy otrzymać:

```json
{
	"version": "1.0.0"
}
```

Natomiast jeśli wejdziemy pod adres `http://localhost:3000/user/Comandeer`, powinniśmy otrzymać:

```json
{
	"id": "Comandeer"
}
```

Jeśli wpiszemy dowolny nieobsługiwany adres (np. `http://localhost:3000/whatever`), przeglądarka powinna wyświetlić domyślny błąd 404.

<p class="note">Oczywiście ten prymitywny serwer <strong>NIE NADAJE SIĘ DO CELÓW PRODUKCYJNCH</strong>. Powstał jedynie po to, by pokazać, jak można wykorzystać <code>URLPattern</code> w praktyce.</p>

Całość kodu, wraz z dokumentacją w formacie [JSDoc](https://en.wikipedia.org/wiki/JSDoc), znajduje się w [Giście](https://gist.github.com/Comandeer/1588f257b94182f02989c7f36ca7fccf).
