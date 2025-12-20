---
layout: post
title:  "async/await w ES3"
description: "Sztuczka z YUI.Test pozwalająca na symulację składni async/await w ES3."
author: Comandeer
date: 2019-09-30T20:05:00+0200
tags:
    - javascript
comments: true
permalink: /async-await-w-es3.html
---

Sensowne narzędzia do obsługi asynchroniczności pojawiły się w JavaScripcie stosunkowo późno, bo dopiero w ES6. W jednej z późniejszych wersji pojawiła się też składnia `async`/`await`. Niemniej przy odrobinie wyobraźni można namiastkę tej składni stworzyć w starym, dobrym ES3.<!--more-->

## Asynchroniczna rewolucja

Główną zmianą dotyczącą operacji asynchronicznych w ES6 było wprowadzenie do języka `Promise`. Pozwalały one na odrzucenie starych callbacków na rzecz czegoś bardziej przyjaznego:

```javascript
// callbacki
doAjax( function( response ) {
	parseResponse( response, function( parsed ) {
		displayResponse( parsed );
	} )
} );

// Promise
doAjax().then( parseResponse ).then( displayResponse );
```

Niemniej wciąż nie był to kod równie czytelny, co kod synchroniczny. Jednak szybko znaleziono na to radę: nagięto użycie generatorów. Zauważono bowiem, że użycie wewnątrz nich komendy `yield` sprawia, że generator zostaje "zamrożony", a wykonanie przenosi się do miejsca wywołania generatora. Możemy wykonać dowolne operacje, a następnie wrócić w to samo miejsce generatora i wykonywać kod dalej, jakby nic się nie stało:

```javascript
const generator = myGenerator();

generator.next(); // start

console.log( 'przejmujemy z powrotem kontrolę' );

generator.next( 'również dowolna wartość' ); // stop

function* myGenerator() {
	console.log( 'start' );

	yield 'dowolna wartość';

	console.log( 'stop' );
}
```

Powyższy kod wyświetli w konsoli następujące komunikaty:

* `start`,
* `przejmujemy z powrotem kontrolę`,
* `stop`.

Dzięki temu, że `yield` mogło zwracać do głównego flow dowolną wartość, można było zwrócić `Promise`, które wykonywało swoją operację poza generatorem, a następnie wynik tej operacji był przekazywany z powrotem do generatora przy pomocy metody `next`. Swego czasu [dokładniej opisywałem ten mechanizm](https://webroad.pl/javascript/746-synchroniczna-asynchronicznosc).

Jeśli komuś przywodzi to coś na myśl, to tak, w bardzo podobny sposób działa nowsza składnia `async`/`await`:

```javascript
run();

async function run() {
	const response = await doAjax();
	const parsed = await parseResponse( response );

	displayResponse( parsed );
}
```

Tym sposobem dotarliśmy do kodu, który jest asynchroniczny, ale – nie licząc słówka `await` – wygląda tak samo jak kod synchroniczny.

## Przekazywanie sterowania

Zarówno generator, jak i składnia `async`/`await`, opierają się na mechanizmie, który można nazwać "przekazywaniem sterowania". W generatorze jest to o wiele bardziej widoczne, ponieważ nowa składnia ukrywa wszelkie szczegóły implementacyjne przed nami.  Kiedy generator używa `yield`, by zwrócić jakąś wartość, przekazuje tym samym sterowanie do miejsca, w którym wywołaliśmy generator. I to od tego miejsca zależy, czy i kiedy sterowanie powróci z powrotem do wnętrza generatora. Momentem powrotu do generatora może być właśnie wykonanie jakiejś operacji asynchronicznej.

Niemniej, jeśli przyjrzymy się dokładniej JavaScriptowi, odkryjemy, że istnieje w nim przynajmniej jeszcze jeden mechanizm pozwalający przekazać sterowanie w inne miejsce kodu: `try`/`catch`.

```javascript
try {
	console.log( 'start' );

	throw 'dowolna wartość';

	console.log( 'stop' );
} catch( e ) {
	console.log( 'przejmujemy sterowanie' );
}
```

{% note %}Warto zauważyć, że `throw` działa z dowolną wartością, nie tylko obiektem `Error`. To sprawia, że można rzucić np. `Promise`.{% endnote %}

Powyższy kod wyświetli w konsoli:

* `start`,
* `przejmujemy sterowanie`.

Jak widać zatem, `throw` przerzuciło nas do bloku `catch`. Niemniej, w przeciwieństwie do wcześniej omawianych mechanizmów, nie istnieje sposób na powrót do wnętrza bloku `try`. Trzeba zatem obejść ten problem!

## Kalekie `async`/`await` w ES3

Załóżmy, że nasz projekt używa biblioteki do `Promise`, która działa tak samo jak te natywne. W chwili, gdy operacja asynchroniczna wewnątrz `Promise` się skończy, chcielibyśmy wrócić do naszego kodu. Niemniej musimy jakoś poinformować `catch`, gdzie dokładnie ma wrócić. W przypadku generatorów i `async`/`await` odpowiedzialne za to były odpowiednie słowa kluczowe (`yield` i `await`). W naszym przypadku słów kluczowych nie możemy użyć. Ale możemy spróbować zastąpić je funkcją!

```javascript
var asyncCallback;

try {
	console.log( 'start' );

	resume( function() { // 4
		console.log( 'stop' );
	} );

	throw asyncOperation(); // 1
} catch( e ) {
	if ( !( e instanceof Promise ) ) {
		throw e;
	}

	console.log( 'przejmujemy sterowanie' );

	e.then( function() { // 2
		asyncCallback(); // 3

		asyncCallback = '';
	} );
}

function resume( fn ) {
	asyncCallback = fn; // 5
}

function asyncOperation() {
	return new Promise( function( resolve ) {
		setTimeout( resolve, 1000 );
	} );
}
```

Powyższy kod wyświetli nam w konsoli:

* `start`,
* `przejmujemy sterowanie`,
* `stop`.

Niemniej co się dokładnie dzieje? Wewnątrz bloku `try` rzucamy operacją asynchroniczną (1). Blok `catch` następnie czeka, aż zwrócony `Promise` się rozwiąże (2) i wywołuje callback zapisany w zmiennej `asyncCallback` (3). To, jaka funkcja dokładnie ma zostać wywołana, jest ustalane przez funkcję `resume` (4), która do zmiennej `asyncCallback` przekazuje swój argument (5). Funkcja `resume` w powyższym kodzie jest odpowiednikiem słowa kluczowe `await` i określa miejsce, do którego ma powrócić sterowanie w bloku `try`. Jedynym mankamentem jest fakt, że musi być wywołana **przed** `throw` – inaczej nigdy nie powrócimy do bloku `try`. Instrukcja `throw` bowiem kategorycznie kończy wykonywanie kodu w danym bloku.

Prawdę mówiąc nie wiem, czy taki sposób obsługi asynchroniczności jest bardziej intuicyjny od tradycyjnych callbacków, czy nie. Na pewno jest niezwykle pomysłowy i pozwala ominąć problem tzw. [callback hell](http://callbackhell.com/). Natknąłem się na niego w starym, poczciwym [YUI.Test](https://yuilibrary.com/yui/docs/test/).

I to by było na tyle. Miłej kontemplacji przyjemnej asynchroniczności w nowoczesnym JS-ie!
