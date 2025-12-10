---
layout: post
title: "Zostawiając awizo…"
description: "Krótko o powiadamianiu czytników ekranowych o zmianach na stronie i czemu potrzebujemy ariaNotify."
author: Comandeer
date: 2025-12-11T00:01:00+0100
tags:
    - adwent-2025
    - standardy-sieciowe
    - a11y
comments: true
permalink: /zostawiajac-awizo.html
---

Kolejną teoretycznie prostą sprawą jest powiadamianie czytników ekranu o zmianach na stronie. Jednak w praktyce jest to o wiele bardziej skomplikowane, niż się wydaje na pierwszy rzut oka.<!--more-->

## Powiadamianie o zmianach na stronie

Czasy całkowicie statycznych stron skończyły się eony temu. Obecnie bardzo często zachodzi potrzeba dynamicznej zmiany treści na stronie, np. w aktualizowanej na żywo relacji z meczu czy w odpowiedzi na akcję osoby użytkowniczej. Osoby, które nie korzystają z technologii asystującej, najczęściej są w stanie taką zmianę zauważyć (strona się wizualnie zmienia). Niemniej osobom korzystającym z technologii asystującej (a zwłaszcza czytników ekranu) taka zmiana może umknąć. Wypada więc w jakiś sposób je o niej poinformować.

Jednym ze sposobów są tzw. [<i lang="en">live regions</i> (żywe regiony, regiony zmieniające się na żywo)](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions). Gdy oznaczy się element na stronie przy pomocy [atrybutu `[aria-live]`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-live), wszelkie zmiay w jego zawartości będą odczytywane osobie korzystającej z czytnika ekranu. Dodatkowo, przy pomocy wartości tego atrybutu, możemy określić, czy czytanie ma być "uprzejme" (`polite`), czy "asertywne" (`assertive`). To pierwsze poczeka, aż osoba skończy wykonywać aktualną czynność (np. czytać akapit tekstu) i dopiero przeczyta komunikat. To drugie przerwie aktualną czynność i komunikat zostanie przeczytany natychmiast. Dodatkowo, przy pomocy [atrybutu `[aria-atomic]`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-atomic) można określić, czy za każdym razem ma być odczytywana cała zawartość elementu z `[aria-live]`, czy tylko jej zmieniona część.

Warto też zauważyć, że istnieją [role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles), które odpowiadają wartościom atrybutu `[aria-live]`. Elementy z [atrybutem  `[role=status]`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role) będą czytane uprzejmie, natomiast elementy z [atrybutem `[role=alert]`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/alert_role) – asertywnie.

{%note %}W większości przypadków nie ma potrzeby przerywać osobie użytkowniczej aktualnej czynności, stąd `[aria-live=assertive]` oraz `[role=alert]` powinny być używane tylko w naprawdę ważnych sytuacjach – takich jak np. krytyczne błędy.{% endnote %}

Niemniej żywe regiony mają jedną, zasadniczą wadę: powiadamiają czytnik ekranu tylko, gdy ich zawartość się zmieni. Nie da się po prostu wstawić elementu z komunikatem na stronę. Trzeba najpierw wstawić pusty element, a dopiero potem dodać do niego treść komunikatu. To sprawia, że całe API zaczyna być mocno upierdliwe w użyciu. Zwykle kończy się na tym, że na stronie istnieje sobie pusty element z atrybutem `[aria-live]`, a wokół niego istnieje całe API, którego zadaniem jest dodawać i usuwać komunikaty. A jeśli robimy większą aplikację, w której komunikatów może być sporo i mogą się pojawiać często, to de facto musimy zrobić cały mechanizm ich kolejkowania. Tak to działa np. [w CKEditorze 5](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-ui/src/arialiveannouncer.ts). Strasznie dużo roboty jak na coś, co powinno być proste.

## Nowy, wygodniejszy sposób

Na całe szczęście, [Edge zaproponował](https://blogs.windows.com/msedgedev/2025/05/05/creating-a-more-accessible-web-with-aria-notify) jakiś czas temu nowe API, [`ariaNotify()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/ariaNotify). To metoda, przypięta do elementów HTML, która pozwala na wysłanie komunikatu do czytnika ekranu:

```javascript
document.ariaNotify( 'Jakiś komunikat' );
```

Dzięki drugiemu argumentowi można też określić priorytet komunikatu:

```javascript
document.ariaNotify( 'Komunikat'. {
	priority: 'normal' // 1
} );

document.ariaNotify( 'Komunikat'. {
	priority: 'high' // 2
} );
```

Normalny priorytet (1) odpowiada czytaniu uprzejmemu, podczas gdy wysoki (2) – asertywnemu.

Nowe API rozwiązuje też problem kolejkowania komunikatów. Nie trzeba się już dłużej samemu tym zajmować, robi to za nas przeglądarka.

Gdzie jest więc haczyk? To wciąż mocno eksperymentalna technologia, która nawet nie ma specyfikacji. Na ten moment jest tylko [propozycja ze strony Edge'a](https://github.com/MicrosoftEdge/MSEdgeExplainers/blob/main/Accessibility/AriaNotify/explainer.md). Samo API na ten moment [działa wyłącznie w Chrome i Edge](https://caniuse.com/mdn-api_element_arianotify) – a i tam ma problemy poza Windowsem. Na razie zatem trzeba dalej męczyć się z żywymi regionami.

Bo dostępność nigdy nie może być za prosta, prawda?
