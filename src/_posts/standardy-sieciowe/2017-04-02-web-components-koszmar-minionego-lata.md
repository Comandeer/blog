---
layout: post
title:  "Web Components – koszmar minionego lata"
description: "Krótkie spojrzenie na obecny stan Web Components."
author: Comandeer
date: 2017-04-02T19:00:00+0100
tags:
    - standardy-sieciowe
    - html-css
    - javascript
    - daj-sie-poznac-2017
comments: true
permalink: /web-components-koszmar-minionego-lata.html
redirect_from:
    - /html-css/javascript/daj-sie-poznac-2017/2017/04/02/web-components-koszmar-minionego-lata.html
---

Ach, moje kochane Web Components, o których – jak to zauważają i wytykają mi nieraz znajomi – mogę rozprawiać godzinami, a i tak mi mało. [Gadałem o nich na żywo](http://comandeer.github.io/web-components-slides/), [pisałem o nich zanim się stało to modne](http://webroad.pl/javascript/3505-web-components) i [narzekałem na nie jeszcze przed nadejściem ich ery](http://tutorials.comandeer.pl/polymer.html). Aż w końcu nadeszły szczęśliwe czasy, w których Web Components mają natywne wsparcie. I co?

I g… nic, jak było źle, tak jest źle, jeśli nie znacznie gorzej. Ale po kolei.<!--more-->

## Piękna idea…

Nieskażone idee zawsze są piękne, czyż nie? Nie było inaczej i w przypadku WC (tak, używam tego skrótu, mimo że w artykułach po polsku wygląda _krypnie_): pozwólmy tworzyć webmasterom ich własne znaczniki! I choć oczywiście XML umożliwiał to od dawna, łącznie z [przestrzeniami nazw](https://developer.mozilla.org/en/docs/Namespaces), to jednak możliwość robienia tego w _normalnym_ HTML-u i to w taki sposób, żeby wytłumaczyć przeglądarce, jak ma się dokładnie obchodzić z takim elementem, była bez wątpienia przełomowa. Tym sposobem od `div` i `section` przeszliśmy do `my-article`.

Żeby było jeszcze lepiej, to mądrzy ludzie stwierdzili, że skoro już pozwalamy tworzyć własne znaczniki, to zróbmy to dobrze, czyli pozwólmy robić to, co przeglądarki mogą od dawna: ukrywać różne, dziwne bebechy i pokazywać jedynie znacznik (jak to ma miejsce choćby z `video`)!

{% figure "../../images/video-SD.png" "Shadow DOM tagu video w przeglądarce Chrome" %}

Tak oto narodził się Shadow DOM (SD).

Jeszcze mało? Dorzućmy wczytywanie tak stworzonych komponentów (czyli połączonych niestandardowych elementów – Custom Elements, CE – z SD) w _deklaratywny_ sposób. Tak powstały HTML Imports (HI):

```html
<link rel="import" href="/components/my-component.html">
```

I tak oto powstała trójca technologii (CE, SD, HI) składająca się na WC! Teoretycznie pozwala ona na stworzenie niezależnych od żadnego frameworka komponentów, które będzie można po prostu załadować na stronę i używać bez obawy, że wpłyną na jakikolwiek inny element strony (pełna enkapsulacja dzięki SD!). Idealny sposób na tworzenia interfejsu użytkownika, prawda?

## …i smutna rzeczywistość

Niemniej w międzyczasie powstał [Angular.js](http://www.webkrytyk.pl/2014/12/12/moja-prawda-o-angular-js/), a następnie [React.js](https://facebook.github.io/react/), podczas gdy standard WC utknął wśród zawiłych meandrów procesu standaryzacyjnego W3C i, dzięki "konstruktywnej krytyce", zaorano pierwszą wersję standardu (którą później nazwano dla niepoznaki "V0") i stworzono… erm, _pierwszą_ wersję standardu ("V1"). Jest tak bardzo dobra, że jedna z podstawowych jego części, atrybut `[is]`, została odrzucona przez Apple i nigdy nie zostanie zaimplementowana w WebKicie. Z kolei  [sama dyskusja](https://github.com/w3c/webcomponents/issues/509) odnośnie tego, co ten atrybut ma robić i czy _w ogóle_ ma coś robić, doszła do poziomu totalnego absurdu (rzucano już [argumenty o długopisie NASA i ołówku ZSSR](https://github.com/w3c/webcomponents/issues/509#issuecomment-265542471)…). Zresztą bardzo podobny los spotkał HI, którym sprzeciwili się wszyscy oprócz Google.

Nic zatem dziwnego, że wszyscy piszą swoje komponenty w React albo innym frameworku i nikt nie zwraca uwagi na śmieszny standard od W3C, który w dodatku ma [żenujące](http://caniuse.com/#feat=custom-elementsv1) [wsparcie](http://caniuse.com/#feat=shadowdomv1). Same prace nad standardem natomiast ciągną się już tak długo, że chyba nawet najstarsi górale nie pamiętają ich początku, a najwięksi fanatycy otwartych standardów stracili już swoją wiarę w zdolnośc dochodzenia do konsensusu wśród członków W3C.

Nie jest jeszcze tak tragicznie (wszyscy wszak pamiętamy sytuację z Pointer Events API), co? Szkoda tylko, że **jedyna** licząca się implementacja WC, [Polymer](https://www.polymer-project.org/), jako [przykład używania WC](https://shop.polymer-project.org/) pokazuje to:

```html
<shop-app unresolved="">SHOP</shop-app>
```

Tak, ten tag HTML zawiera w sobie całą logikę biznesową skomplikowanej aplikacji…

Idę płakać w kącie.

## I co dalej?

Nic, wracaj do swojego Reacta, przedstawienie skończone. Czas się chyba w końcu pogodzić z faktem, że WC są martwe (w sumie to nigdy nie były żywe).
