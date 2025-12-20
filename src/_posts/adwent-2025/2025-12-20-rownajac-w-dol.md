---
layout: post
title:  "Równając w dół"
description: "Kompatybilność międzyprzeglądarkowa to spory problem. Baseline ma pomóc go rozwiązać"
author: Comandeer
date: 2025-12-20T17:11:00+0100
tags:
    - adwent-2025
    - standardy-sieciowe
comments: true
permalink: /rownajac-w-dol.html
---

Kompatybilność międzyprzeglądarkowa od lat jest [jednym z największych problemów webdevu](https://2025.stateofhtml.com/en-US/usage/). Dlatego powstał Baseline, który ma pomóc ten problem rozwiązać.<!--more-->

## Kompatybilność?

Obecnie na rynku mamy trzy duże silniki przeglądarek: [Blink](https://en.wikipedia.org/wiki/Blink_(browser_engine)) (używany w Chrome), [WebKit](https://en.wikipedia.org/wiki/WebKit) (Safari) oraz [Gecko](https://en.wikipedia.org/wiki/Gecko_(software)) (Firefox). Do tego dochodzą różne przeglądarki oparte na różnych wersjach tych trzech silników, ale też np. rozwiązania pokroju [Electrona](https://en.wikipedia.org/wiki/Electron_(software_framework)), który pozwala tworzyć aplikacje desktopowe na Chromium. Powstają też dwa nowe, duże silniki: [Servo](https://en.wikipedia.org/wiki/Servo_(software)) oraz [Ladybird](https://en.wikipedia.org/wiki/Ladybird_(web_browser)).

W teorii wszystkie te silniki wspierają te same standardy sieciowe. Ale w praktyce różnice mogą być znaczące. Po pierwsze, istnieje bardzo dużo standardów sieciowych, które nieustannie się zmieniają (np. [specyfikacja HTML](https://html.spec.whatwg.org/multipage/) w momencie pisania tego artykułu była zmieniana ostatnio 17 grudnia 2025). Niektóre przeglądarki nie mają na tyle zasobów, by implementować wszystkie najnowsze standardy i robią to z opóźnieniem. Dodatkowo, nawet jeśli przeglądarka X zaimplementuje jakiś standard z wersji z listopada, to wersja z grudnia może być już zupełnie inna. Tym samym dwie przeglądarki implementujące ten sam standard mogą nie być kompatybilne między sobą.

Kolejnym czynnikiem są różne priorytety przeglądarek. Niektóre przeglądarki skupiają się na dostarczaniu coraz to nowych ficzerów, podczas gdy inne stawiają na innowacje w innych obszarach, jak np. UI samej przeglądarki. Dobrym przykładem może być tutaj [Projekt Fugu](https://www.chromium.org/teams/web-capabilities-fugu/). Google zgłosiło szereg propozycji standardów sieciowych, które miały zminimalizować różnice między możliwościami aplikacji natywnych oraz webowych. Wśród propozycji były m.in. [WebUSB](https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API) czy [Web NFC](https://developer.mozilla.org/en-US/docs/Web/API/Web_NFC_API). Zarówno [Firefox](https://mozilla.github.io/standards-positions/#webusb), jak i [Safari](https://webkit.org/standards-positions/#position-68), odmówiły implementacji tych propozycji, wskazując na potencjalne problemy z bezpieczeństwem i prywatnością.

Wreszcie: zarówno przeglądarki, jak i same specyfikacje, mają bugi. Dodatkowo specyfikacje można interpretować na różne sposoby, nawet jeśli włożono spory wysiłek w to, by ich tekst był jak najbardziej jednoznaczny. Tutaj na pomoc przychodzą [Web Platform Tests](https://wpt.fyi/results/) – testy sprawdzające zgodność implementacji ze standardami sieciowymi. I choć dostarczają one dokładnych wyników, to są przeznaczone raczej dla osób, które zawodowo zajmują się tworzeniem przeglądarek lub standardów. Dla całej reszty mogą być mało czytelne.

## Baseline

Dlatego też powstał [Baseline](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility). To wskaźnik [pierwotnie zaproponowany przez Chrome'a w trakcie Google I/O 2023](https://web.dev/baseline/overview). Obecnie jest rozwijany przez [Web Developer Experience Community Group](https://www.w3.org/community/webdx/). Jego zadaniem jest wskazywanie, czy dany ficzer jest już dostępny we wszystkich najpopularniejszych przeglądarkach, czyli w Chrome (na desktopie i Androdzie), Firefoksie (na desktopie i Androidzie), Edge'u (na desktopie) oraz Safari (na desktopie i iOS-ie).

Każdy ficzer może mieć trzy poziomy wsparcia:

* {% image "../../images/rownajac-w-dol/limited-availability.svg" "" "display: inline-block;block-size: 2rem;inline-size: 2rem;" %} <b lang="en">Limited availability</b> (ograniczona dostępność) – dany ficzer wciąż nie jest dostępny we wszystkich przeglądarkach,
* {% image "../../images/rownajac-w-dol/newly-available.svg" "" "display: inline-block;block-size: 2rem;inline-size: 2rem;" %} <b lang="en">Newly available</b> (świeżo dostępny) – dany ficzer jest dostępny w najnowszych wersjach przeglądarek, może nie działać w starszych,
* {% image "../../images/rownajac-w-dol/widely-available.svg" "" "display: inline-block;block-size: 2rem;inline-size: 2rem;" %} <b lang="en">Widely available</b> (szeroko dostępny) – dany ficzer jest dostępny we wszystkich przeglądarkach od co najmniej 30 miesięcy (2.5 roku).

Baseline ma dostarczać prostej odpowiedzi na pytanie, czy ficzer X można już używać w projektach. Niemniej nie mówi nic ponad to, w jakich przeglądarkach dany ficzer jest dostępny. Jeśli potrzebujemy większej liczby szczegółów, wciąż trzeba sięgnąć po dokładniejsze źródła, takie jak choćby wspomniane już Web Platform Tests. Co więcej, wskaźnik ten nie uwzględnia różnic w implementacji danego standardu w przeglądarkach. Jedynie wskazuje, czy jest on obsługiwany w _jakikolwiek_ sposób. A to może też prowadzić do przekłamań, np. niektóre API są oznaczone jako mające ograniczoną dostępność, bo nie są dostępne w desktopowych przeglądarkach – mimo że niekoniecznie mają w nich sens (np. wspomniane już Web NFC).

Mimo swoich wad, Baseline już jest stałym elementem choćby dokumentacji MDN czy [Web.dev](https://web.dev/blog/baseline-urlpattern?hl=en). Osobiście mam co do niego mieszane uczucia, ale nie można mu odmówić jednego: robi dokładnie to, do czego go stworzono. A przez to już jest lepszy od wielu technologii sieciowych…
