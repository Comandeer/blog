---
layout: post
title:  "Potrzebujemy zachowań, nie dziedziczenia!"
author: Comandeer
date:   2017-04-09 20:00:00 +0100
categories: html-css javascript daj-sie-poznac-2017
comments: true
---

Choć tydzień temu [obwieściłem śmierć Web Components](https://comandeer.github.io/blog/html-css/javascript/daj-sie-poznac-2017/2017/04/02/web-components-koszmar-minionego-lata.html), nie byłbym sobą, gdybym nie usiadł na chwilę i nie zaczął myśleć, czemu pewne rzeczy nie działały tak jak powinny i co się schrzaniło. Najbardziej interesowała mnie [kwestia owego nieszczęsnego atrybutu `[is]`](https://github.com/w3c/webcomponents/issues/509), o który toczone są zażarte boje. I wówczas zrozumiałem, że W3C po prostu źle podeszło do tematu.

### OOP a DOM

Jeśli coś się nazywa Obiektowym Modelem Dokumentu, to jakbyśmy nie próbowali nagiąć faktów, nie uciekniemy od prostego stwierdzenia, że mimo wszystko to część starego i dobrego OOP (DFM – Document Functional Object; rzucam Wam wyzwanie, wielbiciele FP!). Z tego też powodu Web Components (WC) również, chcąc nie chcąc, w tę metodologię wpisywać się muszą – ot, choćby dla starej, poczciwej zasady zachowania konsekwencji  i spójności.

Najbardziej ucierpiały na tym Custom Elements (CE), które są niczym innym jak klasami rozszerzającymi natywny DOM-owy konstruktor `HTMLElement`. Jeśli tego podstawowego warunku nie spełnimy, przeglądarka się zbuntuje przy próbie stworzenia takiego elementu:

```javascript
customElements.define( 'wtf-w3c', class {} );
document.createElement( 'wtf-w3c' ); // Uncaught TypeError: Failed to construct 'CustomElement': The result must implement HTMLElement interface

customElements.define( 'rly-wtf-w3c', class extends HTMLElement {} );

document.createElement( 'rly-wtf-w3c' ); // Totally fine!
```

Skoro sprawę postawiono tak jasno, oczywiste jest, że wszystko, co kręci się wokół WC, będzie w większym lub mniejszym stopniu związane z obiektówką. Tak też się stało w przypadku `[is]`, które ma wprowadzać możliwość "rozszerzania natywnych elementów"… czyli mówiąc inaczej: _dziedziczenia_ po nich.

### "Po co mam dziedziczyć po przycisku?!!!"

To pytanie najlepiej oddaje bezsensowność takiego podejścia. No bo pomyślmy: czy kiedykolwiek przy tworzeniu aplikacji stwierdziliśmy, że jakiś przycisk powinien odziedziczyć po innym? Tak fantazyjnego podejścia nie ma nawet w BEM, gdzie zamiast dziedziczyć _modyfikujemy_:

```html
<button class="button">Jestem przyciskiem!</button>
<button class="button button_big">Jestem DUŻYM przyciskiem!</button>
```

W przypadku CE natomiast duży przycisk jest klasą dziedziczącą po wbudowanej klasie przycisku:

```html
<script>customElements.define( 'big-button', class extends HTMLButtonElement {}, { extends: 'button' } );</script>
<button is="big-button">Jestem DUŻYM przyciskiem!</button>
```

Nie oszukujmy się: nie wygląda to zbyt ładnie. Sam natomiast mechanizm dziedziczenia przywodzi mi na myśl prymitywne przykłady podstaw obiektowości w niemal każdej książce do Javy czy PHP (`class Dog extends Animal`…). Podczas gdy [React od dawna zachęca do kompozycji](https://facebook.github.io/react/docs/composition-vs-inheritance.html), oficjalny standard utknął na poziomie zabaw z obiektami.

### Kłopoty z dziedziczeniem

Wyobraźmy sobie, że mamy [przycisk otwierający menu](https://jsfiddle.net/2uhg0kgr/), który wykonaliśmy jako CE:

```html
<button is="nav-toggler" for="nav">Otwórz/zamknij menu</button>
```

Jego zadanie jest proste: otwierać i zamykać menu, przy okazji ustawiając odpowiednie atrybuty ARIA. Pytanie brzmi: czy myślimy o tym przycisku jako przycisku, który _jest_ przyciskiem przeznaczonym do otwierania i zamykania menu, czy może raczej o przycisku, który _służy_ do otwierania i zamykania menu? Mówiąc inaczej: czy to, co dany przycisk robi, sprawia, że jest to inny rodzaj przycisku – mimo że wygląda dokładnie tak samo? Specyfikacja CE twierdzi, że tak: `button` i `button[is=nav-toggler]` to dwa zupełnie różne elementy.

Jeśli jednak zmienimy `[is=nav-toggler]` na `[data-toggle=nav]`, dostaniemy [Bootstrapowy przycisk do otwierania… _czegokolwiek_](http://getbootstrap.com/javascript/#collapse). Ba, równie dobrze możemy to zrobić z linkiem, co sprawi, że mamy od razu wbudowany fallback (jeśli JS nie zadziała, link po prostu przeniesie nas do odpowiedniego fragmentu, który można pokazać choćby przy pomocy `:target` w CSS). W przypadku CE takiej możliwości nie ma: `nav-toggler` może być wyłącznie przyciskiem.

Inny przykład? `div[is=my-draggable]` będzie przesuwalnym `div`, ale już `dialog[is=my-draggable]` nie zadziała – wszystko trzeba będzie upychać w `div`…

To sprawia, że zaczynamy tworzyć sztuczne byty. Żeby uczynić konkretne elementy przesuwalnymi, będziemy tworzyć poszczególne klasy dla poszczególnych elementów, które będą powielać dokładnie tę samą funkcjonalność: `div[is="div-draggable"], p[is="p-draggable"], blockquote[is="blockquote-draggable"]` itd. Nie dość, że przeczy to starej dobrej zasadzie DRY, to od razu widzimy jak bezsensowne są reguły nazewnictwa CE w przypadku rozszerzania wbudowanych elementów (to, co jest sensownym sposobem nazywania nowych elementów – np. `dgui-slider` – w przypadku podczepiania pod istniejące elementy wygląda dziwnie). Dochodzi tutaj do niepotrzebnego parowania konkretnego zachowania z konkretnym elementem.

Co prawda w dalszym ciągu dyskusji [zaproponowano rozbicie elementów HTML na wiele małych interfejsów](https://github.com/w3c/webcomponents/issues/509#issuecomment-281059414), ale osobiście widzę w tym jeszcze większe zagrożenie niż prymitywne `[is]` i dziedziczenie całych elementów. Jeśli bowiem chcemy mieć przycisk, który otwiera menu, po prostu przypinamy event listener do przycisku i już. Nikt o zdrowych zmysłach nie będzie tworzył elementu `nav-toggler` składającego się z 30 interfejsów tylko po to, żeby zrobić przycisk otwierający menu. A jak już ktoś jest na tyle szalony, to i tak po drodze pewnie zapomni o dodaniu `HTMLActivateClickOnSpace` i tyle będzie z dostępnego przycisku.

### Potrzebujemy zachowań!

A teraz wyobraźmy sobie, gdyby można było zrobić coś takiego:

```html
<script>
	customElements.defineBehavior( 'dgui-draggable', class {
		/**
		 * @param {HTMLElement} element Element, do którego przyczepiono zachowanie.
		 * @param {Mixed[]} param Przekazane parametry. W przypadku przypięcia przez atrybut
		 * dostaniemy zawsze jeden String, w innym wypadku – dowolną liczbę parametrów
		 * o dowolnym typie.
		 */
		constructor( element, ...param ) {

		}
	} );

	customElements.define( 'dgui-floating', class extends HTMLElement {
		static get attachedBehaviors() {
			return [ 'dgui-draggable' ];
		}
	} );
</script>

<div dgui-draggable>Jestem przesuwalnym divem!</div>
<p dgui-draggable>A ja akapitem!</p>
<blockquote dgui-draggable="vertical">A mnie przesuniesz tylko w pionie!</blockquote>
<dialog>Też jestem przesuwalny!</dialog>
<script>
	document.querySelector( 'dialog' ).attachBehavior( 'dgui-draggable', 'para', 'metry' );
</script>
<dgui-floating>A ja mam po prostu wbudowane to zachowanie!</dgui-floating>
```

W WHATWG toczy się właśnie [dyskusja nad zezwoleniem na dowolne niestandardowe atrybuty](https://github.com/whatwg/html/issues/2271), która od razu spowodowała pojawienie się głosów, że ma to sens wyłącznie wtedy, gdy [będzie można obserwować cykl życia atrybutów](https://github.com/whatwg/html/issues/2271#issuecomment-273420086). W pełni popieram! Dzięki oddzieleniu zachowań od konkretnych elementów i przeniesieniu ich na poziom atrybutów jesteśmy w stanie przy pomocy jednego i tego samego kodu obsłużyć każdy element HTML. Nie myślimy już sztucznie stworzonymi relacjami pomiędzy poszczególnymi elementami na stronie (czy ten przycisk jest przyciskiem, czy może _wyspecjalizowanym_ przyciskiem?), ale zachowaniami – skupiamy się na tym, _co_ dany element robi, a nie _czym_ dany element jest. Prosto, skutecznie, elegancko.

To co, piszemy polyfill i do W3C?

