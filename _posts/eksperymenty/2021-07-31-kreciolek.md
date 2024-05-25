---
layout: post
title:  "Kręciołek!"
author: Comandeer
date: 2021-07-31T23:50:00+0200
tags: 
    - eksperymenty
comments: true
permalink: /kreciolek.html
---

Jeśli w wolnym czasie człowiek bawi się w tworzenie narzędzi uruchamianych w terminalu, to prędzej czy później stanie przed poważnym wyzwaniem – implementacją kręciołka, znanego też pod swoją angielską nazwą, spinnera. Przyszło zatem i mnie zmierzyć się z tym tematem.

## Dlaczego nie gotowe rozwiązania?

"Przecież pewnie jest pełno gotowych spinnerów w npm!" – zakrzyknie Co Bardziej Rozgarnięty Czytelnik. I muszę przyznać Ci, drogi Czytelniku, rację. Tak, jest ich pełno. Ale mój szybki research przekonał mnie, że większość ma mało przyjazne API, nie była aktualizowana od długiego czasu lub ogólnie wydaje się nie być rozwijana. Na szczęście istnieje [Sindre Sorhus](https://sindresorhus.com/), który w JS napisał już wszystko, więc także i kręciołka. Tak trafiłem na pakiet [`ora`](https://github.com/sindresorhus/ora), który ze wszystkich znalezionych przeze mnie spinnerów miał najprzyjaźniejsze API. Nie szukając zatem dłużej, zainstalowałem i… okazało się, że z bliżej niezidentyfikowanych powodów `ora` nie działała. Spinner często się duplikował, a dodatkowo nie był widoczny w terminalu nawet po wywołaniu metody do jego usuwania. Po 1.5 godziny debugowania doszedłem do wniosku, że to przecież _tylko_ spinner i nie ma sensu marnować na to większej ilości czasu.

Sięgnąłem zatem po opcję atomową. Wychodząc z logicznego założenia, że spinner, który pokazuje się w npm przy instalacji zależności, _musi_ działać (w końcu wyświetlany jest jakieś… **kilkadziesiąt milionów** razy miesięcznie), poszperałem i znalazłem pakiet [`gauge`](https://github.com/npm/gauge). I faktycznie, działa i już go wdrożyłem w swoich projektach potrzebujących kręciołka. Tylko że jest jeden problem. Tak, jak większość narzędzi wykorzystywanych w npm, tak i ten ma API równie przyjemne, co jedzenie kawałków szkła zalanych kwasem siarkowym na śniadanie. Prosty przykład: trzeba ręcznie wywoływać każdą klatkę animacji spinnera. W chwili, gdy wdrażałem spinner, był także [problem związany z brakiem  jednej z zależności w `package.json`](https://github.com/npm/gauge/issues/123), ale widzę, że został rozwiązany kilka dni temu.

Dlatego doszedłem do wniosku, że sprawdzę, czy nie da się napisać jakiegoś prymitywnego kręciołka samodzielnie, bez potrzeby uciekania się do gotowców. I okazuje się, że jak najbardziej się da i nie jest to specjalnie trudne!

## Kontrola nad terminalem

Jednym z najpopularniejszych pakietów do pracy z terminalem jest [`chalk`](https://github.com/chalk/chalk) (stworzony przez Sindre'a Sorhusa – a jakże!). Pakiet ten pozwala na kolorowanie komunikatów wyświetlanych w terminalu. Dlaczego o nim wspominam? Bo wykorzystuje on specjalne sekwencje znaków, które terminal odczytuje jako polecenie przełączenia na odpowiedni kolor, np.

```javascript
console.log( '\x1b[31mTest' );
```

Powyższy kod odpalony w Node.js wyświetli czerwony tekst "Test". Odpowiedzialny za to jest kod `\x1b[31m`.  [Kodów jest o wiele, wiele więcej](https://en.wikipedia.org/wiki/ANSI_escape_code) i oprócz kolorów pozwalają też na kontrolowanie m.in. pozycji kursora.

Jedynym problemem może być wsparcie dla tego typu sekwencji ucieczki (jak to się ładnie nazywa). Jeśli wsparcie na Linuksach czy macOS-ach jest pewne, tak problem może pojawić się na Windowsie. Z własnego doświadczenia mogę powiedzieć, że na Windowsie 10 powinno działać – zarówno w standardowym cmd, jak i w PowerShellu. Na starszych Windowsach prawdopodobnie będziemy musieli obejść się smakiem.

## Ogólne założenia kręciołka

Zasada działania kręciołka jest dość prosta. Jak przyjrzymy się, jak zachowuje się terminal, to zauważymy, że wypluwa informacje linia po linii. Każdy `console.log` to kolejna linia. Z kolei kręciołek "siedzi" cały czas w tej samej linii i w dodatku jest animowany. Musimy zatem znaleźć sposób na to, aby zablokować przechodzenie do kolejnej linii…

Albo podejść do sprawy z innej strony. Zablokowanie przechodzenia do kolejnej linii jest tak naprawdę równoznaczne z wyczyszczeniem aktualnej linii i zapisaniem w niej nowej treści. Zatem przy każdej klatce animacji usuwamy aktualną linię w terminalu i wstawiamy w niej nową zawartość. Można to zrobić przy pomocy odpowiednich kodów. Najpierw należy przejść na początek aktualnej linii przy pomocy `\r` (czyli znaku powrotu karetki), a następnie użyć kodu `\x1b[K`, który powoduje usunięcie zawartości linii od pozycji kursora do samego jej końca. Po usunięciu zawartości linii można następnie wstawić kolejną klatkę animacji. Cały mechanizm przypomina nieco używanie [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) w przeglądarce. Tam też jesteśmy zmuszeni do kontrolowania każdej klatki osobno.

Pozostaje jeszcze jeden problem: `console.log` wymusza przejście do nowej linii na końcu każdego wyświetlonego komunikatu. A tego nie chcemy. Tu na szczęście przychodzi nam z pomocą fakt, że `process.stdout` (czyli tzw. standardowe wyjście, a więc w naszym wypadku terminal) jest [strumieniem](https://nodejs.org/api/stream.html). Dzięki temu możemy całkowicie pominąć pośrednika w postaci `console` i wypisywać komunikaty bezpośrednio. Da nam to całkowitą kontrolę nad formatowaniem, w tym nad znakami nowej linii. A to dokładnie to, czego potrzebujemy, by upewnić się, że spinner będzie prawidłowo odświeżany.

## Prototyp

Napiszmy więc szybki prototyp. Stwórzmy sobie plik `spinner.js`. Pierwsze, co będziemy chcieli zrobić, to stworzyć sobie tablicę klatek ze spinnerem. W naszym wypadku będą to kreski:

```javascript
const spinner = [
	'/',
	'-',
	'\\',
	'|'
];
```

Następnie chcemy napisać prostą funkcję, która będzie pobierała poszczególne klatki spinnera. Nazwijmy ją `prepareFrame`:

```javascript
const spinner = [
	…
];
let currentFrame = 0; // 1

function prepareFrame() {
	return spinner[ currentFrame++ % spinner.length ]; // 2
}
```

Tworzymy sobie licznik `currentFrame` (1), który będzie nam wskazywał, która klatka animacji powinna być aktualnie wyświetlana. Następnie w dość przerażająco wyglądającej linijce (2) pobieramy potrzebną nam ramkę. Rozbijmy tę linijkę na części.

 `currentFrame++` oznacza, że wartość `currentFrame` zostanie zwiększona o 1 po wykonaniu działania obecnego w tej linijce. To oznacza, że dla pierwszego wywołania `prepareFrame` możemy wyrażenie `currentFrame++` zamienić na `0`. Z kolei `spinner.length` możemy podmienić na `4` (bo tyle mamy kresek w tablicy `spinner`). Otrzymujemy zatem mniej groźnie wyglądające działanie `0 % 4` – czyli 0. Dla kolejnego wywołania będziemy mieli `1 % 4` – czyli 1 itd. Wykorzystanie operatora `%` pozwala nam na nieresetowanie licznika, gdy ten przekroczy długość tablicy, np. `8 % 4` da nam 0, `9 % 4` – 1 itd.

Liczbę uzyskaną z tego działania przekazujemy jako indeks do tablicy `spinner` i zwracamy element znajdujący się pod tym indeksem. W ten sposób wyciągamy odpowiednią kreskę z tablicy.

Jednak sama kreska musi być też narysowana i podmieniana przez nowe co określony czas. Napiszmy zatem funkcję `drawFrame`, która będzie to robić:

```javascript
[…]
function drawFrame() {
	const nextFrame = prepareFrame(); // 2

	console.log( nextFrame );

	setTimeout( drawFrame, 60 ); // 1
}

drawFrame(); // 3

```

Jeśli teraz odpalimy nasz program, zauważymy, że w nieskończoność wyświetla kreski z tablicy po kolei (program można ubić naciskając <kbd>Ctrl</kbd> + <kbd>C</kbd>, również na macOS-ie). Osiągnęliśmy to dzięki zastosowaniu `setTimeout` (1), które wywołuje rysowanie kolejnej klatki animacji (czyli dokładnie jak przy `requestAnimationFrame`!). Wykorzystujemy tutaj także funkcję `prepareFrame` do pobierania kolejnych klatek (2). Na samym końcu wywołujemy funkcję `drawFrame` (3), by rozpocząć animację.

Oczywisty problem z aktualnym podejściem polega na tym, że wykorzystuje `console.log`, przez co uzyskujemy każdą klatkę w nowej linii. Zmieńmy zatem nieco kod funkcji `drawFrame` i zastosujmy strumień:

```javascript
[…]

function drawFrame() {
	const nextFrame = prepareFrame();

	process.stdout.write( nextFrame, 'utf8', () => { // 1
		setTimeout( drawFrame, 60 ); // 2
	} );
}

[…]
```

Pojawiła się funkcja `process.stdout.write` (1). Służy ona do wysyłania danych do strumienia. Funkcja ta przyjmuje trzy argumenty: tekst (dane), który chcemy umieścić w strumieniu, kodowanie tego tekstu oraz callback, który zostanie wywołany po umieszczeniu danych w strumieniu. W naszym wypadku po prostu kolejkujemy rysowanie kolejnej klatki (2).

<p class="note">Bardzo często spinnery są wyświetlane w <code>stderr</code> (czyli strumieniu przeznaczonym na błędy). Jest to związane z niepisaną konwencją, według której <a href="https://web.archive.org/web/20201111211140/https://www.jstorimer.com/blogs/workingwithcode/7766119-when-to-use-stderr-instead-of-stdout" rel="noreferrer noopener">wszystkie diagnostyczne rzeczy powinny trafiać właśnie tam</a>.</p>

Jeśli odpalimy program teraz, zauważymy, że kolejne klatki co prawda wyświetlają się w tej samej linii, ale poprzednie nie są usuwane. A to dlatego, że nie usuwamy tego, co jest w tej linii. W tym celu najlepiej będzie zmienić funkcję `prepareFrame`, by dodawała do klatki także odpowiednie sekwencje ucieczki:

```javascript
function prepareFrame() {
	const eraseLineCmd = '\r\x1b[K'; // 2
	const nextFrame = spinner[ currentFrame++ % spinner.length ]; // 3

	return eraseLineCmd + nextFrame; // 1
}
```

Teraz funkcja zwraca ramkę (1), która składa się z dwóch rzeczy: kodu, który przesuwa kursor na początek linii, a następnie usuwa jej zawartość (2), oraz samej ramki (3). Po odpaleniu naszego programu w takiej wersji, uzyskamy w końcu ładny kręciołek 🎉!

Cały kod wygląda tak:

```javascript
const spinner = [
	'/',
	'-',
	'\\',
	'|'
];
let currentFrame = 0;

function prepareFrame() {
	const eraseLineCmd = '\r\x1b[K';
	const nextFrame = spinner[ currentFrame++ % spinner.length ];

	return eraseLineCmd + nextFrame;
}

function drawFrame() {
	const nextFrame = prepareFrame();

	process.stdout.write( nextFrame, 'utf8', () => {
		setTimeout( drawFrame, 60 );
	} );
}

drawFrame();
```

## Co dalej?

Oczywiście taki kręciołek można rozwijać na wiele sposobów. Jednym z nich jest dodanie wsparcia dla etykiet tekstowych wyświetlanych obok animowanego kręciołka. Warto także dodać wykrywanie, czy aby na pewno terminal użytkownika wspiera takie rzeczy. No i w końcu warto to wszystko otoczyć w jakieś przyjemne API, by można było kontrolować, kiedy spinner ma się pokazywać i ukrywać. Jak to wygląda (czy też będzie wyglądać) u mnie, [można zobaczyć na GitHubie](https://github.com/Comandeer/cli-spinner).

PS jakby ktoś pytał, NIH to dla mnie taki [komiks internetowy](http://notinventedhe.re/).
