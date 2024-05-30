---
layout: post
title:  "Headings First Principle"
description: "Zasada Najpierw Nagłówki jako podstawa tworzenia struktury treści na stronie WWW."
author: Comandeer
date: 2018-04-30T22:05:00+0200
tags:
    - refleksje
    - html-css
comments: true
permalink: /headings-first-principle.html
redirect_from:
    - /refleksje/html-css/2018/04/30/headings-first-principle.html
---

Dzisiaj krótko o tym, czym jest Headings First Principle (Zasada Najpierw Nagłówki). [Wymyśliłem ją na poczekaniu 20 lutego](https://github.com/w3c/html/issues/1566) w trakcie dyskusji nad sensownością znaczników `article` i `section` i moim skromnym zdaniem w prosty i sensowny sposób opisuje, jak dzielić stronę na sekcje.<!--more-->

## O co chodzi?

Headings First Principle (HFP) jest bardzo prostą zasadą. Jej trzonem jest dzielenie strony na poszczególne części (sekcje) przy użyciu nagłówków. Mówiąc inaczej: polega na stworzeniu [poprawnej hierarchii treści](https://blog.comandeer.pl/html-css/a11y/2017/07/04/o-naglowkach-slow-kilka.html) na stronie. Gdy już tę hierarchię będziemy mieli gotową, wzmacniamy istniejący podział strony na sekcje przy pomocy [znaczników sekcjonujących](http://w3c.github.io/html/sections.html#sections). Tym sposobem implicytny podział strony staje się eksplicytny.

Wychodzenie od nagłówków ma sens z kilku powodów:

* [Sekcje zawsze powinny mieć nagłówki](http://w3c.github.io/html/sections.html#the-section-element):

  > Each `section` should be identified, typically by including a heading (`h1`-`h6` element) as a child of the `section` element.
  >
  > [Każdy element `section` powinien być identyfikowalny, najczęściej poprzez dołączenie nagłówka (elementu `h1`-`h6`) jako dziecka elementu `section`.]

* Nagłówki są widocznym wyznacznikiem poszczególnych sekcji i części strony. Użytkownik nie widzi, czy użyliśmy znacznika `section` w kodzie, ale widzi tekst napisany większym fontem, który zawiera słowo kluczowe indetyfikujące daną część strony.

* [Więcej użytkowników czytników ekranowych używa do nawigacji nagłówków niż nawigacji regionami](https://webaim.org/projects/screenreadersurvey7/#finding). I to nie są jakieś małe różnice, ale sięgające **kilkudziesięciu procent**. Z tego też powodu lepiej jest wyjść od nagłówków, z których niemal wszyscy korzystają, a dopiero jako dodatek dodać podział na sekcje.

* Dodawanie sekcji do już istniejących nagłówków niejako z automatu chroni nas przed sytuacjami, w których pojawiają się sekcje bez sensownych nagłówków. Skoro nie ma nagłówka, nie ma też sekcji… i problemu.

* No i najzwyczajniej w świecie łatwiej dzielić przy pomocy nagłówków. Tak samo jak łatwiej jest pisać artykuł lub książkę zaczynając od spisu treści, tak samo łatwiej pisać stronę mając gotową hierarchię treści.

## I znowu to `h1`…

HFP kładzie bardzo duży nacisk na to, by łączyć poszczególne nagłówki z elementami sekcjonującymi. Innymi słowy mówiąc: elementy sekcjonujące mają jedynie _wzmacniać_ znaczenie nagłówków. Dana część strony jest oznaczona przy pomocy `section` czy `article` dlatego, że znajduje się tam odpowiedni nagłówek, nie zaś na odwrót. I tutaj dochodzimy znowu do kwestii `h1`: jeśli jest on głównym nagłówkiem strony, określającym jej główny temat, to jego odpowiednikiem wśród innych znaczników powinno być `main` (względnie `main > section, main > article` lub też w `body > header` umieszczonym tuż przed `main`). Zatem HFP bardzo ładnie współgra z opisywanym już przeze mnie [modelem nagłówka poza nawigacją](https://blog.comandeer.pl/html-css/a11y/2017/07/04/o-naglowkach-slow-kilka.html#2--nag%C5%82%C3%B3wek-poza-nawigacj%C4%85).

## Ktoś to stosuje?

W teorii HFP brzmi bardzo fajnie, ale czy da się to wykorzystać w praktyce? Jak najbardziej, według tej zasady sam tworzę strony WWW. Tak powstała m.in. [moja domowa](https://www.comandeer.pl) czy [tutorial o HTML5](https://tutorials.comandeer.pl/html5-blog.html). Jest więc to technika przetestowana w boju, która wydaje mi się sensowna i pomocna w dzieleniu strony na poszczególne sekcje. Zatem nagłówkujmy!
