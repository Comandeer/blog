---
layout: post
title:  "Najprostszy event emitter w przeglądarce"
description: "Jak stworzyć emitter zdarzeń przy pomocy EventTarget()?"
author: Comandeer
date: 2022-01-23T23:10:00+0100
tags:
    - javascript
comments: true
permalink: /najprostszy-event-emitter-w-przegladarce.html
---

Praca z DOM prędzej czy później wymusi na każdym zapoznanie się z [event listenerami](https://javascript.info/introduction-browser-events). Ten prosty mechanizm pozwala nam reagować w momencie, gdy w aplikacji sieciowej coś się dzieje – użytkownik kliknie przycisk, jakaś animacja się zakończy, wczyta się zawartość ramki… Jednak czasami taki system zdarzeń przydałby się w logice naszej aplikacji. Wówczas w jednym miejscu moglibyśmy reagować na rzeczy, które dzieją się w innych częściach aplikacji. Na szczęście okazuje się, że w przeglądarce jest na to sposób.<!--more-->

## Nasz event emitter

Żeby stworzyć prosty event emitter, wystarczy stworzyć obiekt klasy [`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/EventTarget):

```javascript
const eventEmitter = new EventTarget();
```

Listenery przypina się do niego dokładnie tak samo jak do elementów DOM:

```javascript
eventEmitter.addEventListener( 'hublabubla', console.log );
```

Jedynym udziwnieniem jest to, że… same eventy również tworzy się tak samo jak dla elementów DOM:

```javascript
const event = new CustomEvent( 'hublabubla', { // 1
    detail: { // 2
    	some: 'info'
    }
} );

eventEmitter.dispatchEvent( event ); // 3
```

By stworzyć nowe zdarzenie, musimy się posłużyć [klasą `CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent) (1; można też zastosować każdy inny konstruktor zdarzeń, łącznie z generycznym [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event)). W drugim parametrze możemy podać obiekt z własnością `detail` (2), która zawierać może dodatkowe informacje, jakie chcemy przekazać do listenera. Żeby ostatecznie zdarzenie do listenera trafiło, trzeba użyć jego [metody `dispatchEvent()`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent) (3).

I choć nie jest to jakoś superdużo roboty, to jestem w stanie zrozumieć tych wszystkich zawiedzionych, którzy dojdą do wniosku, że to jednak nie jest najprostszy z najprostszych sposobów. Na szczęście, po klasie `EventEmitter` można dziedziczyć i stworzyć swój własny emiter z pomocniczą metodą `fire()`:

```javascript
class EventEmitter extends EventTarget {
    fire( name, detail ) { // 1
        const event = new CustomEvent( name, { // 2
            detail
        } );

        return this.dispatchEvent( event ); // 3
    }
}
```

Tworzymy w niej event na podstawie przekazanych danych – jego nazwy i własności `detail` (1). Dane te przekazujemy do konstruktora `CustomEvent` (2). Na samym końcu wywołujemy zdarzenie (3).

Wykorzystanie jest praktycznie takie samo jak "czystego" `EventTarget`:

```javascript
const eventEmitter = new EventEmitter();

eventEmitter.fire( 'hublabubla', {
    some: 'info'
} );
```

Nie musimy jedynie martwić się o własnoręczne tworzenie `CustomEvent`a, ponieważ tym zajmuje się nasza nowa metoda.

## `EventTarget` – co to właściwie jest?

System zdarzeń był w DOM-ie niemal od samego początku. Jednak potrzeba było sposobu, aby w jakiś sposób ujednolicić go pomiędzy wszystkimi elementami DOM, BOM-em (Browser Object Model, czyli m.in. [`navigator`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator) i inne własności globalnego obiektu `window`) itd. Stąd powstał interfejs `EventTarget`. To właśnie w nim znajdują się metody takie jak `addEventListener()` czy `dispatchEvent()`. I ten interfejs następnie implementują praktycznie wszystkie rzeczy dostępne w JS-owym środowisku przeglądarki, które używają zdarzeń:

```javascript
window instanceof EventTarget; // true
document instanceof EventTarget; // true
document.createElement( 'div' ) instanceof EventTarget; // true
new XMLHttpRequest() instanceof EventTarget; // true
```

Tradycyjnie interfejsy DOM-owe były tworami mocno abstrakcyjnymi. Jeśli były obecne w przeglądarce, to zazwyczaj można je było wykorzystać co najwyżej do sprawdzenia przy pomocy operatora `instanceof`, czy jakiś obiekt dany interfejs implementuje. Jednak pewien czas temu to się zmieniło i sporo interfejsów zamieniło się w de facto pełnoprawne klasy, które można instancjonować. Tak się też stało w przypadku `EventTarget`, dzięki czemu można tworzyć swoje własne event emittery bez potrzeby wykorzystywania jakiejkolwiek biblioteki zewnętrznej.

## Haczyki

Oczywiście są haczyki, w tym wypadku dwa. Pierwszy polega na tym, że cały ten system zdarzeń jest w pełni synchroniczny, więc jeśli jakiś listener ma wykonać akcję asynchroniczną, to trzeba jednak sięgnąć po jakieś nienatywne rozwiązanie, np. [`emittery`](https://www.npmjs.com/package/emittery), lub [napisać samemu](https://github.com/Comandeer/mocha-lib-tester/blob/e64c6e1203de9c755bcb62eb744789a49ef08a8a/src/EventEmitter.js).

Drugi haczyk polega na tym, że `EventTarget` to typowo przeglądarkowe API. To oznacza, że [Deno je ma](https://deno.land/x/deno@v1.6.2/docs/runtime/web_platform_apis.md#codecustomeventcode-codeeventtargetcode-and-codeeventlistenercode), ale [Node… również je ma](https://nodejs.org/api/events.html#eventtarget-and-event-api). Więc w sumie jest tylko jeden haczyk.

I to by było na tyle. Events on!
