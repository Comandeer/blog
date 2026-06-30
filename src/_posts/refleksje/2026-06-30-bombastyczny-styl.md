---
layout: post
title:  "Bombastyczny styl"
description: "Czy aby na pewno promujemy odpowiednie wartośći jako brana"
author: Comandeer
date: 2026-06-30T23:50:00+0200
tags:
    - refleksje
comments: true
permalink: /bombastyczny-styl.html
---

> Ale ja nie mogę zrozumieć! Nie mogę zrozumieć, jak zachwyca, jeśli nie zachwyca.
>
> – Witold Gombrowicz, <cite>Ferdydurke</cite>

Ostatnio w kilku różnych miejscach przewinąła się ta sama strona internetowa jako przykład dobrze zaprojektowanej strony – [igloo.inc](https://www.igloo.inc/). Swego czasu wygrała nawet [tytuł strony dnia w serwisie Awwwards](https://www.awwwards.com/sites/igloo-inc). I mam z tego powodu mieszane odczucia.

<!--more-->

## Estetyka przede wszystkim?

Nie powiem, strona może zainteresować swoim wyglądem. Efekt paralaksy, animowane igloo, transformacje 3D kostek lodu, ciekawy "narracyjny" scroll… Pod względem designu dzieje się tu bardzo dużo interesujących rzeczy.

Tylko czy web design jest bardziej o designie, czy jednak bardziej o _webie_? W tym przypadku medium ma bardzo duże znaczenie i bezpośrednio wpływa na to, jakich form i środków ekspresji używać może projekt. Co więcej, web design wypadałoby rozpatrywać z perspektywy sztuki użytkowej – a więc takiej, której ostatecznym rezultatem jest przedmiot codziennego użytku, który jest przy tym estetyczny. A to oznacza, że te przedmioty muszą być _użyteczne_. Po co komu choćby szklanka bez denka? I na tym zasadza się cały problem z tego typu stronami: są estetyczne, często wręcz wytyczające trendy – ale trudno je uznać za użyteczne.

Żeby nie być gołosłownym, pozwolę sobie wskazać kilka problemów ze stroną Igloo, Inc.:

* **Strona jest całkowicie niedostępna dla czytników ekranu**. Do jej stworzenia użyto [elementu `canvas`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas). Niemniej nie dodano treści alternatywnej. Czytnik ekranu nie ma zatem żadnej informacji o tym, co się dzieje na stronie. W dobie [HTML-in-Canvas](https://html-in-canvas.dev/) to mocno słabe rozwiązanie.
* **Nawigacja klawiaturą jest niemożliwa**. Co prawda strzałki w górę i w dół przewijają stronę, ale nie ma żadnego sposobu, by sfocusować linki na stronie lub aktywować jakikolwiek element interaktywny. Razi to zwłaszcza na ekranie z linkami do mediów społecznościowych, ponieważ można pomiędzy poszczególnymi linkami przemieszczać się przy pomocy strzałek w lewo i w prawo, ale nie można ich aktywować, naciskając <kbd>Enter</kbd>.
* **Wszystko się rusza**. I ja rozumiem, że taki był zamysł, ale [media query `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) nie powstało bez powodu. Część osób ma [problemy z błędnikiem](https://www.a11yproject.com/posts/understanding-vestibular-disorders/) i nie może korzystać ze stron z animacjami ruchowymi. Część osób może też po prostu nie lubić ruszających się rzeczy i fajnie byłoby to uszanować.
* **Dźwięk jest automatycznie włączany**. Wystarczy zacząć przewijać i nagle pojawia się muzyka w tle, a różne elementy reagują dźwiękami na choćby najechanie myszą. Nawet jeśli nie uznamy tego za błąd dostępności, to jest to skrajnie irytujące.

Nie jest to oczywiście lista wszystkich problemów. Wymieniłem jedynie te widoczne na pierwszy rzut oka. Ale już dwa pierwsze z nich tak naprawdę dyskwalifikują tego typu projekt w czasach [Europejskiego aktu o dostępności](https://www.webkrytyk.pl/2025/06/23/wpadki-i-wypadki-21-europejski-akt-o-dostepnosci/). Wpływają też bezpośrednio na jego użyteczność. Niemniej strona na Awwards w kategorii <q>użyteczność</q> dostała ocenę 7.5/10. I to pomimo tego, że tak naprawdę jest używalna tylko przy pomocy myszy, względnie dotyku!

Czy jako branża naprawdę nie mamy problemu z tym, że promujemy design, który tylko wygląda, ale nie niesie ze sobą użyteczności i dostępności? Czy na pewno chcemy jako przykłady pokazywać strony, które wykluczają bardzo spore grono osób z możliwości interakcji z nimi? Bo jak dla mnie projekty pokroju Awwwards zdecydowanie za bardzo skupiły się na formie, zapominając o treści.

## Ale to już było…

A najśmieszniejsze w tym wszystkim jest to, że jestem wystarczająco stary, by pamiętać, jak to już kiedyś przerabialiśmy jako branża. Istniało coś takiego jak [Flash](https://en.wikipedia.org/wiki/Adobe_Flash). Był to program do animacji, później przejęty przez Adobe. Animacje w nim tworzone były zapisywane w formacie `.swf` i by je odtworzyć, potrzebny był specjalny plugin do przeglądarki, Flash Player. I tak, to był [_plugin_](https://developer.mozilla.org/en-US/docs/Glossary/Plugin), nie [rozszerzenie](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/What_are_WebExtensions). Żeby osadzić animację Flasha na stronie, używało się [elementu `embed`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/embed) – albo, jeśli chciało się być cool i mieć walidujący się XHTML, [elementu `object`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/object).

Lista problemów z takimi animacjami była praktycznie identyczna jak w przypadku omawianej strony. Flash był tak naprawdę monolitycznym blobem, którego często nie dało się nawet obsłużyć przy pomocy klawiatury. A do tego sam Flash znany był ze swojej zasobożerności, niestabilności i licznych problemów z bezpieczeństwem. Aż w końcu [Steve Jobs wypowiedział mu wojnę](https://en.wikipedia.org/wiki/Thoughts_on_Flash) i zastąpił go HTML5 z `canvas`em. Flash, mimo bycia jednym z kamieni węgielnych internetowej popkultury ([Newgrounds](https://www.newgrounds.com/)!), został wyparty przez otwarte standardy sieciowe.

Zatem: [ale to już było](https://www.youtube.com/watch?v=RXM-9haRVl8)… i jednak wróci więcej?
