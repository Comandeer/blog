---
layout: post
title:  "Inkunabuły mądrości"
description: "Poprawiłem bloczki kodu!"
author: Comandeer
date: 2025-12-21T00:00:00+0100
project: blog
tags:
    - adwent-2025
    - html-css
    - javascript
comments: true
permalink: /inkunabuly-madrosci.html
---

Po odświeżeniu dygresji przyszedł czas na kolejny częsty element mojego bloga: bloczki z kodem!<!--more-->

## Stare bloczki

Stare bloczki… były:

{% figure "../../../images/inkunabuly-madrosci/stary-bloczek.png" "Bloczek kodu CSS z ciemnego motywu bloga, otoczony białym obramowaniem." "Przykład bloczka kodu z wpisu [Frywolne marginalia](https://blog.comandeer.pl/frywolne-marginalia)" %}

Co prawda spełniały swoje zadanie, miały nawet dobre kolorowanie składni (dzięki [Shiki](https://shiki.matsu.io/)), ale brakowało w nich choćby informacji o języku programowania. Dlatego też postanowiłem je nieco odświeżyc.

## Odświeżone bloczki

Nowe bloczki wyglądają następująco:

{% figure "../../../images/inkunabuly-madrosci/nowy-bloczek.png" "Bloczek kodu CSS z ciemnego motywu bloga, nad którym znajduje się pasek z nazwą języka programowania oraz przyciskiem &quot;Kopiuj&quot;" "Przykład odświezonego bloczka kodu z wpisu [Frywolne marginalia](https://blog.comandeer.pl/frywolne-marginalia)" %}

Tak naprawdę zmiany nie są szczególnie wielkie – pojawiła się jedynie nazwa języka oraz przycisk do skopiowania kodu do schowka.

### Nowy HTML

Od strony HTML-a cały bloczek kodu trafił do elementu `figure`:

```html
<figure class="code" typeof="SoftwareSourceCode">
	<figcaption class="code__caption"> <!-- 3 -->
		<span class="code__title" property="programmingLanguage">CSS</span> <!-- 1 -->
		<button class="code__copy">Kopiuj</button> <!-- 2 -->
	</figcaption>
	<div class="code__code" translate="no" property="text"> <!-- 4 -->
		<pre><code>[…]</code></pre> <!-- 5 -->
	</div>
</figure>

```

Podpis z nazwą języka (1) i przyciskiem (2) został umieszczony w `figcaption` (3), natomiast sam kod w dodatkowym `div`ie z [atrybutem `[translate=no]`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/translate) (4). Dzięki temu Google Translate i podobne usługi nie będą próbowały tłumaczyć kodu na inne języki. Dodatkowo zastosowałem też [RDFa](https://blog.comandeer.pl/o-semantyce-slow-kilka#rozszerzanie-semantyki), żeby oznaczyć całość jako kod w języku programowania. Sam kod (5) pozostał bez zmian – dalej jest kolorowany przez Shiki.

### Nowy JS

Przycisk do kopiowania kodu potrzebuje obsługi w JS-ie. Dodałem więc taką do swojego pliku JS:

```javascript
document.addEventListener( 'click', async ( evt ) => { // 1
	const isCopyButton = evt.target.closest( '.code__copy' ); // 2

	if ( !isCopyButton ) {
		return;
	}

	const closestCode = evt.target.closest( '.code' ).querySelector( '.code__code' ); // 3

	await navigator.clipboard.writeText( closestCode.innerText ); // 4
} );
```

 Stosuje tutaj technikę [<i lang="en">event delegation</i> (delegacji zdarzeń)](https://javascript.info/event-delegation) (1). Dzięki temu mogę przypiąć tylko jeden nasłuchiwacz i obsłużyć wszystkie przyciski "Kopiuj", zamiast musieć się przypiąć do każdego z nich osobno. Niemniej ta technika sprawia, ze muszę sprawdzić, czy na pewno został kliknięty przycisk "Kopiuj". Robię to przy pomocy wyszukania go przez [metodę `#closest()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest) (2). Metoda ta zwróci najbliższy element o klasie `.code__copy`. W przypadku, gdy ktoś kliknie przycisk, będzie to on sam. Metoda `#closest()` zabezpiecza nas przed przypadkiem, gdybyśmy dodali kiedyś ikonkę do przycisku i ktoś kliknął w nią – wówczas zamiast przycisku mielibyśmy w `evt.target` np. element `svg`. Jak już ustalimy, że został naciśnięty odpowiedni przycisk, wyszukujemy najbliższy bloczek kodu (3). Następnie wywołujemy [metodę `Clipboard#writeText()`](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText), do której przekazujemy tekstową zawartość bloczka (4). Jeśli osoba naciskająca przycisk wyrazi zgodę na zapisanie danych do schowka, kod zostanie skopiowany.

### Nowy backend

Nowe bloczki kodu renderowane są przy pomocy autorskiego pluginu do [MarkdownIt](https://www.npmjs.com/package/markdown-it) (biblioteki renderującej Markdowna w Eleventy). Jego kod prezentuje się następująco:

```javascript
function markdownItCodeBlock( markdownIt ) {
	const originalFenceRule = markdownIt.renderer.rules.fence; // 1

	markdownIt.renderer.rules.fence = ( tokens, idx, options, env, slf ) => {
		const token = tokens[ idx ];
		const lang = token.info ? token.info.trim() : ''; // 3
		const renderedCodeBlock = originalFenceRule( tokens, idx, options, env, slf ); // 4

		/ * 5 */ return `<figure class="code" typeof="SoftwareSourceCode">
			<figcaption class="code__caption">
				<span class="code__title" property="programmingLanguage">${ langs[ lang ] ?? '' }</span>
				<button class="code__copy">Kopiuj</button>
			</figcaption>
			<div class="code__code" translate="no" property="text">
				${ renderedCodeBlock }
			</div>
		</figure>`;
	};
}
```

Na początku zapisujemy sobie do zmiennej aktualną funkcję do renderowania bloczków kodu (1). W przypadku MarkdownIt funkcja ta znajduje się w [regułach renderera](https://markdown-it.github.io/markdown-it/#Renderer.prototype.rules). Następnie nadpisujemy tę regułę własną (2). Wyciągamy z kodu Markdown nazwę języka programowania (3), a następnie wywołujemy oryginalną regułę renderującą bloczki kodu (4). Dzięki temu dostajemy kod ładnie pokolorowany przez Shiki. Na koniec  tworzymy nasz własny kod HTML bloczka (5), do którego wsadzamy pokolorowany kod i zwracamy całość z funkcji.

Teraz zostaje tylko dodać ten plugin do [naszej zmodyfikowanej wersji MarkdownIt](https://github.com/Comandeer/blog/blob/983e2db060f90d4bcfc923187c2147d3c937e12d/plugins/markdownIt.js#L113). Można to zrobić przy pomocy [metody `#use()`](https://markdown-it.github.io/markdown-it/#MarkdownIt.use).

I to tyle! Bloczki kodu na blogu są od teraz _nieco_ lepsze.
