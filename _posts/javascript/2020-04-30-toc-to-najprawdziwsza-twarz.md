---
layout: post
title:  "Toć to najprawdziwsza twarz…!"
author: Comandeer
date: 2020-04-30T23:24:00+0200
categories: javascript standardy-sieciowe
comments: true
permalink: /toc-to-najprawdziwsza-twarz.html
---

Google wierzy, że [Sieć może konkurować z natywnymi aplikacjami bez żadnego wstydu](https://www.chromium.org/teams/web-capabilities-fugu). Jednym z obszarów, na którym aplikacje sieciowe były słabsze od swoich natywnych odpowiedników, było wykrywanie różnych kształtów na zdjęciach. Ale te czasy już bezpowrotnie minęły!

## Shape Detection API

Pewien czas temu w WICG pojawił się nowy standard – [Shape Detection API](https://wicg.github.io/shape-detection-api/). Pozwala wykryć na obrazku dwa typy kształtów: [twarze](https://wicg.github.io/shape-detection-api/#face-detection-api) oraz [kody kreskowe/QR](https://wicg.github.io/shape-detection-api/#barcode-detection-api). Obecnie obydwa te mechanizmy znajdują w Chrome i choć kody kreskowe można już wykrywać bez problemu, API do wykrywania twarzy wciąż jest za flagą (`chrome://flags#enable-experimental-web-platform-features`). Istnieje jeszcze osobna specyfikacja, [Text Detection API](https://wicg.github.io/shape-detection-api/text.html), umożliwiająca wykrywanie – jak sama nazwa wskazuje – tekstu.

Wszystkie detektory mają takie samo API:

```javascript
const detector = new FaceDetector( optionalOptions );
const results = await detector.detect( imageBitmap );
```

Mamy dostęp do trzech nowych interfejsów globalnych (zarówno na stronie internetowej, jak i wewnątrz Web Workera):

* `FaceDetector`,
*  `BarcodeDetector`,
* `TextDetector`.

Parametr `optionaOptions` zawiera obiekt z dodatkową konfiguracją detektora. Każdy detektor ma swój zestaw opcji, które można modyfikować albo zostawić w spokoju – ich domyślne wartości powinny wystarczyć w większości przypadków.

Po skonstruowaniu detektora, możemy użyć jego asynchroniczną metodę `detect`, która wykrywa kształty na obrazku. Zwraca też obiekt ze współrzędnymi kształtu wraz z dodatkowymi informacjami (np. treść rozpoznanego tekstu w przypadku `TextDetector`a czy współrzędne oczy i nosa w przypadku `FaceDetector`a). Parametr `imageBitmap` to z kolei obrazek, który chcemy poddać wykrywaniu, przekazany jako [obiekt `ImageBitmap`](https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#imagebitmap).

<p class="note">Jeśli się zastanawiasz, czemu <code>ImageBitmap</code> zamiat zwykłego elementu <code>img</code> czy nawet <code>Blob</code>a: jest to powiązane z faktem, że detektory są dostępne także z poziomu workerów. To oznacza, że wszystko, co powiązane z DOM odpada z automatu. Dodatkowo <code>ImageBitmap</code> ma zdecydowanie więcej możliwości niż generyczny <code>Blob</code>. Pozwala bowiem tworzyć obrazki z wielu różnych źródeł, takich jak <code>canvas</code> (w tym te <a href="https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas" rel="noreferrer noopener">pozaekranowe</a>) czy nawet <code>video</code>.</p>

I to w zasadzie tyle!

## Przykładowa aplikacja

Dobrze, wykorzystajmy zatem dopiero co zdobytą wiedzę w praktyce – przygotujmy prostą aplikację sieciową!

### HTML

Zacznijmy od pliku `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Shape Detection API demo</title>
</head>
<body>
	<h1>Shape Detection API</h1>

	<h2>Face Detection</h2>
	<label>Choose image file: <input type="file" accept="image/*" data-type="face"></label>

	<h2>Barcode Detection</h2>
	<label>Choose image file: <input type="file" accept="image/*" data-type="barcode"></label>

	<h2>Text Detection</h2>
	<label>Choose image file: <input type="file" accept="image/*" data-type="text"></label>

	<script type="module">
	</script>
</body>
</html>
```

Plik zawiera trzy elementy `input[type=file]`, które będą źródłem obrazków do analizy. Wszystkie one posiadają atrybut `[data-type]`, który informuje skrypt, jakiego kształtu ma szukać. Jest także element `script[type=module]`, który zawiera kod obsługi naszych `input`ów:

```javascript
import detectShape from './detector.mjs'; // 1

document.body.addEventListener( 'change', async ( { target } ) => { // 2
	const [ image ] = target.files; // 3

	const detected = await detectShape( image, target.dataset.type ); // 4

	console.log( detected ); // 5
} );
```

Na początku importujemy funkcję `detectShape` z pliku `detector.mjs` (1). Ta funkcja będzie wykonywać całą robotę. Następnie podpinamy listener zdarzenia `change` bezpośrednio do `document.body` (2). Dzięki temu będzie on reagował na wszelkie zmiany we wszystkich `input`ach, z powodu mechanizmu [delegacji zdarzeń](https://javascript.info/event-delegation). Dodatkowo listener jest asynchroniczny, bo detektor też taki jest, a ja bardzo lubię składnię `async`/`await`. Pojawia się także destrukturyzacja argumentów funkcji, żeby dobrać się do własności `target` obiektu `event`, który jest zawsze przekazywany do listenera. Tym sposobem wiemy, z jakiego elementu pochodzi dane zdarzenie. Następnie pobieramy z pola plik, jaki wybrał użytkownik i zapisujemy go w zmiennej `image` (3). Przekazujemy ją potem do funkcji `detectShape` wraz z typem pożądanego detektora, który uzyskaliśmy z atrybutu `[data-type]` (4). Musimy poczekać na wynik, który potem po prostu wyświetlamy w konsoli (5).

## JS

Przejdźmy zatem do pliku `detector.mjs`:

```javascript
const options = { // 5
	face: {
		fastMode: true,
		maxDetectedFaces: 1
	},
	barcode: {},
	text: {}
}
async function detectShape( image, type ) {
	const bitmap = await createImageBitmap( image ); // 2
	const detector = new window[ getDetectorName( type ) ]( options[ type ] ); //3
	const detected = await detector.detect( bitmap ); // 6

	return detected; // 7
}

function getDetectorName( type ) {
	return `${ type[ 0 ].toUpperCase() }${ type.substring( 1 ) }Detector`; // 4
}

export default detectShape; // 1
```

W pliku znajduje się tylko jeden, domyślny eksport – `detectShape` (1). Ta funkcja konwertuje przekazany plik (który jest [obiektem `File`](https://developer.mozilla.org/en-US/docs/Web/API/File)) do obiektu `ImageBitmap` przy pomocy globalnej funkcji `createImageBitmap` (2). Następnie jest instancjonowany odpowiedni detektor (3). Nazwa konstruktora jest tworzona z parametru `type`. Jego pierwsza litera jest zamieniana na dużą oraz jest doklejany sufiks `Detector` (4). Istnieje także obiekt opcji dla każdego typu detektora (5). Dla detektora kodów kreskowych i tekstu używamy domyślnych opcji, niemniej dla detektora twarzy zmienamy dwie opcje: `fastMode`, która włącza nieco mniej dokładne wykrywanie (dzięki czemu wykryjemy więcej twarzy, ale także zwiększymy liczbę tzw. false positives), oraz `maxDetectedFaces`, którą ustawiamy na `1`, żeby wykryć tylko jedną twarz. Po stworzeniu detektora możemy wywołać jego metodę `detect` i poczekać na wyniki (6). Kiedy się pojawią, po prostu je zwracamy (7).

### Odpalanie aplikacji

Kodowanie zakończone, niemniej nasza aplikacja nie będzie działała poprawnie, jeśli odpalimy ją bezpośrednio z dysku. Spowodowane jest to głównie faktem, że moduły ES przestrzegają [zasad CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS). Są dwa rozwiązania tego problemu:

* powrót do starego, niemodułowego JS-a – wówczas przestaniemy być cool,
* użycie lokalnego serwera do serwowania strony – wówczas wciąż będziemy cool.

Na szczęście uruchomienie lokalnego serwera sprowadza się do wywołania poniższej komendy w katalogu aplikacji:

```shell
npx http-server ./
```

Komenda ta ściągnie i uruchomi [pakiet npm `http-server`](https://www.npmjs.com/package/http-server). Możemy następnie przejść pod adres `http://localhost:8080` (lub inny adres, który wyświetlił się w Twoim terminalu) i przetestować aplikację.

I to tyle! Dzięki tym nowym APIs można bez większych problemów wykrywać konkretne kształty na obrazkach – a przynajmniej w Chrome. Czy inne przeglądarki to również zaimplementują? Zobaczymy.

[Cały kod znajduje się na GitHubie](https://github.com/Comandeer/shape-detection-api-demo).

