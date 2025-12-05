---
layout: post
title:  "Aktualizacja zainstalowana"
description: "Trochę o tym, jak można obecnie zainstalować PWA, a jak będziesz można wkrótce przy pomocy Web Install API."
author: Comandeer
date: 2025-12-02T00:53:00+0100
tags:
    - adwent-2025
    - standardy-sieciowe
comments: true
permalink: /aktualizacja-zainstalowana.html
---

Edge ostatnio ogłosił, że [rozpoczyna testy Web Install API](https://blogs.windows.com/msedgedev/2025/11/24/the-web-install-api-is-ready-for-testing). To dość spore wydarzenie w świecie [PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps), ponieważ w końcu mamy szansę otrzymać standard pozwalający kontrolować instalowanie aplikacji webowych.<!--more-->

## Instalacja PWA

Zacznijmy od szybkiego wyjaśnienia, czym jest instalacja PWA. Jeśli zainstaluje się aplikację webową, to zachowuje się ona podobnie do takiej desktopowej/mobilnej. Skrót do niej pojawi się na pulpicie (lub w doku), a sama aplikacja dostanie swoje własne okienko, najczęściej pozbawione paska adresu. Ot, aplikacja sieciowa upodabnia się do _zwyczajnej_ aplikacji w danym systemie.

{% figure "../../images/aktualizacja-zainstalowana/zainstalowane-pwa.jpg" "Strona główna mojego bloga wyświetlona w okienku, w którym jest tylko cienka belka tytułowa z nazwą strony (Comandeerowy blog) na środku oraz z przyciskami do włączania rozszerzeń przeglądarki i menu po prawej stronie." "Mój blog zainstalowany przy pomocy Chrome'a na macOS-ie." %}

Tego typu zainstalowana aplikacja ma dostęp do wszystkich rzeczy, do których ma dostęp "zwykła" strona WWW. Ale ma też dostęp do kilku rzeczy zarezerwowanych tylko dla tego typu aplikacji, jak np. [ustawienie licznika powiadomień na ikonce aplikacji](https://developer.chrome.com/docs/capabilities/web-apis/badging-api). Innymi słowy: zainstalowane PWA dostają dodatkowe dyngsy, przy pomocy których mogą się lepiej zintegrować z systemem urządzenia.

Sam proces instalacji różni się między poszczególnymi przeglądarkami, np. w Chrome odpowiedni przycisk znajduje się bezpośrednio w pasku adresu.

{% figure "../../images/aktualizacja-zainstalowana/instalacja-chrome.png" "Pasek adresu w Chrome z adresem &quot;https://blog.comandeer.pl&quot;. Po prawej stronie dwa przyciski: ekran komputera z naniesioną w prawym górnym rogu strzałką skierowaną w dół oraz gwiazdka." "Ikonka komputera (druga z prawej) pozwala zainstalować PWA w Chrome." %}

Natomiast w przypadku takiego Safari instalacja ukryta jest w menu udostępniania strony jako dodawanie do doka.

{% figure "../../images/aktualizacja-zainstalowana/instalacja-safari.png" "Strona mojego blogu wraz z otwartym menu udostępniania w Safari. Wśród wielu opcji znajduje się też opcja &quot;Add to Dock&quot;." "Opcja dodania do doku w menu udostępniania w Safari." %}

## "Instalowalność" aplikacji

Jednak, żeby PWA mogło zostać zainstalowane, musi być [_instalowalne_](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable). Przeglądarki bowiem nie pozwalają instalować dowolnej strony. Podstawowym kryterium jest obecność [manifestu aplikacji webowej](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest). To plik JSON zawierający podstawowe informacje o aplikacji, takie jak:

* `name` – [nazwa aplikacji](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/name),
* `short_name` – [skrócona nazwa aplikacji](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/short_name) (używana w miejscach, gdzie pełna nazwa się nie mieści),
* `description` – [opis aplikacji](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/description),
* `icons` – [ikony aplikacji](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/icons) (żeby ładnie się prezentowała na pulpicie),
* `start_url` – [adres strony głównej](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/start_url),
* `id` – [identyfikator aplikacji](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/id) (w postaci URL-a; może być taki sam jak `start_url`),
* `screenshots` – [screenshoty aplikacji](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/screenshots),
* `display` – [sposób wyświetlania aplikacji](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/display), a więc rodzaj okienka (czy ma być bardziej aplikacyjne, czy bardziej przeglądarkowe).

Dzięki manifestowi przeglądarka wie, z jaką w ogóle aplikacją ma do czynienia. Przeglądarki wykorzystują też te informacje do tworzenia lepszych okienek instalacyjnych.

{% figure "../../images/aktualizacja-zainstalowana/instalacja-android.png" "W Chrome jest otwarta strona Squoosh.app. Okno jest nieaktywne z powodu okienka instalacji. Na górze okienka znajduje się ikona aplikacji wraz z jej nazwą i adresem oraz przycisk instalacji. Poniżej znajduje się tekstowy opis aplikacji, pod którymi znajdują się jej screenshoty." "Przykładowe okienko instalacji Squoosha w Chrome na Androidzie." %}

Drugim niezbędnym warunkiem instalowalności jest HTTPS. Jeśli strona nie zapewnia dostępnego połączenia, nie będzie można jej zainstalować.

Kiedyś Chrome narzucał też trzeci warunek: [strona musiała mieć service workera](https://stackoverflow.com/a/74968289). Teraz jednak to kryterium zostało usunięte.

## Przeglądarka ma władzę

Niemniej z instalowaniem PWA jest jeden zasadniczy problem: jako osoba tworząca PWA nie ma się żadnej kontroli nad instalacją aplikacji. To przeglądarka ostatecznie decyduje, czy strona jest godna instalacji i czy okienko instalacji w ogóle się pokaże. Przeglądarki oparte na Chromium mają dodatkowo niestandardowe [zdarzenie `beforeinstallprompt`](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event). Odpala się ono, gdy przeglądarka stwierdzi, że strona jest godna instalacji.

Samo zdarzenie ma metodę `prompt()`, która pokazuje okienko instalacji. Jeśli przechwycimy to zdarzenie i zapiszemy "na później", będziemy mogli wywołać okienko instalacji np. po naciśnięciu przycisku:

```html
<p>
	<button id="install">Install</button>
</p>
<script>
	let installPrompt; // 3

	window.addEventListener( 'beforeinstallprompt', ( evt ) => { // 1
		evt.preventDefault(); //2

		installPrompt = evt; // 4
	} );

	document.querySelector( '#install' ).addEventListener( 'click', async () => { // 5
		if ( installPrompt === undefined ) { // 6
			return;
		}

		await installPrompt.prompt(); // 7
	} );
</script>
```

Na początku musimy przypiąć się do zdarzenia `beforeinstallprompt`(1). Jeśli takowe zajdzie, anulujemy domyślną akcję przeglądarki (2) oraz do zmiennej `installPrompt` (3) zapisujemy samo zdarzenie (4). Następnie w obsłudze kliku przycisku (5) sprawdzamy, czy mamy zapisane zdarzenie z okienkiem instalacji (6). Jeśli tak, wywołujemy jego metodę `#prompt()` (7). Jeśli wszystko się udało, osoba odwiedzająca stronę zobaczy okienko instalacji.

W praktyce zależy to od humoru przeglądarki. Alternatywą jest wyświetlenie dokładnych instrukcji instalacji aplikacji po kliknięciu w przycisk, ale to też ma swoje problemy (np. każda przeglądarka obsługuje instalację inaczej). Brakuje sposobu, dzięki któremu to osoba tworząca aplikację może zadecydować o jej instalacji.

## Web Install API na ratunek

I tutaj całe na biało wchodzi [Web Install APi](https://github.com/MicrosoftEdge/MSEdgeExplainers/blob/main/WebInstall/explainer.md). To propozycja nowego API, stworzona przez Diego Gonzaleza z Microsoftu. Całość API sprowadza się do jednej nowej metody, `navigator.install()`:

```javascript
await navigator.install();
```

Wywołanie jej pokazuje okienko instalacji aplikacji. Nie ma żadnego magicznego zdarzenia, zależnego od widzimisię przeglądarki. Po prostu jedna metoda, którą można wywołać np. po kliknięciu w przycisk:

```html
<p>
	<button id="install">Install</button>
</p>
<script>
	document.querySelector( '#install' ).addEventListener( 'click', async () => {
		try {
			await navigator.install();
		} catch {
			// Instalacja się nie powiodła.
		}
	} );
</script>
```

Kliknięcie takiego przycisku zainstaluje daną stronę. Jedynym wymogiem jest istnienie manifestu aplikacji webowej z określonym `id` aplikacji.

{% note %}Z uwagi na to, że API jest w fazie testów, wymogi względem stron WWW mogą się jeszcze zmienić.{% endnote %}

Niemniej to tylko połowa możliwości tego API! Bo to API pozwala także instalować inne PWA:

```html
<p>
	<button id="install">Install</button>
</p>
<script>
	document.querySelector( '#install' ).addEventListener( 'click', async () => {
		try {
			await navigator.install( 'https://microsoftedge.github.io/Demos/pwa-pwastore/' )
		} catch {
			// Instalacja się nie powiodła.
		}
	} );
</script>
```

Kliknięcie takiego przycisku zainstaluje [przykładowy sklep z aplikacjami](https://microsoftedge.github.io/Demos/pwa-pwastore/), przygotowany przez Edge'a na potrzeby demonstracji Web Install API.

Z racji tego, że API jest dopiero w fazie testów, jest ukryte za flagami – zarówno w Edge'u, jak i w Chrome. W Chrome można je włączyć w wersji developerskiej (144 w momencie pisania tego artykułu) pod adresem `chrome://flags/#web-app-installation-api`, natomiast w Edge w wersji developerskiej (również 144) pod adresem `edge://flags/#web-app-installation-api`.

## Brakujące elementy

Jak widać, nowe API jest niezwykle proste – żeby nie rzec: prymitywne. Pozwala tak naprawdę wyłącznie na wywołanie instalacji aplikacji. To, czego mi najbardziej brakuje, to możliwości wykrycia, czy aplikacja jest już zainstalowana. W końcu nie ma sensu wyświetlać przycisku instalacji, jeśli ta się już odbyła…

Osobiście widziałbym tutaj drugą metodę, `navigator.isInstalled()`:

```javascript
const isInstalled = await navigator.isInstalled();

if ( !isInstalled ) {
	// Pokaż przycisk instalacji
}
```

Niemniej taka metoda byłaby dobra tylko dla akurat otwartej aplikacji. Możliwość sprawdzenia, czy na urządzeniu zainstalowana jest _dowolna_ aplikacja PWA, brzmi jak spory problem z prywatnością. Więc pewnie nie dostaniemy takiego API.

Trzeba sobie zatem radzić inaczej! Chyba najbardziej eleganckim sposobem jest sprawdzenie, [w jaki sposób strona jest wyświetlana](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/display-mode):

```css
@media ( display-mode: standalone ) {
	.install-button {
		display: none;
	}
}
```

Wciąż jednak Web Install API jest krokiem w dobrą stronę i po raz kolejny kawałek władzy został oddany w ręce osób tworzących strony WWW!
