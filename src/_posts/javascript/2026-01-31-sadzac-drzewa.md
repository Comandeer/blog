---
layout: post
title:  "Sadząc drzewa"
description: "Narzędzia pozwalają wypluwać przy pomocy JSX-a różne typy drzewek, nie tylko Reactowe. W tym wpisie przyglądam się, jak to zrobić."
author: Comandeer
date: 2026-01-31T23:06:00+0100
tags:
    - javascript
comments: true
permalink: /sadzac-drzewa.html
---

Dawno, dawno temu pokazywałem, jak przygotować [własną wersję funkcji `React.createElement()`](https://blog.comandeer.pl/prymitywna-implementacja-mitycznej-funkcji-react-createelement). Jednak nic więcej z nią nie zrobiliśmy. A przecież możemy ją wykorzystać w JSX-ie!<!--more-->

## JSX

Wypada jednak na samym początku wspomnieć, czym w ogóle jest JSX. Za [oficjalną dokumentacją](https://facebook.github.io/jsx/):

> <p lang="en">JSX is an XML-like syntax extension to ECMAScript without any defined semantics. […] It's intended to be used by various preprocessors (transpilers) to transform these tokens into standard ECMAScript.</p>
>
> [JSX to rozszerzenie składni ECMAScript o składnię podobną do XML-a bez definiowania konkretnej semantyki. […] Jest przeznaczone do użytku przez różnego rodzaju preprocesory (transpilery) do transformacji tych tokenów w standardową składnię ECMAScriptu.]

Przekładając to na ludzki – JSX pozwala umieszczać w kodzie JS coś, co _wygląda_ jak kod XML:

```jsx
const component = <article>
	<h1>Hello, world!</h1>
	<p>Some content</p>
</article>;
```

Niemniej kod w takiej postaci nie ma być rozumiany przez przeglądarki czy środowiska uruchomieniowe typu Node.js. Taki kod powinien być najpierw przepuszczony przez jakieś narzędzie (transpiler), które przetłumaczy go na zwyczajny kod JS. Praktycznie każdy szanujący się transpiler JS-a ma wsparcie dla JSX-a (np. [TypeScript ma wbudowane](https://www.typescriptlang.org/docs/handbook/jsx.html), a [Babel potrzebuje pluginu](https://babeljs.io/docs/babel-plugin-transform-react-jsx)). Jeśli przepuścimy przez jeden z nich powyższy kod, powinniśmy otrzymać coś takiego:

```javascript
const component = React.createElement( 'article', null, // 1
	React.createElement( 'h1', null, 'Hello, world!' ), // 2
	React.createElement( 'p', null, 'Some content' ) // 3
);
```

Każdy z XML-owych elementów w naszym JSX-ie został zamieniony na wywołanie funkcji `React.createElement()`. Jest też oddana relacja między poszczególnymi elementami – wywołania dla `h1` (2) i `p` (3) znajdują się wewnątrz wywołania dla `article` (1). Dzięki temu React jest w stanie odtworzyć w swoim vDOM-ie dokładnie takie drzewko, jakie zaprojektowaliśmy w JSX-ie.

{% note %}Dokładniejszy opis tej funkcji znajduje się w przywołanym już we wstępie [artykule o tworzeniu własnej wersji funkcji `React.createElement()`](https://blog.comandeer.pl/prymitywna-implementacja-mitycznej-funkcji-react-createelement).{% endnote %}

## Wykorzystanie własnej funkcji

Domyślnie JSX jest zawsze tłumaczony do wywołań funkcji `React.createElement()`. A co jeśli nie chcemy korzystać z Reacta? Wówczas mamy dwie możliwości podmiany tej funkcji.

Pierwsza z nich, mniej elegancka, to… stworzenie funkcji `React.createElement()`:

```javascript
const React = {
	createElement() {
		// Tutaj jakiś kod
    }
};
```

Niemniej istnieje też bardziej elegancka metoda: _nadpisanie semantyki JSX-a_. Czyli powiedzenie naszemu transpilerowi, jak dokładnie ma transformować kod JSX. Minusem tej metody jest różnica w konfiguracji poszczególnych narzędzi. W przypadku jednak tych najpopularniejszych (TypeScript, Babel, [esbuild](https://esbuild.github.io/api/#jsx-factory)) można wykorzystać [pragmę](https://www.johno.com/jsx-pragma) – czyli komentarz wskazujący odpowiednią funkcję:

```jsx
/* @jsx myFunction */
const component = <article>
	<h1>Hello, world!</h1>
	<p>Some content</p>
</article>;
```

W tym przypadku informujemy transpiler, że ma używać funkcji o nazwie `myFunction()`. Dzięki temu po transpilacji dostaniemy następujący kod:

```javascript
/* @jsx myFunction */
const component = myFunction( 'article', null,
	myFunction( 'h1', null, 'Hello, world!' ),
	myFunction( 'p', null, 'Some content' )
);
```

Dzięki temu możemy podstawić naszą implementację `React.createElement()`, która czekała na ten moment _niemalże 9 lat_:

{% include 'embed' src="https://codepen.io/Comandeer/pen/NPrYRaw" %}

{% note %}[CodePen pozwala używać Babela](https://blog.codepen.io/documentation/es-modules-on-codepen/#react-and-jsx) do pisania JS-a, dzięki czemu działa na nim JSX.{% endnote %}

Ale wypluwanie elementów HTML z JSX-a jest _nudne_. Tak naprawdę można generować absolutnie wszystko, co da się zapisać jako drzewko elementów. Jak np. tekstowe drzewko plików:

{% include 'embed' src="https://codepen.io/Comandeer/pen/JoKLRyg" %}

W tym przypadku funkcja obsługująca JSX wygląda następująco:

```javascript
function jsx( tag, attributes, ...children ) {
	const { name } = attributes; // 1

	const childrenContent = children.map( ( child ) => {
		return `${ child }`
			.replaceAll( /^/gm, '\n|   ' ) // 3
			.replaceAll( '\n\n', '\n' );
	} ).join( '' ); // 4

	return `| - ${ name }${ childrenContent }`;
}
```

Z JSX-owego elementu pobieramy atrybut `name` (1) – to nazwa katalogu lub pliku. Zwracamy ją (2) jako ciąg tekstowy razem z fajką (`|`), wskazującą aktualny poziom zagłębienia, oraz ciągami tekstowymi zwróconymi przez dzieci. Te nieco modyfikujemy, dodając do każdego pliku/katalogu brakujące fajki (3), a następnie łącząc wszystkie dzieci w jeden duży ciąg tekstowy (4).

Natomiast JSX użyty do tego przykładu wygląda następująco:

```jsx
/* @jsx jsx */
const component = <directory name="/">
	<file name="README.md" />
	<directory name="src/">
		<file name="index.ts" />
	</directory>
</directory>;
```

## Komponenty

Niemniej w JSX-ie oprócz zwyczajnych elementów istnieją również komponenty, a więc elementy, których nazwy zaczynają się wielką literą. Spójrzmy na taki przykład:

```jsx
const component = <Greeting name="Comandeer" />;
```

Jeśli przepuścimy ten kod przez transpiler, otrzymamy mniej więcej coś takiego:

```javascript
const component = React.createElement( Greeting, { name: 'Comandeer' } );
```

W tym przypadku do `React.createElement()` jako pierwszy argument nie jest przekazywana nazwa elementu, ale referencja do `Greeting`. Wypada zatem stworzyć taką funkcję:

```javascript
function Greeting( { name } ) { // 1
	return <h1>Hello, {name}!</h1>; // 2
}
```

Jako parametr przyjmuje ona obiekt z atrybutami (1), z którego wyciągamy atrybut `name`. Następnie zwracamy element `h1`, wewnątrz którego wykorzystujemy ten atrybut do stworzenia powitania (2).

Wypada nieco zmodyfikować naszą funkcję do obsługi JSX-a:

```javascript
function jsx( tag, attributes, ...children ) {
	if ( typeof tag === 'function' ) { // 1
		return tag( { ...attributes, children } ); // 2
	}

	const element = document.createElement( tag );

	if ( attributes && typeof attributes === 'object' ) {
		Object.entries( attributes ).forEach( ( [ name, value ] ) => {
			element.setAttribute( name, value );
		} );
	}

	children.forEach( ( child ) => {
		element.append( child ); // 3
	} );

	return element;
}
```

Większość logiki została taka sama, pojawił się jedynie dodatkowy warunek na początku. Sprawdza on, czy przekazany `tag` jest funkcją (1) i jeśli tak, to wywołuje ją, przekazując jako parametr obiekt zawierający atrybuty oraz własność `children` z dziećmi (2). Robimy to w taki sposób, żeby zachować Reactowy kształt API. Przy okazji, dzięki użyciu [metody `#append()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/append) (3) przy dodawaniu dzieci zniknęła potrzeba tworzenia węzła tekstowego. Metoda `#append()` bowiem, w przeciwieństwie do starszej [metody `#appendChild()`](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild), pozwala dodawać tekst bezpośrednio do elementu.

Nasza obsługa komponentów prezentuje się następująco:

{% include 'embed' src="https://codepen.io/Comandeer/pen/ogLqBPm" %}

I tak oto udało nam się przygotować własną, prostą obsługę JSX-a! Oczywiście, nie jest ona skończona, brakuje choćby sensownej obsługi [fragmentów](https://react.dev/reference/react/Fragment). Niemniej jest fajnym punktem wyjścia do dalszych eksperymentów.
