---
layout: post
title:  "Deklaratywny Shadow DOM"
description: "Eksperyment polegający na dodaniu deklaratywnego Shadom DOM-u."
author: Comandeer
date: 2017-10-31T23:25:00+0100
tags:
    - javascript
    - eksperymenty
comments: true
permalink: /deklaratywny-shadow-dom.html
redirect_from:
    - /javascript/2017/10/31/deklaratywny-shadow-dom.html
---

W swoim [poprzednim wpisie](https://blog.comandeer.pl/javascript/2017/09/30/zmutowany-dom.html) rozpisałem się co nieco o mutowaniu DOM-u i obiecałem, że następnym razem pokażę sensowny przykład jego zastosowania. Ten czas właśnie nadszedł! Pokażę, jak przy pomocy mutacji stworzyć prototyp deklaratywnego Shadow DOM.<!--more-->

<small>Wypada zaznaczyć, że treści zawarte w tym artykule działają tylko w [przeglądarkach obsługujących Shadow DOM](http://caniuse.com/#feat=shadowdomv1). W chwili pisania jest to tylko Chrome i Safari.</small>

## Shadow DOM – co to takiego?

O Shadow DOM wspominałem w [moim wpisie o problemach Web Components](https://blog.comandeer.pl/html-css/javascript/daj-sie-poznac-2017/2017/04/02/web-components-koszmar-minionego-lata.html). Niemniej pominąłem bardzo istotną kwestię: Shadow DOM działa tylko i wyłącznie z poziomu JS. By dodać go do elementu, trzeba zastosować metodę `attachShadow`:

```html
<div></div>
<script>
const div = document.querySelector( 'div' );
const shadow = div.attachShadow( { mode: 'open' } );
shadow.innerHTML = '<p>Some HTML here</p>';
</script>
```

W ten sposób stworzyliśmy element `div`, którego wnętrzności są ukryte.

{% figure "../../images/div-sd.png" "Shadow DOM widziany z poziomu dev tools Chrome'a." %}

Nie będę w tym miejscu rozpisywał się o szczegółach tego kodu. Ważne jedynie, by pamiętać, że `attachShadow` zawsze musi przyjąć jako parametr obiekt z własnością `mode`, która może przyjąć wartość `'open'` lub `'closed'`. Natomiast faktyczny Shadow DOM (czyli to, co zwróci nam `attachShadow`) pozwala nam wyszukiwać elementy przez `querySelector*`, dodawać i usuwać nowe elementy przez tradycyjne metody DOM-we oraz dodatkowo ustawiać treść przy pomocy `innerHTML`.

Problem, jaki powstaje przy okazji korzystania z Shadow DOM, jest taki, że staje się on zależny od JS i DOM, co pociąga za sobą 3 poważne konsekwencje:

*   Shadow DOM nie zadziała, gdy [nie zadziała JS](https://kryogenix.org/code/browser/everyonehasjs.html) – co w dobie niestabilnego mobilnego Internetu wcale nie jest takie niemożliwe.
*   Shadow DOM nie lubi się z Server Side Rendering – nie da się wygenerować odpowiedniego kodu przy pomocy szablonów na serwerze, bo bez odwołania się do `attachShadow` i tak nie dostaniemy tego, co chcemy.
*   Fakt, że treść jest zaszyta w kodzie JS, sprawia, że SEO również nie do końca jest zadowolone.

Te problemy zostały zauważone i powstał pomysł, by stworzyć [deklaratywny Shadow DOM](https://github.com/whatwg/dom/issues/510). W dużym skrócie pomysł polega na tym, by dodać do HTML nowy znacznik, najprawdopodobniej nazwany `shadowroot`, który byłby zamieniany na Shadow DOM swojego rodzica. Tym sposobem Shadow DOM działałby bez JS-a, problem z szablonami po stronie SSR zostałby rozwiązany, a i roboty wyszukiwarek, które niekoniecznie radzą sobie z JS, miałyby dostęp do pełnej treści poszczególnych elementów.

## Implementacja

Zróbmy zatem prymitywny polyfill dla elementu `shadowroot`. Będzie on działał w taki sposób, że każdy ten element podmieni na Shadow DOM odpowiedniego elementu na stronie. Jeśli JS nie zadziała, całość dalej będzie działać. Różnica będzie taka, że wówczas zamiast Shadow DOM, treść pozostanie w normalnym DOM w `shadowroot`, który przeglądarka potraktuje jak nieznany element i zignoruje.

Na początku zajmijmy się przypadkiem, w którym nasz skrypt będzie podmieniał zawartość już istniejących elementów na stronie:

```html
<div>
	<shadowroot>
		<p>Testowa treść</p>
	</shadowroot>
</div>

<div>
	<shadowroot>
		<p>Inna testowa treść</p>
	</shadowroot>
</div>
<script>
( function() {
	const shadowRoots = document.querySelectorAll( 'shadowroot' ); // 1

	shadowRoots.forEach( ( shadowRoot ) => {
		const parent = shadowRoot.parentNode; // 2
		const shadow = parent.attachShadow( { mode: 'open' } ); // 3

		shadow.innerHTML = shadowRoot.innerHTML; // 4

		shadowRoot.remove(); // 5
	} );
}() );
</script>
```

Kod jest dość prosty. Na sam początek pobieramy wszystkie elementy `shadowroot` (1). Gdy już je mamy, to robimy pętlę po wszystkich. Dla każdego `shadowroot` pobieramy jego bezpośredniego rodzica – czyli element, któremu chcemy podczepić Shadow DOM. Temu elementowi tworzymy Shadow DOM (3) i kopiujemy zawartość `shadowroot` (4). Na sam koniec usuwamy element `shadowroot` (5). Gdybyśmy tego nie zrobili, mielibyśmy zduplikowaną treść. Poza tym ten element po wykonaniu swojego działania traci sens.

Podstawowa wersja działa. Niemniej teraz zrobi się trudniej: chcemy obsługiwać także dynamicznie dodawane elementy z `shadowroot`:

```html
<button>Dodaj element</button>
<script>
	( function() {
		const button = document.querySelector( 'button' );

		button.addEventListener( 'click', () => {
			const div = document.createElement( 'div' );

			div.innerHTML = `<shadowroot>
				<p>Testowy element</p>
			</shadowroot>`;

			button.parentNode.insertBefore( div, button );
		} );
	}() );
</script>
```

Oczywiście można zrobić to ręcznie i dodać do obsługi kliku nasz wcześniejszy kod. Niemniej nietrudno wyobrazić sobie, że takie elementy mogą pochodzić z różnych miejsc w kodzie (czy nawet z żądań ajaksowych) i dodawanie wszędzie tego samego kodu byłoby nieoptymalne. Stąd lepiej stworzyć rozwiązanie, które z jednego miejsca pozwoli nam obsłużyć wszystkie nowo dodawane elementy. I właśnie tutaj wykorzystamy `MutationObserver`!

```html
<div>
	<shadowroot>
		<p>Testowa treść</p>
	</shadowroot>
</div>

<div>
	<shadowroot>
		<p>Inna testowa treść</p>
	</shadowroot>
</div>

<button>Dodaj element</button>

<script>
	( function() {
		function upcastShadows() { // 1
			const shadowRoots = document.querySelectorAll( 'shadowroot' );

			shadowRoots.forEach( ( shadowRoot ) => {
				const parent = shadowRoot.parentNode;
				const shadow = parent.attachShadow( { mode: 'open' } );

				shadow.innerHTML = shadowRoot.innerHTML;

				shadowRoot.remove();
			} );
		}

		upcastShadows(); // 2

		const observer = new MutationObserver( function() {
			upcastShadows(); // 6
		} );

		observer.observe( document.body, { // 3
			childList: true, // 4
			subtree: true // 5
		} );

		const button = document.querySelector( 'button' );

		button.addEventListener( 'click', () => {
			const div = document.createElement( 'div' );

			div.innerHTML = `<shadowroot>
				<p>Testowy element</p>
			</shadowroot>`;

			button.parentNode.insertBefore( div, button );
		} );
	}() );
</script>
```

Nasz poprzedni kod do obsługi `shadowroot` awansował na funkcję `upcastShadows` (1). Jest ona wywoływana od razu (2) – tym sposobem obsłużymy wszystkie już istniejące na stronie elementy `shadowroot`. Niemniej równocześnie przypinamy obserwator na `document.body` (3). Przypinamy go w tym miejscu, bo chcemy reagować na elementy pojawiające się w obrębie całej strony. Mutacja, jaka nas interesuje, to `childList` (4), czyli dodanie lub usunięcie dziecka obserwowanego elementu. Dorzucenie `subtree` (5) pokryje też wszelkie przypadki, gdy ktoś wstawi element niebezpośrednio do `body` (np. zagnieżdżone komponenty). Z racji tego, że nie obchodzi nas dokładnie, jakie zmiany zaszły, a po prostu chcemy zamieniać `shadowroot` na Shadow DOM, od razu wywołujemy `upcastShadows`, nie sprawdzając nawet, co tak naprawdę się stało (6). I tyle – w ten sposób `MutationObserver` pozwala nam reagować na jakiekolwiek pojawienie się elementu `shadowroot` na stronie.

## Zasoby zewnętrzne, czyli niesforny edge-case

Zastanówmy się, co się stanie, gdy zrobimy tak:

```html
<div>
	<shadowroot>
		<img src="https://www.comandeer.pl/images/custom/comandeer.jpg" alt="Comandeer" onload="console.log( 'załadowano' );">
	</shadowroot>
</div>
```

Dodałem `[onload]` w tak brzydki sposób dla uproszczenia kodu – w normalnym świecie warto go dodać przez JS.

Powyższy kod spowoduje wyświetlenie tekstu "załadowano" w konsoli dwukrotnie. Jest to spowodowane prostym faktem: przeglądarka najpierw doda do DOM element `shadowroot`, co spowoduje pierwsze wczytanie obrazka. Następne usunięcie `shadowroot` i zamiana go na Shadow DOM spowoduje tak naprawdę stworzenie drugiego, identycznego obrazka (bo kopiujemy wartość `innerHTML`). Stąd nasze rozwiązanie będzie wczytywać zasoby zewnętrzne dwukrotnie. Słabo.

Najprostszym rozwiązaniem jest zamiana `shadowroot` na element `template` z jakimś dodatkowym atrybutem. Element `template` bowiem jest "wyłączony". Dopiero, gdy jego zawartość jest dodana do innego elementu, zostaje uaktywniona:

```html
<div>
	<template shadowroot>
		<img src="https://www.comandeer.pl/images/custom/comandeer.jpg" alt="Comandeer" onload="console.log( 'załadowano' );">
	</template>
</div>

<script>
	( function() {
		function upcastShadows() {
			const shadowRoots = document.querySelectorAll( '[shadowroot]' ); // 1

			shadowRoots.forEach( ( shadowRoot ) => {
				const parent = shadowRoot.parentNode;
				const shadow = parent.attachShadow( { mode: 'open' } );

				shadow.appendChild( shadowRoot.content ); // 2

				shadowRoot.remove();
			} );
		}

		upcastShadows();
</script>
```

Tym razem obrazek wczytał się tylko raz – czyli dokładnie tak, jak chcieliśmy. No i zmieniły się na dobrą sprawę tylko 2 linijki kodu: selektor (1) oraz sposób dołączania treści do Shadow DOM (2). Niemniej `template` ma jedną, poważną wadę: nie zadziała bez JS. Tak, jak przeglądarka zignoruje `shadowroot` i po prostu wyświetli jego zawartość, tak `template` potraktuje jako szablon i go w ogóle nie wyświetli. Osobiście uważam to za krok w tył, dlatego też poszukałbym innego rozwiązania.

Takim rozwiązaniem jest przeniesienie wszystkich dzieci elementu `shadowroot` do `DocumentFragment` a następnie dodanie tego `DocumentFragment` do naszego Shadow DOM:

```html
<div>
	<shadowroot>
		<img src="https://www.comandeer.pl/images/custom/comandeer.jpg" alt="Comandeer" onload="console.log( 'załadowano' );">
	</shadowroot>
</div>

<script>
	( function() {
		function createDocumentFragment( element ) {
			const documentFragment = new DocumentFragment(); // 2
			const children = Array.from( element.children ); // 3

			children.forEach( ( child ) => {
				documentFragment.appendChild( child ); // 4
			} );

			return documentFragment; // 5
		}

		function upcastShadows() {
			const shadowRoots = document.querySelectorAll( 'shadowroot' );

			shadowRoots.forEach( ( shadowRoot ) => {
				const parent = shadowRoot.parentNode;
				const shadow = parent.attachShadow( { mode: 'open' } );

				shadow.appendChild( createDocumentFragment( shadowRoot ) ); // 1

				shadowRoot.remove();
			} );
		}

		upcastShadows();
	}() );
</script>
```

Jak widać teraz do Shadow DOM dodajemy dziecko stworzone przez funkcję `createDocumentFragment` (1). Funkcja ta bierze element i przerabia go na `DocumentFragment`. W tym celu najpierw ów `DocumentFragment` tworzy (2), następnie pobiera wszystkie dzieci elementu i tworzy z nich tablicę (3). Ten krok pozwala nam wygodniej operować na kolekcji elementów, np. korzystając z `Array.prototype.forEach`. Następnie każde dziecko `shadowroot` jest przenoszone do nowoutworzonego `DocumentFragment` (4), który na końcu zwracamy (5). Tym sposobem nasz obrazek wczyta się tylko raz, bo przez cały czas operujemy na tym samym elemencie.

## Całość rozwiązania

Ostatecznie całość kodu prezentuje się następująco:

{% include 'embed' src="https://jsfiddle.net/Comandeer/t2qyvz1z" %}

```html
<div>
	<shadowroot>
		<p>Testowa treść</p>
	</shadowroot>
</div>

<div>
	<shadowroot>
		<p>Inna testowa treść</p>
	</shadowroot>
</div>

<div>
	<shadowroot>
		<img src="https://www.comandeer.pl/images/custom/comandeer.jpg" alt="Comandeer" onload="console.log( 'załadowano' );">
	</shadowroot>
</div>


<button>Dodaj element</button>

<script>
	( function() {
		function createDocumentFragment( element ) {
			const documentFragment = new DocumentFragment(); // 2
			const children = Array.from( element.children ); // 3

			children.forEach( ( child ) => {
				documentFragment.appendChild( child ); // 4
			} );

			return documentFragment; // 5
		}

		function upcastShadows() {
			const shadowRoots = document.querySelectorAll( 'shadowroot' );

			shadowRoots.forEach( ( shadowRoot ) => {
				const parent = shadowRoot.parentNode;
				const shadow = parent.attachShadow( { mode: 'open' } );

				shadow.appendChild( createDocumentFragment( shadowRoot ) ); // 1

				shadowRoot.remove();
			} );
		}

		upcastShadows(); // 2

		const observer = new MutationObserver( function() {
			upcastShadows(); // 6
		} );

		observer.observe( document.body, { // 3
			childList: true, // 4
			subtree: true // 5
		} );

		const button = document.querySelector( 'button' );

		button.addEventListener( 'click', () => {
			const div = document.createElement( 'div' );

			div.innerHTML = `<shadowroot>
				<p>Testowy element</p>
			</shadowroot>`;

			button.parentNode.insertBefore( div, button );
		} );
	}() );
</script>
```

## Czemu nie Custom Element?

Zapewne co bardziej zainteresowani tematyką Web Components zapytają, czemu zastosowałem tutaj Mutation Observer a nie stworzyłem po prostu odpowiedniego Custom Element (np. `shadow-root`). Odpowiedź jest prosta: moje rozwiązanie próbuje być polyfillem dla opracowywanego w WHATWG deklaratywnego Shadow DOM. Stąd też nie mogłem zastosować Custom Element (przeglądarka nie pozwala rejestrować elementów bez myślnika w nazwie). Polyfill ma też taką przewagę, że w chwili gdy `shadowroot` zostanie zaimplementowany w przeglądarkach, wystarczy go wywalić i całość będzie wciąż działać tak samo.

Niemniej muszę przyznać uczciwie, że rozwiązanie tego problemu przy pomocy Custom Elementu byłoby o wiele bardziej eleganckie i prezentowałoby się tak:

{% include 'embed' src="https://jsfiddle.net/Comandeer/14h0qjtx" %}

```html
<div>
	<shadow-root>
		<p>Testowa treść</p>
	</shadow-root>
</div>

<div>
	<shadow-root>
		<p>Inna testowa treść</p>
	</shadow-root>
</div>

<div>
	<shadow-root>
		<img src="https://www.comandeer.pl/images/custom/comandeer.jpg" alt="Comandeer" onload="console.log( 'załadowano' );">
	</shadow-root>
</div>


<button>Dodaj element</button>

<script>
	( function() {
		class ShadowRoot extends HTMLElement {
			connectedCallback() {
				this._upcast();
			}

			_upcast() {
				const parent = this.parentNode;
				const shadow = parent.attachShadow( { mode: 'open' } );

				shadow.appendChild( this._createDocumentFragment( this ) );

				this.remove();
			}

			_createDocumentFragment() {
				const documentFragment = new DocumentFragment();
				const children = Array.from( this.children );

				children.forEach( ( child ) => {
					documentFragment.appendChild( child );
				} );

				return documentFragment;
			}
		}

		window.customElements.define( 'shadow-root', ShadowRoot );

		const button = document.querySelector( 'button' );

		button.addEventListener( 'click', () => {
			const div = document.createElement( 'div' );

			div.innerHTML = `<shadow-root>
				<p>Testowy element</p>
			</shadow-root>`;

			button.parentNode.insertBefore( div, button );
		} );
	}() );
</script>
```

Całość implementacji jest teraz zgrabnie zamknięta w klasie `ShadowRoot`, co dodatkowo pozwoli nam odchudzić kod (odpada iterowanie po poszczególnych elementach oraz cała obsługa obserwatora).

To tyle! Mam nadzieję, że ta krótka wycieczka w nieco bardziej sensowne rejony mutacji była choć ciut zajmująca.
