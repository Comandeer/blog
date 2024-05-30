---
layout: post
title:  "Skok z wieży Babel"
description: "Trochę narzekania na dokumentację Babela."
author: Comandeer
date: 2017-04-23T20:00:00+0100
tags:
    - refleksje
    - javascript
    - daj-sie-poznac-2017
comments: true
permalink: /skok-z-wiezy-babel.html
redirect_from:
    - /refleksje/javascript/daj-sie-poznac-2017/2017/04/23/skok-z-wiezy-babel.html
---

Przecież najpopularniejsze narzędzie w ekosystemie JS nie może być całkowicie zepsute i dodatkowo nie posiadać żadnej sensownej dokumentacji, [prawda](https://www.youtube.com/watch?v=zTuUAlMveBU)? Jeśli na to pytanie, Drogi Czytelniku, odpowiedziałeś twierdząco, to muszę Cię zmartwić: jak najbardziej może. I przekonałem się o tym, nie po raz pierwszy zresztą, na własnej skórze.<!--more-->

Dokładnie wczoraj wypuściłem wersję 3.0.0 mojego [`rollup-plugin-babili`](https://www.npmjs.com/package/rollup-plugin-babili). Nigdy nie przypuszczałem, że to wręcz prymitywne narzędzie do minifikacji będzie moim najpopularniejszym projektem (i tyle, jeśli chodzi o zmienianie świata oprogramowania…). Ba, jest na tyle popularne, że ktoś go _faktycznie używa_ i nawet znalazł poważny defekt, do którego – uwaga, uwaga! – przygotował [pull request](https://github.com/Comandeer/rollup-plugin-babili/pull/15). [Święto](https://www.youtube.com/watch?v=nsBByTiKfyY). Tenże pull request naprawiał pewne niedogodności w tzw. bannerze, czyli komentarzu zawierającego informacje o licencji i autorze, który znajduje się na samej górze pliku:

```javascript
/*! jQuery v3.2.1 | (c) JS Foundation and other contributors | jquery.org/license */
[reszta kodu]
```

I wszystko byłoby fajnie, ALE… W przypadku mojego pluginu nie jest wstawiana nowa linia pomiędzy bannerem a kodem:

```javascript
/*! jQuery v3.2.1 | (c) JS Foundation and other contributors | jquery.org/license */[reszta kodu]
```

Ale to nic, przecież w tak doskonałym i popularnym narzędziu jak Babel coś takiego można zrobić z palcem w nosie, [prawda](https://www.youtube.com/watch?v=zTuUAlMveBU)? Nie, nie można. Babel skopie Cię po żołądku i przywali metalową pałką w głowę, a następnie zostawi nagiego na środku pustyni, żeby cię sępy pożarły.

W moim przypadku banner wstawiany jest przez [dedykowany plugin](https://www.npmjs.com/package/@comandeer/babel-plugin-banner) (tak, specjalnie napisałem go w tym celu). O dziwo ten plugin _wstawia_ nową linię na końcu:

```javascript
path.unshiftContainer( 'body', t.noop() );
```

Jak doszedłem do tego, że wstawienie nowej linii jest tym samym, co wstawienie "typu noop", to temat nie na osobny wpis, a na książkę… Ale wróćmy do sedna: skoro plugin działa dobrze, to znak, że musi być winna integracja z [`babili`](https://www.npmjs.com/package/babili) – Babelowym minifikatorem. I owszem, to zawiniło, ponieważ [Babel odpala pluginy przed presetami](https://babeljs.io/docs/plugins/#plugin-preset-ordering) (czyli mój kod zostanie wykonany przed całą minifikacją). Wniosek prosty: moja nowa linia jest usuwana.

I tutaj dygresja, bo konfiguracja pluginów i presetów w Babelu to śmieszna sprawa. Pluginy są bowiem odpalane w takiej kolejności, w jakiej je wpisaliśmy. Presety z kolei – w odwrotnej. Czemu? Bo:

>   This is mostly for ensuring backwards compatibility, since most users list “es2015” before “stage-0”.

No tak, lepiej zmienić API na całkowicie nieintuicyjne, bo jacyś użytkownicy robią coś źle…

Ok, ustaliłem przyczynę problemu, to teraz jak go rozwiązać?  Najlogiczniejszym wyjściem wydaje się dorzucenie jakimś sposobem mojego pluginu do babiliowego presetu. Jest nawet [moduł od tego](https://www.npmjs.com/package/modify-babel-preset). Cały dowcip polega na tym, że ten moduł operuje nazwami presetów i pluginów… czego nie mogę użyć, bo sposób, w jaki Babel następnie tych presetów i pluginów szuka, nie działa w Node 4.x i npm 2.x, które mam zamiar wspierać. Czyli dalej jestem w lesie. Skoro zatem nie mogę zmodyfikować istniejącego presetu, stworzę nowy tylko z jednym pluginem i umieszczę go _na początku_ listy presetów (żeby odpalił się po minifikacji). Genialne, [prawda](https://www.youtube.com/watch?v=zTuUAlMveBU)? Problem w tym, że nie działa.

Okazuje się, że Babel zbiera wszystkie transformacje ze wszystkich presetów i robi jakąś swoją magię, żeby je połączyć i móc zaaplikować w jak najmniejszej liczbie kroków, przez co i tak moje voodoo nie działa. Ale nie poddałem się, stwierdziłem, że przecież w konfiguracji Babela na pewno da się to zmienić. I tak, owszem, da się – opcją`passPerPreset`, która nie wiem, jak działa, bo… nie istnieje w dokumentacji, a dowiedziałem się o niej z [losowego issue na GitHubie](https://github.com/babel/babel/issues/4882#issuecomment-286615366). No ale to ostatnia deska ratunku, więc skorzystałem. Zapewne pomyślisz, Drogi Czytelniku, że się udało i mamy szcześliwe zakończenie, [prawda](https://www.youtube.com/watch?v=zTuUAlMveBU)? A gdzie tam, opcja ta powodowała, że kod w ogóle nie był minifikowany. Żeby było śmiesznej, okazało się, że moja linia jest usuwana z powodu opcji konfiguracyjnej Babela (`minified`) i nie ma to nic wspólnego z `babili` jako takim (oprócz tego, że babili domyślnie tę opcję włącza)… Ale jak zachować minifikację _oraz_ moją nową linię – nie wiem, po prostu nie wiem.

A wszystko zaczęło się od tego, że zmerge'owałem pull request od gościa, który przy pomocy reverse engineeringu rollupa wytłumaczył mi, że źle używam opcji w rollupowych pluginach – bo, rzecz jasna, w docsach tego nie było…

Gdzie moja książka do Javy?
