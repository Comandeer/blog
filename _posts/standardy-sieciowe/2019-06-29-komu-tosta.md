---
layout: post
title:  "Komu tosta?"
author: Comandeer
date:   2019-06-29 14:45:00 +0200
categories: standardy-sieciowe refleksje
comments: true
permalink: /komu-tosta.html
---

Ostatnio Google ogłosiło, że [zamierza wprowadzić nowy element HTML, `toast`/`std-toast`](https://groups.google.com/a/chromium.org/forum/#!msg/blink-dev/Gl7FIKM5IFw/tA70X9ZIBQAJ). Nie trzeba chyba mówić, że [wywołało to poruszenie w środowisku](https://adactio.com/journal/15357)…

## Ale o co chodzi?

Od czasu powstania Web Components Google nieustannie eksperymentuje z tworzeniem czegoś, co można by nazwać "standardowymi komponentami" – niby opartymi o Web Components, ale równocześnie wbudowanymi w przeglądarkę i posiadającymi odpowiednią specyfikację. Nie inaczej jest w przypadku `std-toast`, czyli elementu mającego być uosobieniem specyficznego typu komunikatów na stronie – tostów (po polsku to serio brzmi tragicznie). [Propozycja dodania tego elementu](https://github.com/jackbsteinberg/std-toast) zawiera dokładny opis, o jaki rodzaj elementu chodzi, więc pozwolę sobie tę kwestię pominąć. O wiele bowiem ciekawsze są konsekwencje, jakie może to przynieść dla standardów sieciowych…

Otóż Google wydaje się nie chcieć standaryzować poszczególnych komponentów jako części HTML czy innego, dużego standardu. Wskazuje na to już sam fakt, że nowy element nazywa się `std-toast` (a zatem: ma nazwę typową dla Custom Elementu). Równocześnie Googlerzy muszą zdawać sobie sprawę z tego, że przecież nie każda przeglądarka będzie chciała dostarczać wbudowany w siebie framework UI. Dlatego zamiast poszczególnych komponentów wolą ustandaryzować _infrastrukturę umożliwiającą dodawanie takich komponentów_.

[Obecna propozycja](https://github.com/whatwg/html/issues/4697) jest taka, żeby wszystkie tego typu nowe elementy były tzw. [Layered API](https://github.com/drufball/layered-apis). Innymi słowy: nowe elementy HTML wczytywane byłyby jako moduły ES:

```html
<script type="module">
import 'std:elements/toast';
</script>

<std-toast id="sample-toast" theme="info">
    Hello World!
</std-toast>
```



## Problemy i zagrożenia

Próba stworzenia takiej infrastruktury jednak wiąże się z wieloma potencjalnymi problemami.

### To pieśń przyszłości

Żeby wprowadzić Layered API, trzeba najpierw wypracować model dla wbudowanych w przeglądarkę modułów ES. A to już [całkowicie odrębny standard](https://github.com/tc39/proposal-javascript-standard-library), którym nawet nie zajmuje się WHATWG, tylko TC39. Oczywiście tutaj pojawia się problem związany z tym, że zdefiniowanie tego na poziomie samego języka sprawi, że poszczególne implementacje ES (czyli silniki JS w przeglądarce i środowiska pokroju Node) będą to musiały następnie dostosować do swoich potrzeb. A to oznacza, że po raz kolejny moduły w przeglądarce i Node.js się rozjadą. Wystarczy wspomnieć choćby, że mamy już połowę 2019 roku, a modułów ES w Node.js wciąż nawet nie ma…

### Polyfille, wszędzie polyfille…

[Każdy nowy element HTML miałby być polyfillowalny](https://github.com/whatwg/html/issues/4696). W teorii brzmi to fajnie, bo w razie braku obsługi danego elementu można go samemu stworzyć. Jaki jest jednak pomysł na to, by móc wczytać nasz moduł w miejsce niedostępnego wbudowanego? Wystarczy stworzyć [mapę importów](https://github.com/WICG/import-maps#for-built-in-modules-in-module-import-map-supporting-browsers). Ale zaraz, zaraz… A co w przypadku gdy przeglądarka nie wspiera map importów? Pewnie da się to jakoś obejść, np. podając jako domyślny adres modułu adres polyfilla elementu HTML, a następnie w mapie importów nadpisać go adresem wbudowanego modułu…

```html
<script type="importmap">
{
  "imports": {
    "/std-toast-polyfill.js": [
      "std:elements/toast",
      "/std-toast-polyfill.js"
    ]
  }
}
</script>
```

Ok, fajnie, ale przecież na rynku są wciąż przeglądarki, które nie rozumieją nawet `script[type=module]`! Dobra, dołożymy gdzieś `script[nomodule]`… Czy już wspominałem, że niektóre przeglądarki wciąż nie obsługują Web Components? I nie są to wydumane problemy, bo [**spora część użytkowników czytników ekranowych używa IE11**](https://webaim.org/projects/screenreadersurvey7/#browsercombos).

A, czy wspominałem już, że to wszystko są mocno eksperymentalne standardy, które mogą się w każdej chwili zmienić, wymuszając aktualizację polyfillów?

### Umocnienie monopolu Chrome

Jeśli przyjrzymy się, kto dał podwaliny pod standardy, na których obecnie budowana jest infrastruktura dla nowych elementów HTML, to można dojść do wniosku, że jest to obszar całkowicie zmonopolizowany przez Google. Pomysł na Layered APIs wyszedł od nich, pomysł na mapy importów wyszedł od nich, ba, pomysł na Web Components również wyszedł od Google. Wydaje się, że jedynym elementem tej układanki, który nie wyszedł od Google, jest próba ustandaryzowania wbudowanych modułów w TC39.

Nawet jeśli zostawimy na boku kwestię samych standardów i przyjrzymy się samym implementacjom, to tutaj również wyraźnie zarysowuje się monopol Chrome'a. De facto nikt nie pracuje obecnie nad tymi technologiami oprócz Google (Mozilla nawet jeszcze się [nie ustosunkowała zarówno co do wbudowanych modułów ES](https://github.com/mozilla/standards-positions/issues/147), jak i [map importów](https://github.com/mozilla/standards-positions/issues/146)).

### Progressive Enhancement

Nowa infrastruktura dodawania elementów HTML oznacza, że aby po prostu użyć nowego elementu HTML będziemy musieli użyć skryptów JS. Innymi słowy: warstwa treści strony internetowej przestaje być niezależna od warstwy zachowania. [Progressive Enhancement przez lata był tą zasadą, według której tworzono standardy](https://github.com/w3c/csswg-drafts/issues/3778#issuecomment-478291654). W tym momencie wydaje się, że dochodzi do swoistego odejścia od tego, co może zaowocować problemem wspomnianym na GitHubie: podstawowe doświadczenia z korzystania ze strony przestaną być _porównywalne_ pomiędzy użytkownikami, u których JS działa, a użytkownikami, u których [JS nie działa](https://kryogenix.org/code/browser/everyonehasjs.html).

Jako główny argument, przemawiający za taką infrastrukturą, Google podaje wydajność. Niemniej [nie ma wystarczających przesłanek](https://github.com/whatwg/html/issues/4697#issuecomment-506644355) ku temu, że faktycznie wbudowane moduły zwiększą wydajność. Inna rzecz: czy wydajność sama w sobie usprawiedliwia odejście od ugruntowanej przez de facto już dziesięciolecia zasady tworzenia standardów?

### Dostępność?

O wielu problemach z dostępnością wspomniałem już w poprzednich punktach. Niemniej problemy pojawiają się nawet na tak podstawowym poziomie, jak [dobranie odpowiedniej roli ARIA dla nowego elementu](https://github.com/jackbsteinberg/std-toast/issues/25). Wydaje się, że [nowy element był tworzony niemal wyłącznie z myślą o sposobie prezentacji wizualnej](https://github.com/jackbsteinberg/std-toast/tree/84bb6eadac5001da031ec1a228ab467221d3e35c/study-group). Z kolei na razie [brakuje dokładnych wyników badania dostępności](https://github.com/jackbsteinberg/std-toast/issues/25#issuecomment-505421273).

### Zasady tworzenia dobrych standardów

O jednej z zasad (Progressive Enhancement) już wspomniałem. Niemniej W3C przygotowało lata temu [dokument opisujący dobre praktyki tworzenia standardów](https://www.w3.org/TR/html-design-principles/) (warto zauważyć, że autorzy obecnie są członkami WHATWG). Wśród zasad jest także zasada ["Priority of Constituencies"](https://www.w3.org/TR/html-design-principles/#priority-of-constituencies) (Ważność Uczestników):

> In case of conflict, consider users over authors over implementors over specifiers over theoretical purity.
>
> [W przypadku konfliktu należy uznać wyższość racji użytkowników nad racją autorów stron, racji autorów stron nad racją implementatorów standardu w przeglądarkach, racji implementatorów standardu w przeglądarkach nad racją autorów specyfikacji, racji autorów specyfikacji nad teoretycznym puryzmem.]

W przypadku `std-toast` mamy dziwną sytuację, w której implementatorzy są także autorami specyfikacji, a równocześnie wydaje się, że [nikt nie zapytał użytkowników o opinię](http://adrianroselli.com/2019/06/scraping-burned-toast.html). Tym samym powstał standard, którego… nikt nie potrzebuje. A to łamie pierwszą zasadę tworzenia dobrych standardów: ["Solve Real Problems"](https://www.w3.org/TR/html-design-principles/#solve-real-problems) (Rozwiązuj Realne Problemy).
