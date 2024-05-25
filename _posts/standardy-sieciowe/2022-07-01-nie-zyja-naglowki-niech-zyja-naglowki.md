---
layout: post
title:  "Nie żyją nagłówki, niech żyją nagłówki!"
author: Comandeer
date: 2022-07-01T18:03:00+0200
tags: 
    - standardy-sieciowe
    - a11y
    - refleksje
comments: true
permalink: /nie-zyja-naglowki-niech-zyja-naglowki.html
---

Stało się. [Po ponad **12 latach** przepychanek](https://html5accessibility.com/stuff/2022/04/05/12-years-beyond-a-html-joke/), w końcu [algorytm outline'u został usunięty ze specyfikacji HTML](https://github.com/whatwg/html/commit/6682bdeee6fb08f5972bea92064fe250f1b4ec9c).

W praktyce zmienia to niewiele, bo o tym, że ten algorytm nie działa, [wiedziano od bardzo dawna](https://www.tpgi.com/html5-document-outline/). Jedynym miejscem, w którym próbowano ten fakt ignorować, była właśnie specyfikacja. To się jednak dzisiaj zmieniło i algorytm przestał istnieć. A zatem tak naprawdę jedynym prawidłowym sposobem wykorzystania nagłówków jest ten jeszcze z czasów HTML 4 – czyli [tworzenie odpowiedniej hierarchii](https://blog.comandeer.pl/o-naglowkach-slow-kilka.html#znaczenie-nag%C5%82%C3%B3wk%C3%B3w).

Jedyna faktyczna zmiana względem najlepszych praktyk ustalonych lata temu to zmiana przeznaczenia [elementu `hgroup`](https://html.spec.whatwg.org/multipage/sections.html#the-hgroup-element). Tak po prawdzie, było to nieuniknione, bo ten element był stworzony z myślą o starym algorytmie outline'u i czekało go albo usunięcie, albo zmiana semantyki. Wybrano tę drugą opcję i obecnie `hgroup` służy do grupowania nagłówków wraz z ich podtytułami lub tytułami alternatywnymi, np:

```html
<hgroup>
	<h1>HTML</h1>
	<p>Living standard</p>
</hgroup>
```

Warto zwrócić uwagę, że nawet przy wykorzystaniu `hgroup` [podtytuł jest akapitem](https://blog.comandeer.pl/o-naglowkach-slow-kilka.html#podtytu%C5%82y).

I to w sumie tyle. 12 lat czekania na w dużej mierze formalną zmianę w specyfikacji.

