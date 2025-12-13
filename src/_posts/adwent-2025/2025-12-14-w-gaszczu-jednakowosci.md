---
layout: post
title:  "W gąszczu jednakowości"
description: "Czasami Custom Elements pozwalają zdecydowanie poprawić czytelność kodu."
author: Comandeer
date: 2025-12-14T00:00:00+0100
tags:
    - adwent-2025
    - html-css
comments: true
permalink: /w-gaszczu-jednakowosci.html
---

Raczej większość z nas wie, że [divitis](https://en.wiktionary.org/wiki/divitis) to jedna z plag Sieci i nie warto przyczyniać się do jego rozprzestrzeniania się. Warto natomiast dbać o semantykę HTML-a i dobierać elementy do konkretnego zastosowania. Chcemy nawigacji? Mamy [`nav`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/nav). Potrzebujemy listy? Możemy wybrać spomiędzy [`ol`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ol), [`ul`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dl) czy nawet [`dl`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/nav). W zdecydowanej większości przypadków da się dobrać lepszy element niż [`div`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/div).

Ale czasami się nie da. Czasami po prostu musimy dodać element, żeby coś ostylować. Ba, czasami w ekstremalnych przypadkach trafimy w _gąszcz_ `div`ów:

```html
<div class="first">
	<div class="second">
		<div class="third">
			<div class="fourth">
				<div class="fifth">
					<div class="sixth">POMOCYYYYYY!!!!!</div>
				</div>
			</div>
		</div>
	</div>
</div>
```

I mimo usilnych starań, żaden inny element HTML nie pasuje. Jak się odnaleźć w tej dżungli?!<!--more-->

## Custom Elements na ratunek

Wraz z Web Components do HTML-a trafiły [<i lang="en">Custom Elements</i> (Niestandardowe Elementy)](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements). Na tym blogu również przewinęły się już kilka razy, m.in. przy okazji [jednoplikowych komponentów](https://blog.comandeer.pl/jednoplikowe-komponenty). W dużym skrócie – dzięki Custom Elements możemy [tworzyć nasze własne elementy](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements):

```html
<fancy-text>Text</fancy-text> <!-- 1 -->
<script>
class FancyText extends HTMLElement { // 2
	connectedCallback() { // 3
		console.log( 'Element has been added to the DOM', this.innerText ); // 4
	}
}

customElements.define( 'fancy-text', FancyText ); // 5
</script>
```

Dodaliśmy nowy element, `fancy-text` (1). Każdy niestandardowy element musi mieć `-` w nazwie, a sama nazwa nie może zaczynać się od `-` lub cyfry. Następnie tworzymy klasę `FancyText`, która dziedziczy po [`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) (2). To kolejny wymóg takich elementów: muszą dziedziczyć po `HTMLElement` (czyli "klasie" reprezentującej generyczny element HTML w DOM). Klasa `FancyText` ma [metodę `#connectedCallback()`](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks) (3), która odpala się w momencie, gdy element zostaje dodany do DOM-u. W niej wyświetlamy w konsoli informację, że element został dodany do DOM-u wraz z jego zawartością tekstową (4). Na samym końcu dodajemy element do rejestru Custom Elements przy pomocy [metody `customElements#define()`](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define) (5). Dzięki temu przeglądarka wie, że gdy napotka element `fancy-text`, ma go stworzyć przy pomocy klasy `FancyText`.

Niestandardowe elementy są domyślnie przezroczyste semantycznie – trzeba im ręcznie nadać odpowiednią [rolę](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles). W swojej czystej postaci są więc równoważne `div`om. Co więcej, przeglądarka nie wymaga, żeby tego typu elementy definiować przy pomocy `customElements#define()`. Wówczas będą traktowane jako tzw. niezdefiniowane elementy. Poza tym, że mają fajną nazwę, zachowują się jak całkowicie zwyczajne elementy HTML.

Biorąc to wszystko pod uwagę, nasz koszmarny gąszcz można zapisać następująco:

```html
<first->
	<second->
		<third->
			<fourth->
				<fifth->
					<sixth->Od razu lepiej</sixth->
				</fifth->
			</fourth->
		</third->
	</second->
</first->
```

Mimo że semantycznie nic się nie zmieniło (zarówno `div`y, jak i niestandardowe elementy bez roli są po prostu kontenerami na treść), sam kod stał się o wiele czytelniejszy.

Jeszcze wypada dodać trochę CSS-a:

```css
:not(:defined) { /* 1 */
	display: block; /* 2 */
}
```

Domyślnie wszystkie Custom Elements są wyświetlane liniowo – a więc inaczej niż `div`y, które są wyświetlane blokowo. Dlatego też przy pomocy pseudoklas [`:not()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:not) i [`:defined`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:defined) łapiemy wszystkie niezdefiniowane elementy (1) i nadajemy im odpowiednią wartość [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/display) (2).

Tak oto możemy raz na zawsze pozbyć się `div`ów!
