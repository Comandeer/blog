---
layout: post
title:  "Głośne szczęki"
description: "WebAIM wypuścił wyniki najnowszej ankiety o czytnikach ekranu. Przyjrzyjmy się w nich pewnej kwestii."
author: Comandeer
date: 2026-10-08T22:16:00+0200
tags:
    - refleksje
comments: true
permalink: /glosne-szczeki.html
---

WebAIM wypuściło [wyniki najnowszej, 11. edycji ankiety wśród osób korzystających z czytników ekranowych](https://webaim.org/projects/screenreadersurvey11/). Całe są dość interesujące, ale nie zamierzam ich dzisiaj analizować. Skupię się tylko na pewnej dość frapującej kwestii.

<!--more-->

WebAIM od 2008 roku regularnie przeprowadza ankietę wśród osób korzystających z czytników ekranowych. Przez ostatnie lata na czoło najpopularniejszych czytników wysunął się [NVDA](https://www.nvaccess.org/) – darmowy, z otwartym źródłem. Niemniej w tym roku na tron powrócił [JAWS](https://vispero.com/jaws-screen-reader-software/), który z kolei jest drogi, ale za to zamkniętoźródłowy. Ale [nie wszędzie króluje](https://webaim.org/projects/screenreadersurvey11/#primary):

> <p lang="en">JAWS usage was significantly lower than NVDA in Africa/Middle East (13.6% vs. 83%), Asia (17% vs. 77.4%), and South America (18.8% vs. 67.2%).</p>
>
> [Popularność JAWS-a była zdecydowanie niższa niż popularność NVDA w Afryce i na Środkowym Wschodzie (13.6% vs 83%), Azji (17% vs 77.4%) i w Południowej Ameryce (18.8% vs 67.2%).]

Ankieta nie zawiera odpowiedzi _dlaczego_ tak jest, ale można podejrzewać, że związane jest to właśnie z ceną JAWS-a. Niemniej to kolejna informacja była faktycznie frapująca:

> <p lang="en">VoiceOver was significantly more popular among respondents without disabilities (21.7% use VoiceOver) than with users with disabilities (5.7% use VoiceOver).</p>
>
> [VoiceOver był zdecydowanie popularniejszy wśród osób bez niepełnosprawności (21.7% z nich używało VoiceOvera), niż wśród osób z niepełnosprawnościami (5.7% z nich używało VoiceOvera).]

[VoiceOver](https://en.wikipedia.org/wiki/VoiceOver) to czytnik ekranowy wbudowany w macOS-a. Z kolei JAWS i NVDA to czytniki na Windowsa. Czemu zatem macOS i jego czytnik cieszą się aż taką popularnością wśród osób bez niepełnosprawności? Tu, niestety, ankieta po raz kolejny nie daje odpowiedzi. Zostają gdybania. I na start trzeba podkreślić, że [nie wszystkie osoby korzystające z czytników ekranowych są niewidome](https://adrianroselli.com/2017/02/not-all-screen-reader-users-are-blind.html). Tego typu programy są też wykorzystywane m.in. przez osoby z dysleksją czy neuroróżnorodne. Część takich osób, w zależności od tego, jak rozumie słowo <q>niepełnosprawność</q>, może określić się jako osoby bez żadnych niepełnosprawności.

Niemniej jest też inna możliwość. Kto najczęściej nie ma niepełnosprawności i do tego korzysta na co dzień z macbooka? Developer w korpo, któremu kazano przetestować dostępność. Czy takie osoby trafiły na tę ankietę i ją wypełniły? Znów: udostępnione wyniki nie dają tego typu informacji. Ale jest to możliwe. I tutaj pojawia się pewien drobny problem. Bo to oznaczałoby, że testowanie dostępności dzieje się na sprzęcie, z którego nie korzysta większość osób używających czytników ekranowych na co dzień. A to prowadzić może do sytuacji, w której aplikacja działa perfekcyjnie w VoiceOverze i słabo w JAWS-ie, którego używa 70% osób z niepełnosprawnościami.

I to jest ten jeden z nielicznych przypadków, w których chciałbym się mylić.
