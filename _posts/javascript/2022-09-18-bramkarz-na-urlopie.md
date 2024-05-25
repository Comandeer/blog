---
layout: post
title:  "Bramkarz na urlopie"
author: Comandeer
date: 2022-09-18T19:13:00+0200
tags: 
    - javascript
    - eksperymenty
comments: true
permalink: /bramkarz-na-urlopie.html
---

Byłem zmuszony podjąć decyzję o zakończeniu projektu [Bramkarz](https://github.com/Comandeer/bramkarz), który rozpocząłem [jakieś 2 miesiące temu](https://blog.comandeer.pl/bramkarz.html). W tym wpisie pokrótce wyjaśnię dlaczego.
## Dziurawe zabezpieczenie
Bramkarz był w założeniu narzędziem pokroju [Hagany](https://github.com/yaakov123/hagana), ale dla projektów, które wykorzystywały [natywne moduły ES](https://nodejs.org/api/esm.html) zamiast, tradycyjnego dla Node.js, [systemu modułów CJS](https://nodejs.org/api/modules.html). To wymuszało wykorzystanie eksperymentalnego [API loaderów](https://nodejs.org/api/esm.html#loaders). I chociaż całość była dość toporna z powodu ograniczeń składni ESM (m.in. brak dynamicznych eksportów), to działało to nadspodziewanie dobrze.
Tylko że był jeden mały problem: tego typu zabezpieczenie można było banalnie prosto obejść. Wystarczyło stworzyć plik JS z rozszerzeniem `.cjs`. Dla Node'a oznacza to, że w tym pliku znajduje się kod w składni CJS. Czyli taki, który jest wczytywany przy pomocy `require()`, nie zaś – `import`. A więc taki, który omija całe zabezpieczenie dodane przez Bramkarza przy pomocy loadera ESM…
## Próba ratowania sytuacji
Na szczęście Node.js posiada [flagę `--require`](https://nodejs.org/api/cli.html#-r---require-module), która pozwala wczytać na start moduł podany jako wartość tej flagi. W teorii zatem wystarczyłoby przygotować moduł CJS nadpisujący operacje na plikach i dorzucić flagę `--require` do naszego skryptu odpalającego Bramkarza.

Tylko tutaj pojawia się pierwszy z problemów: Bramkarz korzysta z [tzw. top-level `await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await#top_level_await) do [wczytania konfiguracji](https://github.com/Comandeer/bramkarz/blob/9974ca7fd223935b1ef295dae1f3883cbd99578f/src/overrides/fs.js#L8). W ESM jest to możliwe, ponieważ moduły są wczytywane asynchronicznie – Node.js spokojnie zaczeka przy wczytywaniu, aż dany moduł się wykona. [W CJS jest inaczej](https://github.com/nodejs/node/issues/21267) – `require()` jest synchroniczne. To znaczy, że nasz moduł nadpisujący zostanie tak naprawdę wczytany przed tym, jak zdąży cokolwiek nadpisać. Innymi słowy: ktoś może skorzystać z operacji na plikach, _zanim_ te zostaną podmienione na zabezpieczone wersje. Problem można zobaczyć choćby na [prostym przykładzie na CodeSandboxie](https://codesandbox.io/s/restless-star-ncwkkv?file=/package.json). Odpalenie tej aplikacji da nam taki output:
```
index.js loaded
async initialized
```
Główna aplikacja odpala się **przed** wykonaniem się kodu wewnątrz wczytywanego modułu. W ESM przed taką sytuacją chroni właśnie top-level `await`.

Niemniej i na to istnieją haki – niekoniecznie działające stuprocentowo dobrze, ale _działające_.

{% include figure.html src="/assets/images/bramkarz-na-urlopie/meme.jpg" alt="–You are without doubt the worst hack I've ever heard of! –But you have heard of me" %}

Istnieje w Node.js [moduł `node:module`](https://nodejs.org/api/module.html), który zawiera całą logikę obsługi modułów CJS. Wśród niej jest (nieudokumentowana) metoda `Module._load`, służąca właśnie do wczytywania modułów. Nadpisanie jej w teorii pozwala dodać wsparcie dla asynchronicznego `require()`. A przynajmniej takiego, które poczeka na wczytanie się konfiguracji Bramkarza:

```javascript
const Module = require( 'node:module' ); // 1
const originalLoad = Module._load; // 2
const somePromise = new Promise( ( resolve ) => { // 3
    setTimeout( () => {
        resolve();
    }, 1000 ); // 4
} );

Module._load = function ( ...args ) { // 5
    somePromise.then( () => { // 6
        return originalLoad( ...args ); // 7
    } );
};
```
Na sam początek wczytujemy moduł `node:module` (1). Następnie zapisujemy sobie oryginalną wersję metody `Module#_load()` do zmiennej (2). Potem tworzymy obietnicę `somePromise` (3), która będzie emulować wczytywanie się konfiguracji. Jedyne, co robi, to odczekanie sekundy (4). Na samym końcu nadpisujemy `Module#_load()` (5). Nowa wersja czeka, aż obietnica `somePromise` zostanie rozwiązana, co można zrobić przy pomocy [`#then()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) (6). Po rozwiązaniu obietnicy odpalamy oryginalną metodę `Module#load()` (7). Taki "loader" można dodać do naszej aplikacji właśnie przy pomocy flagi `--require`.

[Ten przykład również można zobaczyć na CodeSandboxie](https://codesandbox.io/s/stupefied-heisenberg-y3qqx8?file=/loader.js).

<p   class="note">Na CodeSandboxie rezultat jest widoczny najlepiej po odpaleniu nowego terminalu i wpisaniu w nim komendy <code>npm start</code>. Przykłady można też ściągnąć jako plik <code>.zip</code> i odpalić lokalnie.</p>

Tylko że tutaj trafiłem na kolejny problem: mój projekt ma zależności. Większość z nich stworzył Sindre Sorhus, który [porzucił wsparcie dla CJS jakiś czas temu](https://scribe.rip/sindre-sorhus/hello-modules-d1010b4e777b). I jak moduły CJS da się wczytać wewnątrz ESM, tak w drugą stronę już nie bardzo. Owszem, są na to odpowiednie haki, np. używanie [dynamicznych importów](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import), ale to rodzi kolejne problemy (np. [konieczność zmiany konfiguracji Rollupa](https://rollupjs.org/guide/en/#renderdynamicimport)). I to był ten moment, gdy stwierdziłem, że odpuszczam. Zbyt dużo problemów jak na projekt, który jest zwykłym eksperymentem.
## I to by było na tyle
Szkoda mi tego projektu, bo bardzo podobała mi się idea zrobienia narzędzia, które pozwalałoby na wprowadzenie do Node'a czegoś na wzór systemu uprawnień. Niemniej trudności, które napotkałem, skutecznie mnie zniechęciły. A już nawet wygenerowałem ładne logo dla projektu przy użyciu [Dall·e 2](https://openai.com/dall-e-2/):

{% include figure.html src="/assets/images/bramkarz-na-urlopie/logo.png" alt="Bramkarz w eleganckim garniturze przed wejściem do klubu nocnego" %}

No cóż, może Bramkarz doczeka się lepszych czasów, np. Node.js kiedyś porzuci wsparcie dla CJS. Na razie jednak Bramkarz zostaje wysłany na urlop.
