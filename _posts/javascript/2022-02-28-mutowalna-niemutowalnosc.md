---
layout: post
title:  "Mutowalna niemutowalność"
author: Comandeer
date: 2022-02-28T10:03:00+0100
categories: javascript
comments: true
permalink: /mutowalna-niemutowalnosc.html
---

Istnieje sobie taka biblioteka jak [Immer](https://immerjs.github.io/immer/). W największym skrócie można powiedzieć, że jest ona w świecie niemutowalności tym, czym składnia `async`/`await` w świecie asynchroniczności – ukrywa przed nami fakt, że kod jest nie-jakiś lub jest a-jakiś. I ostatnio zaczęło mnie zastanawiać, jak działa pod spodem.

## Przykład

Na początku rozważmy [prosty przykład działania Immera](https://codesandbox.io/s/eloquent-buck-i5boy9?file=/src/index.js):

```javascript
import { produce } from 'immer'; // 1

const initialStateObj = { // 2
	id: 2,
	author: { // 3
		name: 'Comandeer'
	},
	details: { // 4
		published: false
	}
};

const newStateObj = produce( initialStateObj, ( draft ) => { // 5
	draft.type = 'article'; // 6
	draft.id = 5; // 7
	draft.details.published = true; // 8
} );

console.log( // 9
	newStateObj, /* {
	id: 5,
	author: {
		name: 'Comandeer'
	},
	details: {
		published: true
	},
	type: 'article'
} */
	newStateObj === initialStateObj // false
);
console.log( // 10
	newStateObj.author, // { name: 'Comandeer' }
    newStateObj.author === initialStateObj.author // true
);
console.log( // 11
	newStateObj.details, // { published: true }
	newStateObj.details === initialStateObj.details // false
);
```

Na początku importujemy z biblioteki funkcję `produce()` (1). Służy ona do tworzenia nowej wersji stanu na podstawie starej. Następnie tworzymy sobie przykładowy obiekt stanu (2), który ma dwa zagnieżdżone obiekty – `author` (3) oraz `details` (4). Przekazujemy ten obiekt do funkcji `produce` (5), która wypluwa nam nowy stan. Jak widać, wewnątrz tej funkcji dostępny jest obiekt `draft`, na którym wykonujemy normalne operacje na obiekcie – dodajemy własności (6), zmieniamy istniejące (7), w tym te zagnieżdżone w obiektach (8). Następnie logujemy sobie kilka rzeczy do konsoli. Na początku (9) wyświetlamy nowy obiekt stanu i sprawdzamy, czy rzeczywiście jest to inny obiekt niż początkowy. Tutaj na razie bez niespodzianek – obiekt jest dokładnie taki, jakie zmiany do niego wprowadziliśmy. Następnie sprawdzamy, co się stało z własnością `author` (10). W oryginalnym obiekcie był to zagnieżdżony obiekt. Okazuje się, że w nowym też jest… i to w dodatku taki sam! Ale kiedy z kolei sprawdzimy `details` (11), to odkryjemy, że ten obiekt jest już inny. Immer bowiem nie dotyka zagnieżdżonych obiektów, jeśli nie zostały zmodyfikowane w żaden sposób – po prostu je "przekleja" do nowego stanu.

Spróbujmy odtworzyć zachowanie Immera z przykładu!

## Własny wycinek Immera

Stwórzmy sobie na sam początek plik `immer.js` i wyeksportujmy w nim jedną funkcję, `produce()`. Będzie ona miała dwa parametry – `state` (czyli obiekt, na podstawie którego chcemy stworzyć nowy) oraz `recipe` (czyli funkcję, która będzie modyfikować ten obiekt):

```javascript
export function produce( state, recipe ) {

}
```

### Naiwne podejście

Wiemy, że chcemy zwracać z tej funkcji nowy obiekt stworzony na podstawie przekazanego `state` i że ma być on modyfikowany przy pomocy `recipe`. Spróbujmy zatem stworzyć podstawową wersję takiego rozwiązania:

```javascript
export function produce( state, recipe ) {
	const draft = { ...state }; // 1

	recipe( draft ); // 2

	return draft; // 3
}
```

Na samym początku tworzymy sobie `draft`, czyli [płytką kopię (<i lang="en">shallow copy</i>)](https://developer.mozilla.org/en-US/docs/Glossary/Shallow_copy) obiektu `state` (1). Następnie przekazujemy ją do `recipe()` (2), w którym użytkownik może dowolnie tę kopię modyfikować. Na samym końcu zwracamy `draft` (3).

To jednak nie zadziała dokładnie tak, jakbyśmy chcieli. Jeśli teraz podmienimy import z Immera na naszego Immera, zauważymy, że co prawda nowy obiekt jest zwrócony, ale zagnieżdżone obiekty są już modyfikowane (co widać po `initialState.details`). A tego nie chcemy. Dodatkowo, nasza funkcja zawsze zwróci nowy obiekt, nawet jeśli w żaden sposób nie zmodyfikujemy stanu. W takim wypadku Immer zwraca po prostu przekazany mu obiekt – i to samo powinien zrobić nasz kod.

### Proxy

Ale żeby wykryć, czy obiekt jest zmodyfikowany, musimy jakoś przechwycić wyrażenia typu `obj.property = newValue`. Tutaj z pomocą przychodzą nam [proxy](https://blog.comandeer.pl/uniwersalny-getter.html)! Pozwalają one w prosty sposób przechwycić większość operacji na obiekcie. Podmieńmy zatem naszą kopię na proxy:

```javascript
export function produce( state, recipe ) {
	const draft = new Proxy( state, {} ); // 1

	recipe( draft );

	return draft;
}
```

Stworzenie takiego "przezroczystego" proxy (1) na razie nie zmieniło w żaden sposób działania kodu – dalej działa źle. Ale drugi parametr konstruktora `Proxy` pozwala nam m.in. [reagować na nadawanie wartości własności obiektu](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/set). Dzięki temu można np. oznaczyć, że stan został zmodyfikowany.

Jednak taką informację trzeba gdzieś przechowywać. Zatem zamiast przekazywać `state` do proxy bezpośrednio, otoczmy go w obiekt:

```javascript
export function produce( state, recipe ) {
	const draft = new Proxy( {
		base: state, // 1
		isModified: false // 2
	}, {} );

	recipe( draft );

	return draft;
}
```

Teraz do proxy przekazujemy obiekt o dwóch własnościach: `base` (1), zawierającą początkowy stan, oraz `isModified` (2), określającą, że stan został zmodyfikowany.

Dodajmy zatem pułapkę `set`, żeby zaznaczyć, że stan faktycznie został zmodyfikowany, i żeby móc tej informacji użyć:

```javascript
export function produce( state, recipe ) {
	const draft = new Proxy( {
		base: state,
		isModified: false
	}, {
		set( draft, property, value ) { // 1
			draft.isModified = true; // 2

			return Reflect.set( draft.base, property, value ); // 3
		}
	} );

	recipe( draft );

	return draft;
}
```

Jako drugi argument do proxy przekazaliśmy obiekt z metodą `set()` (1). Jest ona wywoływana, gdy jakiejś własności w proxy jest ustawiana wartość. Wewnątrz `set()` oznaczamy stan jako zmodyfikowany (2) oraz wywołujemy [`Reflect.set()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/set), żeby faktycznie zmienić określoną własność obiektu (3).

Na ten moment wszystkie zmiany są dokonywane bezpośrednio na początkowym stanie – a więc zupełnie nie o to nam chodzi! My chcemy wszystkich zmian dokonywać na _kopii_ oryginalnego stanu. Musimy sobie zatem taką utworzyć:

```javascript
export function produce( state, recipe ) {
	const draft = new Proxy( {
		base: state,
		isModified: false
	}, {
		set( draft, property, value ) {
			draft.isModified = true;

			if ( !draft.copy ) { // 1
				draft.copy = { ...draft.base }; // 2
			}

			return Reflect.set( draft.copy, property, value ); // 3
		}
	} );

	recipe( draft );

	return draft.isModified ? draft.copy : draft.base; // 3
}
```

Przed wywołaniem `Reflect.set()` sprawdzamy, czy istnieje kopia oryginalnego stanu (1) i jeśli nie, to tworzymy jego płytką kopię (2). Następnie wywołujemy `Reflect.set()` już na tej kopii (3). Z całej funkcji `produce()` z kolei możemy zwrócić oryginalny stan, jeśli nie został zmodyfikowany, a w przeciwnym wypadku – jego kopię (3).

### Zagnieżdżone obiekty

Taki kod jednak nie zadziała w przypadku zagnieżdżonych obiektów. Dla nich bowiem nie jest wywoływana pułapka `set()` a [`get()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/get). Musimy zatem i ją dodać do naszego proxy:

```javascript
export function produce( state, recipe ) {
	const draft = new Proxy( {
		base: state,
		isModified: false
	}, {
		set( draft, property, value ) {
            […]
		},

		get( draft, property ) {
			return Reflect.get( draft.base, property ); // 1
		}
	} );

	recipe( draft );

	return draft.isModified ? draft.copy : draft.base;
}
```

Na ten moment po prostu zwracamy wartość danej własności z początkowego stanu przy pomocy [`Reflect.get()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/get) (1).

Ta zmiana jednak sprawi, że przestanie działać zwracanie wartości z funkcji `produce()`. Jest to spowodowane tym, że teraz wszystkie odwołania do własności w `draft` będą przechodzić przez pułapkę `get()`. Najprostszym rozwiązaniem tego problemu będzie po prostu wyciągnięcie `draft` poza proxy. Dla przejrzystości od razu wyciągnijmy także tworzenie drafta i proxy do osobnej funkcji:

```javascript
export function produce( state, recipe ) {
	const draft = createDraft( state ); // 1

	recipe( draft.proxy ); // 2

	return draft.isModified ? draft.copy : draft.base;
}

function createDraft( state ) { // 3
	const draft = { // 4
		base: state,
		isModified: false
	};
	const proxy = new Proxy( {}, { // 5
		set( target, property, value ) {
			draft.isModified = true;

			if ( !draft.copy ) {
				draft.copy = { ...draft.base };
			}

			return Reflect.set( draft.copy, property, value );
		},

		get( target, property ) {
			return Reflect.get( draft.base, property );
		}
	} );

	draft.proxy = proxy; // 6

	return draft;
}
```

Teraz w `produce()` `draft`a tworzymy przy pomocy wywołania `createDraft()` z przekazanym mu początkowym stanem (1). Zmieniło się też wywołanie `recipe()`, do którego teraz przekazujemy nie cały `draft`, a jego własność `proxy` (2). Cała magia dzieje się za to w funkcji `createDraft()` (3). Na samym początku tworzymy sobie obiekt `draft` (4). Będzie on trzymał wszystkie potrzebne nam informacje na temat modyfikowanego stanu. Następnie tworzymy proxy (5). Jako obiekt, na którym ma pracować, przekazujemy po prostu pusty obiekt. W rzeczywistości nasze proxy będzie zmieniać rzeczy na naszym obiekcie `draft`, ale chcemy mieć też możliwość dostępu do niego poza proxy – a taki trick nam to umożliwia. Samo proxy natomiast dodajemy jako własność `proxy` do naszego `draft`a (6).

Wypada teraz sprawić, by modyfikacje w zagnieżdżonych obiektach również były monitorowane. Możemy to zrobić, tworząc zagnieżdżone drafty:

```javascript
const isDraft = Symbol( 'draft' ); // 1

export function produce( state, recipe ) {
	[…]
}

function createDraft( state ) {
	const draft = {
		base: state,
		isModified: false,
        [ isDraft ]: true // 2
	};
	const proxy = new Proxy( {}, {
		set( target, property, value ) {
			[…]
		},

		get( target, property ) {
			const baseValue = Reflect.get( draft.copy || draft.base, property ); // 3

			if ( !baseValue || typeof baseValue !== 'object' ) { // 4
				return baseValue; // 5
			}

			if ( !draft.copy ) { // 6
				draft.copy = { ...draft.base }; // 7
			}

			if ( !draft.copy[ property ][ isDraft ] ) { // 9
				draft.copy[ property ] = createDraft( draft.copy[ property ] ); // 8
			}

			const proxiedValue = Reflect.get( draft.copy, property );// 10

			return proxiedValue.proxy; // 11
		}
	} );

	draft.proxy = proxy;

	return draft;
}
```

Na samym początku pojawił się symbol `isDraft` (1). Dzięki niemu będziemy mogli rozpoznać, które własności obiektu są draftami. Każdy draft będzie powiem zawierał ten symbol jako własność (2). Najwięcej zmian zaszło w `get()`. Na początku pobieramy wartość własności przy pomocy `Reflect.get()` (3). Próbujemy pobrać własność z kopii stanu (czyli w przypadku, gdy draft został zmodyfikowany) lub z oryginalnego stanu (gdy nie został zmodyfikowany). Jeśli ta wartość nie jest obiektem (4; to pierwsze sprawdzenie odsiewa nam `null`, który również ma typ `'object'`), po prostu ją zwracamy (5). W innym wypadku sprawdzamy, czy istnieje kopia draftu (6) i jeśli nie, tworzymy ją (7). Następnie w tej kopii tworzymy drafta dla zagnieżdżonego obiektu (8) – oczywiście, po uprzednim sprawdzeniu, czy takowy już nie istnieje (9). Potem pobieramy drafta tej własności (10) i zwracamy jej proxy (11).

To jednak sprawi, że zmodyfikowany stan będzie zawierał w sobie drafty, a nie zmienione własności i wartość zwracana z `produce()` będzie teraz nieprawidłowa. Dlatego wypada odpowiednio przerobić nasz draft z powrotem w stan. Stwórzmy w tym celu funkcję `convertDraftToState()`:

```javascript
const isDraft = Symbol( 'draft' );

export function produce( state, recipe ) {
	const draft = createDraft( state );

	recipe( draft.proxy );

	return convertDraftToState( draft ); // 1
}

function createDraft( state ) {
	[…]
}

function convertDraftToState( draft ) {
	if ( !draft.isModified ) { // 2
		return draft.base; // 3
	}

	const state = Object.entries( draft.copy ).reduce( ( state, [ property, value ] ) => { // 4
		const newValue = getPropertyValue( value );

		return { ...state, [ property ]: newValue };
	}, {} );

	return state;
}

function getPropertyValue( value ) {
	if ( isValueADraft( value ) ) {
		return convertDraftToState( value ); // 6
	}

	return value; // 7
}

function isValueADraft( value ) { // 8
	return value && value[ isDraft ]; // 9
}
```

Zamiast zwracać bezpośrednio kopię lub oryginał stanu z `draft`a, zwracamy wynik funkcji `convertDraftToState()` (1). Funkcja ta sprawdza, czy dany draft został zmodyfikowany (2) i jeśli nie, zwraca oryginalny stan (3). W przeciwnym wypadku przelatuje po wszystkich własnościach kopii stanu (4) i przy pomocy funkcji `getPropertyValue()` (5) ustala pożądane wartości poszczególnych własności stanu. Funkcja `getPropertyValue()` dla drafów wywołuje rekurencyjnie `convertDraftToState()` (6), natomiast pozostałe wartości zwraca (7). Jeśli coś nie jest draftem, to po prostu jest albo typem prostym (a więc niemutowalnym z założenia), albo niezmodyfikowanym zagnieżdżonym obiektem (a więc takim, który powinniśmy po prostu zwrócić). Pomocnicza funkcja `isValueADraft()` (8) po prostu sprawdza, czy dana wartość istnieje i jest draftem (9).

Rekurencyjne wykorzystanie `convertDraftToState()` pozwala nam rozwiązać problem z obiektami zagnieżdżonymi w zagnieżdżonych obiektach – a więc pozwala tworzyć (teoretycznie) nieskończone poziomy zagłębienia.

### Zagnieżdżone drafty

Pozostaje jednak jeden przypadek, w którym nasz kod nie zadziała: zmiana wyłącznie w zagnieżdżonym obiekcie. Jest to spowodowane tym, że zmiana w zagnieżdżonym drafcie oznaczy jedynie ten draft jako zmodyfikowany. A to znaczy, że nasza funkcja `convertDraftToState()` nie wykryje żadnych zmian (`isModified` głównego draftu będzie ustawione wciąż na `false`) i zwróci początkowy stan.

Pierwszym rozwiązaniem, jakie przychodzi do głowy, jest po prostu sprawdzanie, czy kopia stanu istnieje i jeśli tak, operowanie na niej. Ale to może nie zadziałać poprawnie, bo do obsługi zagnieżdżonych obiektów kopia jest tworzona, by trzymać w niej drafty – nawet wówczas, gdy nie zajdzie w nich żadna zmiana. W takim wypadku chcielibyśmy, żeby kod zwrócił początkowy stan, co przy tego typu implementacji nie byłoby możliwe. Dlatego trzeba pomyśleć o innym rozwiązaniu.

Jednym z nich jest stworzenie struktury podobnej do drzewka DOM – każdy draft będzie zawierał informację o swoim rodzicu. Dzięki czemu zmiany w zagnieżdżonych draftach mogą być propagowane wyżej, aż do głównego drafta:

```javascript
[…]

function createDraft( state, parent = null ) { // 1
	const draft = {
		base: state,
		isModified: false,
		[ isDraft ]: true,
		parent // 3
	};
	const proxy = new Proxy( {}, {
		set( target, property, value ) {
			markModified( draft ); // 4

			if ( !draft.copy ) {
				draft.copy = { ...draft.base };
			}

			return Reflect.set( draft.copy, property, value );
		},

		get( target, property ) {
			[…]

			if ( !draft.copy[ property ][ isDraft ] ) {
				draft.copy[ property ] = createDraft( draft.copy[ property ], draft ); // 2
			}

			const proxiedValue = Reflect.get( draft.copy, property );

			return proxiedValue.proxy;
		}
	} );

	draft.proxy = proxy;

	return draft;
}

[…]

function markModified( draft ) {
	draft.isModified = true; // 5

	if ( draft.parent ) { // 6
		markModified( draft.parent ); // 7
	}
}
```

Do funkcji `createDraft()` dodaliśmy drugi parametr – `parent` z domyślną wartością `null` (1). W chwili tworzenia głównego drafta, będziemy używali właśnie tej domyślnej wartości. Natomiast, gdy będziemy tworzyć zagnieżdżony draft, to wówczas jako drugi argument podamy aktualny `draft` (2) – dzięki czemu będziemy wiedzieli, jak drafty są ze sobą powiązane. Dopisujemy też własność `parent` do obiektu `draft` (3), by móc ją później odczytać. Następnie, wewnątrz pułapki `set()`, wywołujemy funkcję `markModified()` (4), podając jej aktualny `draft`. Funkcja `markModified()` ustawia własność `isModified` przekazanego drafta na `true` (5), po czym sprawdza, czy istnieje własność `draft#parent` (6) i, jeśli tak, rekurencyjnie wywołuje się na drafcie, który się w niej znajduje (7). Tym sposobem nawet zmiany w najbardziej zagnieżdżonym drafcie zostaną prawidłowo wykryte.

[Pełny przykład można zobaczyć na CodeSandboxie](https://codesandbox.io/s/festive-antonelli-o7u1h2?file=/src/index.js).

## Co dalej?

Nasz kod daleki jest od bycia produkcyjnym – choćby dlatego, że implementuje jedynie wycinek Immera. Brakuje m.in. obsługi usuwania własności z obiektów (co można zrobić przy pomocy [pułapki `deleteProperty()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/deleteProperty)) czy całej obsługi tablic. Brakuje też dokładnych testów naszej obecnej implementacji, więc nie ma pewności, czy aby na pewno działa poprawnie.

Rozwiązanie przedstawione w tym poście nie jest dokładnie takim samym, jakie stosuje Immer. Niemniej główna zasada działania zostaje taka sama – kontrolujemy modyfikację obiektu przy pomocy proxy.

I to by było na tyle.
