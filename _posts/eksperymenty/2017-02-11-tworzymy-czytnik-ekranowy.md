---
layout: post
title:  "Tworzymy czytnik ekranowy"
author: Comandeer
date:   2017-02-11 21:46:18 +0100
categories: eksperymenty a11y
comments: true
---
Ostatnio [kumpel z pracy](https://github.com/Tade0) rzucił pomysłem: "a czemu w sumie nie napiszesz własnego czytnika ekranowego?". Tak po prawdzie nigdy się nad tym nie zastanawiałem jakoś specjalnie. Uważałem, że czytniki ekranowe są na tyle skomplikowane, że zrobienie tego _dobrze_ jest niezwykle trudne (co zresztą widać po tym jak wielkie rozbieżności są pomiędzy największymi w stawce, np. [VoiceOverem](http://www.apple.com/accessibility/mac/vision/) a [JAWS-em](http://www.freedomscientific.com/Products/Blindness/JAWS)). No i przede wszystkim jeszcze niedawno technologie webowe nie pozwalały na takie cuda, jak choćby czytanie tekstu na głos.

Ale to się zmieniło i powstało [Web Speech API](https://developers.google.com/web/updates/2013/01/Voice-Driven-Web-Apps-Introduction-to-the-Web-Speech-API), którego częścią jest [Speech Synthesis](https://developers.google.com/web/updates/2014/01/Web-apps-that-talk-Introduction-to-the-Speech-Synthesis-API), czyli – po ludzku – API do zamieniania tekstu pisanego na mowę. [Wsparcie jest zadziwiająco dobre](http://caniuse.com/#feat=speech-synthesis), zwłaszcza jak na coś, co [wciąż nie jest oficjalnym standardem od W3C](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html). Skoro zatem główną funkcjonalność czytnika ekranowego znajdziemy dzisiaj w _de facto_ każdej przeglądarce, to możemy nieco poeksperymentować, prawda? Udało mi się złożyć [przykładową implementację](https://comandeer.github.io/sr-poc/) (zgadnijcie, w czym nie działa…), o której nieco poopowiadam.

Wbrew pozorom sama zamiana tekstu na mowę jest w całym czytniku najłatwiejsza i sprowadza się do wywołania prostej metody [`speechSynthesis.speak`](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/speak). Najpierw jednak trzeba:

*   ustalić, które elementy można czytać;
*   zaznaczyć odpowiedni element;
*   określić, jak dokładnie należy go przeczytać użytkownikowi.

Przyjrzyjmy się tym czynnościom po kolei.

### Pobieramy czytalne elementy

Co chcemy czytać użytkownikowi? Odpowiedź "wszystko" nie jest zbyt zadowalająca. Nie wszystko bowiem na stronie nadaje się do czytania, np. elementy w `head` (pomijając rzecz jasna `title`). Użytkownik raczej nie byłby zachwycony, gdybyśmy mu zaczęli czytać zawartość poszczególnych metatagów. Wypada zatem założyć, że użytkownika interesuje jedynie zawartość `body`.

Niemniej i tak nie wystarczy pobrać wszystkich elementów z `body`, bo znajdziemy tam np. `script`, który żadnemu użytkownikowi potrzebny do szczęścia nie jest. Dodatkowo dzięki standardowi RDFa możemy się w środku strony natknąć na `meta[property]`. Wypada więc takie elementy usunąć. To jednak wciąż nie wszystko, bo niektóre elementy są niewidoczne – poprzez ukrycie przez `display: none;`, `visibility: hidden` czy `[hidden]`. Mamy także atrybut `[aria-hidden=true]`, który wymusza, aby dany element był pomijany przez czytniki ekranowe.

Gdy przyjrzymy się powyższej liście elementów, możemy podzielić je na 3 grupy:

*   elementy niewidoczne na stronie,
*   elementy z `[aria-hidden=true]` (widoczne na stronie, ale niewidoczne dla czytnika)
*   "normalne" elementy.

Nas interesują tylke te ostatnie, resztę możemy sobie podarować. W tym celu najłatwiej będzie pobrać wszystkie elementy z `body`, które nie mają atrybutu `[aria-hidden=true]`, a następnie przefiltrować tak uzyskaną kolekcję i wyrzucić wszystkie elementy, które się nie pokazują na stronie. Właśnie to robi funkcja `createFocusList`:

```javascript
const focusList = [];

function createFocusList() {
	focusList.push( ...document.querySelectorAll( 'html, body >:not( [aria-hidden=true] )' ) );

	focusList = focusList.filter( ( element ) => {
		const styles = getComputedStyle( element );

		if ( styles.visibility === 'hidden' || styles.display === 'none' ) {
			return false;
		}

		return true;
	} );
	[…]
}
```

Jak widać, pobieram wszystkie elementy z `body`, które nie mają atrybutu `[aria-hidden=true]`, przy pomocy [`document.querySelectorAll`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll), a następnie używam [spread operatora](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Spread_operator), żeby uzyskać prawdziwą tablicę i użyć na niej [`Array.prototype.filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter). Warunkiem filtrowania jest brak `display: none` i `visibility: hidden` w tzw. [<i>computed styles</i>](https://developer.mozilla.org/en/docs/Web/API/Window/getComputedStyle) (obliczonych stylach). To faktyczne style, jakie ma nadany element, po uwzględnieniu zarówno domyślnych stylów przeglądarki, jak i tych nadanych przez autora strony. Dzięki temu możemy tak wykryć zarówno elementy, które style przemycają przez klasy czy atrybuty takie jak `[hidden]`, ale także elementy, których przeglądarka nigdy nie renderuje (`meta, script` itp.; tak, przeglądarki dają im domyślnie `display: none`; tak, można to nadpisać). Dodatkowo pobieram także element `html`, który będzie reprezentował całą stronę.

To podejście dość naiwne i nie uwzględnia bardziej skomplikowanych przypadków (zagnieżdżone sekcje, pomijanie `p > span` itp.) czy `[role=presentation]`, jednak na start jest całkowicie wystarczające i dla prostych stron sprawdza się perfekcyjnie. Jeśli chcielibyśmy rozwijać projekt, to trzeba jednak poświęcić temu więcej czasu i zakodzić wsparcie dla wspomnianych przypadków. W końcu struktura strony _nigdy_ nie jest tak prosta, jak w moim przykładzie.

### Zaznaczanie elementu

Skoro mamy już listę elementów, które czytamy, pora zastanowić się jak umożliwić użytkownikowi poruszanie się pomiędzy nimi i czytanie ich. W przypadku normalnej pracy z przeglądarką przechodzenie pomiędzy poszczególnymi elementami interaktywnymi odbywa się przy pomocy klawisza <kbd>Tab</kbd>, zatem postanowiłem, że w przypadku dema zastosuję konwencję <kbd>[klawisz czytnika]</kbd> + <kbd>Tab</kbd> (klawiszem czytnika jest <kbd>Alt</kbd>). Co więcej, nie możemy się w przypadku czytnika ograniczyć tylko do elementów interaktywnych, ale powinniśmy dawać możliwość nawigowania po wszystkich elementach czytalnych. Najłatwiej po prostu przy naciśnięcu <kbd>Alt</kbd> + <kbd>Tab</kbd> przesunąć się o jeden element w przód w tablicy `focusList`, którą przed chwilą utworzyliśmy. Natomiast jeśli ktoś naciśnie <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>Tab</kbd>, wypada przesunąć się o jeden element wstecz w tablicy `focusList` (analogicznie do naciśnięcia <kbd>Shift</kbd> + <kbd>Tab</kbd>).

Wykonuje to prosta funkcja `moveFocus`, która jako parametr przyjmuje, o ile miejsc ma się przesunąć w tablicy `focusList` (jeśli liczba jest ujemna, to funkcja "cofnie się").

```javascript
function moveFocus( offset ) {
	[…]
	focusIndex = focusIndex + offset;

	if ( focusIndex < 0 ) {
		focusIndex = focusList.length - 1;
	} else if ( focusIndex > focusList.length - 1 ) {
		focusIndex = 0;
	}

	focus( focusList[ focusIndex ] );
}
```

Niemniej wypada się także zabezpieczyć przed sytuacją, w której użytkownik naciśnie sam <kbd>Tab</kbd> lub <kbd>Shift</kbd> + <kbd>Tab</kbd>. W takim wypadku wiemy, jaki element ma zostać zaznaczony, nie wiemy jednak, jaką ma pozycję na liście, więc trzeba ją odszukać, a następnie zaznaczyć element:

```javascript
function moveFocus( offset ) {
	[…]
    if ( offset instanceof HTMLElement ) {
		focusIndex = focusList.findIndex( ( element ) => {
			return element === offset;
		} );

		return focus( offset );
	}
	[…]
}
```

Wykorzystuję w tym celu [`Array.prototype.findIndex`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex).

Przyjrzyjmy się teraz funkcji `focus`:

```javascript
function focus( element ) {
	if ( element === document.body ) {
		element = document.documentElement;
	}

	element.setAttribute( 'data-sr-current', true );
	element.focus();

	announceElement( element );
}
```

Jak widać, funkcja ustawia elementowi atrybut `[data-sr-current]`, który służy głównie do odpowiedniego ostylowania elementu (nadania mu grubej, czarnej ramki wokół), a następnie focusuje go i przystępuje do jego czytania (`announceElement`).

Gdybyśmy ograniczyli się wyłącznie do nadania atrybutu `[data-sr-current]`, to nasz czytnik co prawda przeczytałby odpowiedni element, ale focus mógłby być na całkowicie innym elemencie strony. To spowodowałoby sytuację, w której użytkownik słuchałby o linku i próbował z niego skorzystać, a faktycznie naciskałby przycisk w innej części strony… Dlatego wraz z przemieszczaniem się "kursora" czytnika ekranowego, przesuwamy wraz z nim natywny focus. Proste i skuteczne rozwiązanie.

Niemniej pojawia się pewien problem: Chrome gubi focus i nie ogarnia, na którym ostatnio elemencie był – zwłaszcza jeśli nie był to element interaktywny. To może zaburzać pracę ze stroną, jeśli użytkownik miesza używanie <kbd>Alt</kbd> + <kbd>Tab</kbd> i samego <kbd>Tab</kbd>.  Na szczęście [istnieje na to lekarstwo](https://www.viget.com/articles/skip-link-primer), które zastosujemy w momencie tworzenia listy `focusList`:

```javascript
function createFocusList() {
	[…]
	focusList.forEach( ( element ) => {
		element.setAttribute( 'tabindex', element.tabIndex );
	} );
}
```

Tak, Chrome (tak jak i inne przeglądarki) prawidłowo nadaje elementom właściwość `tabIndex`, mimo to i tak wymaga jawnego nadania atrybutu `[tabindex]`, żeby działać poprawnie. Cóż, na szczęście to rozwiązuje nasz problem w pełni.

Zostały tylko dwie kwestie: usuwanie zaznaczenia ze starych elementów przy przenoszeniu się na inne oraz ustawianie kursora czytnika po jego włączeniu na aktualnie focusowanym elemencie. Pierwsza to proste wywołanie `element.removeAttribute`, natomiast drugie sprowadza się do ustawienia kursora na `document.activeElement`.

I znów: naiwne podejście, ale sprawdza się, o dziwo, bardzo dobrze.

### Czytanie elementu

Przy czytaniu elementów największym problemem jest to, w jaki sposób dany element przeczytać. W końcu doszedłem do wniosku, że… najlepiej nie czytać elementów. Nie, nie oszalałem – podszedłem do sprawy tak, jak powinno się podejść!

A mianowicie: elementy zastąpiłem rolami. [Standard ARIA](http://w3c.github.io/aria/aria/aria.html) definiuje [wiele ról](http://w3c.github.io/aria/aria/aria.html#role_definitions), które mogą przyjąć elementy HTML. Wśród nich znajdziemy m.in. `banner` (nagłówek strony), `navigation` (nawigacja), `main` (główna treść strony) czy bardziej prozaiczne `button` (przycisk) i `link` (no zgadnijcie…). Innymi słowy: wszystkie elementy ciekawe z punktu widzenia dostępności są reprezentowane przez odpowiednią rolę w [drzewku dostępności](https://developers.google.com/web/fundamentals/accessibility/semantics-builtin/the-accessibility-tree). Inne nieciekawe elementy po prostu są przezroczyste (Chrome prezentuje je jako `group` – najbardziej podstawową rolę) i prezentują swoją treść. Istnieje też [dokładny spis domyślnych ról dla poszczególnych elementów HTML](https://w3c.github.io/html-aria/#docconformance).

Z racji tego, że np. element `p` można zamienić w nagłówek poprzez zastosowanie `[role=heading]`, to opieranie algorytmu czytania (ależ to pięknie brzmi!) na elementach HTML to ślepa uliczka. Prędzej czy później i tak musielibyśmy sięgnąć do ról. Zatem czemu od początku nie odrzucić HTML-a na ich rzecz? Wystarczy umieścić w kodzie podobną do tej w specyfikacji listę przyporządkowującą domyślne role do elementów HTML i gotowe! Oczywiście nie można zapomnieć o możliwości nadpisania roli przy pomocy `[role]`:

```javascript
const mappings = {
  button: 'button',
  […]
};

function computeRole( element ) {
	const name = element.tagName.toLowerCase();

	if ( element.getAttribute( 'role' ) ) {
		return element.getAttribute( 'role' );
	}

	return mappings[ name ] || 'default';
}
```

Następnie dla każdej roli możemy dopisać inną funkcję czytającą, dzięki czemu dla przycisków możemy poinformować użytkownika, że może nacisnąć go poprzez naciśnięcie spacji, a dla nagłówków podać ich poziom (czyli cyferkę po `h*`).

```javascript
const announcers = {
	[…]
	button( element ) {
		say( `Button, ${ computeAccessibleName( element ) }. To press the button, press Space key.` );
	},
	[…]
};
```

Zapewne zastanawiasz się, co robi funkcja `computeAccessibleName`. Otóż zgodnie ze specyfikacją ARIA, elementy mają tzw. <i>accessible name</i> (dostępną nazwę), czyli tekst, którym przeglądarka przedstawia dany element w drzewku dostępności. W przypadku `input` jest to zawartość odpowiedniego `label`, w przypadku `img` – atrybut `[alt]` itd. W większości przypadków element jest przedstawiany przy pomocy własnej zawartości tekstowej. Można to jednak zmienić, dodając atrybut `[aria-label]` czy `[aria-labelledby]`.

Funkcja `computeAccessibleName` przedstawia się następująco:

```javascript
function computeAccessibleName( element ) {
	const content = element.textContent.trim();

	if ( element.getAttribute( 'aria-label' ) ) {
		return element.getAttribute( 'aria-label' );
	} else if ( element.getAttribute( 'alt' ) ) {
		return element.getAttribute( 'alt' );
	}

	return content;
}
```

Bardzo prosta, _naiwna_ (jak cała reszta) implementacja, która pomija bardzo wiele szczegółów i na chwilę obecną używa wyłącznie `[aria-label], [alt]` i zawartości elementu. I tutaj ciekawostka: `[aria-label]` ma wyższy priorytet niż `[alt]`.

Na podstawową implementację coś takiego starczy. W normalnej trzeba by było jeszcze sprawdzać, czy aby jakaś część zawartości nie powinna zostać pominięta (bo ma np. `[aria-hidden=true]`), czy też element nie ma dodatkowego opisu podanego przez `[aria-describedby]` itp. Itd.

### Mówimy!

I teraz, po tych wszystkich przygotowaniach, możemy w końcu coś powiedzieć:

```javascript
function say( speech, callback ) {
	const text = new SpeechSynthesisUtterance( speech );

	if ( callback ) {
		text.onend = callback;
	}

	speechSynthesis.cancel();
	speechSynthesis.speak( text );
}
```

Jak widać, tekst, który chcemy powiedzieć, musi być zamknięty w instancji klasy [`SpeechSynthesisUtterance`](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance). To pozwala nam przypiąć się do różnych zdarzeń, np. w naszym przypadku podpinamy się pod zdarzenie `end`, które zachodzi, gdy dany tekst zostanie przeczytany. Wywołanie `speechSynthesis.cancel` z kolei przerywa czytanie właśnie czytanego tekstu (żeby nie musieć słuchać długiego opisu linków, gdy już jesteśmy na kolejnym elemencie). No i w końcu _coś mówimy_ przy pomocy metody `speak` – wow!

***

Jak widać, stworzenie prymitywnego czytnika ekranowego nie jest jakimś mega wyzwaniem. Niemniej, jak już mówiłem, zrobienie tego dobrze – i to na DOM – [nie jest łatwe](https://www.marcozehe.de/2013/09/07/why-accessibility-apis-matter/). Jesteśmy bowiem zmuszeni do żmudnego, własnoręcznego parsowania poszczególnych elementów i wyciągania z nich informacji, które przeglądarki udostępniają w drzewku dostępności. Z drugiej jednak strony możemy wyciągnąć też i te informacje, których [przeglądarki jeszcze nie udostępniają](http://www.html5accessibility.com/).

Niemniej największą wadą tego typu czytnika ekranowego jest fakt, że będzie działał tylko i wyłącznie ze stronami internetowymi, więc nie ma nawet po co stawać w szranki z VoiceOverem czy JAWS-em. Ale może być bardzo ciekawym eksperymentem czy wręcz narzędziem do testowania dostępności stron i… implementacji innych czytników ekranowych czy drzewka dostępności w przeglądarce. Pod warunkiem, że zrobi się to _dobrze_. A na to potrzeba czasu – czegoś, czego mi często brakuje…
