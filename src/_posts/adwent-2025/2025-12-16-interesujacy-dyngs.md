---
layout: post
title:  "Interesujący dyngs"
description: "Krótki poradnik, jak wyrazić zainteresowanie elementem UI?"
author: Comandeer
date: 2025-12-16T00:00:00+0100
tags:
    - adwent-2025
    - standardy-sieciowe
    - html-css
comments: true
permalink: /interesujacy-dyngs.html
---

Zwrot deklaratywny trwa w najlepsze. Oprócz [obsługi komend](https://blog.comandeer.pl/rozkazuje-ci), ostatnio pojawiło się też [<i lang="en">Interest Invoker API</i> (API Wyzwalacza Zainteresowania)](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using_interest_invokers).<!--more-->

## Zainteresowanie?

Wypada zacząć od wyjaśnienia, czym jest <q>zainteresowanie</q> w tym kontekście. W [oficjalnej propozycji nowego API](https://open-ui.org/components/interest-invokers.explainer/#introduction) jest to wyjaśnione mocno enigmatycznie:

><p lang="en">[…] rather than being activated via a <strong>click</strong> on the element, this API uses a lighter-touch way for the user to “show interest” in an element without fully activating it.</p>
>
>[[…] zamiast aktywowania poprzez **klik** na elemencie, to API używa lżejszego sposobu okazania przez osobę użytkowniczą "zainteresowania" elementem bez jego pełnej aktywacji.]

Taka definicja nie wyjaśnia za dużo, ale na szczęście jest [cała sekcja](https://open-ui.org/components/interest-invokers.explainer/#hids-and-interest) poświęcona różnym sposobom interakcji z urządzeniem i jak się to przekłada na zainteresowanie:

| Sposób interakcji z urządzeniem                              | Sposób okazywania zainteresowania                            | Sposób tracenia zainteresowania                        |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------ |
| [Myszka](https://open-ui.org/components/interest-invokers.explainer/#mouse) | Najechanie kursorem myszy (hover) i przytrzymanie go na elemencie przez pewien czas | Zjechanie kursorem myszy z elementu                    |
| [Klawiatura](https://open-ui.org/components/interest-invokers.explainer/#keyboard) | Sfocusowanie elementu i pozostawienie go sfocusowanym przez pewien czas | Zabranie focusu z elementu, naciśnięcie <kbd>Esc</kbd> |
| [Ekran dotykowy](https://open-ui.org/components/interest-invokers.explainer/#touchscreen) | Gest [długiego naciśnięcia (<i lang="en">long press</i>)](https://en.wikipedia.org/wiki/Pointing_device_gesture#:~:text=0%3A04-,Long%20Press,-Duration%3A%205%20seconds) | Dotknięcie poza elementem                              |
| [Pozostałe](https://open-ui.org/components/interest-invokers.explainer/#other) | Przeglądarka dobiera odpowiedni sposób                       | Przeglądarka dobiera odpowiedni sposób                 |

Innymi słowy: "okazywanie zainteresowania" to ulepszony hover. Działa bowiem nie tylko z myszką, dostosowuje się także do innych urządzeń wejściowych i sposobów interakcji z urządzeniem.

## Nowe API

{% note %}Dla uproszczenia, będę opisywał API z perspektywy osoby korzystającej z myszy. Niemniej wszędzie tam, gdzie pojawia się najechanie myszą, tak naprawdę chodzi o wszystkie wymienione wyżej sposoby interakcji.{% endnote %}

### Tooltipy

Nowe API jest podobne do istniejącego [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API). Jego głównym elementem jest [atrybut `[interestfor]`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#interestfor). Można go dodać do elementów [`a`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a), [`area`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/area), [`button`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button) oraz [`a` w SVG](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/a). Wskazuje on na element, z którym coś ma się stać, gdy elementowi z tym atrybutem okaże się zainteresowanie. Sztandarowym przykładem jest pokazanie tooltipa:

{% include 'embed' src="https://codepen.io/Comandeer/pen/xbVNNYJ" %}

```html
<button interestfor="tooltip">Jakiś przycisk</button> <!-- 1 -->
<span popover="hint" id="tooltip">Jakiś tooltip</span> <!-- 2 -->
```

Przycisk ma atrybut `[interestfor]`, wskazujący na element `#tooltip` (1). Z kolei element `#tooltip` ma [atrybut `[popover=hint]`](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using#using_hint_popover_state) (2). Dzięki temu po najechaniu myszą na przycisk, po chwili powinien pod nim pojawić się tooltip:

{% figure "../../images/interesujacy-dyngs/tooltip.png" "Przycisk &quot;Jakiś przycisk&quot;, pod którym znajduje się obramowane okienko z napisem &quot;Jakiś tooltip&quot;." %}

Natomiast sama wartość `hint` dla atrybutu `[popover]` informuje przeglądarkę, że ma traktować ten popover jako pomocniczy. Dzięki temu jego pojawienie się będzie zamykać jedynie inne pomocnicze popovery. Pozostałe będą go ignorować.

Położenie tooltipa można kontrolować przy pomocy [własności CSS `position-area`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-area):

```css
[popover=hint] {
	position-area: bottom; /* 1 */
}
```

W naszym przykładzie użyliśmy wartości `bottom` (1), dzięki czemu tooltip pojawia się pod przyciskiem.

CSS pozwala także zmienić opóźnienie po interakcji z elementem, po którym przeglądarka uzna, że ktoś wyraża zainteresowanie:

```css
[interestfor] { /* 2 */
	interest-delay: 0s; /* 1 */
}
```

W powyższym przykładzie [ustawiliśmy opóźnienie](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/interest-delay) na `0s` (1). Tym samym będzie się to zachowywać praktycznie identycznie do pseudoklas [`:hover`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:hover) i [`:focus`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus). Warto też zauważyć, że własność tę należy dodać do elementu z atrybutem `[interestfor]`, nie zaś do popovera (2).

### Zaawansowane interakcje

Można jednak tworzyć o wiele bardziej skomplikowane interakcje, niż pokazywanie tooltipa:

{% include 'embed' src="https://codepen.io/Comandeer/pen/OPNYYqN" %}

W powyższym przykładzie najechanie na przycisk sprawi trzy rzeczy:

1. najechany przycisk dostanie pomarańczowe tło,
2. kółko na środku strony zmieni kształt i kolor obramowania,
3. kółko na środku dostanie kolor tła równy zawartości atrybutu `[data-color]` najechanego przycisku.

Kod HTML wygląda następująco:

```html
<p>
	<button interestfor="circle" data-color="pink">Różowy</button> <!-- 1 -->
	<button interestfor="circle" data-color="blue">Niebieski</button> <!-- 2 -->
	<button interestfor="circle" data-color="green">Zielony</button> <!-- 3 -->
</p>
<div class="circle" id="circle"></div> <!-- 4 -->
```

Każdy z przycisków (1, 2, 3) ma atrybut `[interestfor]` wskazujący na element `#circle` (4).

Z kolei kod CSS odpowiedzialny za zmianę tła przycisków oraz obramowania koła prezentuje się tak:

```css
:interest-source { /* 1 */
	background: orange; /* 2 */
}
:interest-target { /* 3 */
	border: 2px #f00 dashed; /* 4 */
}
```

[Pseudoklasa `:interest-source`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:interest-source) (1) wskazuje na aktualnie najechany elementy z atrybutem `[interestfor]`. Dostanie on pomarańczowe tło (2). Z kolei element wskazywany przez atrybut `[interestfor]` aktualnie najechanego elementu jest wskazywany przez [pseudoklasę `:interest-target`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:interest-target) (3). Dostanie on czerwone, przerywane obramowanie (4).

Natomiast do zmiany tła kółka potrzebujemy kodu JS:

```javascript
const circle = document.querySelector( '#circle' );

circle.addEventListener( 'interest', ( evt ) => { // 1
	evt.target.style.backgroundColor = evt.source.dataset.color; // 2
} );
circle.addEventListener( 'loseinterest', ( evt ) => { // 3
	evt.target.style.backgroundColor = 'transparent'; // 4
} );
```

Gdy najedziemy na przycisk z atrybutem `[interestfor]`, na elemencie przez niego wskazywanym odpali się [zdarzenie `interest`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/interest_event) (1). Gdy zajdzie, do kółka przypisujemy kolor wskazywany przez atrybut `[data-color]` przycisku (2). Własność `evt.target` przechowuje element wskazywany przez atrybut `[interestfor]`, podczas gdy `evt-source` – element z atrybutem `[interestfor]`. Z kolei, gdy zjedzie się myszą z przycisku, wówczas na kółku zostanie odpalone [zdarzenie `loseinterest`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/loseinterest_event) (3). Wtedy też usuwamy mu tło (4).

### Przyszłość

Nowe API ma zdecydowanie gorsze wsparcie niż swój klikalny odpowiednik. Na ten moment [działa wyłącznie w Chrome i Edge'u](https://caniuse.com/wf-interest-invokers). Co nie jest aż takie zaskakujące, jeśli weźmie się pod uwagę, że Interest Invoker API nie ma jeszcze nawet oficjalnej specyfikacji. To oznacza, że jeszcze trochę sobie poczekamy na w pełni natywne, deklaratywne tooltipy. A jest na co czekać, bo zrobienie ich dobrze, z dobrym pozycjonowaniem tooltipów, to jest zaskakująco skomplikowany problem. Istnieją całe biblioteki, takie jak [Floating UI](https://floating-ui.com/), których jedynym zadaniem jest obliczanie, w którym miejscu okienko z pomocną etykietą powinno się pokazać. Do tego trzeba dodać całą JS-ową logikę, która będzie pokazywać tooltipa po odpowiednio długim przytrzymaniu myszy na elemencie. A przecież trzeba jeszcze obsłużyć inne sposoby "okazywania zainteresowania". To w gruncie rzeczy problem podobny do [zamykania elementów UI zgodnie z konwencjami danej platformy](https://blog.comandeer.pl/sezamie-zamknij-sie).

Dlatego ja z niecierpliwością czekam na czasy, gdy okazywanie zainteresowania w końcu stanie się łatwe.
