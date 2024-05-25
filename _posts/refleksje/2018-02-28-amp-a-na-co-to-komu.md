---
layout: post
title:  "AMP – a na co to komu?"
author: Comandeer
date: 2018-02-28T23:58:00+0100
tags: 
    - refleksje
    - html-css
comments: true
permalink: /amp-a-na-co-to-komu.html
redirect_from:
    - /refleksje/html-css/2018/02/28/amp-a-na-co-to-komu.html
---

Siedząc od lat w środowisku webdevowym, wyrobiłem sobie dość silne opinie o poszczególnych aspektach działania dżungli zwanej Siecią. Dzisiaj podzielę się jedną z takich opinii.

## AMP – czyli co?

AMP to skrót oznaczający Accelerated Mobile Pages (ang. Przyśpieszone Strony Mobilne). Jest to [projekt open source stworzony przez Google](https://www.ampproject.org/), który ma umożliwić tworzenie szybkich stron internetowych. Wszystko opiera się na technologiach sieciowych, w tym głównie na [standardzie Custom Elements](https://developers.google.com/web/fundamentals/web-components/customelements) (CE). AMP udostępnia webdeveloperom zestaw CE, dzięki którym można zaimplementować bardziej responsywne odpowiedniki standardowych tagów HTML.

Strony AMP są serwowane bezpośrednio z cache Google'a, co sprawia, że są wczytywane niezwykle szybko. Z kolei zestaw reguł AMP zapewnia, że strona nie jest przeładowana niepotrzebnymi elementami, zachowując mały rozmiar, przystosowany do stron mobilnych. A dzięki faktowi, że całość jest open source, wydawcy treści bez żadnych problemów byli w stanie zaimplementować nową technologię.

## Smutna prawda

Ot, kolejna, szlachetna inicjatywa od Google, która ma ulepszyć wspólne dobro, jakim jest Internet, [prawda](https://www.youtube.com/watch?v=zTuUAlMveBU)? Wszystko rozbija się o to, w jaki sposób AMP zostało wdrożone.

Po pierwsze, to technologia własnościowa, mimo że formalnie o otwartych źródłach. Jedyną liczącą się implementacją AMP jest ta w wyszukiwarce Google. I prawda jest taka, że gdyby Google nie kusiło miejscem w karuzeli na samej górze listy znalezionych stron, to raczej mało kto miałby ochotę bawić się w dodatkowy format treści na swoją stronę WWW.

Własnościowość tej technologii pogłębia fakt, że obecnie [Google integruje AMP z GMailem](https://www.blog.google/products/g-suite/bringing-power-amp-gmail/) jako sposób na tworzenie jeszcze bardziej interaktywnych e-maili. Problem w tym, że żaden inny klient pocztowy AMP nie obsługuje i nie zdziwiłbym się, gdyby do tego nigdy nie doszło. Niemniej Google z pozycji monopolisty, może sobie na taki krok pozwolić, pokazując wszystkim "ej, patrzcie, ulepszyliśmy e-mail!". Problem polega na tym, że to już _nie jest_ e-mail. To po prostu Google'owska alternatywa dla e-maila, która działa wyłącznie w aplikacji od Google w oparciu o technologię stworzoną przez Google. Jednym z głównym powodów, dla którego e-mail wciąż jest tak popularnym środkiem wymiany informacji, jest fakt, że działa praktycznie wszędzie. AMP-owy e-mail działa praktycznie _nigdzie_.

Jak bardzo duży tupet ma Google w nazywaniu swoich własnościowych rozwiązań otwartymi standardami, pokazują [prace Google nad naprawianiem kompatybilności z WebKitem](http://frederic-wang.fr/amp-and-igalia-working-together-to-improve-the-web-platform.html) (to nie żart!). Coś, co z jednej strony mogłoby być naprawdę dobre dla Sieci, bardzo szybko okazuje się być poprawianiem kompatybilności WebKita z Chrome i AMP, nie zaś – WebKita z otwartymi standardami sieciowymi. Ba, AMP jest nazywany "przyszłością przyjazną dla użytkownika", co ma usprawiedliwiać [implementację AMP w WordPressie](https://twitter.com/AMPhtml/status/963443140005957632). Jeremy Keith się nie krępuje i mówi wprost: ["Google kłamie"](https://adactio.com/journal/13035). I [nie jest w tym stwierdzeniu odosobniony](http://ampletter.org/). [Naprawdę](https://ethanmarcotte.com/wrote/amplified/) [nie](https://github.com/ampproject/amphtml/issues/13597) [jest](https://www.zachleat.com/web/amp-letter/).

A najśmieszniejsze w tym wszystkim jest to, że [AMP nie jest wydajne](https://ferdychristant.com/amp-the-missing-controversy-3b424031047). Jedyne, co zapewnia mu wydajność, to cache ze strony Google oraz sprytny preloading AMP-owych stron w wynikach wyszukiwania. Prawda jest taka, że sposób, w jaki AMP działa (oparcie na CE i zależność od JS-a), sprawia, że dobrze zoptymalizowana strona WWW prawdopodobnie będzie szybsza.

## Alternatywa?

Alternatywą dla własnościowych technologii – jak zawsze w przypadku Sieci – są otwarte standardy sieciowe. Ba, [odpowiednia inicjatywa istnieje od dawna](https://timkadlec.com/2016/02/a-standardized-alternative-to-amp/). Problem w tym, że bez zainteresowania ze strony przeglądarek, taki standard sieciowy jest skazany na porażkę. A trudno, by zainteresowanie się pojawiło, skoro największy gracz na rynku zagarnął już niszę swoją własną technologią. A szkoda, bo obiektywnie szybkie strony (co da się zmierzyć przy pomocy choćby [Speed Index](https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/metrics/speed-index)) to coś, co przysłuży się całej Sieci. Otwartej Sieci, nie własnościowej.
