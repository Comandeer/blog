---
layout: post
title:  "🐈 mi się zepsuł"
description: "Są takie dni, w których człowiekowi nawet kot się zepsuje."
author: Comandeer
date: 2026-07-31T17:33:00+0200
tags:
    - javascript
comments: true
permalink: /kot-mi-sie-zepsul.html
---

Jest taki upał, że nawet kot mi się zepsuł… Nie wierzycie? No to patrzcie:

```javascript
'🐈'.length // 2
```

<!--more-->

## Czemu 🐈 się psuje?

Rzućmy okiem do [MDN-u](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length):

> The **`length`** data property of a [`String`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) value contains the length of the string in UTF-16 code units.
>
> [Własność `length` ciągów tekstowych zawiera długość tego ciągu w jednostkach kodowych UTF-16.]

No dobrze, ale co to są "jednostki kodowe" (<i lang="en">code units</i>)? Sięgnijmy raz jeszcze do [przepastnej skarbnicy MDN-u](https://developer.mozilla.org/en-US/docs/Glossary/Code_unit):

> A character encoding system uses one or more code units to encode a Unicode [code point](https://developer.mozilla.org/en-US/docs/Glossary/Code_point). […] In [UTF-16](https://developer.mozilla.org/en-US/docs/Glossary/UTF-16), each code point is encoded using one or two 16-bit code units.
>
> [System kodowania znaków używa jednego lub więcej jednostek kodowych, by zakodować punkt kodowy. […] W UTF-16 każdy punkt kodowy jest zapisywany przy pomocy jednej lub dwóch 16-bitowych jednostek kodowych.]

Punkty kodowe można porównać do współrzędnych znaku w wielkiej tabeli wszystkich znaków standardu Unicode. W praktyce oznacza to, że każdy znak zareprezentować można jako liczbę, np. litera `A` to `U+0041`, natomiast `🐈` to `U+1F408`.

Czemu jednak JS poprawnie rozpoznaje `A` jako ciąg tekstowy zawierający jeden znak, podczas gdy `🐈` jako dwa? Wynika to z ograniczenia UTF-16, a dokładniej: 16-bitowa jednostka kodowa może zakodować co najwyżej 2<sup>16</sup> (65536) znaków. Standard Unicode zawiera ich zdecydowanie więcej, więc część znaków jest kodowana przy pomocy dwóch jednostek kodowych. I do tej grupy zaliczają się także emoji. Cały problem polega na tym, że `String#length` zwraca liczbę _jednostek kodowych_ w ciągu, nie – liczbę znaków. Stąd `🐈` jest zepsuty.

{% note %}

Zasady działania standardu Unicode w JS-ie są mocno zawiłe, niemniej [MDN zawiera dokładniejszy opis całego mechanizmu](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#utf-16_characters_unicode_code_points_and_grapheme_clusters).

{% endnote %}

## Jak naprawić 🐈?

Jeśli chcemy policzyć znaki w ciągu tekstowym, o wiele bezpieczniejszym sposobem jest wykorzystanie wbudowanego w ciągi iteratora:

```javascript
[ ...'🐈' ].length; // 1
```

Ale oczywiście nie może być za prosto! Istnieje jeszcze coś takiego jak _klastry grafemów_ (<i lang="en">grapheme clusters</i>). W wielkim uproszczeniu: niektóre znaki mogą być tak naprawdę połączeniem wielu różnych znaków, np. `👨‍👦` to połączenie trzech znaków: `👨`, `‍` ([łącznika o zerowej szerokości](https://en.wikipedia.org/wiki/Zero-width_joiner)) oraz `👦`. I iterator ciągu rozbije takie emoji na poszczególne znaki składowe:

```javascript
[ ...'👨‍👦' ].length; // 3
```

Niekoniecznie jest to pożądany rezultat. Na całe szczęście jest [`Intl.Segmenter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter)!

```javascript
const segmenter = new Intl.Segmenter( 'pl', { granularity: 'grapheme' } ); // 1

console.log( [ ...segmenter.segment( '👨‍👦' ) ].length ); // 2
```

Najpierw tworzymy instancję segmentera (1). Informujemy go, że dzielony tekst będzie po polsku oraz że chcemy dzielić po grafemach. Następnie, przy pomocy [metody `Intl.Segmenter#segment()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/segment), dzielimy ciąg zawierający klaster grafemów (2). Tym razem uzyskujemy wynik `1` – jeden widoczny znak został policzony jako jeden znak.

I tym sposobem 🐈 został naprawiony!
