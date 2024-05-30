---
layout: post
title:  "Kreda, czyli reakcja łańcuchowa"
description: "Jak odtworzyć API Chalka przy użyciu proxy?"
author: Comandeer
date: 2024-05-01T00:25:00+0200
tags:
    - javascript
    - eksperymenty
comments: true
permalink: /kreda-czyli-reakcja-lancuchowa.html
---

Node.js w wersji 21.7.0 dodał [natywne wsparcie dla kolorków w terminalu](https://nodejs.org/docs/latest-v21.x/api/util.html#utilstyletextformat-text), yay! Teraz można łatwo i przyjemnie stylować tekst w terminalu:

```javascript
import { styleText } from 'node:util';

console.log( util.styleText( 'underline', util.styleText( 'italic', 'Podkreślony, pochylony tekst' ) ) ),
```

Hmm, powiedziałem _łatwo i przyjemnie_… A mówiąc to, mam na myśli tak naprawdę to, w jaki sposób zachowuje się [Chalk](https://www.npmjs.com/package/chalk):

```javascript
import chalk from 'chalk';

console.log( chalk.underline.italic( 'Podkreślony, pochylony tekst' ) );
```

Zdecydowanie czytelniej i jakoś tak _milej_. No więc postanowiłem spróbować dorobić taki interfejs do natywnego wsparcia kolorków.<!--more-->

## Kreda

Owocem mojego eksperymentu jest pakiet [`kreda`](https://www.npmjs.com/package/kreda). Używa on pod spodem [moich ulubionych proxy](https://blog.comandeer.pl/uniwersalny-getter.html). Czemu zdecydowałem się na ich użycie? Przyjrzyjmy się łańcuszkowi stworzonemu przez Chalk. Widzimy, że mamy tam własność `underline` oraz metodę `italic()`. Jak na razie wygląda to jak typowe zastosowanie techniki chainingu (łańcuchowania). Coś typu:

```javascript
class Chalk { // 1
	underline = this; // 2

	italic() { // 3
		return this; // 4
	}
}

const chalk = new Chalk(); // 5

chalk.underline.italic( 'Jakiś tekst' ); // 6
```

Mamy sobie klasę `Chalk` (1), która ma własność `underline` (2) oraz metodę `italic()` (3). Metoda ta zwraca `this` (4), podobnie jak własność. Dzięki temu w momencie, gdy stworzymy sobie instancję tej klasy (5), możemy tworzyć łańcuszek (6).

Tylko że pojawia się drobny problem:

```javascript
// To też działa:
chalk.italic.underline( 'Jakiś tekst' );
```

Innymi słowy: w Chalku każda własność może być równocześnie metodą, jeśli zajdzie taka potrzeba. I na odwrót: każda metoda to też własność. Stąd moim pierwszym skojarzeniem były proxy – one wszak pozwalają na dziwną magię w obiektach.

I faktycznie, udało mi się stworzyć prosty mechanizm, który tak się zachowuje!

```javascript
const kreda = createProxy( [] ); // 2

function createProxy( modifiers ) { // 1
	return new Proxy( () => {}, { // 3
		get( target, property ) { // 4
			return createProxy( [ ...modifiers, property ] ); // 6
		},
		apply( target, thisArg, args ) { // 5
			return style( modifiers, ...args ); // 7
		}
	} );
}
```

Stworzyłem funkcję `createProxy()` (1), która jako argument przyjmuje tablicę modyfikatorów (stylów tekstu). Na samym początku jest ona pusta (2). Funkcja `createProxy()` zwraca `Proxy` (3), które ma dwie pułapki – `get()` (4) do obsługi własności i `apply()` (5) do obsługi wywołania funkcji. Warto zwrócić uwagę na to, ze proxy jest tworzone na pustej funkcji strzałkowej. Inaczej pułapka `apply()` nie zadziała (dostaniemy błąd, że próbujemy wywołać coś, co nie jest funkcją)

W chwili, gdy następuje odwołanie do dowolnej własności proxy, pułapka `get()` zwraca nowe proxy (6). Jako argument przekazuje tablicę zawierającą wszystkie obecne modyfikatory + nazwę żądanej własności (np. `underline`). Z kolei, gdy ktoś chce wywołać własność, odpalana jest funkcja `style()` (7), która jako 1. argument dostaje tablicę wszystkich modyfikatorów, a jako kolejne – poszczególne argumenty przekazane do wywołania funkcji. Przykładowo:

```javascript
kreda.underline.italic( 'Test' );
// oznacza
style( [ 'underline', 'italic' ], 'Test' );
```

Sama zaś funkcja `style()` po prostu wywołuje natywną funkcję Node'a od kolorowania tekstu. Tym sposobem udało się stworzyć chalkowy łańcuszek! Jak takie coś działa, z dodatkową walidacją i kilkoma innymi ficzerami, można zobaczyć w [kodzie kredy](https://github.com/Comandeer/kreda/blob/main/src/index.ts).

## A jak to robi Chalk?

_Magicznie ✨_.

Niemniej z tego, co zrozumiałem, Chalk za każdym razem zwraca funkcję, której prototyp jest modyfikowany "na żywca" tak, aby zawierał poszczególne własności. Mniej więcej coś takiego:

```javascript
const chainPrototype = Object.defineProperties( () => {}, { // 1
	property1: {
		get() { // 2
			return createChain(); // 3
		}
	},
	property2: {
		get() {
			return createChain();
		}
	}
} );

function createChain() {
	const chain = ( text ) => { // 4
		console.log( text ); // 5
	};

	Object.setPrototypeOf( chain, chainPrototype ); // 6

	return chain; // 7
}

const chain = createChain(); // 8

chain.property1.property2( 'Powinienem się wyświetlić w konsoli' ); // 9
```

Na początku tworzony jest prototyp dla łańcucha (1). Odbywa się to przy pomocy [`Object.defineProperties()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties). Jest ono wykorzystywane z powodu możliwości definiowania w wygodny sposób getterów. Każda własność ma getter (2), który wywołuje funkcję `createChain()` (3). Funkcja ta tworzy funkcję, która ostatecznie ma zostać wywołana (4). W naszym wypadku wyświetla ona jedynie przekazany tekst w konsoli (5). Następnie do prototypu tej funkcji doczepiany jest nasz prototyp łańcucha (6). Tak zmodyfikowana funkcja jest następnie zwracana (7). Łańcuchowanie zaczyna się od przypisana wyniku `createChain()` do zmiennej (8). Dzięki temu można dowolnie łączyć ze sobą własności i każdą z nich wywoływać jak funkcję (9).

Czemu Chalk robi to w ten sposób? Jednym z powodów jest zapewne kompatybilność takiego rozwiązania, które powinno działać od Node 0.12.0 (czyli _od zawsze_). Drugi powód, który przychodzi mi na myśl, to wydajność – nie zdziwiłoby mnie, gdyby rozwiązanie oparte o `Proxy` było wolniejsze (aczkolwiek nie robiłem benchmarków). Niemniej osobiście wydaje mi się, że chalkowe rozwiązanie ma zdecydowanie wyższy [wskaźnik WTF/minuta](https://www.osnews.com/story/19266/wtfsm/), niźli rozwiązanie kredowe.

## Wielki powrót Node'a

Stylowanie tekstu w terminalu zostało przeportowane do [Node'a 20.12.0](https://nodejs.org/docs/latest-v20.x/api/util.html#utilstyletextformat-text) praktycznie bez zmian. Ale weszło też do nowego [Node'a 22](https://nodejs.org/api/util.html#utilstyletextformat-text). I tam już poprawiono ergonomię! Teraz można przekazać tablicę formatów zamiast pojedynczego formatu:

```javascript
import { styleText } from 'node:util';

console.log( util.styleText( [ 'underline', 'italic' ], 'Podkreślony, pochylony tekst' ) ),
```

Zdecydowanie przyjemniej, ale IMO wciąż łańcuszek jest nieco czytelniejszy. Nie jest to jednak aż tak duża różnica, żeby kruszyć o to kopie. Co oznacza, że `kreda` raczej nie doczeka się jakichś wielkich aktualizacji, ale mimo wszystko była ciekawym eksperymentem.

