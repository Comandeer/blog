---
layout: post
title:  "Pudełko z ciasteczkami"
description: "Ciasteczka są częścią platformy sieciowej od prawie zawsze. W końcu doczekały się sensownego API."
author: Comandeer
date: 2025-12-15T00:00:00+0100
tags:
    - adwent-2025
    - standardy-sieciowe
comments: true
permalink: /pudelko-z-ciasteczkami.html
---

Relacja Sieci z [<i lang="en">cookies</i> (ciasteczkami)](https://developer.mozilla.org/en-US/docs/Glossary/Cookie) od prawie samego początku była mocno skomplikowana. Powstały jako wynalazek Netscape'a, żeby przechowywać krótkie informacje po stronie przeglądarki. Potem zaczęły być używane do śledzenia osób przeglądających Internet. W końcu pojawiły się [ciasteczkowe prawa](https://www.cookiebot.com/en/cookie-law/) i dzisiaj praktycznie każda strona ma informację o wykorzystaniu ciasteczek. Niemniej nie tylko na polu prawno-etycznym ciasteczkom było trudno.<!--more-->

## Podstawy działania ciasteczek, czyli stary przepis babci

Lata 90. to był dziwny czas dla platformy sieciowej. Jej kształt dopiero się wykuwał i sporo obecnie standardowych technologii wtedy nawet nie istniało. Same ciasteczka pojawiły się w 1994, więc na rok przed JavaScriptem! Z tego też względu [oryginalna propozycja Netscape'a](https://web.archive.org/web/19961027104920/http://www.netscape.com/newsref/std/cookie_spec.html) z oczywistych względów nie wspomina o żadnym JS-owym API. Zamiast tego jedynym sposobem ustawienia ciasteczek był nagłówek HTTP `Set-Cookie`:

```
Set-Cookie: NAME=VALUE; expires=DATE; path=PATH; domain=DOMAIN_NAME; secure
```

Jego poszczególne części to:

1. `NAME` – nazwa ciasteczka,
2. `VALUE` – wartość ciasteczka
3. `expires=DATE` – data ważności, po której ciasteczko zostanie usunięte; format daty opisany jest w [standardzie RFC 2616](https://datatracker.ietf.org/doc/html/rfc2616#section-3.3.1),
4. `path=PATH` – [ścieżka](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Path), dla której ciasteczko ma być używane,
5. `domain=DOMAIN_NAME` – nazwa domeny, dla której ciasteczko ma być używane,
6. `secure` – słowo kluczowe, oznaczające, że ciasteczko ma być wysyłane tylko bezpiecznym połączeniem (HTTPS).

Obowiązkowe było podanie tylko nazwy i wartości, resztę części można było ominąć.

Założenie ciasteczek było proste: serwer wysyła do przeglądarki jakąś informację (np. identyfikator koszyka w sklepie). Gdy dana strona zostanie potem ponownie odwiedzona, przeglądarka odsyła tę informację z powrotem. Robiła to przy pomocy nagłówka `Cookie`, dodawanego do żądania HTTP:

```
Cookie: cookie1=wartosc; cookie2=wartosc; cookie3=wartosc
```

Przeglądarka wysyłała jedynie nazwy i wartości istniejących ciasteczek. Każda para <nazwa, wartość> była oddzielona od siebie średnikiem. Tym sposobem można powiązać konkretną osobę (przeglądarkę) z konkretnymi danymi po stronie serwera.

Co ciekawe, nagłówek HTTP `Set-Cookie` niemalże w niezmienionej postaci przetrwał do dziś. Oficjalna specyfikacja ciasteczek, [RFC 6265](https://datatracker.ietf.org/doc/html/rfc6265), [definiuje go następująco](https://datatracker.ietf.org/doc/html/rfc6265#section-4.1):

```
Set-Cookie: NAME=VALUE; Expires=DATE; Max-Age=MAX_AGE; Domain=DOMAIN_NAME; Path=PATH; Secure; HttpOnly; EXTENSIONS
```

Tak naprawdę pojawiły się trzy nowe elementy:

1. `Max-Age=MAX_AGE` – liczba sekund, po której ciasteczko traci ważność,
2. `HttpOnly` – słowo kluczowe wskazujące, że ciasteczko ma być dostępne wyłącznie w żądaniach i odpowiedziach HTTP, bez dostępu z poziomu JS-a,
3. `EXTENSIONS` – dodatkowe elementy nagłówka, opisane w innych specyfikacjach.

Na ten moment istnieją tak naprawdę dwa ustandaryzowane dodatkowe elementy nagłówka:

1. `Partitioned` – słowo kluczowe wskazujące, że ciasteczko ma zostać wrzucone do osobnego słoika, dzięki czemu nie będzie mogło być użyte do śledzenia przeglądarki między różnymi stronami; część tzw. [CHIPS (Cookies Having Independent Partitioned State, Ciasteczka Posiadające Niezależny Podzielony Stan)](https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/Privacy_sandbox/Partitioned_cookies),
2. `SameSite=None|Lax|Strict` – określa, jak ciasteczko ma się [zachowywać w żądaniach pomiędzy różnymi stronami](https://web.dev/articles/samesite-cookies-explained).

{% note %}Nie będę tutaj wchodził w szczegóły tych dwóch rozszerzeń, ponieważ zasługują tak naprawdę na osobne artykuły. W tym artykule w zupełności wystarczy nam wiedza, że po prostu istnieją.{% endnote %}

Nawet jednak biorąc pod uwagę cztery nowe elementy nagłówka `Set-Cookie`, można spokojnie uznać, że podstawy działania ciasteczek pozostały niezmienne od _ponad 30 lat_. To wciąż są małe fragmenty informacji, które serwer może zapisać w przeglądarce, a przeglądarka odeśle je z powrotem przy każdym żądaniu HTTP.

## Stare API, czyli wyżerając surowe ciasto

Wraz z pojawieniem się JS-a powstała potrzeba odczytywania i ustawiania ciasteczek z jego poziomu. Powstała zatem [własność `document.cookie`](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie), Za jej pomocą można zarówno odczytywać, jak i zapisywać ciasteczka.

Żeby zapisać ciasteczko, ustawiamy wartość własności `document.cookie` na poprawną zawartość nagłówka HTTP `Set-Cookie`:

```javascript
document.cookie = `myCookie=wartosc;Expires=${ ( new Date( '2030-12-31' ) ).toUTCString() }`;
```

Powyższy kod stworzy nowe ciasteczko o nazwie `myCookie` i wartości `wartosc`. Ciasteczko będzie ważne do 31 grudnia 2030 roku. Warto zwrócić uwagę, że wykorzystaliśmy tutaj [metodę `Date#toUTCString()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toUTCString) – tworzy ona datę w formacie zgodnym ze [standardem RFC 7231](https://datatracker.ietf.org/doc/html/rfc7231#section-7.1.1.1). Ogólnie można uznać, że to ten sam format, który jest akceptowany w nagłówku `Set-Cookie`.

{% note %}W przypadku standardów opisywanych przez RFC, nowsze RFC nadpisują starsze RFC. Tym samym format daty został już wielokrotnie nadpisany. Po raz pierwszy pojawia się w [RFC 822](https://datatracker.ietf.org/doc/html/rfc822#section-5.1), potem w [RFC 1123](https://datatracker.ietf.org/doc/html/rfc1123#section-5.2.14), [RFC 2616](https://datatracker.ietf.org/doc/html/rfc2616#section-3.3.1), [RFC 2822](https://datatracker.ietf.org/doc/html/rfc2822#section-3.3), [RFC 5322](https://datatracker.ietf.org/doc/html/rfc5322#section-3.3) i w końcu – [RFC 7231](https://datatracker.ietf.org/doc/html/rfc7231#section-7.1.1.1). Na całe szczęście, zachodziły w nim głównie kosmetyczne poprawki oraz ujednolicanie różnych standardów. Oczywiście, ujednolicanie w ramach istniejących RFC – bo ten standard wciąż jest zupełnie inny niż [standard ISO 8601](https://en.wikipedia.org/wiki/ISO_8601).{% endnote %}

Żeby odczytać istniejące ciasteczka, można odczytać wartość własności `document.cookie`:

```javascript
console.log( document.cookie );
```

Zwróci to ciąg tekstowy w postaci:

```
cookie1=wartosc; cookie2=wartosc
```

Innymi słowy: jest to taki sam format, jaki ma nagłówek HTTP `Cookie`.

Stare JS-owe API ciasteczkowe jest, cóż, _proste_. I na tym jego lista zalet się kończy. Ustawianie zmiennej na wartość A, by następnie odczytać z niej wartość B samo w sobie brzmi jak słaby projekt API. Do tego dochodzą zwracanie ciasteczek w formie jednego, długiego ciągu znaków, który trzeba samemu parsować, oraz synchroniczność samego API. A mimo to przez lata nie doczekaliśmy się niczego sensowniejszego.

## Nowe API, czyli przechowując ciasteczka w słoiku

Dopiero całkiem niedawno doczekaliśmy się nowego API, [Cookie Store](https://cookiestore.spec.whatwg.org/). Składa się ono z dwóch zasadniczych części: [`CookieStore`](https://developer.mozilla.org/en-US/docs/Web/API/CookieStore) oraz [`CookieStoreManager`](https://developer.mozilla.org/en-US/docs/Web/API/CookieStoreManager).

{% note %}Tak, też uważam, że to [powinno się nazywać Cookie Jar API](https://github.com/whatwg/cookiestore/issues/48)!{% endnote %}

Przy ustawianiu i odczytywaniu ciasteczek potrzebny będzie nam `CookieStore`. Każda strona jest już w niego wyposażona, jako [własność `window.cookieStore`](https://developer.mozilla.org/en-US/docs/Web/API/Window/cookieStore):

```javascript
await cookieStore.set( 'testowe', 'jakaś wartość' ); // 1
await cookieStore.set( { // 2
	name: 'testowe2',
	value: 'ęą',
	sameSite: 'strict'
} );

console.log( await cookieStore.getAll() ); // 3

await cookieStore.delete( 'testowe' ); // 4
console.log( await cookieStore.get( 'testowe' ) ); // 5
```

Na sam początek dodajemy przy pomocy [metody `CookieStore#set()`](https://developer.mozilla.org/en-US/docs/Web/API/CookieStore/set) nowe ciasteczko o nazwie `testowe` i wartości `jakaś wartość` (1). Jeśli chcemy podać więcej opcji przy tworzeniu ciasteczka, można przekazać do metody `#set()` obiekt z opcjami (2). Akceptowana jest większość opcji z nagłówka HTTP `Set-Cookie`, oprócz `Secure` (bo Cookie Store API i tak wymaga HTTPS) i `HttpOnly` (bo ciasteczka dostępne wyłącznie przez HTTP nie mają sensu w JS-ie). Następnie przy pomocy [metody `#getAll()`](https://developer.mozilla.org/en-US/docs/Web/API/CookieStore/getAll) wyświetlamy wszystkie zapisane ciasteczka (3). Potem, przy pomocy [metody `#delete()`](https://developer.mozilla.org/en-US/docs/Web/API/CookieStore/delete) usuwamy ciasteczko `testowe` (4) i próbujemy je wyświetlić przy pomocy [metody `#get()`](https://developer.mozilla.org/en-US/docs/Web/API/CookieStore/get) (5). Z racji tego, że ciasteczka już nie ma, w konsoli pojawi się wartość `null`. Warto zwrócić przy okazji uwagę, że wszystkie metody `CookieStore` są asynchroniczne.

Na obiekcie `CookieStore` może też zajść [zdarzenie `change`](https://developer.mozilla.org/en-US/docs/Web/API/CookieChangeEvent). Odpala się ono w momencie, gdy zajdzie jakakolwiek zmiana w ciasteczkach:

```javascript
cookieStore.addEventListener( 'change', ( { changed, deleted } ) => { // 1
	console.group( 'CookieChangeEvent' ); // 4
	console.log( 'Zmienione ciasteczka', changed ); // 2
	console.log( 'Usunięte ciasteczla', deleted ); // 3
	console.groupEnd( 'CookieChangeEvent' ); // 5
} );
```

Nasłuchujemy na zdarzenie `change` (1). Gdy zajdzie, wyświetlamy informacje o nim: [listę zmienionych ciasteczek](https://developer.mozilla.org/en-US/docs/Web/API/CookieChangeEvent/changed) (2) oraz [listę usuniętych ciasteczek](https://developer.mozilla.org/en-US/docs/Web/API/CookieChangeEvent/deleted) (3). Dzięki [grupowaniu w konsoli](https://developer.mozilla.org/en-US/docs/Web/API/console/group_static) (4, 5) informacje o konkretnym zdarzeniu są ładnie oddzielone od reszty komunikatów w konsoli:

{% figure "../../images/pudelko-z-ciasteczkami/change.png" "Przykład wyświetlonych w konsoli dwóch zdarzeń change: każde z nich zaczyna się od nazwy grupy, napisanej pogrubionym fontem, &quot;CookieChangeEvent&quot;, następnie dwie wcięte względem nazwy linie – &quot;Zmienione ciasteczka&quot; wraz z tablicą zmienionych ciasteczek oraz &quot;Usunięte ciasteczka&quot; wraz z tablicą usuniętych ciasteczek." "Przykładowe zdarzenia `change`" %}

Z kolei [`CookieStoreManager`](https://developer.mozilla.org/en-US/docs/Web/API/CookieStoreManager) pozwala wykrywać zmiany w ciasteczkach z poziomu [Service Workera](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API). Nie umożliwia jednak modyfikowania ciasteczek.

Jeśli chodzi o `CookieStore`, [wszystkie najważniejsze przeglądarki go wspierają](https://caniuse.com/mdn-api_cookiestore). Z kolei [`CookieStoreManager` nie jest obsługiwany w Safari](https://caniuse.com/mdn-api_cookiestoremanager).

## Testowanie, czyli pora na degustację

Wypada jeszcze słowo poświęcić temu, w jaki sposób można testować ciasteczka. Tutaj na pomoc przychodzą [narzędzia deweloperskie przeglądarki (devtools)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/What_are_browser_developer_tools). W przypadku Chrome interesuje nas [zakładka <i lang="en">Application</i>](https://developer.chrome.com/docs/devtools/application). W niej z kolei znajduje się sekcja <i lang="en">Storage</i>, a w niej – [opcja <i lang="en">Cookies</i>](https://developer.chrome.com/docs/devtools/application/cookies). Po wejściu w nią, naszym oczom ukaże się lista zapisanych w przeglądarce ciasteczek dla danej strony:

{% figure "../../images/pudelko-z-ciasteczkami/chrome.png" "Zakładka &quot;Application&quot; w Chrome: po lewej menu z różnymi opcjami, z których wybrana jest opcja &quot;Cookies&quot; w sekcji &quot;Storage&quot;; po prawej tabelka z istniejącymi ciasteczkami i ich opcjami; pod tabelką panel, w którym wyświetlane są szczegóły aktualnie wybranego ciasteczka." "Widok ciasteczek w Chrome" %}

Z poziomu tego widoku można dodawać, modyfikować i usuwać ciasteczka. Co więcej, wszystkie zmiany wprowadzone tutaj zostaną wyłapane przez zdarzenie `change` obiektu `CookieStore`. Dzięki temu można przetestować, czy nasza logika obsługi ciasteczek działa poprawnie.

Z kolei w przypadku Firefoksa analogiczny widok jest dostępny w zakładce <i lang="en">Storage</i> w devtools:

{% figure "../../images/pudelko-z-ciasteczkami/firefox.png" "Zakładka &quot;Storage&quot; w Firefoksie: po lewej menu z różnymi typami zapisanych danych, z których wybrana jest opcja &quot;Cookies&quot;; na środku tabelka z istniejącymi ciasteczkami i ich opcjami; po prawej panel, w którym wypisane są szczegóły aktualnie wybranego ciasteczka." "Widok ciasteczek w FIrefoksie" %}

Tutaj też można dodawać, usuwać i modyfikować ciasteczka.

Zatem nie przedłużając już więcej: miłej degu… znaczy testowania ciasteczek!
