---
layout: post
title:  "ComSemRel – raport wojenny #1"
author: Comandeer
date:   2017-03-27 23:50:00 +0100
categories: daj-sie-poznac-2017
comments: true
---

Dzisiaj pierwszy raport z placu boju o lepszą automatyzację releasowania oprogramowania open source! Wieści nie są dobre, ale wciąż nie tragiczne (przynajmniej jak na mnie).

## TS jest fajny, chyba że akurat nie jest fajny

Jak już to wielokrotnie wspominałem, TypeScript jest fajny, bo dodaje interfejsy, niemniej jest nieciekawy jeśli chodzi o sam kompilator (transpilator?). Niby udostępnia miliard opcji, ale raptem kilka z nich faktycznie jest interesujących. Najbardziej mnie boli (tak, powtórzę to po raz setny) słabe wsparcie dla transpilowania wszystkiego do jednego pliku, co możliwe jest tylko w przypadku modułów SystemJS czy AMD. A ja potrzebowałbym czegoś takiego dla modułów ES6 i UMD. Zatem zostaje mi kombinowanie z narzędziami pokroju Webpacka czy rollupa.

Oczywiście mogłem wziąc Webpacka, bo wszyscy go używają i jest przetestowany w boju… i właśnie dlatego wziąłem rollupa, bo jest bardziej niszowy i jak coś nie działa, to siedzi się nad tym miesiąc. Chyba nikogo nie zdziwi fakt, że nie działa i jak na razie siedzę nad tym kilka dni (więc wciąż sporo przede mną). A wszystko rozbija się o to, w jaki sposób dochodzi do transpilacji. W przypadku rollupa kod jest wczytywany z plików i przekazywany pomiędzy poszczególnymi pluginami już jako zwykły tekst. A TS woli pliki. Co prawda udostępnia metodę `transpileModule`, ale… nie rzuca ona żadnymi błędami, nawet jeśli wciśniemy jej całkowicie błędny lub bezsensowny kod JS. Jeszcze bardziej denerwujący jest fakt, że ta metoda nie generuje plików z deklaracjami typów, które (oprócz interfejsów, rzecz jasna) są jedynym sensownym powodem do używania TypeScripta. Słowem: jest bezużyteczna.

Na chwilę obecną siedzę i myślę jak to obejść. Najprościej byłoby zapuszczać standardowy kompilator TS-a z poziomu konsoli (`spawn`, huh), zapisywać do plików tymczasowych, a następnie pobierać do pamięci i podsyłać rollupowi. Alternatywnie można to zrobić z poziomu kodu. Jeszcze inna możliwość, która brzmi najbardziej pro, to oszukanie TS-a i zmuszenie go do pracowania na wirtualnym systemie plików, które by istniały w pamięci. Niemniej żaden z tych sposobów nie brzmi jak coś, co powinno być konieczne do tak trywialnej czynności. Sprawdziłbym w dokumentacji jak coś takiego zrobić, ale oczywiście _akurat_ tego w niej nie ma…

## Własny bundler

Na szczęście udało się zrobić drugą rzecz: stworzyć [własny bundler dla bibliotek](https://github.com/Comandeer/rollup-lib-bundler). To małe maleństwo w założeniu ma być stosowane do wszystkich moich projektów rollupowych i innych, które będą programami typowo konsolowymi lub bibliotekami dla node.js. Głównym założeniem był całkowity brak konfiguracji i oparcie się wyłącznie na metadanych z pliku `package.json`. Tym sposobem cały bundler sprowadza się do prostej komendy `rlb`. Wystarczy ją odpalić i odpowiednie pliki są tworzone. Tyle. Proste do bólu.

## Cisza przed burzą…

Jak na razie, zamiast pisać sensowny kod, bawię się w rzeźbienie narzędzi. Tym samym ComSemRel leży i odpoczywa, czekając, aż w końcu będę odpowiednio uzbrojony, by się z nim zmierzyć. Męczące mnie nieustannie od miesiąca choróbsko również średnio w tym wszystkim pomaga i jeszcze bardziej zabija (nie)produktywność. Niemniej _coś_ się posuwa do przodu i mam nadzieję, że choćby tempo miało zostać tak niemrawe jak obecnie, to będzie utrzymane.

Bo może i ComSemRel jest projektem nudnym jak flaki z olejem, ale za to ambitnym i pozwalającym zaglądnąć choćby w trzewia gita. No i przede wszystkim warto w końcu dorzucić choć jeden skończony projekt do swojego "portfolio", prawda?
