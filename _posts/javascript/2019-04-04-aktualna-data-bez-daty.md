---
layout: post
title:  "Aktualna data bez daty"
author: Comandeer
date: 2019-04-04T18:10:00+0200
categories: javascript
comments: true
permalink: /aktualna-data-bez-daty.html
---

Dzisiaj na Facebooku ktoś zadał ciekawe pytanie: jak w JS wyświetlić aktualną datę i czas, nie używając `Date` ani nie pobierając czasu z żadnego zewnętrznego źródła (nawet `input[type=datetime-local]`)? Przyjrzyjmy się zatem, jak to zrobić!

## Znacznik czasu Unixa

Pierwszą myślą, jaka przyszła mi do głowy, było zastąpienie `Date` znacznikiem czasu Unixa. W bardzo wielu przypadkach data bywa wyrażona właśnie jako znacznik czasu Unixa. Jest to nic innego jak liczba sekund (w przypadku JS-a – milisekund), które upłynęły od północy 1 stycznia 1970 roku. Znając datę początkową i aktualną liczbę sekund, które upłynęły od niej, jesteśmy w stanie przy pomocy prostej matematyki obliczyć aktualną datę i czas.

Zatem jak się pobiera znacznik czasu w JS-ie? Przy pomocy `Date.now`…

Niemniej na szczęście istnieje przynajmniej jeden mniej oficjalny sposób pobierania znacznika czasu. Swego czasu powstała specyfikacja [High Resolution Time](https://w3c.github.io/hr-time/), której zadaniem było dostarczenie narzędzia do dokładnego pomiaru wydajności na stronie (poprzez obliczanie, ile milisekund upłynęło od początku do końca danego zadania). Tym samym powstało kilka metod i własności, umożliwiających dokładne określenie aktualnego czasu. Nas interesować będą dwie: `performance.timeOrigin` oraz `performance.now()`. `performance.timeOrigin` to nic innego jak znacznik czasu w chwili wczytania danej strony internetowej. `performance.now()` to z kolei liczba milisekund, jakie upłynęły od owego wczytania. Tym samym dodanie do siebie tych dwóch wartości zwróci nam aktualny znacznik czasu. Połowa pracy już za nami!

## Formatowanie daty

Mając liczbę milisekund od 1 stycznia 1970 roku możemy sobie podzielić to w odpowiedni sposób, by uzyskać poszczególne elementy daty i czasu. Niemniej istnieje inny sposób: zastosowanie [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat). Choć według MDN formatuje on tylko obiekt `Date`, to [wg specyfikacji radzi sobie również ze znacznikami czasu](https://tc39.github.io/ecma402/#sec-datetime-format-functions). Tym sposobem wyświetlenie ładnie sformatowanej daty sprowadza się do:

```javascript
const timestamp = Math.round( performance.timeOrigin + performance.now() );
const formatter = new Intl.DateTimeFormat( 'pl', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
} );
formatter.format( timestamp ); // czwartek, 4 kwietnia 2019, 18:06:02
```

Niestety, nie w każdej przeglądarce to działa (np. w Safari rzuca błędem). W pozostałych trzeba porobić odpowiednie obliczenia. Ale to już zostawię Wam do zabawy!
