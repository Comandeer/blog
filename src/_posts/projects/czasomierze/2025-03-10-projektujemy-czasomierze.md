---
layout: post
title:  "Projektujemy czasomierze"
description: "Zaprojektujmy czasomierze lepsze od tych w przeglądarce"
author: Comandeer
date: 2025-03-10T15:58:00+0100
project: czasomierze
tags:
    - javascript
comments: true
permalink: /projektujemy-czasomierze.html
---

[W poprzednim odcinku](https://blog.comandeer.pl/tik-tak) przyjrzeliśmy się, jak działają czasomierze w przeglądarce i zidentyfikowaliśmy kilka problemów, które można poprawić. Dzisiaj spróbujemy zaprojektować ~~lepsze~~ nowe API czasomierzy!<!--more-->

## Jak to będziemy robić?

Zajmiemy się wszystkimi wspomnianymi problemami po kolei, próbując ich rozwiązania zamknąć w spójne, sensowne API. Będziemy korzystać z już istniejących rozwiązań, żeby podpatrzeć, jak można pewne rzeczy zrobić. Będziemy też całość pisać w [TypeScripcie](https://www.typescriptlang.org/), dzięki czemu za darmo dostaniemy ładne typy. Oficjalna strona TypeScriptu udostępnia [miejsce do testowania kodu online](https://www.typescriptlang.org/play/).

<p class="note">Część przykładów z tego artykułu może nie chcieć się uruchomić we wspomnianym wyżej narzędziu, narzekając na obecność <a href-"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await#top_level_await">top-level <code>await</code></a>. W takim wypadku wystarczy wymusić traktowanie kodu jako modułu ES poprzez dodanie, czy to na początku, czy na końcu, pustego eksportu (<code>export {}</code>) lub otoczyć całość w <a href="https://developer.mozilla.org/en-US/docs/Glossary/IIFE">samowywołującą się asynchroniczną funkcję</a>.</p>

Obecnie kod TS można także [uruchomić bezpośrednio w Node.js](https://nodejs.org/en/learn/typescript/run-natively):

```shell
$ node --experimental-strip-types ./nasz-plik.ts
```

Node.js obsługuje TS-a od wersji 22.6.0.

## Poprawiamy asynchroniczność

Pierwszym problemem było [przestarzałe podejście do asynchroniczności](https://blog.comandeer.pl/tik-tak#przestarza%C5%82e-podej%C5%9Bcie-do-asynchroniczno%C5%9Bci), objawiające się używaniem [callbacków](https://developer.mozilla.org/en-US/docs/Glossary/Callback_function). Dlatego nasze API powinno używać [obietnic](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), które obecnie są zalecanym sposobem obsługi asynchroniczności.

Przepisywanie APi callbackowego na obietnicowe najlepiej podpatrzyć w Node.js, które miało kiedyś ten problem:

```javascript
import { readFile as readFileCallback } from 'node:fs';
import { readFile as readFilePromise } from 'node:fs/promises';

readFileCallback( '/jakis-plik', 'utf-8', ( err, data ) => {
	console.log( data );
} );

const data = await readFilePromise( '/jakis-plik', 'utf-8' );
```

W przypadku callbackowego API z parametrów wyleciał callback (zatem `readFilePromise()` przyjmuje tylko 2 parametry, podczas gdy `readFileCallback()` – 3). Wynik działania funkcji za to jest zwracany z tej funkcji, nie zaś – przekazywany do callbacku. I to w sumie tyle, ile będzie nam potrzebne. Warto jednak wspomnieć, że zmienia się także sposób obsługi błędów:

```javascript
readFileCallback( '/plik-do-ktorego-nie-mamy-uprawnien', 'utf-8', ( err, data ) => { // 1
	console.error( err );
} );

try { // 2
	const data = await readFilePromise( '/plik-do-ktorego-nie-mamy-uprawnien', 'utf-8' );
} catch ( err ) {
	console.error( err );
}
```

W przypadku, gdy wystąpi błąd w wersji callbackowej, zostanie on przekazany jako pierwszy parametr do callbacku (1). W przypadku wersji z obietnicą, błąd spowoduje odrzucenie obietnicy. Można go obsłużyć, dodając blok `try`/`catch` (2).

Niemniej przy czasomierzach nie będziemy dodawać obsługi błędów. To API bowiem nie rzuca żadnymi błędami.

Mając to wszystko na uwadze, stwórzmy obietnicowe `setTimeout()`:

```typescript
async function setTimeout( delay: number ): Promise<void> { // 1
	return new Promise( ( resolve ) => { // 2
		globalThis.setTimeout( resolve, delay ); // 3
	} );
}
```

Tworzymy asynchroniczną funkcję `setTimeout()` (1), która przyjmuje jako parametr `delay`. Ten parametr jest typu `number`, bo przekazywać będziemy liczbę milisekund. Dodatkowo oznaczamy funkcję jako zwracającą pustą obietnicę (`Promise<void>`). W środku tworzymy nową obietnicę (2), w której wywołujemy `globalThis.setTimeout()` (3), a następnie zwracamy tę obietnicę. Do wywołania `globalThis.setTimeout()` przekazujemy `resolve()` obietnicy jako callback oraz `delay` jako liczbę milisekund do odczekania.

Kod ten wygląda bardzo podobnie do funkcji `wait()` z poprzedniego artykułu. Niemniej, z uwagi na to, że używamy nazwy `setTimeout()`, tym samym przesłaniamy natywną funkcję `setTimeout()`. Ta jednak wciąż istnieje jako `globalThis.setTimeout()` – a więc funkcja globalna o takiej nazwie. [Zmienna `globalThis`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis) wskazuje na globalne `this` (w uproszczeniu można przyjąć, że globalny obiekt) i jest dostępna nie tylko w przeglądarce, ale także w innych środowiskach uruchomieniowych JS-a (takich jak Node.js).

Tym sposobem mamy rozwiązaną połowę problemu asynchroniczności. Ale pozostaje jeszcze `setInterval()`, które służy do wykonywania jakiejś czynności co określony czas. Nie jesteśmy w stanie zatem zwrócić pojedynczej obietnicy. Na szczęście ktoś już ten problem rozwiązał! W Node.js istnieje oparte na obietnicach API czasomierzy, w tym – [takie dla `setInterval()`](https://nodejs.org/api/timers.html#timerspromisessetintervaldelay-value-options). API to zwraca nie obietnicę, a [asynchroniczny iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols):

```javascript
import { setInterval } from 'node:timers/promises'; // 1

for await ( const _ of setInterval( 1000 ) ) { // 2
	console.log( 'tick' ); // 3
}
```

Importujemy obietnicową wersję `setInterval()` z modułu `node:timers/promises` (1). Następnie wywołujemy `setInterval()` wewnątrz [pętli `for await...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) (2). Co sekundę pętla ta spowoduje wyświetlenie słowa `'tick'` (3).

Spróbujmy zatem odtworzyć to API:

```typescript
async function* setInterval( tick: number ): AsyncIterableIterator<void> { // 1
	while ( true ) { // 2
		yield setTimeout( tick ); // 3
	}
}

async function setTimeout( delay: number ): Promise<void> {
	[…]
}
```

Najprostszym sposobem na stworzenie asynchronicznego iteratora jest wykorzystanie [asynchronicznego generatora](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function*) (1). Wewnątrz niego tworzymy nieskończoną pętlę (2), natomiast w niej – `yield`ujemy wywołanie stworzonego przez nas wcześniej`setTimeout()` (3). Tym sposobem za każdym razem zwracamy obietnicę, którą zewnętrzny kod może wykorzystać w pętli `for await...for`.

Dość ironicznie wewnątrz naszego `setInterval()` nie da się wykorzystać tego oryginalnego. Wynika to stąd, że dla każdego "tyknięcia" musimy zwrócić osobną wartość (nową obietnicę). W przypadku natywnego `setInterval()` byłoby to niemożliwe. W przeciwieństwie do `setTimeout()`, przekazanie `resolve()` nie zadziałałoby poprawnie (nie da się spełnić dwa razy tej samej obietnicy). Dlatego najłatwiejszym sposobem jest użycie obietnicowej wersji `setTimeout()`. Dzięki temu za każdym razem zwrócimy nową obietnicę, która zostanie rozwiązana po określonym czasie. Taka "podmiana" pojedynczego odliczania z interwałem jest możliwa, ponieważ z zewnątrz następujące po sobie wywołania `setTimeout()` tak naprawdę nie różnią się zachowaniem od interwału.

## Dodanie wsparcia dla `AbortController`a

Przejście na obietnicowe API sprawia, że drugi problem, [brak wsparcia dla `AbortController`a](https://blog.comandeer.pl/tik-tak#brak-wsp%C3%B3%C5%82pracy-z-abortcontrollerem), jest jeszcze bardziej palący. Z racji tego, że obietnica jest tworzona wewnątrz `setTimeout()`, nie ma za bardzo możliwości jej odrzucenia z zewnątrz. Tutaj bardzo pomogłaby możliwość przekazania sygnału, który mógłby przerywać odliczanie lub interwał. Dorzućmy zatem jego obsługę do naszego API. Zacznijmy od `setTimeout()`:

```typescript
interface SetTimeoutOptions { // 2
	signal?: AbortSignal; // 3
}

async function setTimeout(
	delay: number,
	{ signal }: SetTimeoutOptions = {} // 1
): Promise<void> {
	return new Promise( ( resolve, reject ) => {
		const timeoutId = globalThis.setTimeout( resolve, delay ); // 3

		if ( signal !== undefined ) { // 4
			signal.addEventListener( 'abort', ( evt ) => { // 5
				clearTimeout( timeoutId ); // 6
				reject( evt ); // 7
			} );
		}
	} );
}
```

W funkcji `setTimeout()` pojawił się drugi, opcjonalny parametr (1). Korzystam tutaj ze [wzorca obiektu opcji](https://michaelnthiessen.com/options-object-pattern), żeby przekazać do funkcji obiekt z opcjonalną konfiguracją. Kształt opcji jest opisywany przez interfejs `SetTimeoutOptions` (2). Jak na razie zezwalamy tylko na jedną opcję – `signal` (3), która będzie naszym [`AbortSignal`em](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal). Z kolei w samym `setTimeout()` zapisujemy id zwracane przez natywne `setTimeout()` do zmiennej `timeoutId` (3). Następnie, jeśli sygnał został przekazany (4), dodajemy obsługę jego [zdarzenia `abort`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/abort_event) (5). Gdy to zdarzenie nastąpi, chcemy anulować odliczanie przy pomocy `clearTimeout()` (6) oraz odrzucić obietnicę (7). Jako powód odrzucenia zwracamy zdarzenie `abort`.

Sprawdźmy, czy faktycznie da się w taki sposób zatrzymać odliczanie. Stwórzmy sobie kilka odliczeń korzystających z tego samego sygnału, a następnie wyślijmy do niego informację o anulowaniu asynchronicznej operacji przy pomocy [`AbortController#abort()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort):

```typescript
const abortController = new AbortController(); // 1
const { signal } = abortController; // 2
const timeouts = [ // 3
	setTimeout( 1000, { signal } ),
	setTimeout( 2000, { signal } ),
	setTimeout( 3000, { signal } )
];

abortController.abort(); // 4

const results = await Promise.allSettled( timeouts ); // 5

results.forEach( ( result ) => {
	console.log( result ); // 6
} );
```

Na początku tworzymy `AbortController` (1) i wyciągamy z niego sygnał (2). Następnie tworzymy tablicę z `setTimeout()`ami (3). Każdemu odliczaniu przekazujemy ten sam sygnał. Następnie wywołujemy `abortController.abort()` (4), żeby przerwać odliczanie. Dalej czekamy na zakończenie wszystkich obietnic przy pomocy [`Promise.allSettled()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled) (5). Użycie tej funkcji pozwoli nam na zaczekanie zarówno na odrzucone obietnice, jak i na te poprawnie spełnione (w przeciwieństwie do [`Promise.all()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all), które obsłuży tylko spełnione obietnice). Status wszystkich obietnic zapisujemy do zmiennej `results`. Następnie wyświetlamy status każdej obietnicy (6).

Po uruchomieniu powyższego kodu powinniśmy zobaczyć, że dla każdej obietnicy został zwrócony obiekt podobny do poniższego:

```javascript
{
	status: 'rejected', // 1
	reason: { // 2
		type: 'abort',
		defaultPrevented: false,
		cancelable: false,
		timeStamp: 89.556842
	}
}
```

Obietnice zostały odrzucone (1), a jako powód odrzucenia podane jest zdarzenie `abort` (2).

Niemniej natywne API korzystające z `AbortSignal`a zachowują się nieco inaczej. Przyjrzyjmy się, jak to robi `setTimeout` z Node'owego modułu `node:timers/promises`:

```javascript
import { setTimeout } from 'node:timers/promises'; // 1

const abortController = new AbortController(); // 2
const { signal } = abortController; // 3
const res = setTimeout( 100, 'result', { signal } ); // 4

abortController.abort(); // 5

await res; // 6
```

Na początku importujemy `setTimeout()` (1). Następnie tworzymy `AbortController`a (2), wyciągamy z niego sygnał (3) i przekazujemy go do wywołania `setTimeout()` (4). Potem wywołujemy `abortController.abort()` (5) i czekamy na odrzucenie odliczania (6). Jeśli uruchomimy ten kod i spojrzymy do konsoli, zobaczymy mniej więcej taki błąd:

```
node:timers/promises:48
    reject(new AbortError(undefined, { cause: signal?.reason }));
           ^

AbortError: The operation was aborted
    at Timeout.cancelListenerHandler (node:timers/promises:48:12)
    at [nodejs.internal.kHybridDispatch] (node:internal/event_target:816:20)
    at AbortSignal.dispatchEvent (node:internal/event_target:751:26)
    at runAbort (node:internal/abort_controller:410:10)
    at abortSignal (node:internal/abort_controller:396:3)
    at AbortController.abort (node:internal/abort_controller:428:5)
    at file://[ciach]/test.ts:11:17
    ... 2 lines matching cause stack trace ...
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:116:5) {
  code: 'ABORT_ERR',
  [cause]: DOMException [AbortError]: This operation was aborted
      at new DOMException (node:internal/per_context/domexception:53:5)
      at AbortController.abort (node:internal/abort_controller:427:18)
      at file://[ciach]/test.ts:11:17
      at ModuleJob.run (node:internal/modules/esm/module_job:268:25)
      at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:543:26)
      at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:116:5)
}
```

Node.js rzucił w tym wypadku `AbortError`, który jako swoją przyczynę ([`Error#cause`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)) wskazał na przyczynę przerwania przekazaną do sygnału ([`AbortSignal#reason`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/reason)). Spróbujmy zatem nieco poprawić zachowanie naszego `setTimeout()`:

```typescript
async function setTimeout( delay: number, { signal }: SetTimeoutOptions = {} ): Promise<void> {
	return new Promise( ( resolve, reject ) => {
		const timeoutId = globalThis.setTimeout( resolve, delay );

		if ( signal !== undefined ) {
			signal.addEventListener( 'abort', () => {
				clearTimeout( timeoutId );
				reject( signal.reason ); // 1
			} );
		}
	} );
}
```

Tak naprawdę nie potrzebujemy dodatkowego owijania we własny `AbortError`, możemy skorzystać bezpośrednio z `AbortSignal#reason`. Co też robimy (1). I to w sumie jedyna zmiana. Jeśli teraz odpalimy nasz kod, zauważymy, że powód odrzucenia obietnicy się zmienił – teraz jest to błąd typu [`DOMException`](https://developer.mozilla.org/en-US/docs/Web/API/DOMException) z komunikatem `signal is aborted without reason` (testowane w Chrome).

<p class="note">Możemy podać dokładny powód przerwania operacji, przekazując go jako argument do <code>AbortController#abort()</code>. Można tam przekazać dowolną wartość, ale przekazywanie <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error">błędów</a> w takich przypadkach jest w miarę powszechnie stosowaną dobrą praktyką.</p>

Jest jeszcze jedna sytuacja, którą powinniśmy wziąć pod uwagę: co jeśli do `setTimeout()` zostanie przekazany już "wykorzystany" sygnał? Może to nastąpić, gdy `AbortController#abort()` zostało wywołane przed wywołaniem `setTimeout()`. Obsługa zdarzenia `abort` tego nie wykryje, bo ono jest w stanie wykryć jedynie przerwanie tu i teraz (tak samo jak np. zdarzenie `click` nie zareaguje na kliknięcie sprzed 10 minut). Na szczęście istnieje [własność `AbortSignal#aborted`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/aborted), która informuje o stanie sygnału:

```typescript
async function setTimeout( delay: number, { signal }: SetTimeoutOptions = {} ): Promise<void> {
	return new Promise( ( resolve, reject ) => {
		if ( signal?.aborted ) { // 1
			reject( signal.reason ); // 2

			return; // 3
		}

		[…]
	} );
}
```

Na samym początku naszej obietnicy dodajemy sprawdzenie, czy własność `signal.aborted` jest prawdą (1). Stosuję tutaj operator opcjonalnego łańcuchowania (ang. <i lang="en">optional chaining operator</i>) dla zwięzłości zapisu. Jeśli ta własność jest prawdą, odrzucam obietnicę (2) i przerywam dalsze działanie funkcji przez `return` (3).

Teraz możemy przetestować działanie nowej wersji `setTimeout()`:

```javascript
const abortController = new AbortController();
const { signal } = abortController;

abortController.abort();
setTimeout( 1000, { signal } );
```

Na początku tworzymy `AbortController` (1), wyciągamy z niego sygnał (2), a następnie wywołujemy `abortController.abort()` (3) i dopiero potem wywołujemy `setTimeout()` i przekazujemy do niego sygnał (4). Po uruchomieniu tego kodu powinniśmy zobaczyć w konsoli znany już nam błąd `DOMException`.

Skoro obsługę `AbortController`a w `setTimeout()` mamy już za sobą, pora zająć się `setInterval()`:

```typescript
async function* setInterval(
	tick: number,
	options: SetTimeoutOptions = {} // 1
): AsyncIterableIterator<void> {
	while ( true ) {
		yield setTimeout( tick, options ); // 2
	}
}
```

Zmiana na dobrą sprawę jest jedna. Pojawił się nowy parametr, przyjmujący ten sam obiekt opcji co w przypadku `setTimeout()` (1). Ten parametr przekazujemy dalej do `setTimeout()` (2)… i to w sumie tyle. Całą obsługą `AbortController`a zajmuje się `setTimeout()`.

Przetestujmy naszą nową wersję `setInterval()`:

```javascript
const abortController = new AbortController(); // 1
const { signal } = abortController; // 2

try { // 4
	for await ( const _ of setInterval( 1000, { signal } ) ) { // 3
		console.log( 'tick' ); // 5
		abortController.abort(); // 6
	}
} catch ( e ) {
	console.log( e.message );
}
```

Standardowo już tworzymy `AbortController`a (1) i wyciągamy z niego sygnał (2). Następnie tworzymy pętlę `for await...of` z `setInterval()`a, do którego przekazaliśmy sygnał (3). Całą pętlę dodatkowo otaczamy blokiem `try`/`catch` (4), żeby wyłapać odrzucenie obietnicy. W samej pętli najpierw wyświetlamy `'tick'` (5), a następnie wywołujemy `abortController.abort()` (6). Zgodnie z tą logiką powinniśmy zobaczyć w konsoli tylko jeden napis `'tick'`, a potem – błąd `DOMException`. I, jeśli wywołamy powyższy kod, to dokładnie tak się stanie!

### Co z `clearTimeout()`/`clearInterval()`?

Obecnie cała nasza obsługa błędów jest oparta o `AbortController`. Niemniej natywne API posiada dwie funkcje służące do anulowania odliczania i interwałów. Zastanówmy się, czy da się je jakoś zaadaptować na potrzeby nowego API.

Zacznijmy od `clearTimeout()`. Funkcja ta pozwala anulować odliczanie przy pomocy unikatowego identyfikatora, który jednoznacznie identyfikuje odliczanie. W naszym przypadku również można taki identyfikator znaleźć – może być nim obietnica zwrócona przez `setTimeout()`. W przypadku `clearInterval()` można próbować identyfikować przy pomocy asynchronicznego generatora i na tej podstawie anulować poszczególne odliczania. Niemniej uważam, ze jest to niepotrzebne kombinowanie – `AbortController` dostarcza wygodniejszy i potężniejszy mechanizm anulowania poszczególnych odliczań i interwałów. Dlatego też pozwolę sobie pominąć obydwie te funkcje.

## Lepszy format czasu

Trzecim wymienionym przeze mnie problemem był [nieprzyjazny format czasu](https://blog.comandeer.pl/tik-tak#nieprzyjazny-format-czasu). Czasomierze akceptują bowiem wyłącznie liczbę milisekund, a ja chciałbym podawać czas w bardziej przystępnym, tekstowym formacie:

```
99h55m33s124ms
```

Format ten jest luźną adaptacją [formatu czasu trwania ze specyfikacji HTML](https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-duration-string).

Równocześnie jestem w stanie wyobrazić sobie, że część osób będzie go uważać za mniej czytelny od podawania liczby milisekund, więc starszy sposób również powinien być wspierany. Zmieńmy zatem odpowiednio pierwszy parametr naszych czasomierzy:

```typescript
type Hours = `${ number }h`; // 6
type Minutes = `${ number }m`; // 7
type Seconds = `${ number }s`; // 8
type MiliSeconds = `${ number }ms`; // 9
type Delay = // 3
| number // 4
| Exclude< // 6
	`${ Hours | ''}${ Minutes | '' }${ Seconds | '' }${ MiliSeconds | ''}`, // 5
	''
>;

async function setTimeout(
	delay: Delay, // 1
	{ signal }: SetTimeoutOptions = {}
): Promise<void> {
	[…]
}

async function* setInterval(
	tick: Delay, // 2
	options: SetTimeoutOptions = {}
): AsyncIterableIterator<void> {
	[…]
}
```

Zarówno w `setTimeout()` (1), jak i `setInterval()` (2), typ pierwszego parametru zmienił się z `number` na `Delay` (3). Ten typ może przyjąć dwie postaci – albo liczby (4), albo mocno skomplikowanego ciągu znaków (5), który dodatkowo owinięty jest w `Exclude<>` (6). Zatrzymajmy się na moment przy tym typie.

W TypeScripcie istnieje coś takiego jak [typy szablonowe literałów](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) (ang. <i lang="en">template literal types</i>). W dużym skrócie są niejako odpowiednikiem [szablonowych ciągów znaków z JS-a](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals). Różnica polega na tym, że gdy w JS-ie możemy w takie ciągi wsadzać zmienne, tak w TS-ie – inne typy. Dlatego też do naszego typu wsadziliśmy typy oznaczające godziny (6), minuty (7), sekundy (8) i milisekundy (9). Jak widać, to też są template literal types, ale prostsze:

```typescript
type Hours = `${ number }h`;
```

W tym przypadku typ `Hours` oznacza ciąg, w którym znajduje się dowolna liczba, po której następuje literka `h`. Typy dla poszczególnych jednostek czasu wyglądają podobnie, różnią się tylko, cóż, _jednostką_. Natomiast typ `Delay` łączy je wszystkie w jeden ciąg – ale każdy człon jest opcjonalny. W końcu nie wszyscy potrzebują czasomierza ustawionego w godzinach. Opcjonalność członów została uzyskana przy pomocy [unii typów](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types):

```typescript
type Delay = `${ Hours | '' }`;
```

Każdy człon może zostać zastąpiony przez pusty ciąg znaków. Niemniej to powoduje pewien problem: skoro wszystkie człony są opcjonalne, to ostatecznie typ `Delay` dopuszcza także pusty ciąg znaków (`''`). I tutaj przydaje się [typ `Exclude<>`](https://www.typescriptlang.org/docs/handbook/utility-types.html#excludeuniontype-excludedmembers), dzięki któremu odfiltrowujemy z naszego `Delay` pusty ciąg znaków. Ostatecznie więc otrzymujemy listę wszystkich możliwych kombinacji jednostek czasu.

Innymi słowy, typ `Delay` można zapisać też jako:

```typescript
type Delay =
| number
| `${number}h`
| `${number}m`
| `${number}s`
| `${number}ms`
| `${number}s${number}ms`
| `${number}m${number}ms`
| `${number}m${number}s`
| `${number}m${number}s${number}ms`
| `${number}h${number}ms`
| `${number}h${number}s`
| `${number}h${number}s${number}ms`
| `${number}h${number}m`
| `${number}h${number}m${number}ms`
| `${number}h${number}m${number}s`
| `${number}h${number}m${number}s${number}ms`
```

Taką też listę powinniśmy zobaczyć po najechaniu na typ w edytorze kodu/IDE. I choć można by ten typ zapisać tak w kodzie, wydaje mi się, że sposób z `Exclude<>` + osobnymi typami dla poszczególnych jednostek czasu jest mimo wszystko czytelniejszy. Acz zdecydowanie bardziej _sprytny_ i wymagający nieco przetrawienia.

Skoro mamy już typ parametru, teraz pora go obsłużyć. Z racji tego, że wewnątrz `setInterval()` jedynie go przekazujemy do wnętrza `setTimeout()`, zajmijmy się od razu tą drugą funkcją:

```typescript
async function setTimeout(
	delay: Delay,
	{ signal }: SetTimeoutOptions = {}
): Promise<void> {
	return new Promise( ( resolve, reject ) => {
		[…]

		const delayInMs = convertDelayToMs( delay ); // 1
		const timeoutId = globalThis.setTimeout( resolve, delayInMs ); // 2

		[…]
	} );
}
```

Pojawiła się nowa zmienna, `delayInMs`, która przechowuje wynik wywołania funkcji `convertDelayToMs()` (1). Tę zmienną przekazujemy jako czas do natywnego `setTimeout()` (2).

Natomiast sama funkcja `convertDelayToMs()` wygląda następująco:

```typescript
interface DelayGroups { // 13
	hours?: Hours;
	minutes?: Minutes;
	seconds?: Seconds;
	miliseconds?: MiliSeconds;
}

function convertDelayToMs( delay: Delay ): number { // 1
	if ( typeof delay === 'number' ) { // 2
		return delay; // 3
	}

	const delayRegex = /^(?<hours>\d+h)?(?<minutes>\d+m(?!s))?(?<seconds>\d+s)?(?<miliseconds>\d+ms)?$/; // 5
	const matched = delay.match( delayRegex ); // 4
	const { hours, minutes, seconds, miliseconds } = matched.groups as DelayGroups; // 6
	let totalDelay = 0; // 7

	if ( hours !== undefined ) { // 8
		totalDelay += removeUnit( hours ) * 3600000; // 9
	}

	if ( minutes !== undefined ) {
		totalDelay += removeUnit( minutes ) * 60000;
	}

	if ( seconds !== undefined ) {
		totalDelay += removeUnit( seconds ) * 1000;
	}

	if ( miliseconds !== undefined ) {
		totalDelay += removeUnit( miliseconds );
	}

	return totalDelay; // 12
}

function removeUnit( delay: Hours | Minutes | Seconds | MiliSeconds ): number { // 10
	return Number( delay.replaceAll( /[a-z]/g, '' ) ); // 11
}
```

Funkcja `convertDelayToMs()` przyjmuje jako jedyny parametr wartość `delay` i zwraca liczbę (1). Na samym początku sprawdzamy, czy przekazane `delay` jest liczbą (2) – jeśli tak, to po prostu tę wartość zwracamy (3). W innym przypadku parsujemy argument `delay` (4) przy pomocy wyrażenia regularnego (5). Wyciągamy z rezultatu parsowania [nazwane grupy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Named_capturing_group) (6). Następnie tworzymy zmienną `totalDelay` (7), która będzie zawierać wynik sumowania czasu. Następnie przechodzimy przez każdą wykrytą jednostkę czasu – sprawdzamy, czy została ustawiona (8), a następnie przeliczamy ją na milisekundy i dodajemy do `totalDelay` (9). Przy przeliczaniu musimy usunąć samą jednostkę. Do tego służy funkcja `removeUnit()` (10), która przyjmuje jednostkę czasu i zwraca samą jej wartość. W tym celu usuwa wszelką nieliczbową treść z przekazanej wartości, a rezultat rzutuje na liczbę (11). Gdy skończymy już dodawać poszczególne jednostki czasu do siebie, zwracamy `totalDelay` (12).

Wróćmy na chwilę do wyrażenia regularnego. Po pierwsze, warto zwrócić uwagę, że nazwane grupy (6) rzutowane są na typ `DelayGroups` (13). Domyślnie TypeScript nie typuje własności `groups` w wyniku parsowania ciągu wyrażeniem regularnym, dlatego trzeba to zrobić własnoręcznie. W samym wyrażeniu regularnym z kolei każda jednostka czasu jest oznaczona jako opcjonalna:

```javascript
/(?<hours>\d+h)?/
```

Taki zapis z `?` za nawiasem oznacza "dana grupa może wystąpić raz lub nie wystąpić wcale".

Dodatkowo grupa dla minut stosuje tzw. [negatywne rozglądnięcie się do przodu](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Lookahead_assertion) (ang. <i lang="en">negative lookahead assertion</i>), żeby przez przypadek nie złapać też milisekund:

```javascript
/(?<minutes>\d+m(?!s))?/
```

Taki zapis oznacza "znajdź liczbę, po której następuje litera `m`, po której _nie_ następuje litera `s`".

<p class="note">Stosując pozytywne rozglądnięcie się do przodu (ang. <i lang="en">positive lookahead assertion</i>) można całe wyrażenie regularne napisać tak, aby wykrywało same wartości liczbowe, przyporządkowując je do konkretnych nazwanych grup na podstawie następujących po nich liter.</p>

## Dodatkowe poprawki

Nasze API wygląda dobrze. Niemniej myślę, że można dodać jeszcze jedno usprawnienie. Obecnie zarówno `setTimeout()`, jak i `setInterval()` nie zwracają żadnej wartości w obietnicach. Zamiast tego mogą zwracać aktualny znacznik czasu (podobnie jak to [robi np. `requestAnimationFrame()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame#timestamp)):

```typescript
async function setTimeout(
	delay: Delay,
	{ signal }: SetTimeoutOptions = {}
): Promise<number> { // 1
	return new Promise( ( resolve, reject ) => {
		[…]

		const timeoutId = globalThis.setTimeout( () => { // 3
			resolve( Date.now() ); // 4
		}, delayInMs );

		[…]
	} );
}

async function* setInterval(
	tick: Delay,
	options: SetTimeoutOptions = {}
): AsyncIterableIterator<number> { // 2
	[…]
}
```

Zmienił się typ zwracanych wartości funkcji – `setTimeout()` zwraca teraz `Promise<number>` (1), a `setInterval()` – `AsyncIterableIterator<number>` (2). W `setTimeout()` zaszła jeszcze jedna zmiana – `resolve()` nie jest już przekazywany bezpośrednio jako callback. Został owinięty w [funkcję strzałkową](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) (3), a do samego `resolve()` przekazywana jest wartość [`Date.now()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now) (4).

<p class="note">Aktualny znacznik czasu niekoniecznie jest szczególnie przydatny w przypadku pojedynczego wywołania <code>setTimeout()</code>, ale w przypadku <code>setInterval()</code> może być przydatny do wykorzystania w technice <a href="https://en.wikipedia.org/wiki/Delta_timing"><i lang="en">delta timing</i></a>.</p>

Kolejnym usprawnieniem, jakie wprowadziłbym, jest… zmiana nazw w naszym API. Istniejące w przeglądarkach czasomierze są na tyle znane, że "podszywanie się" pod nie niekoniecznie jest dobrym pomysłem. Zwłaszcza, że nasze API działa całkowicie inaczej. Nie dość, że zmieniło się zachowanie funkcji `setTimeout()` i `setInterval()`, to dodatkowo `clearTimeout()` i `clearInterval()` nie działają w ogóle. Dlatego, żeby nie wprowadzać niepotrzebnego chaosu, nasze `setTimeout()` będzie nazywać się `wait()`, a `setInterval()` – `tick()`.

## Całość kodu

Ostatecznie nasz kod powinien wyglądać mniej więcej tak:

```typescript
type Hours = `${ number }h`;
type Minutes = `${ number }m`;
type Seconds = `${ number }s`;
type MiliSeconds = `${ number }ms`;
type Delay =
| number
| Exclude<
	`${ Hours | ''}${ Minutes | '' }${ Seconds | '' }${ MiliSeconds | ''}`,
	''
>;

interface SetTimeoutOptions {
	signal?: AbortSignal;
}

async function wait(
	delay: Delay,
	{ signal }: SetTimeoutOptions = {}
): Promise<number> {
	return new Promise( ( resolve, reject ) => {
		if ( signal?.aborted ) {
			reject( signal.reason );

			return;
		}

		const delayInMs = convertDelayToMs( delay );
		const timeoutId = globalThis.setTimeout( () => {
			resolve( Date.now() );
		}, delayInMs );

		if ( signal !== undefined ) {
			signal.addEventListener( 'abort', () => {
				clearTimeout( timeoutId );
				reject( signal.reason );
			} );
		}
	} );
}

async function* tick(
	tick: Delay,
	options: SetTimeoutOptions = {}
): AsyncIterableIterator<number> {
	while ( true ) {
		yield wait( tick, options );
	}
}

interface DelayGroups {
	hours?: Hours;
	minutes?: Minutes;
	seconds?: Seconds;
	miliseconds?: MiliSeconds;
}

function convertDelayToMs( delay: Delay ): number {
	if ( typeof delay === 'number' ) {
		return delay;
	}

	const delayRegex = /^(?<hours>\d+h)?(?<minutes>\d+m(?!s))?(?<seconds>\d+s)?(?<miliseconds>\d+ms)?$/;
	const matched = delay.match( delayRegex );
	const { hours, minutes, seconds, miliseconds } = matched.groups as DelayGroups;
	let totalDelay = 0;

	if ( hours !== undefined ) {
		totalDelay += removeUnit( hours ) * 3600000;
	}

	if ( minutes !== undefined ) {
		totalDelay += removeUnit( minutes ) * 60000;
	}

	if ( seconds !== undefined ) {
		totalDelay += removeUnit( seconds ) * 1000;
	}

	if ( miliseconds !== undefined ) {
		totalDelay += removeUnit( miliseconds );
	}

	return totalDelay;
}

function removeUnit( delay: Hours | Minutes | Seconds | MiliSeconds ): number {
	return Number( delay.replaceAll( /[a-z]/g, '' ) );
}
```

## Co dalej?

Udało nam się zaprojektować nowe API dla czasomierzy. W następnym odcinku spróbujemy z tego skleić _profesjonalny_ pakiet npm!
