---
layout: post
title:  "Dostępność w nieoczekiwanych miejscach"
author: Comandeer
date: 2023-05-18T00:00:00+0200
categories: a11y refleksje
comments: true
permalink: /dostepnosc-w-nieoczekiwanych-miejscach.html
---

Dzisiaj, 18 maja 2023, obchodzimy kolejny [Światowy Dzień Świadomości Dostępności (ang. <i lang="en">Global Accessibility Awareness Day</i>)](https://accessibility.day/). Z tej okazji naszła mnie krótka refleksja o tym, jak postrzegana jest dostępność.

Gdyby zapytać przypadkową osobę webdeveloperską o to, czym jest dostępność, to jest duża szansa uzyskania odpowiedzi, że to dostosowanie strony tak, aby mogły z niej korzystać także osoby z niepełnosprawnościami. To prawda. Prawdopodobnie można by też usłyszeć o [standardzie WCAG](https://wcag21.lepszyweb.pl/). I to też jak najbardziej prawda. Problem polega na tym, że nie _cała_ prawda.

Bo dostępność bardzo trudno zamknąć w obiektywnie weryfikowalny standard. Jasne, strona zgodna z WCAG ma zdecydowanie większe szanse być faktycznie dostępna, ale nawet [wprowadzenie do tego standardu](https://wcag21.lepszyweb.pl/#background-on-wcag-2) zaznacza, że

> Chociaż wytyczne poruszają szereg zagadnień, nie jest możliwe, aby odpowiadały szczegółowo na potrzeby wszystkich możliwych rodzajów, stopni niepełnosprawności, czy też niepełnosprawności złożonych.

WCAG to przede wszystkim zbiór dobrych, sprawdzonych w boju praktyk, których przestrzeganie pozwoli stworzyć podstawy dostępnego rozwiązania. Ale bardzo często, by stworzyć faktycznie dostępne rozwiązanie, trzeba pochylić się także nad innymi kwestiami – często takimi, które wcale nie są oczywiste.

Cofnijmy się nieco i spójrzmy, jak w ogóle definiowana jest dostępność. Bardzo ładną definicję znaleźć można na [angielskiej Wiki](https://en.wikipedia.org/wiki/Web_accessibility):

> **Web accessibility**, or **eAccessibility**,[[1\]](https://en.wikipedia.org/wiki/Web_accessibility#cite_note-sec1095-1) is the [inclusive practice](https://en.wikipedia.org/wiki/Inclusion_(disability_rights)) of ensuring there are no barriers that prevent interaction with, or access to, [websites](https://en.wikipedia.org/wiki/Website) on the [World Wide Web](https://en.wikipedia.org/wiki/World_Wide_Web) by people with physical [disabilities](https://en.wikipedia.org/wiki/Disabilities), situational disabilities, and socio-economic restrictions on bandwidth and speed.
>
> [Dostępność stron WWW lub eDostępność to inkluzywna praktyka zapewniająca brak barier w dostępie i interakcji ze stronami WWW przez osoby z niepełnosprawnościami trwałymi i sytuacyjnymi oraz osoby z ograniczeniami socjo-ekonomicznymi dotyczącymi transferu i prędkości łącza.]

W tej definicji pojawia się aspekt, którego zwykle nie łączy się z dostępnością: ograniczenia transferu i prędkości łącza. Innymi słowy – za dostępność uznać można także kwestie związane z wydajnością stron internetowych. Zwłaszcza, że [Sieć to nie tylko szerokopasmowe łącza](https://www.smashingmagazine.com/2017/03/world-wide-web-not-wealthy-western-web-part-1/). W chwili, gdy [każdy bajt słono kosztuje](https://whatdoesmysitecost.com/), rozmiar strony zaczyna ograniczać dostęp do niej w bardzo podobny sposób co niedostosowanie do osób z niepełnosprawnościami. I to wyłącznie od autora strony zależeć będzie, czy zapewni dostępność takim osobom, np. poprzez ograniczenie ilości wczytywanego JavaScriptu czy skorzystanie z dobrych praktyk (jak np. [Web Vitals](https://web.dev/vitals/)).

Warto przy tym zauważyć, że WCAG nigdzie nie wspomina o wydajności. Stąd też ograniczenie się wyłącznie do spełniania wymogów standardu niekoniecznie uchroni nas przed odcięciem dostępu sporej liczbie użytkowników. I właśnie dlatego warto regularnie sprzątać pod metaforycznym łóżkiem naszej strony – bo możemy znaleźć problemy z dostępnością w naprawdę nieoczekiwanych miejscach.
