---
layout: post
title:  "BEM jako architektura"
author: Comandeer
date: 2017-05-12T21:00:00+0200
tags: 
    - html-css
    - javascript
    - daj-sie-poznac-2017
comments: true
permalink: /bem-jako-architektura.html
redirect_from:
    - /html-css/javascript/daj-sie-poznac-2017/2017/05/12/bem-jako-architektura.html
---

Co bardziej zaznajomieni z moją osobą zapewne już zorientowali się, że [udało mi się napisać książkę](http://helion.pl/ksiazki/javascript-programowanie-zaawansowane-tomasz-comandeer-jakut,jascpz.htm). Tworzę w niej [bibliotekę BEMQuery](https://github.com/BEMQuery) (wrócę do niej kiedyś… serio), która opiera się na bardzo prostym założeniu: zamiast pobierać elementy jak w jQuery, przy pomocy selektorów CSS, tworzę swój własny język zainspirowany [metodyką BEM](https://en.bem.info/). Można by wręcz odnieść wrażenie, że jestem fanatykiem BEM-u – piszę o nim książkę, piszę narzędzia nim inspirowane, wszędzie, gdzie tylko się da, ewangelizuję ludzi, żeby przeszli na BEM…

Nie zawsze tak jednak było. Kiedyś uważałem BEM za klasyczny przykład [classitisu](https://www.steveworkman.com/html5-2/standards/2009/classitis-the-new-css-disease/). Było to spowodowane prostym faktem, że niemal wszystkie materiały w Sieci, które przybliżyć miały czytelnikowi, czym jest BEM, skupiały się w gruncie rzeczy na jego najmniej istotnym elemencie: konwencji nazewniczej. Niemniej, gdy wspomina się o BEM, niemal wszyscy myślą właśnie o tym – o konwencji nazewniczej:

```html
<div class="block">
	<span class="block__element block__element_modified">Text</span>
</div>
```

[Nieco lepszy przykład](http://pasjaonline.pl/krotki-przyklad-na-zywo/) skonstruowałem lata temu. Nie zmienia to jednak faktu, że praktycznie wszystkie artykuły o BEM po polsku (ale nie tylko) sprowadzają się do tego samego: wspomnienia, że BEM to podział na bloki, elementy i modyfikatory i że jest to realizowane przy pomocy konwencji nazewniczej. I tutaj pojawia się problem: wiążę się całą metodykę z jej konkretną implementacją…

Wróćmy do samego początku, do podstaw i przyjrzyjmy się BEM nie przez pryzmat jego konwencji nazewniczej, ale _terminologii_. Pozwolę sobie użyć [swojego poprzedniego przykładu, formularza logowania](http://codepen.io/Comandeer/pen/epbaYM) i jeszcze raz spróbujemy go podzielić zgodnie z filozofią BEM. Dla przypomnienia, najważniejsze założenia BEM brzmią:

*   Strona nie jest monolitem. Każda strona składa się z bloków (dzisiaj rzeklibyśmy: komponentów), które są reużywalne i całkowicie odizolowane (samowystarczalne). To oznacza, że dany blok można "wyjąć" z danego miejsca, przełożyć w inne i wciąż będzie działać dokładnie tak samo.
*   Każdy blok składa się z elementów. Dany typ elementu może występować tylko w danym bloku.
*   Bloki i elementy mogą mieć swoje warianty, które są wprowadzane dzięki modyfikatorom.

Jak widać, takie założenia nie narzucają w żaden sposób konkretnej konwencji nazewniczej. Ba, jak na razie nawet nie poruszamy się w sferze kodu! Nie ma tu ani słowa ani o HTML-u, ani CSS-ie. I to jest właśnie jedna z największych zalet BEM-u, która traci się, gdy jest on sprowadzany tylko i wyłącznie do roli konwencji nazewniczej – wówczas staje się bowiem wyłącznie szczegółem implementacyjnym. A prawda jest taka, że BEM jest całkowicie niezależny od kodu HTML czy CSS. Jest warstwą abstrakcji, która pozwala oderwać się od myślenia HTML-em czy DOM-em i skupić na myśleniu _konkretnym projektem_. Mówiąc jeszcze inaczej: BEM dla każdego projektu, w którym go używamy, pozwala wytworzyć _język_, dzięki któremu jak najdokładniej ten projekt opiszemy (w sumie tworzy tzw. [DSL – Domain Specific Language](https://en.wikipedia.org/wiki/Domain-specific_language)).

I nie jest to bynajmniej twierdzenie na wyrost. W chwili, gdy zaczniemy dzielić stronę na poszczególne bloki, okaże się, że myślenie BEM-owe przychodzi nam w gruncie rzeczy niejako naturalnie. Gdy patrzymy na stronę, widzimy poszczególne bloki: nagłówek, nawigację, ów formularz logowania, który jest naszym przykładem, pasek z reklamami, stopkę itd. Gdy spojrzymy na każdy z tych bloków, mentalnie jesteśmy w stanie je dzielić dalej – na mniejsze bloki (np. menu w nagłówku) czy wreszcie na elementy, których już bardziej się podzielić nie da (np. pole do wpisania loginu w formularzu logowania). Po dłuższym przyjrzeniu się dostrzeżemy także podtypy poszczególnych bloków i elementów (modyfikatory): a to jeden z artykułów jest wyróżniony innym tłem, bo jest najpopularniejszy, a to link w menu jest podkreślony, bo prowadzi do aktualnej strony, a to pole w formularzu logowania ma czerwoną krawędź, bo jest źle wypełnione… Takie myślenie i nazywanie rzeczy bierze się wprost z obserwacji (dalej nie doszliśmy nawet do kodu!), z próby _nazwania_ tego, co widzimy na ekranie. To sprawia, że BEM na takim poziomie rozumienia staje się właśnie owym językiem, w którym możemy mówić o projekcie. I to językiem zadziwiająco kompatybilnym z innymi tego typu językami (np. [Atomic Design](http://bradfrost.com/blog/post/atomic-web-design/) – w gruncie rzeczy chodzi w nim dokładnie o to samo!).

Implikacje takiego rozumienia BEM są nie do przecenienia. W chwili przejścia od BEM jako szczegółu implementacyjnego do BEM jako języka zaczyna nam się krystalizować w końcu BEM jako **architektura**. Naturalną konsekwencją jest bowiem używanie tego samego języka na niemal wszystkich poziomach konkretnego projektu:

*   Pierwsze makiety strony (niekoniecznie nawet elektroniczne, bo ten pomysł sprawdzi się równie dobrze przy makietach papierowych!) są złożone z niezależnych bloków, a te – z przesuwalnych elementów. To sprawia, że testy i prototypowanie jest niesamowicie ułatwione. W każdej chwili jakąś część projektu można przesunąć w inne miejsce. Dodatkowo doskonale wiemy, jak przebiegają zależności i granice: formularz logowania jest formularzem logowania, a nie "tym tam w sidebarze".
*   [Design systems czy też visual languages](https://blog.prototypr.io/design-system-ac88c6740f53) skupiają się wokół zbioru puzzli, nie zaś – wielkich monolitów, które trudno ruszyć, a tym bardziej opisać.
*   Architektura systemu plików niejako też się sama układa. Podział na bloki w tym wypadku przecież też jest po prawdzie _naturalny_ – skoro cały system jest podzielony na poszczególne komponenty, grzechem z tej organizacji nie byłoby skorzystać i na poziomie plików.
*   W końcu kod też jest skupiony wokół komponentów. Nie dostosowujemy projektu do konkretnej implementacji, ale konkretną implementację do projektu. Innymi słowy: **odrzucamy** myślenie w HTML-u/DOM na rzecz myślenia w BEM.

I dopiero tutaj, w tym miejscu, wkraczamy na obszar kodu i implementacji. BEM jako język łączy caly projekt we wspólną całość i pozwala na proste porozumienie się pomiędzy wszystkimi jego uczestnikami: klient lepiej rozumie, z czego składa sie jego aplikacja, designerzy i fachowcy od UX mają z kolei wspólny język z programistami. A ci ostatni w końcu mogą przystąpić do przelewania BEM-u na kod.

Warto się teraz zastanowić, czym jest BEM na poziomie kodu. Skoro w każdym innym miejscu BEM jest _warstwą abstrakcji_, która organizuje projekt, wypada oczekiwać, że na poziomie kodu BEM również objawi się jako abstrakcja. I tak też się dzieje, BEM staje się abstrakcją nadbudowaną na DOM. Zamiast operować na konkretnych węzłach DOM, zaczynamy operować na blokach i ich elementach. Zamiast dodawać klasę do `input`a, **zmieniamy stan elementu służącego do wprowadzenia hasła użytkownika**. Niby zwykłe przesunięcie semantyczne, ale umożliwiające całkowite odseparowanie projektu od jego implementacji. Zmiana stanu (wprowadzenie modyfikatora) bowiem jest operacją spójną i dającą zawsze **ten sam rezultat** niezależnie od tego, w jaki sposób tę operację się przeprowadzi. Zmiana stanu elementu poprzez modyfikację DOM da taki sam rezultat jak zmiana stanu elementu poprzez wyrenderowanie nowej klatki w `canvas`. A to otwiera całkowicie nowe możliwości, w których GUI aplikacji niekoniecznie musi być napisane w HTML-u.

I teraz dopiero dochodzimy do konwencji nazewniczej BEM, która jest najpopularniejszą, ale nie jedyną możliwą implementacją BEM-u w HTML-u. Pozwoliłem sobie przygotować [przykładową implementację opartą na atrybutach `[data-*]`](http://codepen.io/Comandeer/pen/dWeWja), która _spełnia_ założenia BEM: mamy podział na bloki, elementy i są też modyfikatory. Ba, mamy rok 2017 i takie wynalazki jak React czy Web Components, które również mogą być sposobem na implementację BEM:

```html
<login-form>
	<login-input name="login" type="text">Login</login-input>
	<login-input name="Password" type="password" error>Hasło</login-input>
	<login-button>Zaloguj mnie</login-button>
</login-form>
```

To wciąż BEM – wciąż mamy wyraźny podział na bloki, elementy i modyfikatory.

Bardzo dobrym przykładem obrazującym sposób, w jaki BEM nadbudowuje się na DOM i stanowi uniwersalny język mówienia o projekcie, jest tzw. BEM tree:

```
login form
|
|-- input login
|
|-- input password
|
|-- action button
```

Na poziomie implementacji to drzewko mogłoby wyglądać tak, jako DOM:

```
form[method=POST][action="/login"].login-form
|
|-- input[type=text][name=login].login-form__input.login-form__input_login
|
|-- input[type=password][name=password].login-form__input.login-form__input_password
|
|-- button[type=submit].login-form__action-button
```

Podczas gdy drugie drzewko jest zrozumiałe niemal wyłącznie dla programistów i tych, którzy znają choćby podstawy HTML-a, pierwsze drzewko i hierarchia występujących w nim elementów jest zrozumiała dla każdego. Jest bowiem wyrażona w abstrakcyjnym języku, stworzonym na potrzeby opisu konkretnych rzeczy w konkretnym projekcie.

I dlatego bardzo nie lubię, gdy BEM rozpatruje się wyłącznie pod kątem konwencji nazewniczej, skoro traktowanie go jako warstwy abstrakcji pozwala na stworzenie uniwersalnego języka opisu projektu aplikacji (i to na każdym etapie: od stworzenia wymagań biznesowych, poprzez prototypowanie UX-owe, projektowanie graficzne, na faktycznej implementacji kończąc), a tym samym – niejako samo z siebie narzuca architekturę (COMPONENT EVERYTHING!). BEM jako DSL – tak, BEM jako konwencja nazewnicza – meh, nie ma sensu.
