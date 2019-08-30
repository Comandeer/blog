---
layout: post
title:  "Ujemne indeksy tablicy"
author: Comandeer
date:   2019-08-30 21:10:00 +0200
categories: javascript
comments: true
permalink: /ujemne-indeksy-tablicy.html
---

Jedną z ciekawszych rzeczy w języku Python są bez wątpienia ujemne indeksy tablic (list). Służą one do operowania na tablicy "od tyłu". Na przykład:

```python
arr = [ 1, 2, 3, 4, 5 ]

print( arr[ -1 ] ) # 5
print( arr[ -2 ] ) # 4

arr[ -3 ] = 21
print( arr[ 2 ] ) # 21
```

Żeby dostać się do ostatniego elementu tablicy, można się posłużyć indeksem `-1`, do przedostatniego – `-2` itd.

Zobaczmy zatem, czy i jak da się przenieść podobną możliwość do JS-a!

## Tworzenie podklas

Najbardziej elegancko byłoby nasze rozwiązanie oprzeć o stworzenie podklasy wbudowanej klasy `Array`.

Składnia klas wprowadzona w ES6 w dużej mierze jest po prostu cukrem składniowym przysypującym prototypy. Prosta klasa jest tak naprawdę odpowiednikiem konstruktora z `prototype`:

```javascript
class Klass {
	method() {}
}

// to de facto to samo co

function Klass() {}
Klass.prototype.method = function() {};
```

Niemniej jedna rzecz jest dostępna tylko przy użyciu nowej składni, a jest to możliwość rozszerzania natywnych klas, takich jak `Array`.

– Ale zaraz, zaraz! – zakrzyknie co bardziej rozgarnięty Czytelnik. – Przecież takie rzeczy można było robić już wcześniej!

Faktycznie, w ES5 można było stworzyć nowy konstruktor oparty o `Array`:

```javascript
function MyArray( arguments ) {
	Array.apply( this, arguments );
};
MyArray.prototype = [];

var myArray = new MyArray();
```

Niemniej mimo że `myArray` było instancją `Array`, równocześnie… nie było tablicą. Można to łatwo udowodnić, pokazując, że `Array.isArray` zwraca `false` oraz że własność `length` nie jest uaktualniana wraz z dodawaniem/usuwaniem elementów:

```javascript
var myArray = new MyArray();

console.log( myArray instanceof Array ); // true
console.log( Array.isArray( myArray ) ); // false

myArray[ 0 ] = 'whatever';

console.log( myArray.length ); // 0
```

I tutaj na scenę wkracza ES6 ze swoją składnią klas:

```javascript
class MyArray extends Array {}

const myArray = new MyArray();

console.log( myArray instanceof Array ); // true
console.log( Array.isArray( myArray ) ); // true

myArray[ 0 ] = 'whatever';

console.log( myArray.length ); // 1
```

Jak widać, teraz wszystko działa tak, jak powinno. Dzieje się tak, ponieważ `extends` pozwala także na dziedziczenie wszelkich niestandardowych zachowań tzw. [obiektów egzotycznych](https://tc39.es/ecma262/#sec-exotic-object). Jak się nietrudno domyślić, `Array` to właśnie przykład obiektu egzotycznego. Oznacza to mniej więcej tyle, że w jego zachowaniu pojawia się odstępstwo w stosunku do innych, "normalnych" obiektów w JS. W przypadku tablic tym odstępstwem jest oczywiście dostęp (dodawanie/usuwanie) do elementów tablicy przy pomocy indeksów numerycznych oraz powiązana z tym własność `length`. 

<p class="note"><a href="https://exploringjs.com/es6/ch_classes.html#_why-cant-you-subclass-built-in-constructors-in-es5" rel="noreferrer noopener">Więcej o różnicy pomiędzy dziedziczeniem w ES5 i ES6 napisał Axel Rauschmayer</a>.</p>

Zaopatrzeni w tę wiedzę, napiszmy szkielet naszego rozwiązania:

```javascript
class NegativeArray extends Array {}
```

## Obsługa ujemnych indeksów

Podklasa `NegativeArray` załatwia nam wszelkie problemy z `length` i dostępem przy pomocy dodatnich indeksów. Niemniej wciąż nie dodaliśmy obsługi _ujemnych_ indeksów. Problem z nimi polega na tym, że tak naprawdę nie istnieją i są tylko innym sposobem zapisu dodatnich indeksów:

```javascript
const negativeArray = new NegativeArray( 1, 2, 3, 4 );

negativeArray[ 3 ] === negativeArray[ -1 ];
negativeArray[ 0 ] === negativeArray[ -4 ];
```

Teoretycznie możemy przy tworzeniu tablicy dodać jako nowe własności ujemne indeksy, ale szybko zauważymy, że takie rozwiązanie się nie skaluje. Musielibyśmy odświeżać indeksy przy każdej zmianie zawartości tablicy.

O wiele prostszym rozwiązaniem wydaje się przechwycenie dostępu do wszystkich indeksów i przetłumaczenie tych ujemnych na odpowiednie dodatnie. Coś podobnego na tym blogu już kiedyś robiliśmy – [uniwersalny getter](/uniwersalny-getter.html)! W tym przypadku również `Proxy` sprawdzi się bardzo dobrze.

Wykorzystamy tutaj też pewną mało znaną cechę konstruktorów w JS: jeśli zwrócą obiekt, zastąpi on obiekt, który został stworzony przez konstruktor.

```javascript
class Klass {
	constructor() {
		this.a = 1;

		return {
			b: 2
		};
	}
}

const klass = new Klass();

console.log( klass.a ); // undefined
console.log( klass.b ); // 2
console.log( klass instanceof Klass ); // false
```

Dzięki temu, zamiast zwracać bezpośrednio stworzoną tablicę, zwrócimy `Proxy`, które pozwoli nam na przechwycenie dostępu do poszczególnych elementów tablicy:

```javascript
class NegativeArray extends Array {
	constructor( ...args ) {
		super( ...args );

		return new Proxy( this, {} );
	}
}
```

Odczytywanie elementów z tablicy uruchamia pułapkę `get`. Zanim jednak pobierzemy odpowiedni element, musimy zmienić ujemny indeks na dodatni. Posłuży nam do tego prywatna funkcja `translateProperty`:

```javascript
function translateProperty( target, property ) { // 1
	const propertyAsNumber = Number( property ); // 2

	if ( Number.isNaN( propertyAsNumber ) || propertyAsNumber > 0 ) { // 3
		return property; // 4
	}

	const translatedProperty = target.length - Math.abs( propertyAsNumber ); // 5

	if ( translatedProperty < 0 ) { // 6
		throw new RangeError( 'Array index out of range' ); // 7
	}

	return translatedProperty; // 8
}
```

Jako parametry (1) przekazujemy tablicę (`target`), dla której chcemy ustalić indeks, oraz nazwę pobieranej własności (`property`). Z racji tego, że każda nazwa własności jest przekazywana jako ciąg tekstowy, to żeby sprawdzić, czy mamy do czynienia z indeksem tablicy, przeprowadzamy konwersję do liczby (2). Jeśli jako wynik uzyskamy `NaN` (a więc: jeśli własność nie jest liczbą) albo liczbę dodatnią (3), po prostu zwracamy tę własność (4). W innym wypadku uzyskujemy dodatni indeks poprzez odjęcie od długości tablicy wartości absolutnej indeksu (5). Z racji tego, że długość tablicy jest zawsze o jeden dłuższa niż ostatni indeks w tablicy, niweluje to różnicę wynikają z faktu, że negatywne indeksy są numerowane od `-1`. Jeśli wynik takiego obliczenia jest ujemny (6) – a zatem: jeśli ktoś chce się cofnąć dalej niż wszystkie elementy w tablicy – rzucamy odpowiedni błąd (7). Jeśli uzyskaliśmy indeks dodatni, zwracamy go (8).

Teraz wystarczy dorzucić tę funkcję na początek pułapki `get` naszego proxy:

```javascript
class NegativeArray extends Array {
	constructor( ...args ) {
		super( ...args );

		return new Proxy( this, {
			get( target, property, ...args ) {
				const translatedProperty = translateProperty( target, property );

				return Reflect.get( target, translatedProperty, ...args );
			}
		} );
	}
}
```

I tym sposobem mamy obsługę dostępu do elementów tablicy przy pomocy ujemnych indeksów:

```javascript
const array = new NegativeArray( 1, 2, 3, 4 );

console.log( array[ -1 ] ); // 4
```

W analogiczny sposób możemy dodać obsługę modyfikowania elementów tablicy przy pomocy ujemnych indeksów:

```javascript
class NegativeArray extends Array {
	constructor( ...args ) {
		super( ...args );

		return new Proxy( this, {
			get( target, property, ...args ) {
				[…]
			},

			set( target, property, value, ...args ) {
				const translatedProperty = translateProperty( target, property );

				return Reflect.set( target, translatedProperty, value, ...args );
			}
		} );
	}
}
```

To powinno dodać obsługę przypisywania wartości do ujemnych indeksów:

```javascript
array[ -2 ] = 6;
console.log( array ); // [ 1, 2, 6, 4 ]
```

## Podsumowanie

[Całość rozwiązania można znaleźć na GitHubie](https://gist.github.com/Comandeer/e5a6fc4e91a267ea4af2ec64563ce57c).

Możliwości, jakie daje nam `Proxy`, są naprawdę spore i wykraczają daleko poza to, co pokazałem w artykułach na blogu. Na pewno będę jeszcze do tego tematu wracać, bawiąc się różnymi innymi rzeczami w JS.

Przy okazji pozdrawiam Gothdo, którego [projekt `one-based-array`](https://github.com/Gothdo/one-based-array) natchnął mnie do napisania tego artykułu.