---
layout: post
title:  "Głośniejsze szczęki"
description: "Pojawiły się wyniki State of HTML 2026. Przyjrzyjmy się w nich pewnej kwestii."
author: Comandeer
date: 2026-11-18T22:17:00+0100
tags:
    - refleksje
comments: true
permalink: /glosniejsze-szczeki.html
---

Pojawiły się wyniki [State of HTML 2026](https://2026.stateofhtml.com/en-US). A wśród nich – pewna dość osobliwa i jakże frapująca kwestia, do której chciałbym się odnieść.

<!--more-->

Wśród pytań w tej edycji znalazło się też [następujące](https://2026.stateofhtml.com/en-US/features/accessibility/#accessibility_screenreaders):

> <p lang="en">Which screen readers do you use for accessibility testing?</p>
>
> [Których czytników ekranowych używasz do testowania dostępności?]

A oto siedem najpopularniejszych odpowiedzi wraz z procentowym udziałem każdej z nich:

1. [Narzędzi developerskich Chrome'a](https://developer.chrome.com/docs/devtools/overview) – 38%
2. [VoiceOvera](https://en.wikipedia.org/wiki/VoiceOver) – 34%
3. Żadnego – 33%
4. [Inspektora dostępności Firefoksa](https://firefox-source-docs.mozilla.org/devtools-user/accessibility_inspector/) – 24%
5. [NVDA](https://www.nvaccess.org/download/) – 18%
6. [WAVE](https://wave.webaim.org/) – 12%
7. [JAWS](https://vispero.com/jaws-screen-reader-software/) – 10%

Z powyższej listy raptem _trzy_ pozycje to faktycznie czytniki ekranowe (VoiceOver, NVDA oraz JAWS). Reszta to narzędzia developerskie do testowania dostępności, które nie zawsze poprawnie oddają to, jak wygląda używanie czytnika ekranowego. Ba, najpopularniejszy czytnik ekranowy, JAWS, jest używany do testowania rzadziej, niż choćby narzędzie WAVE, przeznaczone do szybkich testów automatycznych.

Miesiąc temu wspominałem, że [zastanawia mnie popularność VoiceOvera wśród osób bez niepełnosprawności](https://blog.comandeer.pl/glosne-szczeki). Rzuciłem wówczas nieśmiałą hipotezą, że może to <q>developerzy w korpo, którym kazano przetestować dostępność</q>. Cóż, jeśli zestawi się to z wynikami State of HTML 2026, to ta hipoteza robi się o wiele bardziej prawdopodobna…
