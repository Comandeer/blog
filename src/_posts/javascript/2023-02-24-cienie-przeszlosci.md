---
layout: post
title:  "Cienie przeszłości"
description: "O zaszłościach historycznych w atrybucie [onclick]."
author: Comandeer
date: 2023-02-24T23:22:00+0100
tags:
    - javascript
    - standardy-sieciowe
comments: true
permalink: /cienie-przeszlosci.html
---

Niektóre rzeczy w webdevie wydają się nie być przesadnie ekscytujące. No bo czymże może nas zaskoczyć atrybut `[onclick]`? Cóż, okazuje się, że _wieloma_ rzeczami.<!--more-->

## Problem

Wyobraźmy sobie prosty kod HTML + JS:

```html
<div id="notifications"> <!-- 1 -->
	<p>Jakieś powiadomienie</p>
</div>

<p>
	<button onclick="clear()">Usuń powiadomienia</button> <!-- 2 -->
</p>

<script>
	function clear() { // 3
		document.querySelector( '#notifications' ).innerHTML = '';
	}
</script>
```

{% include 'embed' src="https://codepen.io/Comandeer/pen/oNPzWEZ" %}

Mamy kontener z powiadomieniami (1), a pod spodem knefel, który ma je usuwać (2). Podczepiona jest do niego przy pomocy atrybutu `[onclick]` funkcja `clear()` (3), która ustawia własność `innerHTML` kontenera na pusty ciąg znaków. Ot, całkiem prosty kawałek kodu.

Tyle że nie działa. I, co gorsza, w konsoli nie ma absolutnie żadnego błędu. Co tu się zatem stanęło?

## Trochę historii

Zanim przeskoczę do mrocznych tajemnic `[onclick]`a, wypadałoby przypomnieć pewną antyczną JS-ową instrukcję – [`with()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/with). Służyła ona do tworzenia bloków kodu, które działały niejako "w kontekście" jakiegoś obiektu. Najprościej wyjaśnić to na przykładzie:

```javascript
const obj = { // 1
	a: 'test' // 2
};

with ( obj ) { // 3
	console.log( a ); // 'test
	console.log( obj.a === a ); // true
}
```

Tworzymy sobie obiekt `obj` (1), który ma jedną własność – `a` (2). Następnie tworzymy blok `with()` dla tego obiektu (3). Dzięki temu w środku tego bloku możemy odwoływać się do własności `obj` bez podawania nazwy obiektu. Innymi słowy, zamiast `obj.a` możemy napisać po prostu samo `a`.

Osobiście nie widzę w tym nic szczególnie przydatnego, a dodatkowo potrafi to wprowadzić niemały chaos w kodzie i trudne do wykrycia błędy:

```javascript
const obj = { // 1
	a: 'lol'
};
const a = 'SUPER IMPORTANT VARIABLE'; // 2

with ( obj ) { // 3
	console.log( a ); // 'lol
	console.log( obj.a === a ); // true
}
```

W tym przykładzie znowu mamy `obj` z jedną własnością `a` (1), ale mamy także zmienną `a` (2), która – na potrzeby budowania dramatyzmu – zawiera _niezwykle ważną_ informację. Tworzymy sobie blok `with()` dla obiektu `obj` (3) i… tracimy dostęp do zmiennej `a`. Własności `obj` skutecznie przesłaniają inne istniejące zmienne o nazwach takich samych jak własności obiektu `obj`. A że wszystko jest zgodnie z zasadami języka (ale niekoniecznie logiki), to przeglądarka/inne środowisko uruchomieniowe JS-a nie wyświetli nam żadnego przydatnego błędu.

Na całe szczęście [tryb ścisły nie pozwala używać `with()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#removal_of_the_with_statement), dzięki czemu – w modularnym świecie – instrukcja ta jest spotykana naprawdę rzadko.

{% note %}Tryb ścisły w świecie [ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) ma spore znaczenie, ponieważ kod JS wczytany jako moduł jest uruchamiany w trybie ścisłym.{% endnote %}

## Mroczny sekret `[onclick]`

Wróćmy zatem po tej historycznej dygresji do naszego `[onclick]`a – co dokładnie się dzieje w chwili naciśnięcia przycisku z problematycznego przykładu?

Otóż okazuje się, że istnieje [metoda `document.clear()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/clear), która… nic nie robi, ale też nie rzuca błędu. Ot, pozostałość po antycznych czasach, która nie została usunięta, by nie psuć Sieci. Jeśli nieco zmodyfikujemy kod, przekonamy się, że faktycznie, ta metoda jest odpalana po kliknięciu przycisku:

```html
<div id="notifications">
	<p>Jakieś powiadomienie</p>
</div>

<p>
	<button onclick="console.log( document.clear === clear );clear()">Usuń powiadomienia</button>
</p>

<script>
	function clear() {
		document.querySelector( '#notifications' ).innerHTML = '';
	}
</script>
```

{% include 'embed' src="https://codepen.io/Comandeer/pen/OJoRmQE" %}

Po kliknięciu przycisku, w konsoli pojawi się `true`. Czyli nasza funkcja `clear()` została nadpisana przez metodę `document`u o tej samej nazwie. Innymi słowy, kod wewnątrz `[onclick]`a jest  mniej więcej równoznaczny z poniższym:

```javascript
with ( document ) {
	clear();
}
```

## A co na to specka?

Nie byłbym sobą, gdybym nie poszperał w specyfikacji, żeby znaleźć wyjaśnienie dla tego zachowania. [Atrybuty HTML dla event listenerów](https://html.spec.whatwg.org/multipage/webappapis.html#event-handler-content-attributes) są opisane w [specyfikacji HTML](https://html.spec.whatwg.org/multipage/). Jest tam zamieszczony [sposób parsowania ich zawartości do faktycznego kodu JS](https://html.spec.whatwg.org/multipage/webappapis.html#getting-the-current-value-of-the-event-handler). Bez zbytniego zagłębiania się w szczegóły techniczne, jednym z etapów jest [ustalenie scope (zakresu)](https://html.spec.whatwg.org/multipage/webappapis.html#getting-the-current-value-of-the-event-handler:~:text=non%2Dlexical%2Dthis-,scope,-Let%20realm%20be). W tym celu wołana jest ["funkcja" `NewObjectEnvironment()` ze specyfikacji ECMAScript](https://tc39.es/ecma262/#sec-newobjectenvironment). Piszę to w cudzysłowie, ponieważ nie jest to faktycznie istniejąca funkcja, a po prostu opis pewnej abstrakcyjnej operacji, którą musi wykonać silnik JS-a. Operacja `NewObjectEnvironment` zwraca tzw. [Object Environment Record (Rejestr Środowiska Obiektu)](https://tc39.es/ecma262/#sec-object-environment-records). Dokładnie taki sam, [jaki tworzy `with()`](https://tc39.es/ecma262/#prod-WithStatement).

Żeby było ciekawiej, jak dokładnie spojrzy się w specyfikację HTML, to zobaczyć można, że tworzone są tam trzy rejestry: dla `document`, dla samego elementu, na którym zachodzi zdarzenie, oraz dla formularza, jeśli takowy jest przodkiem elementu z atrybutem `[on…]`. Całość oczywiście jest dodatkowo uruchamiana w globalnym scope, co sprawia, że można tworzyć naprawdę przerażające potworki:

```html
<form action="./">
	<button type="button" onclick="reset();clear();console.log( innerHTML, innerWidth );">Ooops…</button>
</form>
```

{% include 'embed' src="https://codepen.io/Comandeer/pen/yLxabvd" %}

* `reset()` pochodzi z formularza ([`HTMLFormElement#reset()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/reset)),
* `clear()` to już wspominane wcześniej `document.clear()`,
* `innerHTML` to własność samego przycisku,
* `innerWidth` to z kolei [własność globalnego obiektu `window`](https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth).

Zatem jeśli jeszcze nie używasz [`addEventListener()`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener), to mam dla Ciebie kolejny argument, by w końcu to zacząć robić!
