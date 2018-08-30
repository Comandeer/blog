---
layout: post
title:  "Kwacze jak kaczka…"
author: Comandeer
date:   2018-08-30 23:55:00 +0100
categories: javascript
comments: true
---

Typy proste w JavaScript są nieco specyficzne, bo można ich używać jak obiekty. W końcu kto z nas nie użył nigdy metody `replace` na zwykłym ciągu tekstowym? Ale czy da się zrobić na odwrót, czyli potraktować obiekty jak typy proste?

## Problem: tekstowa reprezentacja obiektów

Wyobraźmy sobie, że mamy klasę `Person` reprezentującą osobę. Ma ona jedną własność, `name`, ustawianą w konstruktorze:

```javascript
class Person {
	constructor( name ) {
		this.name = name;
	}
}
```

Chcemy, żeby obiekty tej klasy zachowywały się jak ciągi tekstowe w miejscach, w których spodziewamy się ciągów tekstowych, czyli zamiast klasycznego `[object Object`] chcemy wyświetlać imię osoby:

```javascript
const person = new Person( 'Comandeer' );

console.log( `${ person }` ); // Comandeer
```

## Symbole na ratunek

Tradycyjnie wszystkie obiekty w JS po przerobieniu na ciąg tekstowy mają postać `[object Object]`. Niektóre wbudowane obiekty zamiast tego zwracają nieco bardziej rozbudowane informacje, np.:

```javascript
String( Math ); // [object Math]
String( document.body ); // [object HTMLBodyElement]
String( Function ); // function Function() { [native code] }
```

W przypadku funkcji – jak zresztą widać po `Function` – konwersja na ciąg tekstowy zwraca ciało funkcji:

```javascript
function fn() { alert( 1 ); }

String( fn ); // function fn() { alert( 1 ); }
```

Od ES6 możemy zmienić to, co zwraca konwersja obiektu na typ prosty. Służą do tego dwa z tzw. dobrze znanych symboli (ang. <i lang="en">well-known symbols</i>): [`Symbol.toStringTag`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag) oraz [`Symbol.toPrimitive`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive).

<p class="note">Dobrze znane symbole to sposób na nadpisanie części mechanizmów wbudowanych w język JS, np. protokołu iteracji.</p>

### Symbol.toStringTag

To mniej przydatny z tej dwójki. Podmienia nazwę obiektu w znanym już nam `[object CośTam]`:

```javascript
class Person {
	[…]
    get [Symbol.toStringTag]() {
        return this.name;
    }
}

const person = new Person( 'Comandeer' );

console.log( `${ person }` ); // [object Comandeer]
```

Nie do końca o taki efekt nam chodziło, więc przyjrzyjmy się drugiemu symbolowi…

### Symbol.toPrimitive

Ten symbol jest zdecydowanie bardziej przydatny, bo pozwala całkowicie nadpisać zachowanie związane z konwersją:

```javascript
class Person {
	[…]
    [Symbol.toPrimitive]() {
        return this.name;
    }
}

const person = new Person( 'Comandeer' );

console.log( `${ person }` ); // Comandeer
```

I oto właśnie nam chodziło! Niemniej wypada zauważyć, że ten symbol służy do konwersji obiektu na _dowolny_ typ prosty, nie tylko na ciąg tekstowy. Pożądany typ wyniku jest przekazywany jako parametr `hint` do metody `[Symbol.toPrimitive]`. Załóżmy, że oprócz imienia każdy obiekt `Person` przechowuje także wiek osoby we własności `age` i w chwili, gdy chcemy obiekt tej klasy skonwertować na liczbę, właśnie on jest zwracany. Zmodyfikujmy zatem odpowiednio kod:

```javascript
class Person {
	constructor( name, age ) { // 1
		this.name = name;
		this.age = age; // 2
	}

    [Symbol.toPrimitive]( hint ) { // 3
		if ( hint === 'number' ) { // 4
			return this.age; // 5
		}

		return this.name; // 6
    }
}

const person = new Person( 'Comandeer', 18 );
console.log( String( person ) ); // Comandeer
console.log( Number( person ) ); // 18
console.log( Boolean( person ) ); // true
```

Dodaliśmy nowy parametr do konstruktora, `age` (1). Przypisujemy jego wartość do własności `age` nowego obiektu (2). Następnie, w metodzie `[Symbol.toPrimitive]` dodaliśmy parametr `hint` (3). Jeśli jego wartość równa się `'number'` (4), to zwracamy wiek osoby (5). W innych wypadkach (a zatem – w wypadku `'string'` i `'default'`) zwracamy imię osoby (6).

Wszystko działa, _ale_… wypada rozpatrzyć, kiedy pojawia się konwersja typu `'default'`. Odpowiedź "wtedy, kiedy nie jest ani `'string'`, ani `'number'`" jest technicznie poprawna, ale całkowicie nieprzydatna.

Konwersja typu `'default'` zachodzi wtedy, gdy silnik JS "nie wie", jaki typ ma zostać zwrócony. Najprostszym tego przykładem jest operator `+`, który działa dla ciągów tekstowych jako konkatenacja, a dla liczb – jako typowy operator dodawania. Wybierając zwracanie nazwy osoby dla każdego nieliczbowego przypadku doprowadziliśmy do typowego nietypowego zachowania JS-a:

```javascript
console.log( person + 1 ); // Comandeer1
```

Jeśli takie zachowanie nie jest pożądane, wypada zmienić obsługę konwersji i to `'string'` traktować jako specjalny przypadek, nie `'number'`.

Innym przykładem konwersji typu `'default'` jest operator równości (`==`). W tym wypadku wymuszamy porównanie przy pomocy imienia osoby, co wydaje się lepszym sposobem niż porównywanie po wieku (imiona są bardziej unikalne).

Natomiast konwersja typu `'default'` nie zachodzi w czasie konwersji na typ boolowski i obiekty w JS zawsze zwracają `true`. A szkoda, bo byłby to dobry materiał na trolling.

<p class="note">Istnieje jeden, szczególny przypadek obiektu, który zwraca <code>false</code> po konwersji na typ boolowski. Jest to <a href="https://html.spec.whatwg.org/multipage/common-dom-interfaces.html#the-htmlallcollection-interface" hreflang="en" rel="noreferrer noopener"><code>document.all</code></a>.</p>

## Internet Explorer atakuje!

Zaimplementowaliśmy konwersję przy pomocy symboli, więc fajrant, co? Figa! Szef chce wsparcia dla Internet Explorera 8!

I zanim zaczniesz wyrywać włosy z głowy, pozwól, że przedstawię Ci parę niezwykle pomocnych metod – [`valueOf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/valueOf) i [`toString`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString).

<p class="note">Co prawda wsparcie dla IE8 wymusza używanie starej składni ES5, ale pozwólcie, że założę istnienie <a href="http://babeljs.io/" hreflang="en" rel="noreferrer noopener">Babela</a> gdzieś po drodze.</p>

### toString

Ta metoda jest wywoływana zawsze wtedy, gdy trzeba przekonwertować obiekt na ciąg tekstowy. Czyli nadaje się idealnie do naszego podstawowego założenia o zamianie obiektu na tekst!

```javascript
class Person {
	constructor( name, age ) {
		this.name = name;
		this.age = age;
	}

    toString() {
		return this.name;
    }
}

const person = new Person( 'Comandeer', 18 );
console.log( String( person ) ); // Comandeer
console.log( Number( person ) ); // NaN
console.log( Boolean( person ) ); // true
```

Jak widać, otrzymaliśmy dla konwersji na ciąg tekstowy i wartość boolowską poprawne wyniki (co dla tego drugiego nie jest zaskoczeniem, bo obiekty zawsze konwertowane są do `true`), ale już dla liczby otrzymaliśmy `NaN`. Wynika to z faktu, że `toString`, w razie nieobecności `valueOf`, jest wykorzystywane również do konwersji na liczby. A ciąg tekstowy przepuszczony przez `Number` zwraca właśnie `NaN`.

### valueOf

Ta metoda jest wywoływana zawsze wtedy, gdy trzeba przekonwertować obiekt na dowolny typ prosty (oprócz wartości boolowskiej, bo każdy obiekt zawsze zwraca `true`!). W przeciwieństwie jednak do `[Symbol.toPrimitive]` nie dostajemy żadnej informacji o tym, jakiej wartości zwrotnej program oczekuje. Tym samym metoda ta zawsze, bez względu na okoliczności, zwróci ten sam wynik. Stąd przyjęło się, że najlepiej implementować ją razem z `toString`, które będzie zwracać tekstową reprezentację obiektu, podczas gdy `valueOf` będzie zwracać liczbową. Dodajmy zatem `valueOf` zwracające wiek osoby:

```javascript
class Person {
	constructor( name, age ) {
		this.name = name;
		this.age = age;
	}

    toString() {
		return this.name;
    }

	valueOf() {
		return this.age;
	}
}

const person = new Person( 'Comandeer', 18 );
console.log( String( person ) ); // Comandeer
console.log( Number( person ) ); // 18
console.log( Boolean( person ) ); // true
```

Działa!

Jak można się domyślić, w przypadku braku `toString` `valueOf` zostanie użyte również w czasie konwersji do ciągu tekstowego.

## Bonus

A co jeśli chcemy, aby nasza klasa `Person`, zamiast zwracać swoje ciało, wyświetlała ładne `[class Person]`? Wystarczy dodać statyczną metodę `toString`, nadpisując natywne zachowanie dla funkcji!

```javascript
class Person {
	static toString() {
		return '[class Person]'
	}
    […]
}

const person = new Person( 'Comandeer', 18 );
console.log( String( person ) ); // Comandeer
console.log( String( Person ) ); // [class Person]
```

PS Przedstawioną w tym artykule technikę można mocno rozbudować, symulując [przeciążanie operatorów](http://2ality.com/2011/12/fake-operator-overloading.html).
