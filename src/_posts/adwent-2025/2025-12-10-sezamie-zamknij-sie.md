---
layout: post
title: "Sezamie, zamknij się!"
description: "Szybki rzut oka na to, czemu zamykanie rzeczy jednak nie jest aż tak proste i czemu potrzebujemy CloseWatchera."
author: Comandeer
date: 2025-12-10T00:04:00+0100
tags:
    - adwent-2025
    - standardy-sieciowe
comments: true
permalink: /sezamie-zamknij-sie.html
---

Czasami banalne czynności okazują się mieć ukrytą głębię. Tak też jest w przypadku… _zamykania_.<!--more-->

## Quiz

Na początek szybki quiz:

{% figure "../../images/sezamie-zamknij-sie/quiz.jpg" "Zawodnik poci się nad pytaniem w Milionerach, próbując zgadnąć poprawną odpowiedź. Pytanie brzmi: &quot;Na ile różnych sposobów można zamknąć &lt;dialog&gt;?&quot;. Możliwe odpowiedzi to: &quot;1&quot;, &quot;2&quot;, &quot;3&quot; oraz &quot;Więcej niż 3&quot;." %}

Zatem policzmy na szybko:

1. Przy pomocy [JS-owego API](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/close).
2. Przy pomocy formularza z atrybutem [`[method=dialog]`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form#method).
3. Przy pomocy klawiatury (naciśnięcie <kbd>Esc</kbd>).
4. Przy pomocy kliknięcia w tło (dzięki atrybutowyi [`[closedby]`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog#closedby)).
5. Przy pomocy przycisku "Wstecz" na Androidzie (przycisku _telefonu_, nie przeglądarki!).

Jestem pewien, że gdyby się uprzeć, dałoby się znaleźć jeszcze kilka innych metod. Niemniej jedno jest pewne: element `dialog` można zamknąć na zaskakująco dużo sposobów.

## Platformowe zamykanie

W przypadku natywnego elementu `dialog` te wszystkie metody dostajemy "w gratisie". Jednak gdy tworzymy [swój własny modal](https://github.com/KittyGiraudel/a11y-dialog), musimy sami zadbać o jego poprawne zamykanie:

1. JS-owe API możemy bez problemu dodać (i tak modal by bez niego nie działał).
2. Zamykanie przy pomocy formularza też da się łatwo zrobić – wystarczy przechwycić [zdarzenie `submit`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event).
3. Obsługa naciśnięcia <kbd>Esc</kbd> to z kolei [zdarzenie `keydown`](https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event), względnie [`keyup`](https://developer.mozilla.org/en-US/docs/Web/API/Element/keyup_event).
4. Kliknięcie w tło da się przechwycić, nasłuchując zdarzenia na całym dokumencie.
5. Z kolei zamykanie po naciśnięciu przycisku "Wstecz"… Ha! Tego akurat się nie da!

A przynajmniej: nie da się w _sensowny_ sposób. Zawsze można [dodać nowy wpis do historii przeglądania](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState), ale takie rozwiązanie ma zdecydowanie więcej wad niż zalet. Dodatkowo: ten sposób zamykania działa tylko na Androidzie. Urządzenia desktopowe raczej nie mają uniwersalnego przycisku "Wstecz". Nowy wpis w historii zepsułby tam przycisk "Wstecz" _przeglądarki_. Więc własne rozwiązanie musiałoby dodatkowo wykrywać, czy ma do czynienia z Androidową przeglądarką… Innymi słowy: trzeba by stworzyć skrajnie przeinżynierowany kod, który i tak często by zawodził.

Zresztą całe te rozważania pomijają jedną, niezwykle istotną kwestię: przeglądarki WWW mogą działać na przeróżnych urządzeniach. Na Androidzie da się zamknąć `dialog` przy pomocy przycisku "Wstecz". A co z innymi urządzeniami? Jak choćby smartwatch sterowany głosem? Prawda jest taka, że gdy to przeglądarka zamyka dla nas `dialog`, pozwala to zrobić na wszystkie sposoby, na które można coś zamknąć na danej platformie. A platformy różnią się dostępnymi sposobami. Na desktopie można nacisnąć <kbd>Esc</kbd>, na Androidzie ten nieszczęsny przycisk "Wstecz", na mikrofali trzeci przycisk od góry…

Podsumowując, nie da się w sensowny sposób stworzyć własnego modala tak, żeby był zamykalny dokładnie tak, jak sobie dana platforma to wymyśliła. Jako osoby tworzące strony po prostu nie mamy dostępu do informacji o samej platformie ani do jej "mechanizmów zamykania" (jakkolwiek by tego nie nazwać). Przeglądarka za to ma – i możliwe, że wkrótce się nim podzieli!

## Patrz, jak się zamyka…

Kilka lat temu Chrome zaproponował nowe API, [CloseWatchera](https://developer.mozilla.org/en-US/docs/Web/API/CloseWatcher). To bardzo proste API, którego jedynym celem jest nasłuchiwanie na zamknięcie. Co więcej: to API dostosowuje się do platformy, na której uruchomiona jest przeglądarka, przez co zamykanie zadziała dokładnie tak samo, jak w przypadku natywnego `dialog`a!

Wyobraźmy sobie więc, że mamy na stronie [wjeżdżające menu](https://www.webkrytyk.pl/2021/10/31/wpadki-i-wypadki-14/). Fajnie byłoby dać osobom odwiedzającym stronę możliwość jego zamykania przy pomocy <kbd>Esc</kbd> czy, wspomnianego w tym artykule zdecydowanie zbyt dużą liczbę razy, przycisku "Wstecz". Gdy ktoś kliknie na przycisk "Menu", to z lewej strony na ekran wjedzie menu. To też dobry moment, żeby stworzyć naszego obserwatora zamykania:

```javascript
function openMenu() { // 1
	// Pokazujemy element itd.

	const closeWatcher = new CloseWatcher(); // 2

	closeWatcher.addEventListener( 'close', closeMenu ); // 3
}

function closeMenu() { // 4
	// Zamykamy menu
}
```

W funkcji otwierającej menu (1) tworzymy nową instancję [`CloseWatcher`](https://developer.mozilla.org/en-US/docs/Web/API/CloseWatcher/CloseWatcher)a (2). Następnie przypinamy mu nasłuchiwacz na [zdarzenie `close`](https://developer.mozilla.org/en-US/docs/Web/API/CloseWatcher/close) (3) i gdy to zajdzie, odpalamy funkcję `closeMenu()` (4), która zamyka menu. I to tyle.

Teraz, jeśli ktoś naciśnie <kbd>Esc</kbd> albo tapnie przycisk "Wstecz", menu się automatycznie zamknie. Można też stworzyć przycisk, który będzie wprost wołał CloseWatchera:

```javascript
closeMenuButton.addEventListener( 'click', closeWatcher.close );
```

[Metoda `CloseWatcher#close()`](https://developer.mozilla.org/en-US/docs/Web/API/CloseWatcher/close_event) zamyka otwartą rzecz. Istnieje też [metoda `CloseWatcher#requestClose()`](https://developer.mozilla.org/en-US/docs/Web/API/CloseWatcher/requestClose), która przed samym zamknięciem odpali [zdarzenie `cancel`](https://developer.mozilla.org/en-US/docs/Web/API/CloseWatcher/cancel_event), pozwalające anulować zamykanie (np. jeśli ktoś nie wypełnił formularza i chcemy się upewnić, że to zrobi przed zamknięciem modala).

Warto też zaznaczyć, że CloseWatcher jest jednorazowy. W momencie, gdy zajdzie zdarzenie `close`, przestanie on reagować na wszelkie próby zamykania. Dlatego trzeba tworzyć nowy obiekt `CloseWatcher` za każdym razem, gdy otwieramy menu.

A na koniec – małe demko zamykalnego, wjeżdżającego menu:

{% include 'embed' src="https://codepen.io/Comandeer/pen/raePOvW" %}

Jedyny problem? [Kompatybilność](https://caniuse.com/wf-closewatcher). Na razie to API jest dostępne jedynie w Chrome. A szkoda, zdecydowanie uprościłoby życie tym wszystkim, którzy muszą coś _zamknąć_.
