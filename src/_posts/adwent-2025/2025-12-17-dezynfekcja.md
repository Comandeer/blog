---
layout: post
title:  "Dezynfekcja"
description: "Rzut oka na HTML Sanitizer API – kolejną broń w arsenale przeciwko atakom XSS."
author: Comandeer
date: 2025-12-17T00:00:00+0100
tags:
    - adwent-2025
    - standardy-sieciowe
    - javascript
comments: true
permalink: /dezynfekcja.html
---

Internet nie jest bezpiecznym miejscem. Zagrożenia czyhają na każdym rogu. Jednym z nich są ataki XSS, które wymierzone są równocześnie w stronę WWW, jak i przeglądarkę. Na szczęście powstało nowe API, mające pomóc w ochronie przed nimi!<!--more-->

## XSS – czyli co zagraża aplikacji WWW?

Zacznijmy od tego, czym w ogóle jest atak [Cross-Site Scripting (XSS)](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS). W największym skrócie: to atak polegający na wstrzyknięciu złośliwego kodu na stronę WWW. Ten kod następnie zostanie wykonany przez przeglądarkę osoby odwiedzającej stronę. Taki kod może zrobić tak naprawdę wszystko, co potrafi JS w przeglądarce, np. pobranie ciasteczek i wysłanie ich do zewnętrznego serwera.

Wstrzyknięcia można dokonać na wiele różnych sposobów. Jednym z najczęstszych jest wykorzystanie formularzy na stronie, np. edytora postów na blogu czy księgi gości. Jeśli dostęp do takiego formularza mają też niezaufane osoby, wówczas jest spora szansa, że jedna z nich spróbuje zaatakować stronę. Choćby zostawiając poniższy wpis:

```html
<img src="x" onerror="alert( 'Słaba ta strona!' )">
```

Jeśli w żaden sposób nie filtrujemy danych przychodzących, tego typu kod może trafić do bazy danych, a ostatecznie – do przeglądarek innych osób odwiedzających stronę. Każdej z tych osób pokaże się wówczas wyskakujące okienko z tekstem <q>Słaba ta strona!</q>. Dzieje się tak, ponieważ atrybut `[onerror]` dodaje do obrazka nasłuchiwacz dla [zdarzenia `error`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/error_event). A to odpala się m.in wówczas, gdy wczytywany obrazek nie istnieje. Jeśli nie mamy na stronie obrazka pod ścieżką `/x` (a mało kto ma), to zdarzenie się odpali i kod wykona się u niczego niepodejrzewających osób odwiedzających naszą stronę.

## Istniejące sposoby ochrony

Mimo że XSS to jeden z podstawowych typów ataków, niemal tak stary jak sam Internet, to wciąż jest niezwykle popularny. Wciąż mocno się trzyma na [liście Top 10 OWASP](https://owasp.org/www-project-top-ten/) – raporcie opisującym dziesięć najpopularniejszych typów ataków w Internecie. Dlatego też wciąż potrzeba sensownych i sprawdzonych metod obrony przed nim. Dotąd trzeba było wykorzystywać w tym celu różne biblioteki. Jedną z najpopularniejszych jest [DOMPurify](https://github.com/cure53/DOMPurify), które działa nie tylko w przeglądarce, ale także w Node.js. Działanie tej biblioteki można zobaczyć w [oficjalnym demie](https://cure53.de/purify). Polega na usuwaniu z przekazanego ciągu tekstowego wszystkich niebezpiecznych fragmentów HTML-a. Jako przykład posłuży nam następujący kod:

```html
<script>alert( 'script' );</script> <!-- 1 -->
<img src="x" alt="" onerror="alert('obrazek')"> <!-- 2 -->
<span onmouseover="alert('hover')">Najedź mnie</span> <!-- 3 -->
```

Powyższy kod HTML po odpaleniu w przeglądarce wyświetli trzy wyskakujące okienka:

1. po wykonaniu skryptu z elementu `script`,
2. po błędzie wczytywania obrazka,
3. po najechaniu na tekst <q>Najedź mnie</q>.

Po przepuszczeniu tego kodu przez DOMPurify dostaniemy:

```html
<img src="x" alt=""> 
<span>Najedź mnie</span> 
```

Wszystkie JS-owe elementy kodu zostały usunięte, tym samym zostawiając wyłącznie bezpieczny HTML.

## HTML Sanitizer API – nowy obrońca Sieci

W końcu doczekaliśmy się API chroniącego przed XSS-em, które jest wbudowane w przeglądarkę – [HTML Sanitizer API (API Dezynfekujące HTML-a)](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API). Składają się na niego dwa główne elementy:

1. [metoda `#setHTML()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML), dołączona do elementów HTML i [korzeni Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot),
2. [statyczna metoda `Document.parseHTML()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/parseHTML_static).

### Bezpieczny zaułek

Metoda `#setHTML()` jest odpowiednikiem [własności `#innerHTML`](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML). Główna różnica między nimi polega na tym, że nowa metoda wyrzuca z przekazanego jej kodu HTML wszystkie niebezpieczne elementy:

```javascript
document.body.setHTML( `<script>alert( 'script' );</script>
<img src="x" alt="" onerror="alert('obrazek')">
<span onmouseover="alert('hover')">Najedź mnie</span>` );
```

Wykonanie tego kodu sprawi, że zawartość strony zostanie podmieniona na następującą:

```html
<span>Najedź mnie</span>
```

Jak widać, natywne API jest nawet dokładniejsze niż domyślne ustawienia biblioteki DOMPurify. Zniknął bowiem cały element `img`. Gdy przyjrzymy się [algorytmowi dezynfekcji HTML-a](https://wicg.github.io/sanitizer-api/#sanitization) w specyfikacji, zauważymy, że jednym z kroków jest usuwanie elementów, które nie występują w konfiguracji dezynfekcji. Jeśli nie podamy własnego obiektu z opcjami, wówczas zostanie użyty [domyślny](https://wicg.github.io/sanitizer-api/#built-in-safe-default-configuration) – a ten nie zawiera elementu `img`. Stąd nie ma go też w wynikowym HTML-u. Teoretycznie, żeby zachować obrazek, jako drugi argument metody `#setHTML()` trzeba podać [obiekt konfiguracyjny](https://developer.mozilla.org/en-US/docs/Web/API/SanitizerConfig) – ale na ten moment nie działa to w żadnej przeglądarce.

Z kolei metoda statyczna `Document.parseHTML()` jest odpowiednikiem [wbudowanego parsera HTML](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser). Metoda parsuje kod HTML, czyści go ze wszystkich niebezpiecznych fragmentów, a następnie tworzy nowy [obiekt `Document`](https://developer.mozilla.org/en-US/docs/Web/API/Document) na jego podstawie:

```javascript
console.log( Document.parseHTML( `<!DOCTYPE html>
    <html lang="pl">
        <head>
            <title>Testowy dokument</title>
        </head>
        <body>
            <script>alert( 'script' );</script>
            <h1>Hello, world!</h1>
        </body>
    </html>`) );
```

Ten kod wyświetli w konsoli następujący dokument:

```html
<!DOCTYPE html>
<html lang="pl">
	<head>
		<title>Testowy dokument</title>
	</head>
	<body>
		<h1>Hello, world!</h1>
	</body>
</html>
```

Jak widać, dokument jest praktycznie identyczny jak ten, który przekazaliśmy metodzie `Document.parseHTML()`. Jedyną różnicą jest brak elementu `script`.

### Niebezpieczna manipulacja

Warto wspomnieć, że zarówno `#setHTML()`, jak i `Document.parseHTML()`, mają swoje "niebezpieczne" odpowiedniki – [`#setHTMLUnsafe()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTMLUnsafe) oraz [`Document.parseHTMLUnsafe()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/parseHTMLUnsafe_static). Działają tak samo, ale nie usuwają niczego.

Tym samym, jeśli użyjemy `#setHTMLUnsafe()` na naszym testowym kodzie HTML:

```javascript
document.body.setHTMLUnsafe( `<script>alert( 'script' );</script>
<img src="x" alt="" onerror="alert('obrazek')">
<span onmouseover="alert('hover')">Najedź mnie</span>` );
```

do zawartości strony trafi dokładnie ten kod HTML, bez żadnego czyszczenia:

```html
<script>alert( 'script' );</script>
<img src="x" alt="" onerror="alert('obrazek')">
<span onmouseover="alert('hover')">Najedź mnie</span>
```

Podobnie stanie się, jeśli podmienimy `Document.parseHTML()` na `Document.parseHTMLUnsafe()`:

```javascript
console.log( Document.parseHTMLUnsafe( `<!DOCTYPE html>
    <html lang="pl">
        <head>
            <title>Testowy dokument</title>
        </head>
        <body>
            <script>alert( 'script' );</script>
            <h1>Hello, world!</h1>
        </body>
    </html>`) );
```

Ten kod stworzy dokładnie taki dokument HTML:

```html
<!DOCTYPE html>
<html lang="pl">
	<head>
		<title>Testowy dokument</title>
	</head>
	<body>
		<script>alert( 'script' );</script>
		<h1>Hello, world!</h1>
	</body>
</html>
```

### Kompatybilność

Gdzie zatem można użyć nowego API? Otóż… nigdzie. Pojawić się powinno w [Firefoksie 147](https://caniuse.com/mdn-api_element_sethtml), którego wydanie planowane jest na 13 stycznia 2026 roku. W Chrome dostępne jest jako eksperymentalny ficzer, ukryty za [flagą](https://developer.chrome.com/docs/web-platform/chrome-flags). Na ten moment [nie wiadomo](https://chromestatus.com/feature/5814067399491584), kiedy trafi do Chrome'a jako stabilny ficzer. Na pewno nie pomaga temu fakt, że [specyfikacja](https://wicg.github.io/sanitizer-api/) wciąż się zmienia i nie wyszła jeszcze z grupy inkubującej nowe standardy.

Zatem wygląda na to, że w najbliższej przyszłości rozwiązania pokroju DOMPurify wciąż będą jedynymi rozwiązaniami pozwalającymi dezynfekować kod HTML. Jednak przeglądarki mają w rękawie jeszcze jednego asa… Ale to już opowieść na inną okazję!
