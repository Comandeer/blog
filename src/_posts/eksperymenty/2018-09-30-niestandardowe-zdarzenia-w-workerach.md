---
layout: post
title:  "Niestandardowe zdarzenia w workerach"
description: "Jak stworzyć niestandardowe zdarzenia w Web Workers."
author: Comandeer
date: 2018-09-30T23:41:00+0100
tags:
    - eksperymenty
    - javascript
comments: true
permalink: /niestandardowe-zdarzenia-w-workerach.html
redirect_from:
    - /eksperymenty/javascript/2018/09/30/niestandardowe-zdarzenia-w-workerach.html
---

W przypadku skryptów korzystających z DOM stworzenie własnych, niestandardowych zdarzeń jest banalnie proste i sprowadza się do utworzenia nowej instancji [`CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent). Ten sposób jednak nie (do końca) działa w przypadku workerów, które nie mają dostępu do DOM. Co zatem zrobić w takim wypadku?<!--more-->

## Zaraz, zaraz – workery…?

JS jest jednowątkowy – to od wieków znana i (raczej) niekwestionowana prawda. Niemniej współczesne procesory od lat potrafią radzić sobie z większą liczbą wątków i tak trochę żal z tego nie skorzystać. Zwłaszcza, że w internecie dzieje się coraz większa część naszego życia. Z tego też powodu powstały [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) (Robotnicy Sieciowi).

Założenie jest bardzo proste: w głównym wątku (czyli tym, który odpowiada za renderowanie tego, co widzi użytkownik) tworzymy workera, który "osiedla się" w kolejnym wątku i tam radośnie sobie działa. Tym sposobem nawet jeśli wykonuje jakieś skomplikowane, długotrwające operacje, użytkownik tego nie odczuje. Istnieje też prosty mechanizm komunikacji pomiędzy workerem a główną stroną, przy pomocy [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/postMessage) (analogicznie jak w przypadku komunikacji strony z osadzoną ramką `iframe`).

Istnieje też specjalny typ workerów, tzw. [Service Workers](https://developers.google.com/web/fundamentals/primers/service-workers/) (Robotnicy Usługowi). Tak jak typowy Web Worker działa od czasu otwarcia strony aż do jej zamknięcia, tak Service Worker działa od czasu instalacji poprzez skrypt na stronie aż do jego ręcznego usunięcia przez użytkownika lub wymuszenia odinstalowania po stronie skryptu. Innymi słowy: Service Worker jest połączony z konkretną stroną, ale działa nieustannie w tle, nawet gdy dana strona jest już zamknięta. Dodatkowo Service Worker jest w stanie przechwytywać wszystkie żądania do konkretnej strony (przy pomocy zdarzenia `fetch`), co sprawia, że w praktyce działa niczym proxy wbudowane w przeglądarkę.

Używanie workerów sprawia, że nasza aplikacja webowa zaczyna działać wielowątkowo, co pozwala przenieść sporą część logiki z głównego wątku do wątków pomocniczych. A to z kolei [otwiera drogę ciekawym optymalizacjom](https://dassur.ma/things/the-9am-rush-hour/).

## Problem: niejasna komunikacja

API do obsługi workerów jest bardzo proste. Najprostsze użycie workera to stworzenie instancji klasy `Worker`:

```javascript
const worker = new Worker( 'worker.js' );
```

Jako parametr konstruktora musimy podać adres skryptu, w którym znajduje się kod naszego workera. Wyobraźmy sobie, że jego zadaniem będzie zaczekanie na informację przesłaną ze strony głównej, obrobienie jej i zwrócenie wyniku. W tym celu musimy się posłużyć wcześniej wspomnianą funkcją `postMessage`. Na głównej stronie musimy dodać kod do obsługi danych przesłanych z workera oraz wysłać dane do workera:

```javascript
worker.addEventListener( 'message', ( { data } ) => { // 1
    console.log( 'main thread', data ); // 2
} );

worker.postMessage( 'myData' ); // 3
```

Każde przychodzące dane odpalają zdarzenie `message` na obiekcie workera (1). Zdarzenie to zawiera własność `data` przechowującą przesłane dane. Nie robimy z nimi nic interesującego, po prostu je rzucamy do konsoli (2). Będąc przygotowanym na odpowiedź workera, możemy mu przesłać dane – w tym wypadku prosty tekst `'myData'` (3).

Analogiczny kod znajduje się po stronie workera:

```javascript
self.addEventListener( 'message', ( { data } ) => { // 1
    console.log( 'worker thread', data ); // 2

    self.postMessage( `${ data } – worker processed` ); // 3
} );
```

Tym razem przypinamy się do globalnego obiektu w workerze, `self` (1; jest to odpowiednik `window` ze strony) i nasłuchujemy zdarzenia `message`. Gdy dane przychodzą, rzucamy je do konsoli (2). Na samym końcu doklejamy do otrzymanych danych ciąg `' – worker processed'` i przesyłamy to jako wiadomość do `self`, co spowoduje odesłanie danych do głównego wątku (3). [Prosty przykład](https://embed.plnkr.co/J3x2SzAZtoBbrEVRLw5j/).

Tego typu sposób pracy z workerami jest bardzo prosty i intuicyjny, lecz ma bardzo poważne ograniczenia. Gdy spojrzymy na DOM, zauważymy, że niemal wszystko ma swoje dedykowane zdarzenie. Dzięki temu bez problemu odróżnimy moment, w którym użytkownik wcisnął przycisk myszy (`mousedown`), od momentu, w którym go puścił (`mouseup`). Można się wręcz pokusić o stwierdzenie, że nazwy zdarzeń DOM stanowią prosty [<abbr title="Domain Specific Language" lang="en">DSL</abbr>](https://en.wikipedia.org/wiki/Domain-specific_language). Nietrudno sobie wyobrazić, jak mało intuicyjne stałoby się posługiwanie się DOM-em (który i tak do najbardziej intuicyjnych nie należy), gdyby np. myszka generowała tylko jedno zdarzenie – `mouse` – i musielibyśmy robić dziwne, heurystyczne wygibasy, by stwierdzić, czy to przycisk został wciśnięty albo może użytkownik nieco poruszył kursorem.

Taka sytuacja, niestety, występuje w workerach, w których na dobrą sprawę mamy do czynienia wyłącznie ze zdarzeniem `message`. Inne zdarzenia, jakie mogą zajść (jak choćby wspomniane `fetch` w Service Workerze), są w pełni niezależne od nas jako programistów i nie mamy kontroli nad tym, kiedy się odpalają. Dodatkowo posiadanie tylko `message` sprawia, że dość trudno jest podzielić przesyłane dane na typy, np. żądania dociągnięcia dodatkowych danych z API i żądania obliczenia 145 cyfry liczby π. Wszystko zaczyna się zlewać w jedno i nawet, jak podzielimy kod na ładne, oddzielne listenery na `message`, to będziemy grzęznąć w gąszczu `if`-ów sprawdzających, czy na pewno ten rodzaj wiadomości chcemy w danej funkcji obsłużyć.

Stąd pojawia się potrzeba obsługi niestandardowych zdarzeń w workerach.

## Naiwna próba

Skoro nasz obiekt `worker` posiada metodę `addEventListener`, to prawdopodobnie posiada też metodę `dispatchEvent`, służącą do odpalania zdarzeń. Obydwie są bowiem zadeklarowane na tym samym interfejsie – [`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget), a [obiekty klasy `Worker` implementują interfejs `EventTarget`](https://html.spec.whatwg.org/multipage/workers.html#creating-workers):

```javascript
(new Worker( '' ) ) instanceof EventTarget; // true
```

<p class="note">W specyfikacjach wykorzystuje się <a href="https://heycam.github.io/webidl/" rel="noreferrer noopener">pseudojęzyk WebIDL</a> do opisu zależności pomiędzy poszczególnymi klasami i obiektami definiowanymi przez różne standardy. Stąd pojawiają się też interfejsy czy mixiny, które normalnie w JS nie występują.</p>

Zatem obsługa niestandardowych zdarzeń powinna być banalnie prosta i sprowadzać się do:

```javascript
const event = new CustomEvent( 'mycustomevent' );
worker.dispatchEvent( event );
```

Sprawdźmy zatem po stronie workera, czy otrzymujemy zdarzenie:

```javascript
self.addEventListener( 'mycustomevent', console.log );
```

Nic, cisza w konsoli…

Wynika to z prostego faktu: obiekt `worker` w głównym wątku i `self` w workerze to totalnie dwa różne obiekty. Ten pierwszy nie jest faktycznym obiektem workera, a jedynie prostym interfejsem do komunikacji z workerem. Co najważniejsze, działa tak samo jak inne klasy implementujące `EventTarget`, czyli m.in. elementy DOM. Jeśli tworzymy sztuczne zdarzenie DOM (np. `click`) nie oczekujemy, że nagle element na innej stronie zostanie kliknięty. A przecież tak należy postrzegać workera – jako coś, co zachowuje się jak inna strona, niezależnie od strony z obiektem `worker`. To oznacza, że zdarzenie wysłane do obiektu `worker` odbierzemy na stronie, na której je wysłaliśmy:

```javascript
worker.addEventListener( 'mycustomevent', console.log );

const event = new CustomEvent( 'mycustomevent' );
worker.dispatchEvent( event );
```

{% include 'figure' src="../../images/niestandardowe-zdarzenia-w-workerach/console.jpg" link="/assets/images/niestandardowe-zdarzenia-w-workerach/console.jpg" alt="Informacja o zaszłym zdarzeniu w konsoli Chrome" %}

Jak widać, w konsoli wyświetliły się informacje o zdarzeniu oraz informacja o tym, że zaszło w pliku `test.html`, nie zaś – w pliku `worker.js`. To oznacza, że faktycznie zdarzenia odpalone na obiekcie `worker` nie wychodzą poza stronę. [Przykład na żywo, jakby ktoś nie wierzył](https://embed.plnkr.co/gfcs2RZUqmINSa2av8fO/).

Trzeba zatem pomyśleć o jakimś innym sposobie…

## Emulowanie zdarzeń przy pomocy wiadomości

Jak wcześniej wspomniałem, praktycznie jedynym sposobem na przekazanie czegokolwiek do workera jest wysłanie do niego wiadomości przy pomocy metody `postMessage`. Sposób ten wyzwala zdarzenie `message`. Sprawdźmy zatem, czy uda nam się w taki sposób przesłać zdarzenie. Zmieńmy kod po stronie workera na:

```javascript
self.addEventListener( 'message', console.log );
```

Kod po stronie strony też musimy zmienić:

```javascript
const event = new CustomEvent( 'mycustomevent' );
worker.postMessage( event );
```

Sprawdźmy, co się stanie.

{% include 'figure' src="../../images/niestandardowe-zdarzenia-w-workerach/clone-error.jpg" link="/assets/images/niestandardowe-zdarzenia-w-workerach/clone-error.jpg" alt="Błąd w konsoli Chrome: &quot;Uncaught DOMException: Failed to execute 'postMessage' on 'Worker': CustomEvent object could not be cloned.&quot;" %}

Z racji tego, że przekazanie do workera danych bezpośrednio mogłoby stanowić lukę w zabezpieczeniach, wszystkie dane są tak naprawdę klonowane przed wysłaniem i worker otrzymuje ich dokładne kopie. Niestety, niektórych obiektów nie da się sklonować. Należą do nich wszystkie te obiekty, które posiadają metody. A zdarzenia mają mnóstwo metod (`preventDefault`, `stopPropagation`, `stopImmediatePropagation` itd.). Tym samym nie możemy posłać zdarzenia bezpośrednio, musimy je wcześniej zmienić na zwykły obiekt. Najprostszy sposób na taką transformację obiektów to przepuszczenie ich przez `JSON.stringify` + `JSON.parse`. Niemniej w przypadku zdarzenia da to raczej nieoczekiwany rezultat:

```javascript
{
	isTrusted: false
}
```

Utraciliśmy wszystkie informacje o zdarzeniu, oprócz  tej, że [jest niezaufane](https://kot-zrodlowy.pl/goscinne/2018/08/22/trusted-events.html). Wynika to z faktu, że tylko ta własność jest przypięta bezpośrednio do zdarzenia, a cała reszta – do prototypu. A jak wiadomo, `JSON.stringify` do prototypów nie zagląda. Kolejny plan spalił na panewce…

Niemniej rozwiązanie tego problemu jest proste: wystarczy stworzyć obiekt imitujący zdarzenie, a następnie niech już worker się martwi, co z tym dalej zrobić!

```javascript
const event = {
    type: 'event',
    name: 'mycustomevent'
};
worker.postMessage( event );
```

Tego typu obiekt bez problemu zostaje przesłany do workera. Tylko co dalej?

Jak wspominałem, worker nie ma dostępu to DOM. To prawda, ale równocześnie ma dostęp do konstruktora `CustomEvent`! Tym samym możemy go użyć do odtworzenia zdarzenia po stronie workera:

```javascript
self.addEventListener( 'message', ( { data: { type, name } = {} } ) => { // 1
	if ( type !== 'event' ) { // 2
		return;
	}

	const event = new CustomEvent( name ); // 3
	self.dispatchEvent( event ); // 4
} );
```

Przypinamy się do zdarzenia `message` i pobieramy z niego wyłącznie `data.type` i `data.name` (1; ten superdziwny zapis w parametrach to [zagnieżdżona destrukturyzacja połączona z domyślnym parametrem](https://simonsmith.io/destructuring-objects-as-function-parameters-in-es6/); tak, wiem…). Chcemy obsłużyć tylko wiadomości, których `data.type` jest równe `event`, więc odsiewamy resztę (2). Następnie tworzymy nowe zdarzenie (3) i je wyzwalamy (4).

Dodajmy zatem jeszcze listener do workera:

```javascript
self.addEventListener( 'mycustomevent', console.log );
```

Sprawdźmy, czy całość działa.

{% include 'figure' src="../../images/niestandardowe-zdarzenia-w-workerach/customevent.jpg" link="/assets/images/niestandardowe-zdarzenia-w-workerach/customevent.jpg" alt="Obiekt zdarzenia zalogowany w konsoli Chrome" %}

Działa! I wcale nie zajęło to dużo kodu. Dodajmy zatem możliwość przekazywania danych do zdarzenia. Po stronie strony wystarczy je przekazać jako nową własność wysyłanego obiektu:

```javascript
const event = {
    type: 'event',
    name: 'mycustomevent',
    detail: 'whatever'
};
worker.postMessage( event );
```

Natomiast po stronie workera wypada dodać nową własność do własności `detail` zdarzenia ([tak się bowiem przekazuje dane do niestandardowego zdarzenia](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)):

```javascript
self.addEventListener( 'message', ( { data: { type, name, detail } = {} } ) => {
	if ( type !== 'event' ) {
		return;
	}

	const event = new CustomEvent( name, {
		detail
	} );
	self.dispatchEvent( event );
} );
```

<i lang="fr">Voilà</i>! Została już tylko jedna rzecz do dopieszczenia: utworzenie przyjemnej funkcji do wywoływania zdarzenia w workerze z poziomu strony:

```javascript
Object.defineProperty( Worker.prototype, 'raiseEvent', {
    value( detail ) {
        const event = {
            type: 'event',
            name: 'mycustomevent',
            detail
        };
        this.postMessage( event );
    }
} );

const worker = new Worker( 'worker.js' );

worker.raiseEvent( 'whatever' );
```

Zastosowałem tutaj `Object.defineProperty`, żeby nowa metoda nie była widoczna na zewnątrz (czyli zachowywała się tak jak natywne). Tym sposobem cała logika związana z tworzeniem zdarzenia jest zamknięta w metodzie `raiseEvent`, do której przekazujemy wyłącznie dodatkowe dane zdarzenia. [Przykład na żywo](https://embed.plnkr.co/f5qfwhWHBheRBfZeKlkw/).

## Bonus: globalny nasłuchiwacz

Gdy przyjrzymy się globalnemu obiektowi w workerze dostrzeżemy, że oprócz `addEventListener` posiada on także globalną wlasność `onmessage`. Wypada więc dodać także taką u nas. Jest to dość proste, bo wystarczy dodać nowy listener dla `'mycustomevent'`, który będzie sprawdzał, czy `self.onmycustomevent` jest funkcją i jeśli tak, to wywoływał ją w kontekście `self` ze zdarzeniem przekazanym jako parametr:

```javascript
self.addEventListener( 'mycustomevent', ( evt ) => {
	if ( typeof self.onmycustomevent === 'function' ) {
		self.onmycustomevent.call( self, evt );
	}
} );
```

Dodajmy zatem nowy globalny listener:

```javascript
self.onmycustomevent = console.warn;
```

Sprawdźmy, czy wszystko działa:

{% include 'figure' src="../../images/niestandardowe-zdarzenia-w-workerach/globalhandler.jpg" link="/assets/images/niestandardowe-zdarzenia-w-workerach/globalhandler.jpg" alt="Działanie globalnego listenera w konsoli Chrome: zostało wyświetlone ostrzeżenie zawierające obiekt zdarzenia" %}

Działa!

<p class="note">Jedyny problem z naszą implementacją <code>onmycustomevent</code> to fakt, że jest wywoływany <em>przed</em> innymi listenerami. Tradycyjnie listenery przypięte przez <code>on…</code> wywołują się na końcu. Wydaje mi się jednak, że tego typu szczegół – zwłaszcza przy własnej implementacji zdarzeń – jest mało istotny i można go pominąć.</p>

## Ostateczna refaktoryzacja

Dopieśćmy zatem ostatecznie naszą obsługę niestandardowych zdarzeń w workerze, wydzielając ją do osobnej funkcji:

```javascript
function registerCustomEvent( eventName ) { // 1
	self.addEventListener( 'message', ( { data: { type, name, detail } = {} } ) => { // 2
		if ( type !== 'event' && name !== eventName ) { // 3
			return;
		}

		const event = new CustomEvent( name, {
			detail
		} );
		self.dispatchEvent( event );
	} );

	self.addEventListener( eventName, ( evt ) => { // 4
		if ( typeof self[ `on${ eventName }` ] === 'function' ) {
			self[ `on${ eventName }` ].call( self, evt );
		}
	} );
}

registerCustomEvent( 'mycustomevent' ); // 5
```

Do naszej nowej funkcji `registerCustomEvent` przekazujemy nazwę zdarzenia, jakie chcemy zarejestrować (1). Jest dla niego tworzony nowy listener `message` (2), który jest lekko zmienioną wcześniejszą wersją. Sprawdzamy bowiem, czy wiadomość, która przyszła przedstawia konkretny typ zdarzenia, rozpoznawany po nazwie (3). Zmianie uległ też listener obsługujący `on<nasza nazwa>`, gdyż teraz nazwa zdarzenia jest do niego przekazywana z zewnątrz, przez zmienną `eventName` (4). Cała reszta pozostała bez zmian. Naszą nową funkcję wywołujemy po prostu podając jej nazwę nowego zdarzenia (5).

Tę funkcję możemy wydzielić do nowego pliku, np. `registerCustomEvent.js`, a następnie dołączyć na samym początku workera, używając [`importScripts`](https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts). Jest to odpowiednik `require` z Node.js czy też znacznika `script:not([async])` z HTML-a.

```javascript
self.importScripts( 'registerCustomEvent.js' );
```

Możemy też przerobić nieco kod w głównym wątku – tak, aby również był uniwersalny:

```javascript
function registerCustomEventDispatcher( dispatcherName, eventName ) { // 1
    Object.defineProperty( Worker.prototype, dispatcherName, { // 2
        value( detail ) {
            const event = {
                type: 'event',
                name: eventName, // 3
                detail
            };
            this.postMessage( event );
        }
    } );
}

registerCustomEventDispatcher( 'raiseEvent', 'mycustomevent' ); // 4
```

Tym razem stworzyliśmy funkcję z dwoma parametrami: nazwą metody wywołującej zdarzenie oraz nazwą samego wywoływanego zdarzenia (1). Cała reszta funkcji praktycznie się nie zmieniła, oprócz podstawienia parametrów w odpowiednie miejsca (2, 3). W naszym wypadku wywołujemy funkcję, podając jako nazwę funkcji `raiseEvent` a jako nazwę zdarzenia – `mycustomevent` (4). Tę funkcję, dla estetyki, również można przenieść do osobnego pliku (np. `registerCustomEventDispatcher.js`).

Tym sposobem uzyskaliśmy minimalistyczną bibliotekę przeznaczoną do tworzenia własnych, niestandardowych zdarzeń w workerach! [Przykład na żywo](https://embed.plnkr.co/paXQMzkeXRX8AozeJUIp/).

<p class="note">Jeśli zastanawiasz się, czy ten przykład zadziała także we wspomnianych Service Workerach, to śpieszę powiedzieć, że jak najbardziej! Prawdopodobnie zajdzie jedynie konieczność dodania naszej metody <code>raiseEvent</code> również do <code>ServiceWorker.prototype</code>.</p>

## Podejście alternatywne

Istnieje także inne podejście do problemu – o wiele bardziej skomplikowane i (moim zdaniem) niewarte zachodu. Chodzi o nadpisanie metod `addEventListener` i `removeEventListener`. Jedyną przewagę tego sposobu nad pokazanym w tym artykule jest możliwość stworzenia całkowicie niezależnego obiegu zdarzeń, który nie opiera się na `self.dispatchEvent`. Niemniej jest stosunkowo mało przypadków, gdy jest to faktycznie potrzebne.

I to by było na tyle. Miłego dodawania niestandardowych zdarzeń do swoich workerów!
