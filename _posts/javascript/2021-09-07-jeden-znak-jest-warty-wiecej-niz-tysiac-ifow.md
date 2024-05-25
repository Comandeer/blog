---
layout: post
title:  "Jeden znak jest warty więcej niż tysiąc ifów"
author: Comandeer
date: 2021-09-07T23:46:00+0200
tags: 
    - javascript
comments: true
permalink: /jeden-znak-jest-warty-wiecej-niz-tysiac-ifow.html
---

Czasami niektóre błędy są bardzo trudne do zdebugowania, bo występują stosunkowo rzadko, a i czają się w miejscach, w których byśmy się ich nie spodziewali.

## Problem

Wyobraźmy sobie, że mamy [prostą aplikację](https://codepen.io/Comandeer/pen/RwgKaRj?editors=1010), która pokazuje parę divów po naciśnięciu przycisku. Cały kod JS wygląda tak:

```javascript
const button = document.querySelector( 'button' ); // 1
const box1 = document.querySelector( '#box1' ); // 2
const box2 = document.querySelector( '#box2' ); // 3

button.addEventListener( 'click', ( evt ) => { // 4
	evt.preventDefault() // 5

	[ box1, box2 ].forEach( ( box ) => { // 6
		box.classList.add( 'box_revealed' ); // 7
	} );
} );
```

Na początku pobieramy przycisk (1) i obydwa boksy (2, 3). Następnie dołączamy nasłuchiwanie na kliknięcie przycisku (4). Dla pewności blokujemy domyślną akcję (5) – jakby ktoś wsadził kiedyś ten mechanizm do formularza – a następnie iterujemy po wszystkich boksach (6) i nadajemy każdemu z nich odpowiednią klasę (7). Ot nic specjalnego.

Tylko że nie działa i przeglądarki pokazują jakieś dziwne błędy. W Chrome dostajemy:

> ```
> Uncaught TypeError: Cannot read properties of undefined (reading '#<HTMLDivElement>')
>     at HTMLButtonElement.<anonymous>
> ```

Natomiast w Firefoksie błąd jest jeszcze dziwniejszy:

> ```
> Uncaught TypeError: evt.preventDefault() is undefined
>     <anonymous>
> ```

## ASI, czyli skrytobójca perfekcyjny

Sytuacja z błędami jest paradoksalna o tyle, że osobiście uważam, że błąd w Chrome'ie dokładniej opisuje to, co się dzieje, ale jest przez to także mniej przyjazny dla użytkownika i trudno wywnioskować z niego, co wybuchło. Natomiast błąd w Firefoksie na pierwszy rzut oka nie ma sensu, za to wskazuje linijkę, w której doszło do eksplozji:

```javascript
evt.preventDefault()
```

Jeśli się ją zakomentuje lub usunie, kod zaczyna działać. Ale naprawić można go też wprowadzając prostą modyfikację do problematycznej linii:

```javascript
evt.preventDefault();
```

Po dostawieniu średnika [wszystko wraca do normy](https://codepen.io/Comandeer/pen/PojWNma?editors=1010).

Magia, jaka jest za to odpowiedzialna, nazywa się [ASI – Automatic Semicolon Insertion (Automatyczne Wstawianie Średników)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#automatic_semicolon_insertion). To mechanizm obecny w JavaScripcie, który – jak sama nazwa wskazuje – służy do wstawiania średników na koniec poszczególnych wyrażeń i instrukcji w razie, gdyby programista tego nie zrobił. Działa to w miarę dobrze… dopóki nie natrafia na konstrukcje składniowe, które można rozumieć na wiele sposobów. I właśnie w tym wypadku z taką mamy do czynienia. W JS-ie bowiem nawiasy kwadratowe służą do dwóch rzeczy – tworzenia tablic oraz odwoływania się do właściwości obiektów:

```javascript
const iAmAnArray = [];

someObj[ 'I am just a property name' ];
```

ASI (jeszcze) nie korzysta ze sztucznej inteligencji i nie jest w stanie rozróżnić między tymi dwoma przypadkami. W naszym przykładzie oczekiwalibyśmy takiego rezultatu:

```javascript
evt.preventDefault(); // 1

[ box1, box2 ].forEach( ( box ) => {
    box.classList.add( 'box_revealed' );
} ); // 2
```

Średnik powinien być wstawiony po wywołaniu `evt.preventDefault()` (1), żeby zaznaczyć, że dalej mamy do czynienia z tablicą. ASI jednak ten średnik omija i wstawia dopiero po całym `forEach` (2). Innymi słowy uzyskujemy konstrukcję podobną do:

```javascript
evt.preventDefault()[ box1, box2 ] // itd.
```

W tym momencie program działa tak, jakbyśmy chcieli pobrać właściwość z wartości zwracanej przez `evt.preventDefault()`. A `evt.preventDefault()` nic nie zwraca – czyli  próbujemy pobrać właściwość z `undefined`. Z kolei wnętrze tablicy traktowane jest jako dwa wyrażenia rozdzielone [operatorem przecinka](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comma_Operator), czyli jako nazwa właściwości traktowany jest ostatni z elementów (`box2`). Jeśli podstawimy sobie te wartości do kodu, uzyskamy:

```javascript
undefined[ box2 ] // itd.
```

Czyli dokładnie to, o czym mówi błąd w Chrome: próbujemy pobrać z `undefined` właściwość o nazwie stworzonej z elementu `div` .

<p class="note">Co Bardziej Rozgarnięty Czytelnik zapewne zapyta w tym momencie, czy ten błąd by się pojawił, gdybyśmy zamiast wymieniać poszczególne elementy w tablicy, użyli zapisu <code>[ ...document.querySelectorAll( '.box' ) ]</code>. Otóż nie, ten błąd by się nie pojawił, za to rzucony byłby błąd składni. Nie można bowiem użyć mechanizmu spread w nazwie właściwości.</p>

## Morał

A morał tej bajki jest krótki i niektórym znany: wstawiaj średniki jak poj…

A przynajmniej skonfiguruj sobie lintera tak, aby [wskazywał ich ominięcie](https://eslint.org/docs/rules/semi). No chyba że naprawdę chcesz je omijać, to wtedy [musisz stosować się do pewnych zasad](https://standardjs.com/rules.html#semicolons).

