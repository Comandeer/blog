---
layout: post
title:  "Prymitywna implementacja mitycznej funkcji React#createElement()"
description: "Odtwarzamy React#createElement() przy wykorzystaniu czystego JS-a i DOM-u."
author: Comandeer
date: 2017-05-28T23:40:00+0200
tags:
    - javascript
    - daj-sie-poznac-2017
comments: true
permalink: /prymitywna-implementacja-mitycznej-funkcji-react-createelement.html
redirect_from:
    - /javascript/daj-sie-poznac-2017/2017/05/28/pymitywna-implementacja-mitycznej-funkcji-React-createElement.html
---

Każdy, kto choć trochę bawił się Reactem (czy naprawdę jestem jedynym, którego nigdy do tego nie ciągnęło?!), zapewne zauważył, że pod spodem JSX-a znajduje się [mityczna funkcja `React.createElement`](https://facebook.github.io/react/docs/react-api.html#createelement). [Składnia tej funkcji szybko została podchwycona przez inne biblioteki](https://github.com/Matt-Esch/virtual-dom#example---creating-a-vtree-using-the-objects-directly) i obecnie jest <i>de facto</i> standardem w środowisku zajmującym się Virtual DOM.<!--more-->

## Virtual DOM – cóż to?

Co jednak robi? Otóż nic wielkiego: tworzy obiekt, który imituje element z drzewka DOM. Jak zapewne już wiesz, przeglądarka, wczytując i interpretując kod HTML, zamienia go na DOM (ang. Document Object Model – Obiektowy Model Dokumentu). Jest to drzewko, które pokazuje zależności pomiędzy wszystkimi elementami na stronie. Każdy element na stronie jest reprezentowany przez obiekt zawierający wszystkie atrybuty, style, referencje do rodzica i dzieci elementu i wiele, wiele innych informacji, których prawdopodobnie nigdy nie użyjemy w praktyce. Działa to wszystko bardzo sprawnie i pozwala na tworzenie interakcji ze stroną (klikalny przycisk, yay!), ale ma dwie poważne wady: zabiera dużo miejsca i nie działa poza przeglądarką.

I tutaj właśnie wkracza koncept Virtual DOM. Jest to nic innego jak… drzewko elementów na stronie. Od DOM odróżnia się tym, że nie przechowujemy miliarda niepotrzebnych informacji, a jedynie te, które są niezbędne do odtworzenia stanu strony. Dodatkowo wszystko opiera się na [POJO](https://twitter.com/_ericelliott/status/831965087749533698) (bo jednak węzły DOM to dziwne bestie są…), co sprawia, że tego typu drzewko zbudować możemy także na serwerze. A to otwiera nam bardzo ciekawe możliwości, związane ze składaniem widoków aplikacji na serwerze. Dodatkowo zabawa z obiektami pozwala nam stworzyć mechanizm pozwalający na wykrywanie różnic pomiędzy dwoma drzewkami, a tym samym: na jak najefektywniejsze modyfikowanie prawdziwego DOM (wystarczy wykryć, co się zmieniło i tylko to uaktualnić, zamiast renderować całe drzewko od nowa).

## Implementujemy!

Tyle teorii. Przyjrzyjmy się, jak funkcji `React.createElement` się używa:

```javascript
React.createElement( type, props, ...children );
```

Jako pierwszy parametr podajemy nazwę tagu HTML, jako drugi – obiekt z atrybutami nowo tworzonego elementu, a jako kolejne – dzieci naszego nowego elementu.

Czyli wywołanie

```javascript
React.createElement( 'div', { class: 'test' }, 'Test' );
```

powinno nam ostatecznie wygenerować

```html
<div class="test">Test</div>
```

Analogicznie

```javascript
React.createElement( 'div', null,
	React.createElement( 'p', null, 'Test' )
);
```

powinno nam dać

```html
<div>
	<p>Test</p>
</div>
```

Na chwilę obecną nie będziemy się zajmować generowaniem wirtualnego DOM (może wrócimy do tego zagadnienia kiedy indziej) – po prostu niech nasza funkcja, `createElement`, stworzy nam odpowiedni element DOM.

Zacznijmy od zadeklarowania samej funkcji:

```javascript
function createElement( tag, attributes, ...children ) {
}
```

Jak widać przyjmuje ona co najmniej trzy parametry: nazwę tworzonego elementu (`tag`), obiekt z atrybutami (`attributes`) oraz bliżej nieokreśloną liczbę parametrów, które staną się dziećmi naszego elementu.

Oczywiście podstawowym zadaniem naszej funkcji będzie stworzenie nowego elementu:

```javascript
function createElement( tag, attributes, ...children ) {
	const element = document.createElement( tag );
}
```

Z racji tego, że `createElement` będzie można zagnieżdżać w sobie, wypada tak stworzony element zwracać (inaczej zamiast dzieci będziemy dostawać piękne `undefined`):

```javascript
function createElement( tag, attributes, ...children ) {
	const element = document.createElement( tag );

	return element;
}
```

Sprawdźmy, czy na razie działa:

```javascript
console.log( createElement( 'div' ) ); // <div></div>
```

Działa! Na razie nie ma za dużo pożytku z tego, bo `document.createElement` jest raptem o 9 znaków dłuższe. Dodajmy zatem dodawanie atrybutów:

```javascript
function createElement( tag, attributes, ...children ) {
	const element = document.createElement( tag );

	if ( attributes && typeof attributes === 'object' ) {
		Object.keys( attributes ).forEach( ( attribute ) => {
			element.setAttribute( attribute, attributes[ attribute ] );
		} );
	}

	return element;
}
```

Na początku sprawdzam, czy na pewno w `attributes` mamy obiekt, z którego można wyciągnąć atrybuty. I tutaj przypomnienie, dlaczego samo sprawdzenie typu nam nie wystarczy: `null` również jest typu `object`! Dlatego wypada najpierw sprawdzić, czy `attributes` jest tzw. truthy value (czyli czy konwertuje się niejawnie na `true`). Jeśli tak i jest to obiekt, to wówczas przy pomocy `Object.keys`, które pobiera wszystkie nazwy własności obiektu, iterujemy po każdym atrybucie i przypisujemy każdy z nich do naszego elementu przy użyciu metody `setAttribute` (czemu to nie jest najlepszy pomysł, to innym razem).

Warto tutaj zauważyć, że `Object.keys` pobiera **tylko nazwy** własności obiektów, więc żeby dobrać się do ich wartości, należy użyć zapisu `obiekt[ pobranaNazwaWłasności]`. Można ten kod zapisać inaczej, używając `Object.entries`, które dla każdej własności zwraca tablicę klucz-wartość:

```javascript
Object.entries( attributes ).forEach( ( [ name, value ] ) => {
	element.setAttribute( name, value );
} );
```

Dodatkowo wewnątrz callbacku `forEach` użyłem [destrukturyzacji (dekonstrukcji?) parametrów](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment), żeby nie musieć użerać się z tablicą. Warto tylko zwrócić uwagę, że `Object.entries` ma o wiele mniejsze wsparcie niż `Object.keys`.

OK, sprawdźmy, czy działa:

```html
console.log( createElement( 'div', { class: 'test' } ) ); // <div class="test"></div>
```

Uff, czyli zostały nam tylko dzieci do ogarnięcia! Z racji tego, że do pozostałych parametrów użyliśmy [operatora spread](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Spread_operator), wystarczy po raz kolejny użyć `forEach`:

```javascript
function createElement( tag, attributes, ...children ) {
	const element = document.createElement( tag );

	if ( attributes && typeof attributes === 'object' ) {
		Object.entries( attributes ).forEach( ( [ name, value] ) => {
			element.setAttribute( name, value );
		} );
	}

	children.forEach( ( child ) => {
		element.appendChild( child );
	} );

	return element;
}
```

Sprawdźmy, czy działa:

```javascript
console.log( createElement( 'div', null, createElement( 'span', { class: 'void' } ) ) ); // <div><span class="void"></span></div>
console.log( createElement( 'div', null, 'Test' ) ); // Uncaught TypeError: Failed to execute 'appendChild' on 'Node': parameter 1 is not of type 'Node'
```

Uppss… Dla normalnych elementów działa aż miło, niemniej dla tekstu – nie. Cały problem polega na tym, że tekst w DOM musi być reprezentowany przez węzeł typu `Text`. Zatem musimy każdy tekst na tego typu obiekt przerobić:

```javascript
children.forEach( ( child ) => {
	if ( typeof child === 'string' ) {
		child = new Text( child );
	}

	element.appendChild( child );
} );
```

Sprawdźmy:

```javascript
console.log( createElement( 'div', null, 'Test' ) ); // <div>Test</div>
```

<i>Voilà</i>! Oto udało nam się stworzyć prymitywną wersję `React.createElement`, która operuje na normalnym DOM i ułatwia tworzenie drzewek elementów:

```javascript
function createElement( tag, attributes, ...children ) {
	const element = document.createElement( tag );

	if ( attributes && typeof attributes === 'object' ) {
		Object.entries( attributes ).forEach( ( [ name, value] ) => {
			element.setAttribute( name, value );
		} );
	}

	children.forEach( ( child ) => {
		if ( typeof child === 'string' ) {
			child = new Text( child );
		}

		element.appendChild( child );
	} );

	return element;
}
```

