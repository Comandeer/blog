---
layout: post
title:  "Ukradli mi magazyn"
description: "Czyli nieoczekiwane zachowanie localStorage."
author: Comandeer
date: 2024-10-31T19:46:00+0100
tags:
    - standardy-sieciowe
    - javascript
comments: true
permalink: /ukradli-mi-magazyn.html
---

Zbliżał się wieczór. Nie było rady, dopaliłem papierosa i wsiadłem do samochodu. Zaczął padać deszcz, bębnił o dach mojego metalowego dyliżansu. Jechałem na nadbrzeże, do mojego magazynu. Wczoraj powinna być dostawa. Droga strasznie się dłużyła, jakby wraz z deszczem spadały też dodatkowe kilometry asfaltu. W końcu jednak mój stary rzęch dochrapał się na miejsce. Wysiadłem i moja brew mimowolnie się uniosła. Spodziewałem się wszystkiego, ale nie tego, że wyparuje cały budynek. Nie ukradli mi towaru, oni ukradli mi magazyn!<!--more-->

## Lokalny magazyn danych

Przeglądarki udostępniają kilka różnych API, które pozwalają na zapisywanie danych po stronie klienta. Trzy najczęściej używane to:

* [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API),
* [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API),
* [ciasteczka](https://developer.mozilla.org/en-US/docs/Glossary/Cookie).

Nie będę tutaj wchodził w szczegóły, jak dokładnie działają (bo to temat na przydługi, osobny wpis). Skupię się na pierwszym API z tej listy, Web Storage API. A mówiąc jeszcze dokładniej: [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

Na dobrą sprawę całe API składa się z czterech metod:

* [`#getItem()`](https://developer.mozilla.org/en-US/docs/Web/API/Storage/getItem) – do pobierania danych,
* [`#setItem()`](https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem) – do zapisywania danych,
* [`#removeItem()`](https://developer.mozilla.org/en-US/docs/Web/API/Storage/removeItem) – do usuwania danych,
* [`#clear()`](https://developer.mozilla.org/en-US/docs/Web/API/Storage/clear) – do usunięcia wszystkich danych.

Główny haczyk przy posługiwaniu się `localStorage`, to możliwość przechowywania w nim jedynie tekstu. To oznacza, że przed zapisaniem wszelkie JS-owe obiekty trzeba przepuścić przez [`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) a po pobraniu – przez [`JSON.parse()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse):

```javascript
const user = {
	name: 'Comandeer'
};

localStorage.setItem( 'user', JSON.stringify( user ) );
JSON.parse( localStorage.getItem( 'user' ) );
```

Trochę niewygodne, ale cóż – to wciąż najprzyjemniejsze API do przechowywania danych w przeglądarce.

## Ustawienia prywatności atakują!

I wszystko byłoby fajnie, gdyby nie [drobny szczegół ze specyfikacji](https://html.spec.whatwg.org/multipage/webstorage.html#the-localstorage-attribute) (pogrubienie moje):

> Throws a ["`SecurityError`"](https://webidl.spec.whatwg.org/#securityerror) `DOMException` if the `Document`'s [origin](https://dom.spec.whatwg.org/#concept-document-origin) is an [opaque origin](https://html.spec.whatwg.org/multipage/browsers.html#concept-origin-opaque) or if the request violates a policy decision (e.g., if the user agent is configured to not allow the page to persist data).
>
> [Rzuca błędem `DOMException` typu "`SecurityError`", jeśli pochodzenie dokumentu jest nieprzezroczyste lub jeśli żądanie łamie polityki bezpieczeństwa (np. jeśli **przeglądarka została skonfigurowana, żeby nie zezwalać na zapisywanie danych**).]

Innymi słowy: jeśli ktoś sobie [wyłączy ciasteczka w przeglądarce](https://superuser.com/a/299080), to próba jakiejkolwiek interakcji z `localStorage` wysadzi aplikację. I mowa tutaj o _każdej_ interakcji, nie tylko o próbie pobrania danych. Zatem poniższy kod też ją wysadzi:

```javascript
if ( 'localStorage' in window ) {
  // localStorage jest dostępny
}
```

Prawdę mówiąc, spodziewałbym się, że brak dostępu będzie przezroczysty – po prostu dostanę `undefined` przy próbie pobrania czegokolwiek. Ale nie, Web Storage API wybiera przemoc za każdym razem. Zatem przy jakichkolwiek kontaktach z nim trzeba być niezwykle ostrożnym:

```javascript
try {
	const theme = localStorage.getItem( 'theme' );
} catch {
	// Wzięło wybuchnęło
}
```

A że używanie wszędzie bloków `try`/`catch` nie należy do najprzyjemniejszych, to zapewne bardzo szybko skończy się to na pomocniczych funkcjach, takich jak poniżej:

```javascript
function getFromStorage( key ) { // 1
	try { // 2
		return JSON.parse( localStorage.getItem( key ) ); // 3
	} catch {
		return undefined; // 4
	}
}

function saveToStorage( key, value ) { // 5
	try { // 7
		localStorage.setItem( key, JSON.stringify( value ) ); // 6
	} catch {
		// noop
	}
}
```

Funkcja `getFromStorage()` (1) pobiera dane z `localStorage`. Wewnątrz bloku `try` (2) następuje pobranie danych przez `localStorage.getItem()`  wraz z parsowaniem ich przez `JSON.parse()` (3). W razie, gdyby pobranie danych się nie udało, funkcja zwraca `undefined` (4). Z kolei funkcja `saveToStorage()` (5) zapisuje dane do `localStorage`. Odpala ona `localStorage.setItem()` (6) wewnątrz bloku `try` (7). Dane przed zapisem do magazynu są przepuszczane przez `JSON.stringify()`.

I tak, artykuł ten powstał dlatego, że ten blog również wybuchał, gdy ktoś sobie wyłączył przechowywanie danych w przeglądarce. Dlatego lekcja na dziś: czasami to nie dane są brakujące, a cały ich magazyn…
