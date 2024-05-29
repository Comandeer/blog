---
layout: post
title:  "Fałszywa dychotomia – estetyka a dostępność"
description: "Wybór między dostępnością a estetyką jest fałszywy."
author: Comandeer
date: 2021-02-27T23:33:00+0100
tags:
    - refleksje
    - a11y
comments: true
permalink: /falszywa-dychotomia-estetyka-a-dostepnosc.html
---

W webdevie pokutuje przekonanie, że strona może być albo ładna, albo dostępna. Myślą tak nawet [laureaci Awwwards 2020](https://twitter.com/ericwbailey/status/1351243179060768778). Problem w tym, że przekonanie to jest całkowicie błędne i często drobne zmiany mogą sprawić, że ładna strona stanie się także o wiele bardziej dostępna.<!--more-->

## Animacja, czyli słoń w składzie porcelany

Najczęściej pojawiającym się błędem jest nierespektowanie ustawień użytkownika w zakresie animacji – a dokładniej: animowanie elementów strony nawet wówczas, gdy [na poziomie systemu użytkownik ustawił ograniczenie ruchu](https://support.apple.com/pl-pl/guide/mac-help/mchlc03f57a1/mac). Strony internetowe mogą wykrywać tego typu ustawienie przy pomocy [media query `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion). To w połączeniu z [funkcją `matchMedia`](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) pozwala na choćby wczytanie alternatywnej, mniej wodotryskowej wersji witryny, gdy okaże się, ze użytkownik chce bardziej _statyczną_ stronę.

Taka alternatywna wersja nie musi być jakoś mocno odmienna. Strona wciąż może wyglądać bardzo podobnie po usunięciu animacji. Weźmy taką [stronę Active Theory](https://activetheory.net/). W alternatywnej wersji na ekranie wyświetlałby się po prostu wybrany screen z projektu, najechanie myszką na przycisk nie powodowałoby efektu fali, a tło nie miałoby efektu paralaksy. I to w sumie tyle. Podbić jeszcze kontrast i dodać wyraźniejsze style dla focusu i mamy całkiem dostępną stronę.

Że niby traci się to specyficzne doświadczenie osiągnięte dzięki animacjom? Może – ale równocześnie niskim kosztem pozwalamy ze strony skorzystać o wiele większej liczbie osób, przy jednoczesnym zapewnieniu im _porównywalnego_ doświadczenia (korzystania z takiej samej strony, tyle że bez animacji).

## Accessible First

Niemniej myślę, że istnieje lepszy sposób, niż przygotowywanie alternatywnej, bardziej dostępnej wersji – podejście, które można by nazwać <i lang="en">Accessible First</i> (z ang. dostępność jako pierwsza). Tak, jak najczęściej zaleca się, by responsywność przygotowywać w podejściu [mobile/content first](mobile/content first), tak być może czas zalecać, by strony tak ogólnie tworzyło się w podejściu priorytetyzującym dostępność.

Założenie jest bardzo proste: zaczynamy od jak najprostszej wersji strony, która po prostu przekazuje treść w dostępny sposób (czyli tak naprawdę zaczynamy w tym samym miejscu, co w mobile/content first). Następnie dodajemy nowe funkcje, przez cały czas pozostając w zgodzie ze [standardem WCAG](https://w3c.github.io/wcag/guidelines/22/). Tego typu podejście sprawia, że sposób myślenia o stronie przez cały okres jej powstawania skupia się wokół jej dostępności, co pozwala w łatwiejszy sposób ominąć typowe problemy z nią związane. Przykładem mogą być animacje, które nie będą stanowić już niezbędnego elementu doświadczenia użytkownika, ale będą tylko opcjonalnym dodatkiem dla użytkowników, którzy sobie ich życzą. Znów: bardzo podobnie do mobile/content first, w którym [poszczególne nowe elementy strony dodawane są w zależności od możliwości urządzenia użytkownika](https://www.webkrytyk.pl/2019/01/31/kurs-web-developer-od-podstaw-w-15-dni-od-samuraja-programowania/#dzien-13). A w obydwu przypadkach bardzo podobnie do [Progressive Enhancement](https://www.aaron-gustafson.com/notebook/insert-clickbait-headline-about-progressive-enhancement-here/). Cebula w cebuli w cebuli. I z tego cebulowego gulaszu wychodzi [pyszne danie](https://responsibleweb.app/). Warte w sumie swojej własnej książki kucharskiej.
