---
layout: post
title:  "ComSemRel – raport wojenny #7"
description: "Podsumowanie postępu prac nad ComSemRelem #7."
author: Comandeer
date: 2017-05-07T23:00:00+0200
tags:
    - daj-sie-poznac-2017
comments: true
permalink: /comsemrel-raport-wojenny-7.html
redirect_from:
    - /daj-sie-poznac-2017/2017/05/07/comsemrel-raport-wojenny-7.html
---

Dalej posucha straszna – za dużo mam innych rzeczy na głowie, żeby na poważnie się zająć ComSemRelem. Teraz siedzę i robię jakieś głupoty, typu poprawna konfiguracja CI, zapewnienie automatycznej aktualizacji zależności przy pomocy [Greenkeepera](https://greenkeeper.io/) itd. Słowem: ruszam, żeby nie było, że umarło.<!--more-->

Równocześnie cały czas kombinuję z rendererem. Doszedłem do wniosku, że metody, jakie będzie posiadał, powinny być jak najbardziej ogólne, typu `print`, `displayTable` (ach, te spójne nazewnictwo!) itd. Dzięki temu teoretycznie będę mógł bez większego problemu podmienić konsolowy renderer na jakieś GUI w HTML-u. Brzmi jak szaleństwo, ale… ja nazwałbym to bardzo dobrą architekturą aplikacji: całkowite oddzielenie logiki od prezentacji.

Renderer powinien być dostępny w tym tygodniu (i tak, wiem, że powtarzam to od 3 tygodni…). A potem zobaczymy, heh.
