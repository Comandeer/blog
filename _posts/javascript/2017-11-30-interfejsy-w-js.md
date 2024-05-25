---
layout: post
title:  "Interfejsy w JS"
author: Comandeer
date: 2017-11-30T23:15:00+0100
categories: javascript
comments: true
permalink: /interfejsy-w-js.html
redirect_from:
    - /javascript/2017/11/30/interfejsy-w-js.html
---

Wszyscy kochamy Javę, dlatego wszyscy chcemy interfejsów w JS, prawda?

## Po co mi to?

Interfejsy w "typowych" językach programowania są zbiorem metod, które musi posiadać klasa implementująca dany interfejs. Przykładowy interfejs w PHP wygląda tak:

```php
interface WebKrytyk {
	public function rateSite();
	public function writeArticle();
}
```

Natomiast klasa go implementująca tak:

```php
class Comandeer implements WebKrytyk {
	public function rateSite() {
		return 'Gniot';
	}

	public function writeArticle() {
		return 'Meh';
	}
}
```

Gdybyśmy się przyjrzeli bliżej temu mechanizmowi, zauważylibyśmy, że interfejsy na dobrą sprawę są bardzo biedne: ani nie można w nich zrobić normalnych metod (można im nadać tylko nazwę i parametry), ani nie można stworzyć instancji danego interfejsu. Dopiero jak jakaś klasa łaskawie go zaimplementuje, to na coś się przydaje… No właśnie: na co?

Istnieje taka bardzo ładna definicja, że interfejs definiuje kontrakt pomiędzy klasą a jej otoczeniem  i określa zachowanie klasy. Mówiąc prościej: interfejs to po prostu taka etykieta, którą się przykleja do klasy i która mówi nam, że to coś jest zgryźliwym WebKrytykiem i robi to i to. I gdy nasz zgryźliwy WebKrytyk tego nie robi, dostajemy błąd.

Choć nie brzmi to jakoś super użytecznie, to wyobraźmy sobie, że oprócz Comandeera jest kilku innych WebKrytyków:

```php
class SuperComandeer implements WebKrytyk {
	[…]
}

class UberComandeer implements WebKrytyk {
	[…]
}

class TotalComandeer implements WebKrytyk {
	[…]
}
```

Co bardziej rozgarnięty czytelnik od razu zakrzyknie: "Zaraz, zaraz – to przecież można dziedziczeniem zrobić!". No niby można, ale każdy autor na WebKrytyku ma swój własny, unikalny styl. Gdybyśmy chcieli dziedziczyć po podstawowej klasie `WebKrytyk`, to musielibyśmy i tak wszystko nadpisać. Poza tym dziedziczenie z góry narzuca myślenie, że coś od czegoś pochodzi – a przecież `WebKrytyk` nie jest prymitywniejszą formą `SuperComandeer`a; to wyłącznie nazwa jego stanowiska. `WebKrytyk` określa to, dlaczego `Comandeer` na blogu _zachowuje się_ w taki sposób, podczas gdy na co dzień jest bardzo miłym gościem.

I poprzez te małe przesunięcia semantyczne doszliśmy do momentu, w którym zapragnąłem mieć interfejsy w JS, żeby móc lepiej wyrażać to, co mój kod robi, bo dziedziczenie nie do końca oddaje to, co chcę powiedzieć.

## Interfejsy w JS

Oczywiście w JS interfejsów nie ma, mamy wyłącznie klasy. Owszem, jest [propozycja dodania interfejsów do standardu](https://github.com/michaelficarra/proposal-first-class-protocols), ale jest na tyle dziwaczna, że nigdy nie przykuła mojej uwagi. Chcę coś, co działa choćby ciutkę podobnie do tego, co znam z PHP czy Javy. Czy da się cokolwiek zrobić?

Otóż istnieje pewien bardzo srogi hack, który pozwala nam emulować interfejsy… przy pomocy dziedziczenia. Niestety, jest to na tyle srogi hack, że działa wyłącznie w chwili wykonywania kodu, nie zaś – w chwili interpretacji/kompilacji (jak w PHP czy Javie). Niemniej wciąż uważam tę metodę za dość użyteczną, pozwalającą nam na wymuszanie na użytkownikach naszego kodu grania według naszych zasad. Załóżmy, że nasza aplikacja obsługuje system pluginów i jedynie klasy implementujące "interfejs" `Plugin` są uznawane za poprawne:

```javascript
if ( !( plugin instance of Plugin ) ) {
	throw new Error( 'Chcę tylko pluginy!' );
}
```

Wypada zatem zacząć od stworzenia klasy `Plugin`:

```javascript
class Plugin {}
```

### Metody

Załóżmy, że każdy plugin powinien mieć metodę `exec`, która będzie odpowiedzialna za wykonywanie logiki. Oczywistym jest, że każdy plugin będzie mieć swoją własną logikę, więc nie ma sensu robić bazowej implementacji. Niemniej JS nie będzie miało żadnego problemu z takim kodem:

```javascript
class Plugin {
	exec() {}
}

class MyPlugin extends Plugin {}

const myPlugin = new MyPlugin();

myPlugin.exec(); // ups…
```

Jak poinformować jego użytkownika, że powinien zaimplementować swoją własną metodę `exec`? Najprostszym sposobem jest wyrzucenie błędu:

```javascript
class Plugin {
	exec() {
		throw new Error( 'Musisz mnie najpierw zaimplementować!' );
	}
}

class MyPlugin extends Plugin {}

const myPlugin = new MyPlugin();

myPlugin.exec(); // I dostajemy błąd!
```

W chwili, gdy użytkownik zaimplementuje swoją własną wersję metody `exec`, kod będzie działał w pełni poprawnie. Tutaj przychodzi nam bowiem w sukurs dziedziczenie. Jeśli użytkownik nie stworzył własnej wersji `exec`, zostanie użyta ta bezpośrednio z `Plugin`.

Największą bolączką jest fakt, że o tym błędzie użytkownik dowie się jedynie, gdy spróbuje użyć takiego pluginu… ale to wciąż lepiej niż całkowity brak błędu!

### Konstruktor

Prawdziwych interfejsów nie można instancjonować, ponieważ nie ma to po prostu sensu. Nie zawierają wszak metod a jedynie ich sygnatury. Dlatego naszego "interfejsu" też nie powinno się dać. Jak to osiągnąć?

Okazuje się, że istnieje sposób, aby napisać konstruktor tak, żeby reagował tylko wtedy, gdy jest wywoływany w taki sposób:

```javascript
new Plugin();
```

Jak to zrobić? Przy pomocy nowego ustrojstwa z ES6, `new.target`:

```javascript
class Plugin {
	constructor() {
		if ( new.target === Plugin ) {
			throw new Error( 'Klasa Plugin nie jest klasą!' );
		}
	}
}

class MyPlugin extends Plugin {}

new MyPlugin(); // Wszystko OK
new Plugin(); // Błąd
```

Co `new.target` robi? Jest to nowa "własność", dostępna w każdej funkcji, która określa, czy dana funkcja została wywołana ze słowem kluczowym `new`, a jeśli tak – dla jakiej konkretnie klasy. Choć druga część tego zdania zdaje się nie mieć sensu (przecież chyba wiemy, jaką funkcję wywołujemy!), to nie należy zapominać, że w przypadku dziedziczenia – tak jak to pokazano na powyższym przykładzie – konstruktor klasy-rodzica jest wywoływany dla klasy-dziecka:

```javascript
class Parent {
	constructor() {
		console.log( new.target );
	}
}

class Child extends Parent {}

new Parent(); // Parent
new Child(); // Child
```

W przypadku, gdy funkcja jest wywoływana bez słowa kluczowego `new`, `new.target` jest równe `undefined`:

```javascript
( function() {
	console.log( new.target ); // undefined
}() );
```

### Cała logika w konstruktorze

Można też nasz psedointerfejs nieco podrasować i przerzucić całą logikę do konstruktora, co pozwoli nam znaleźć niezaimplementowane metody już w czasie tworzenia instancji danego pluginu:

```javascript
class Plugin {
	constructor() {
		if ( new.target === Plugin ) {
			throw new Error( 'Klasa Plugin nie jest klasą!' );
		}

		if ( Reflect.getPrototypeOf( this ).exec === Reflect.getPrototypeOf( Plugin ).exec ) {
			throw new Error( 'Musisz mnie najpierw zaimplementować!' );
		}
	}

	exec {}
}
class MyPlugin extends Plugin {}

const myPlugin = new MyPlugin();
```

Żeby sprawdzić, czy dana metoda jest zaimplementowana, wykorzystuję `Reflect.getPrototypeOf`, który pobiera prototyp wskazanego obiektu. Z racji tego, że definicja metod w klasie przypisuje je do prototypu, w ten sposób można sprawdzić, czy istniejąca w naszym pluginie metoda `exec` nie jest przypadkiem tą samą, co ta w bazowej klasie `Plugin`.

## Robimy prostą funkcję od tego

Oczywiście nie byłbym sobą, gdybym nie postanowił zrobić z tego małej funkcji, która definiowałaby dla nas interfejsy:

```javascript
function createInterface( methods ) {
	return class Interface {
		constructor() {
			if ( new.target === Interface ) {
				throw new Error( 'Interfaces could not be instantiated' );
			}

			methods.forEach( ( method ) => {
				if ( Reflect.getPrototypeOf( this )[ method ] === Reflect.getPrototypeOf( Interface )[ method ] ) {
					throw new Error( `You must implement ${ method } method` );
				}
			} );
		}
	}
}

const Plugin = createInterface( [ 'exec' ] );

class MyPlugin extends Plugin {
}

const myPlugin = new MyPlugin(); // You must implement exec method
```

Jeśli ktoś byłby zainteresowany, o co chodzi z tym `class Interface`, to odsyłam do [artykułu Kangaxa o named function expressions](https://kangax.github.io/nfe/). Co prawda traktuje on o funkcjach, ale mechanizm w przypadku klas jest w pełni analogiczny.

Na chwilę obecną, niestety, nie da się tego bardziej podrasować i zostajemy z klasą, której nie da się instancjonować i która rzuca błędy. Bardziej interfejsowa implementacja wymaga już zwrócenia się o pomoc do narzędzi pokroju TypeScripta czy przynajmniej pluginu do Babela.
