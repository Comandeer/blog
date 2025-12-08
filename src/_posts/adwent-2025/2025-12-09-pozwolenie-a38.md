---
layout: post
title:  "Pozwolenie A38"
description: "Kiedy zwykłe pozwolenie to za mało."
author: Comandeer
date: 2025-12-09T00:00:00+0100
tags:
    - adwent-2025
    - standardy-sieciowe
comments: true
permalink: /pozwolenie-a38.html
---

Wszyscy to znamy. Chcemy coś zrobić w przeglądarce i pojawia się to wkurzające okienko z prośbą o pozwolenie:

{% figure "../../images/pozwolenie-a38/pozwolenie.png" "Wyskakujące okienko w przeglądarce Chrome z zapytaniem, czy pozwolić stronie http://localhost:3000 na odczytywanie tekstu i obrazków ze schowka systemowego, oraz przyciskami &quot;Block&quot; i &quot;Allow&quot;." %}

Ale czasami może być gorzej. Czasami trzeba mieć _pozwolenie na pozwolenie_…<!--more-->

## Potężne ficzery

Dawno, dawno temu pojawiła się specyfikacja pod intrygującą nazwą [<cite lang="en">Requirements for Powerful Features</cite> (Wymagania dla Potężnych Ficzerów)](https://www.w3.org/TR/2014/WD-powerful-features-20141204/). Niestety, nazwa została zmieniona i obecnie mamy [<cite lang="en">Secure Contexts</cite> (Bezpieczne Konteksty)](https://w3c.github.io/webappsec-secure-contexts/). A szkoda, bo nowej nazwie brakuje tego _czegoś_. Dodatkowo uważam, że stara o wiele lepiej oddawała, o co chodzi w tym dokumencie.

A chodzi o to, że w przeglądarkach są obecnie ficzery, którymi można zrobić krzywdę, jeśli użyje się ich niezgodnie z przeznaczeniem. Dobrym przykładem jest tutaj [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API), które pozwala [odczytywać tekst](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/readText) z systemowego schowka. Dlatego też przeglądarki stosują dodatkowe środki ochronne, by nie dało się użyć tego API w niecnych celach. Podstawową formą ochrony jest wymuszanie bezpiecznego połączenia przez HTTPS (stąd zresztą nazwa <q>_bezpieczne_ konteksty</q>). Niemniej nie jest to jedyny sposób ochrony. Kolejnym jest tzw. <dfn lang="en">user activation</dfn> (aktywacja przez osobę użytkowniczą).

## Aktywacja przez osobę użytkowniczą

Wyobraźmy sobie następującą sytuację: szukamy jakiejś informacji w Google. Klikamy na jeden z wyników i trafiamy na jakąś dziwną, podejrzaną stronę. Natychmiast ją zamykamy… Ale jest już za późno, bo zdążyła odczytać zawartość naszego schowka i zdobyć tym samym numer naszej karty kredytowej. Na całe szczęście to całkowicie nierealny scenariusz – i nie tylko dlatego, że raczej nikt nie ma ot tak skopiowanego numeru swojej karty. Żeby strona mogła odczytać dane ze schowka, muszą być spełnione dwa warunki:

1. musimy udzielić stronie pozwolenia na odczytywanie danych ze schowka,
2. strona musi być aktywowana.

To oznacza, że nawet zaufana strona, której udzielimy pozwolenia na dostęp do schowka, nie będzie mogła sobie ot tak odczytać z niego danych. Weźmy taki kod:

```javascript
setTimeout( async () => { // 1
	const text = await navigator.clipboard.readText(); // 3

	alert( text ); // 4
}, 2000 ); // 2
```

Ustawiamy timer (1) na 2 sekundy (2). Gdy miną, odczytujemy tekst ze schowka (3) i wyświetlamy go w wyskakującym alercie (4).

Jeśli wejdziemy teraz na taką stronę i nie będziemy w nią klikać ani w żaden inny sposób wchodzić z nią w interakcję, wyskakujące okienko się nie pokaże. Natomiast w konsoli pojawi się błąd:

```
Uncaught (in promise) NotAllowedError: Failed to execute 'readText' on 'Clipboard': Document is not focused.
```

Powyższy błąd pochodzi z Chrome'a. W Firefoksie wygląda nieco inaczej:

```
Uncaught (in promise) DOMException: Clipboard read request was blocked due to lack of user activation.
```

Innymi słowy: schowek potrzebuje [aktywacji ze strony osoby użytkowniczej](https://html.spec.whatwg.org/multipage/interaction.html#tracking-user-activation). Co to jednak oznacza? W największym skrócie: dopóki osoba użytkownicza nie kliknie w stronę, nie naciśnie żadnego klawisza na klawiaturze, nie sfocusuje strony, to ta pozostanie nieaktywowana. Dopiero, gdy osoba użytkownicza wykaże jakiekolwiek zainteresowanie stroną, wówczas przeglądarka pozwoli odczytać tekst ze schowka.

Co to jednak znaczy <q>wykazać zainteresowanie</q>? [Standard jest mocno precyzyjny](https://html.spec.whatwg.org/multipage/interaction.html#activation-triggering-input-event) w tym zakresie. Aktywacja zachodzi wtedy, gdy akcja osoby użytkowniczej odpali jedno ze zdarzeń:

* [`keydown`](https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event) – z wyłączeniem <kbd>Esc</kbd> oraz skrótów klawiszowych samej przeglądarki,
* [`mousedown`](https://developer.mozilla.org/en-US/docs/Web/API/Element/mousedown_event),
* [`pointerdown`](https://developer.mozilla.org/en-US/docs/Web/API/Element/pointerdown_event) i [`pointerup`](https://developer.mozilla.org/en-US/docs/Web/API/Element/pointerup_event) – ale tylko dla myszki,
* [`touchend`](https://developer.mozilla.org/en-US/docs/Web/API/Element/touchend_event).

Te zdarzenia muszą być [zaufane](https://kot-zrodlowy.pl/goscinne/2018/08/22/trusted-events.html#nie-ufam-ci), więc nie da się ich stworzyć w kodzie, muszą być rezultatem akcji ze strony osoby użytkowniczej.

Dodatkowo wyróżnić można dwa typy aktywacji:

* **[przyczepiona (<i lang="en">sticky</i>)](https://html.spec.whatwg.org/multipage/interaction.html#sticky-activation)** – akcja ze strony osoby użytkowniczej zaszła w dowolnym momencie od wczytania strony, np. ktoś kliknął przycisk 5 minut temu i od tego czasu nic więcej nie robił,
* **[przelotna (<i lang="en">transient</i>)](https://html.spec.whatwg.org/multipage/interaction.html#transient-activation)** – akcja ze strony osoby użytkowniczej właśnie się dzieje (np. ktoś klika przycisk) lub wydarzyła się góra kilka sekund temu.

W zależności od API, może ono wymagać jednego albo drugiego typu aktywacji. Dostęp do schowka wymaga tej przelotnej – żeby zagwarantować, że osoba użytkownicza faktycznie chce dać stronie ten dostęp. Na MDN-ie jest [lista API wymagających aktywacji](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/User_activation).

Warto też wspomnieć o [własności `navigator.userActivation`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userActivation), która zwraca informacje o stanie aktywacji strony:

```javascript
console.log( navigator.userActivation ); // { hasBeenActive: true, isActive: true }
```

Zwracany obiekt ma dwie własności:

* `hasBeenActive` – pokazującą, czy zaszła przyczepiona aktywacja,
* `isActive` – pokazującą, czy zachodzi przelotna aktywacja.

Dzięki temu prostemu API można się łatwo dowiedzieć, czy mamy już nasze _pozwolenie na pozwolenie_.
