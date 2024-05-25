---
layout: post
title:  "Reduce i formatowanie tekstu"
author: Comandeer
date: 2017-05-21T20:20:00+0200
categories: javascript daj-sie-poznac-2017
comments: true
permalink: /reduce-i-formatowanie-tekstu.html
redirect_from:
    - /javascript/daj-sie-poznac-2017/2017/05/21/reduce-i-formatowanie-tekstu.html
---

Zapewne niektórzy się oburzą, co to za obrzydłe herezje ten Comandeer głosi: jak to można używać `Array.prototype.reduce` do formatowania tekstu?! Ano, można i już demonstruję jak i po co.

## Co to za czary?

Zacznijmy od ustalenia, do czego przydaje się `Array.prototype.reduce`. Chyba najbardziej znanym przykładem jest ten z dodawaniem:

```javascript
const arr = [ 1, 5, 8, 9, 10 ];

const sum = arr.reduce( ( sum, number ) => {
	return sum + number;
} );

console.log( sum ); // 33
```

Po szybkiej analizie tego kodu można dojść do wniosku, że `Array.prototype.reduce` z całej tablicy produkuje ostatecznie jedną wartość – w tym wypadku sumę wszystkich elementów tablicy. Do każdego wywołania jako 1. parametr przekazywana jest wartość, którą chcemy ostatecznie zwrócić, natomiast jako 2. parametr – aktualny element tablicy. Wszystko, co zwrócimy, zostanie przekazane kolejnemu wywołaniu `reduce` jako 1. parametr.

Zmodyfikujmy nieco kod i zobaczmy, co dokładnie jest wywoływane:

```javascript
const arr = [ 1, 5, 8, 9, 10 ];
let i = 0;

const sum = arr.reduce( ( sum, number ) => {
	console.log( `Wywołanie #${ ++i }\tsum: ${ sum }\tnumber: ${ number }` );
	return sum + number;
} );

console.log( sum ); // 33
```

Gdy spojrzymy w konsolę przeglądarki, zobaczymy taki wynik:

```
Wywołanie #1	sum: 1	number: 5
Wywołanie #2	sum: 6	number: 8
Wywołanie #3	sum: 14	number: 9
Wywołanie #4	sum: 23	number: 10
```

Jak widać, dla 5 elementów w tablicy metoda `reduce` została wywołana tylko 4 razy. Pierwsze wywołanie nastąpiło dla drugiej wartości w tablicy (5), natomiast pod 1. parametr – przechowujący ostateczną wartość – został podstawiony po prostu 1. element tablicy. Może to sprawić pewien problem, gdy zamiast prostej wartości liczbowej będziemy mieli np. obiekty:

```javascript
const arr = [
	{
		value: 1
	},

	{
		value: 5
	},

	{
		value: 8
	},

	{
		value: 9
	},

	{
		value: 10
	}
];

const sum = arr.reduce( ( sum, number ) => {
	return sum + number.value;
} );

console.log( sum ); // [object Object]58910
```

A co tu się stało? Pomyślmy: przy 1. wywołaniu zamiast `sum` zostanie podstawiona 1. wartość w tablicy – zatem obiekt. Na tym obiekcie zostanie następnie wywołana operacja dodawania. I tutaj na scenę wkracza dynamiczne typowanie w JS: jeśli do obiektu spróbujemy dodać nie-obiekt (tekst, liczbę, booleana), najczęściej obydwie te rzeczy zostaną zamienione na tekst i dopiero wtedy połączone. Dokładnie to się tutaj stało, a przecież zupełnie nie o to nam chodziło. Na szczęście `Array.prototype.reduce` przyjmuje drugi parametr, który zostanie użyty jako wartość początkowa:

```javascript
const arr = [
	{
		value: 1
	},

	{
		value: 5
	},

	{
		value: 8
	},

	{
		value: 9
	},

	{
		value: 10
	}
];

const sum = arr.reduce( ( sum, number ) => {
	return sum + number.value;
}, 0 );

console.log( sum ); // 33
```

Niemniej nieco to nam zmieni sposób wywoływania:

```
Wywołanie #1	sum: 0	number: [object Object]
Wywołanie #2	sum: 1	number: [object Object]
Wywołanie #3	sum: 6	number: [object Object]
Wywołanie #4	sum: 14	number: [object Object]
Wywołanie #5	sum: 23	number: [object Object]
```

Tym razem `Array.prototype.reduce` zostało wywołane dla każdego elementu tablicy. Co jest zrozumiałe: wszak przekazaliśmy początkową wartość, więc 1. element tablicy trzeba do niej dodać.

## Formatujemy!

Skoro jakieś strzępki teorii już mamy, zastanówmy się, jakim to sposobem można by wykorzystać `Array.prototype.reduce` do formatowania tekstu. Może od razu wyjaśnię, że pod słowem "formatowanie" mam na myśli coś na wzór funkcji `printf` z jej licznymi parametrami. Dodatkowo use case, w którym wykorzystamy `Array.prototype.reduce` jest dość nietypowy.

Napisałem dzisiaj na kolanie prosty [generator kodu CSS](https://jsfiddle.net/Comandeer/dutuuLp9/). Przesuwamy suwaczek i zostaje nam wygenerowany kod CSS. I właśnie przy jego generowaniu wykorzystałem `Array.prototype.reduce`. Zrobiłem to, ponieważ jako dane wejściowe otrzymuję kolekcję (tablicę) `input`ów, a chcę na podstawie ich wartości wygenerować kod CSS (tekst). Jak widać chcę przerobić tablicę na pojedynczą wartość – brzmi jak dobre zastosowanie dla `Array.prototype.reduce`! Tak też zrobiłem:

```javascript
function generateCSSString( container ) {
	var filters = Array.from( container.querySelectorAll( '.filters__value' ) ); // 1

	return filters.reduce( ( code, input ) => { // 2
		code += `${ input.name }(${ input.value }${ input.dataset.unit }) `; // 3

		return code; // 4
	}, '' ) // 5
	.trim(); // 6
}
```

Co się dzieje w powyższym kodzie?

1.  Pobieram wszystkie `input`y z wartościami, na podstawie których chcę wygenerować kod CSS i z tej kolekcji robię tablicę (niestety, `NodeList` wciąż nie dochrapało się wsparcia czegokolwiek innego niż najprostszego `forEach`).
2.  Na tak powstałej tablicy wykonuję `Array.prototype.reduce`.
3.  Dla każdego `input` generuje string oparty na jego własnościach. Warto tutaj zauważyć, że wartość stworzoną na podstawie aktualnego pola **doklejam** do wcześniejszego kodu. Jest to spowodowane tym, że 1. parametr w `Array.prototype.reduce` zawsze musi zawierać pełną wartość.
4.  Tak sklejony kod zwracam.
5.  Warto przy tym zauważyć, że jako 2. parametr do `Array.prototype.reduce` przekazałem pusty ciąg tekstowy. Inaczej natknąłbym się na opisany wcześniej problem, czyli próbę dołączenia tekstu do obiektu.
6.  Uważne oko zauważy, że sposób generowania kodu sprawia, że na jego końcu będzie niepotrzebna spacja. Ten `String.prototype.trim` temu zaradzi – chociaż nie jest to najbardziej eleganckie rozwiązanie.

Według mnie takie wygenerowanie kodu CSS na podstawie wartości z wielu pól `input` jest o wiele czytelniejsze niż tradycyjna pętla po nich.

## Uniwersalny formater?

Można by się pokusić o takie zmodyfikowanie powyższej funkcji, żeby dla dowolnej tablicy obiektów zwracała ładnie sformatowany ciąg tekstowy z podstawionymi zmiennymi:

```javascript
function formatString( source, template, separator = ' ') { // 1
	return source.reduce( ( output, input ) => {
		output += template.replace( /\{\{(.+?)\}\}/g, ( match, property ) => { // 2
			property = property.trim(); // 3

			return input[ property ]; // 4
		} );

		return `${ output }${ separator }`; // 5
	}, '' )
	.trim(); // 6
}
```

Ale się porobiło! Spróbujmy to przetrawić:

1.  Definiuję funkcję `formatString`, która przyjmuje 3. parametry: tablicę obiektów z danymi (`source`), szablon, do którego dane mają być podstawione (`template`) oraz separator pomiędzy kolejnymi przerobionymi elementami tablicy (`separator`; w kodzie formatującym CSS był on na sztywno wstawiony do kodu).
2.  Z racji tego, że [template literals](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals), użyte we wcześniejszej funkcji, od razu podstawiają wszystkie wartości, trzeba było wymyślić nieco inny format szablonu. Padło na [wąsy](https://mustache.github.io/), zatem nazwy własności są wstawiane pomiędzy podwójne nawiasy klamrowe ({% raw %}`{{`{% endraw %} i {% raw %}`}}`{% endraw %}). A jak już mamy tego typu zagranie, po prostu [musimy zastosować `String.prototype.replace`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_function_as_a_parameter) i proste wyrażenie regularne odnajdujące wąsy. `/\{\{(.+?)\}\}/g` jest właśnie takim wyrażeniem, które pobierze nam wszystko pomiędzy wąsami.
3.  Wewnątrz funkcji wykonującej zamianę usuwam wszystkie spacje i inne białe znaki z pobranej nazwy własności (bo w końcu nie istnieje np. własność `[spacja]name[spacja]`, istnieje za to `name`).
4.  Za {% raw %}`{{ własność }}`{% endraw %} podstawiam konkretną wartość własności z naszego obiektu.
5.  Moglibyśmy zwrócić od razu tak przerobiony ciąg, ale trzeba też pamiętać o separatorze! Dopiero po dodaniu go, zwracamy przerobiony ciąg.
6.  `String.prototype.trim`, bo nie potrzebujemy spacji na końcu.

Przykład zastosowania:

```javascript
formatString( [
	{
		name: 'test1',
		value: 1
	},

	{
		name: 'test2',
		value: 2
	}
], '{% raw %}{{ name }}{% endraw %} = {% raw %}{{ value }}{% endraw %}', '\n' );
```

Ten kod da nam taki wynik:

```
test1 = 1
test2 = 2
```

Tylnej części co prawda nie urywa, ale robi to, co chcemy!

## Bonus: ładniejsze rozwiązanie na `Array.prototype.map`

Powyższy formater rozpadnie się w przypadku, gdy jako separator podamy cokolwiek innego niż biały znak. Wówczas radośnie doda nam go także na końcu wygenerowanego ciągu, co, w zależności od przypadku, może być problemem. Wypada się zatem zastanowić, jak temu zapobiec. Jednym z przykładowych rozwiązań może być wykorzystanie w tym celu `Array.prototype.join`:

```javascript
[ 1, 2, 3 ].join( ';' ); // 1;2;3
```

To jednak oznacza, że zamiast ciągu tekstowego nasz formater powinien zwrócić tablicę. Przeróbmy zatem nasze rozwiązanie oparte o `Array.prototype.reduce`:

```javascript
function formatString( source, template, separator = ' ') {
	return source.reduce( ( output, input ) => {
		output.push( template.replace( /\{\{(.+?)\}\}/g, ( match, property ) => { // 1
			property = property.trim();

			return input[ property ];
		} ) );

		return output;
	}, [] ) // 2
	.join( separator ); // 3
}
```

Jak widać, zmian nie jest dużo:

1.  Zamiast dodawania do `output` wykorzystuję `Array.prototype.push`…
2.  …bo jako początkową wartość ustawiłem pustą tablicę.
3.  Zamiast `String.prototype.trim` robię `Array.prototype.join`.

Sprawdźmy, czy działa:

```javascript
formatString( [
	{
		name: 'test1',
		value: 1
	},

	{
		name: 'test2',
		value: 2
	}
], {% raw %}'{{ name }}{% endraw %} = {% raw %}{{ value }}{% endraw %}', ';' ); // test1 = 1;test2 = 2
```

Działa!

Niemniej nie jest to najładniejsze zastosowanie `Array.prototype.reduce`… Przekształcenie tablicy w tablicę nie brzmi jak "zredukowanie" jej. Od produkcji tablicy z tablicy jest inna metoda, `Array.prototype.map`:

```javascript
function formatString( source, template, separator = ' ' ) {
	return source.map( ( input ) => {
		return template.replace( /\{\{(.+?)\}\}/g, ( match, property ) => {
			property = property.trim();

			return input[ property ];
		} );
	} ).join( separator );
}
```

O wiele ładniej, prawda?

## Zadanie domowe

A co jak będziemy mieli coś takiego?

```javascript
formatString( [
	{
		sub: {
			name: 'test'
		}
	}
], {% raw %}'{{ sub.name }}'{% endraw %}, ';' );
```

Podpowiedź: [Ferrante fajną funkcję napisał](http://ferrante.pl/frontend/javascript/namespace-w-javascript/).
