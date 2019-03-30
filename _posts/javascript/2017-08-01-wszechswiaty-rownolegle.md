---
layout: post
title:  "Wszechświaty równoległe"
author: Comandeer
date:   2017-08-01 23:30:00 +0200
categories: javascript
comments: true
permalink: /wszechswiaty-rownolegle.html
redirect_from:
    - /javascript/2017/08/01/wszechswiaty-rownolegle.html
---

Co to, Comandeer się przerzucił na fizykę kwantową? Nic z tych rzeczy, wciąż tylko JavaScript! Niemniej dzisiaj porozmawiamy sobie o… <i>sferach</i>.

## Jak rozbić bank?

Udało mi się dzisiaj zepsuć symulator lotto napisany w JS. I choć jego kod znajdował się wewnątrz [IIFE](http://benalman.com/news/2010/11/immediately-invoked-function-expression/), podstawiłem mu własne wyniki – i to bez chamskich zabaw z edytorem kodu w Chrome. Trzon rozwiązania stanowił generator liczb (pseudo)losowych, który używał `Math.round` do zwrócenia liczb całkowitych:

```javascript
( function() {
	function getRandomNumber() {
		return Math.round( Math.random() * 999999 );
	}

	for ( let i = 0; i < 10; i++ ) {
		console.log( getRandomNumber() ); // 10 losowych liczb
	}
}() );
```

 I tutaj na scenę wkraczam ja. Wystarczyło podmienić `Math.round` tak, żeby zwracał wybraną przeze mnie wartość, dzięki czemu byłem w stanie za każdym razem trafiać szóstkę:

```javascript
Math.round = () => 1;

( function() {
	function getRandomNumber() {
		return Math.round( Math.random() * 999999 );
	}

	for ( let i = 0; i < 10; i++ ) {
		console.log( getRandomNumber() ); // 10 jedynek
	}
}() );
```

Skoro można nadpisać natywne funkcje w JS, to jak się bronić przed tego typu atakami?

## Sfery

W standardzie ECMAScript istnieje coś takiego, jak [<i lang="en">realms</i> (<i>sfery</i>)](http://www.ecma-international.org/ecma-262/8.0/#sec-code-realms). To nic innego, jak zbiór wszystkich globalnych obiektów (`window`, `Array`, `Math` itd.), czyli gotowe środowisko, w którym nasz kod JS będzie odpalany. Gdy uruchamiamy jakąś stronę w przeglądarce, taka sfera jest tworzona i to w niej uruchamiany jest cały kod. Niemniej ze względu na specyficzne cechy JS-a, na tę sferę możemy wpływać, np. podmieniając konstruktor `Array` czy robiąc sztuczkę opisaną powyżej. Zmiana sfery wpływa na wszystkie skrypty uruchamiane wewnątrz niej.

Choć nie jest to regułą, na potrzeby tego artykułu możemy przyjąć, że każde okno (karta) przeglądarki, a także każda ramka (`iframe`) posiadają swoje własne sfery. To znaczy, że jeśli otworzymy jedną stronę dwa razy i na jednej z nich zmienimy coś, to na drugiej ta zmiana nie będzie widoczna. W przypadku ramek ma to też znaczenie z powodów bezpieczeństwa – zwłaszcza, gdy dołączamy zasób z zewnętrznej domeny. Nie do pomyślenia jest, żeby zmiana na czyjejś stronie pozwoliła np. wykraść login z formularza logowania Facebooka.

## Wszechświaty równoległe

No dobrze: ale jak się to ma do naszego problemu? Jak już wspomniałem, nową sferę dość prosto uzyskać: wystarczy stworzyć ramkę! Zobaczmy zatem, jakby to wyglądało w praktyce:

```javascript
Math.round = () => 1;

( function() {
	let round;
	let random;

	function getFreshMathMethod( name ) {
		return new Promise( ( resolve ) => {
			const iframe = document.createElement( 'iframe' );

			document.body.appendChild( iframe );

			iframe.onload = () => {
				resolve( iframe.contentWindow.Math[ name ] );

				document.body.removeChild( iframe );
			};
		} );
	}

	function getRandomNumber() {
		return round( random() * 999999 );
	}

	function run() {
		for ( let i = 0; i < 10; i++ ) {
			console.log( getRandomNumber() ); // 10 losowych liczb
		}
	}

	Promise.all( [
		getFreshMathMethod( 'round' ),
		getFreshMathMethod( 'random' )
	] ).then( ( values ) => {
		round = values[ 0 ];
		random = values[ 1 ];

		run();
	} );
}() );
```

Jak widać, wszystko działa, jak należy. Niemniej kod stał się o wiele bardziej skomplikowany. Wszystko dlatego, że obsługa `iframe` jest asynchroniczna.

Przyjrzyjmy się metodzie `getFreshMathMethod`, bo to ona jest tutaj kluczowa:

```javascript
function getFreshMathMethod( name ) {
    return new Promise( ( resolve ) => { // 1
		const iframe = document.createElement( 'iframe' ); // 2

		document.body.appendChild( iframe ); // 3

		iframe.onload = () => { // 4
			resolve( iframe.contentWindow.Math[ name ] ); // 5

			document.body.removeChild( iframe ); // 6
		};
	} );
}
```

Zwracam `Promise` (1), żeby całość móc później ładnie obsłużyć i żeby kod był wolny od callbacków. Wewnątrz tej obiecanki tworzę ramkę (2) i dodaję ją do `document.body` (3). Krok ten jest konieczny, bo przeglądarki nie uruchamiają ramek, które są poza DOM (ot, taka optymalizacja). Gdy zawartość tej ramki się wczyta (4; domyślnie zostanie wczytana "strona" `about:blank`), odczytujemy wybraną metodę z jej obiektu `window` (5). Każda ramka ma swój własny, globalny obiekt, ukryty pod wlasnością `contentWindow` elementu `iframe`. Tak odczytaną funkcję zwracamy jako wartość obiecanki. Na sam koniec czyścimy po sobie (6).

Tak pobrane funkcje zapisujemy następnie w lokalnych zmiennych `round` i `random` i wykorzystujemy w generatorze liczb (pseudo)losowych. I tyle! Niestraszne nam nadpisanie `Math` całej strony, bo i tak pobierzemy sobie zawsze świeże metody, z nowo utworzonej sfery.

Jak zatem widać, ramki to wszechświaty równoległe do głównej strony, które mają te same zasady "fizyki", lecz są całkowicie odrębnymi bytami. I czasami warto z tej odrębności skorzystać.
