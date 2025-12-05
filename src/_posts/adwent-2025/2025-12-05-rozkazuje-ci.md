---
layout: post
title: "Rozkazuję ci…!"
description: "Wyzwalacze to nowy, deklaratywny sposób dodawania zachowań do elementów HTML."
author: Comandeer
date: 2025-12-05T00:00:00+0100
tags:
    - adwent-2025
    - standardy-sieciowe
    - html-css
comments: true
permalink: /rozkazuje-ci.html
---

W 2024 wspominałem o [zwrocie deklaratywnym w standardach sieciowych](https://blog.comandeer.pl/zwrot-deklaratywny):  coraz więcej API przenosi rzeczy dotąd możliwe tylko w JS-ie na grunt HTML-a. Wspominałem tam też o wywoływaczach, które wówczas były tylko propozycją. Minęło ok. 1.5 roku i oto ~~wywoływacze~~ [wyzwalacze są już w przeglądarkach](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API).<!--more-->

## Wyzwalacze

{% note %}Tak, w 2024 zaproponowałem nazwę <q>wywoływacze</q>, ale im częściej jej używałem, tym bardziej mi się ona nie podobała. Dlatego od teraz będę to API nazywał <q>wyzwalaczami</q>{% endnote %}

Wyzwalacze, a dokładniej [<i lang="en">Invoker Commands API</i> (API Komend Wyzwalacza)](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API), dodają dwa nowe atrybuty: [`[command]`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button#command) oraz [`[commandfor]`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button#commandfor). Można ich użyć do przypięcia komend do określonych elementów:

{% include 'embed' src="https://codepen.io/Comandeer/pen/VYaEqXa" %}

W powyższym przykładzie nie ma ani linijki JS-a. Zarówno otwarcie, jak i zamknięcie modala, są zrobione przy pomocy nowego API. Przyjrzyjmy się, jak można to zrobić, na przykładzie otwierania:

```html
<button command="show-modal" commandfor="dialog">Otwórz modal</button> <!-- 1 -->
<dialog id="dialog"> <!-- 2 -->
	<p>Cześć, jestem modalem!</p>
</dialog>
```

Tworzymy przycisk (1), któremu dodajemy dwa atrybuty: `[command]`, z nazwą komendy, którą chcemy wywołać (w tym wypadku `show-modal`), oraz `[commandfor]`, zawierający identyfikator elementu, któremu chcemy tę komendę wydać (w tym wypadku `dialog`). Oczywiście taki element też musimy dodać do kodu (2). W ten prosty sposób możemy otwierać modale bez udziału JS-a!

Warto przy tym zauważyć, że komendy można wywoływać wyłącznie przy pomocy elementu `button`. Atrybuty nie zadziałają na żadnym innym. Dzięki temu prostemu zabiegowi nie da się stworzyć całkowicie niedostępnej komendy. Przycisk bowiem został stworzony dokładnie do takich rzeczy i po prostu [robi to najlepiej](https://blog.comandeer.pl/czy-div-jest-dostepny).

A jakie komendy są dostępne? Na ten moment jest ich [niewiele](https://html.spec.whatwg.org/multipage/form-elements.html#attr-button-command):

* `toggle-popover` – przełącza stan [popovera](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using),
* `show-popover` – pokazuje popover,
* `hide-popover` – ukrywa popover,
* `close` – zamyka otwarty element `dialog`,
* `request-close` – wysyła żądanie zamknięcia elementu `dialog` (czyli odpala odpowiednie zdarzenie, żeby była możliwość zablokowania zamknięcia; w przypadku `close` element jest po prostu zamykany, bez możliwości zablokowania tego),
* `show-modal` – pokazuje wskazany elementy `dialog` w trybie modalnym.

Jak widać, można podzielić te komendy na dwie grupy: te do sterowania popoverami oraz te do sterowania modalami/dialogami. W przyszłości prawdopodobnie będą dodawane kolejne komendy.

{% note %}Tak, wyzwalacze nieco duplikują to, na co pozwalają atrybuty z Popover API (`[popovertarget]` i `[popovertargetaction]`). Osobiście raczej będę używał tylko wyzwalaczy, żeby niepotrzebnie nie wprowadzać zamieszania w kodzie.{% endnote %}

## Niestandardowe komendy

Jest także możliwość definiowania swoich komend:

```html
<p>
	<button command="--add-filter" commandfor="logo">Dodaj filtr</button>
</p>
<p>
	<img id="logo" src="./logo.svg" alt="">
</p>
```

Dodaliśmy do przycisku komendę `--add-filter`. Tak jak w przypadku [zmiennych w CSS-ie](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties), tutaj też nazwa musi się zaczynać od dwóch myślników (`--`). Gdy kliknie się taki przycisk, na elemencie wskazanym przez atrybut `[commandfor]` zostanie wywołane [zdarzenie `command`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/command_event). Można je obsłużyć w JS-ie:

```javascript
document.querySelector( '#logo' ).addEventListener( 'command', ( evt ) => { // 1
	if ( evt.command === '--add-filter' ) { // 2
		evt.target.style.filter = 'blur( 5px )'; // 3
	}
} );
```

Do elementu `#logo` [przypinamy nasłuchiwacz zdarzenia](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) `command` (1). Następnie sprawdzamy, jaka komenda została wywołana przy pomocy [własności `command`](https://developer.mozilla.org/en-US/docs/Web/API/CommandEvent/command) zdarzenia (2). Jeśli to nasza komenda, dodajemy [filtr rozmycia](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/filter-function/blur) do elementu (3).

Efekt końcowy wygląda tak:

{% include 'embed' src="https://codepen.io/Comandeer/pen/WbwaLBg" %}

{% note %}Dla wbudowanych komend zdarzenie `command` również się odpali.{% endnote %}

I to w sumie tyle! Małe, przyjemne API, pozwalające się pozbyć kolejnego fragmentu JS-a. Jedynym minusem jest [niepełne wsparcie przeglądarek](https://caniuse.com/wf-invoker-commands). Ale gdy tylko Safari nadgoni, raz na zawsze pozbędę się tych wszystkich [`showModal()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal) z mojego kodu JS!
