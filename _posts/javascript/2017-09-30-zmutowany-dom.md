---
layout: post
title:  "Zmutowany DOM"
author: Comandeer
date:   2017-09-30 23:55:00 +0200
categories: javascript
comments: true
permalink: /zmutowany-dom.html
redirect_from:
    - /javascript/2017/09/30/zmutowany-dom.html
---

DOM jest jak żywy organizm. A każdy żywy organizm umie kilka podstawowych czynności, wśród których znajduje się… mutowanie!

## Mutacje – co to?

Mówiąc najprościej: mutacja to każda zmiana w drzewie DOM. Mutacją jest pojawienie się nowego elementu, zmiana atrybutu czy usunięcie elementu. Zmiany te możemy obserwować ręcznie przy pomocy inspektora elementów w każdej nowoczesnej przeglądarce. Wystarczy znaleźć interesujący nas element, kliknąć go prawym przyciskiem myszy i z menu kontekstowego wybrać "Zbadaj element". W Chrome wszystkie zmiany, jakie zachodzą w danym elemencie, są pokazywane przy pomocy "mignięcia" fioletowego koloru na zmienionym elemencie. Widać to ładnie zwłaszcza w przypadku animacji, które nieustannie zmieniają style danego elementu.

## Obserwator

Niemniej ręczne obserwowanie mutacji nie jest wygodne, a przede wszystkim – nie ma żadnego zastosowania w skryptowaniu strony. Na szczęście istnieje sposób, by to zautomatyzować! Stworzono [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver), dzięki któremu możemy obserwować zmiany na stronie. Wystarczy wybrać element, pod który chcemy tego typu obserwatora przyczepić, wskazać interesujące nas zmiany i… czekać, aż skrypt je wykryje!

Można na przykład stworzyć obserwatora, który wykryje zmianę zawartości pola tekstowego stworzonego przy pomocy atrybutu `[contenteditable]`:

<iframe width="100%" height="300" src="//jsfiddle.net/Comandeer/ju26vyy0/embedded/result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

```html
<style>
[contenteditable] {
	border: 1px #000 solid;
}
</style>
<div contenteditable="true">Type here</div>
<script>
	const observer = new MutationObserver( function( mutations ) {
	mutations.forEach( ( mutation ) => {
		console.log( mutation )
	} );
} );

observer.observe( document.querySelector( '[contenteditable]' ), {
	subtree: true,
	characterData: true
} );
</script>
```

Jeśli otworzymy konsolę, widać wyraźnie, że każda zmiana zawartości pola jest odnotowywana w konsoli. Warto tutaj dodać, że standardowym sposobem obserwacji zmian zawartości pola jest [zdarzenie `input`](https://developer.mozilla.org/en-US/docs/Web/Events/input), które daje niemal identyczne rezultaty, jak nasz obserwator.

Przyjrzyjmy się naszemu obserwatorowi. Widać, że jego kod składa się z dwóch części: wywołania konstruktora oraz wywołania metody `observe`.

Konstruktorowi jako parametr przekazujemy funkcję, która jest odpalana w chwili, gdy dojdzie do jakichkolwiek mutacji. Z racji tego, że obserwator jest asynchroniczny, może się zdarzyć, że pojawi się wiele mutacji zanim zostanie on wywołany (przeglądarki mogą dodatkowo opóźniać wywołanie obserwatora, jeśli stwierdzą, że będzie to dobre dla wydajności). Stąd też mutacje są tablicą i dopiero dobranie się do konkretnych mutacji (w naszym przypadku przy pomocy pętli `forEach`) da nam szczegółowe informacje o zmianach.

Metoda `observe` z kolei przyjmuje dwa parametry: element, którego mutacje chcemy obserwować, oraz obiekt określający, jakie mutacje nas interesują. W naszym wypadku wskazaliśmy na `characterData`, a zatem zmiany w zawartości tekstowej. Dodatkowo musieliśmy dodać także `subtree`, oznaczające, że interesują nas też zmiany dla wszystkich węzłów potomnych. Gdybyśmy tego nie określili, obserwator nie wykryłby żadnych zmian.

Dzieje się tak dlatego, że w DOM tekst również jest węzłem DOM – podobnie jak elementy. Gdy w edytowalnym `div`ie pojawia się jakakolwiek treść, w rzeczywistości jest ona umieszczona właśnie w węźle typu `text`:

```
div[contenteditable]
|
|
|--- #text(Type here)
```

Obserwator domyślnie jest bardzo krótkowzroczny i widzi zmiany, które zachodzą wyłącznie w węźle, który ma obserwować. Z tej też przyczyny trzeba go poinformować o tym, że interesują nas też zmiany we wszystkich potomkach.

Innym przykładem, w którym obserwator może się przydać, jest potrzeba wykrycia momentu, w którym do dokumentu zostanie dodany nowy element.

## Obserwator a pola formularzy

Jak już wspominałem, obserwator może wykrywać zmiany w atrybutach elementów:

<iframe width="100%" height="300" src="//jsfiddle.net/Comandeer/bp49cmkp/embedded/result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

```html
<input disabled>
<button>Włącz/wyłącz pole</button>
<script>
const input = document.querySelector( 'input' );
const observer = new MutationObserver( function( mutations ) {
	mutations.forEach( ( mutation ) => {
		console.log( mutation );
	} );
} );

observer.observe( input, {
	attributes: true
} );

document.querySelector( 'button' ).addEventListener( 'click', () => {
	input.disabled = !input.disabled;
} );
</script>
```

Jak widać, mimo że obserwator obserwuje atrybuty (a zatem elementy kodu HTML), zmiana wartości własności elementu DOM zostaje wyświetlona w konsoli. Dzieje się tak dlatego, że większość własności DOM jest przepisywana bezpośrednio na atrybuty, tzn. zmiana własności `disabled` pola formularza doda lub usunie atrybut `[disabled]` z kodu HTML (można to sprawdzić w inspektorze elementów).

Niemniej od samego początku istnienia pól formularzy istnieje też błąd w specyfikacji HTML, który sprawia, że nie można obserwować w taki sposób zmian zawartości pól formularza. Atrybut `[value]` pola formularza bowiem nie odzwierciedla aktualnej zawartości pola (własność `value`), lecz _domyślną_ wartość pola (czyli tę, którą pole będzie miało po wyrenderowaniu danego kodu HTML, bez interakcji ze strony użytkownika; wartość tą przechowuje własność `defaultValue`). Nie można tego zmienić, gdyż zepsułoby to za dużo stron. Sprawia to jednak, że nie da się obserwować przy pomocy `MutationObserver` zmian, jakie zachodzą w wartości pola formularza:

<iframe width="100%" height="300" src="//jsfiddle.net/Comandeer/nu3avaws/embedded/result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

```html
<input value="Domyślna wartość">
<button>Zmień domyślną wartość</button>
<script>
const input = document.querySelector( 'input' );
const observer = new MutationObserver( function( mutations ) {
	mutations.forEach( ( mutation ) => {
		console.log( mutation );
	} );
} );

observer.observe( input, {
	attributes: true
} );

document.querySelector( 'button' ).addEventListener( 'click', () => {
	input.defaultValue = Date.now();
} );
</script>
```

Ten przykład także pokazuje, że faktycznie – atrybut `[value]` nie odzwierciedla tego, co przechowuje własność `value`. Niemniej zmiana własności `defaultValue` zostaje w konsoli odnotowana (bo zmienia równocześnie atrybut `[value]` w kodzie HTML). Dodatkowo, jeśli przed naciśnięciem przycisku wpiszemy cokolwiek do pola, można zauważyć, że zmiana atrybutu `[value]` nie wpływa w żaden sposób na zawartość pola.

---

Jak widać, `MutationObserver` to potężna zabawka, która umożliwia wykrywanie zmian w DOM strony, co otwiera sporo możliwości do zabawy i eksperymentowania. Jak można to wykorzystać w praktyce, o tym w następnym wpisie.
