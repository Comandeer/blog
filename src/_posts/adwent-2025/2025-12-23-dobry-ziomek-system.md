---
layout: post
title:  "Dobry ziomek system"
description: "Systemy operacyjne wcale nie są takie najgorsze, jeśli chodzi o dostępność."
author: Comandeer
date: 2025-12-23T00:00:00+0100
tags:
    - adwent-2025
    - a11y
comments: true
permalink: /dobry-ziomek-system.html
---

Dzisiaj chciałbym zwrócić uwagę na cichego bohatera dostępności: system operacyjny! Dostarcza on bowiem szeregu technologii asystujących oraz innych usprawnień dla osób z niepełnosprawnościami.<!--more-->

## Technologia asystująca

Czym jednak jest technologia asystująca? Za [definicją proponowaną przez WHO](https://www.who.int/news-room/fact-sheets/detail/assistive-technology):

> <p lang="en">Assistive products help maintain or improve an individual’s functioning related to cognition, communication, hearing, mobility, self-care and vision, thus enabling their health, well-being, inclusion and participation.</p>
>
> [Produkty asystujące pomagają w utrzymaniu lub poprawie funkcjonowania osoby w zakresie funkcji poznawczych, komunikacji, słuchu, mobilności, samoopieki oraz wzroku, pozwalając tej osobie być zdrową fizycznie i psychicznie, włączoną w życie społeczne oraz uczestniczącą w nim.]

Ta definicja jest niezwykle szeroka i obejmuje tak naprawdę wszystkie sprzęty oraz oprogramowanie, które pomagają w codziennym funkcjonowaniu. Stąd można do niej zaliczyć np. wózek inwalidzki, czytniki ekranu, ale też choćby lupę. Swego czasu [opisałem trochę przykładów takich technologii](https://gwd.comandeer.pl/dostepnosc/technologia-asystujaca/).

## Systemowa technologia asystująca

Systemy operacyjne dostarczają osobom z nich korzystających wbudowanych technologii asystujących. Lista takich technologii będzie się różnić w zależności od systemu. Weźmy jako przykład macOS-a. Chyba najbardziej znaną technologią asystującą dostępną wraz z tym systemem jest [czytnik ekranowy VoiceOver](https://en.wikipedia.org/wiki/VoiceOver). Nie jest bynajmniej jedyną. Ustawienia systemu posiadają mocno rozbudowaną sekcję poświęconą dostępności:

{% figure "../../images/dobry-ziomek-system/macos-ustawienia.jpeg" "Aplikacja Ustawienia, zakładka &quot;Accessibility&quot;; w sekcji &quot;Vision&quot; znajdują się opcje &quot;VoiceOver&quot;, &quot;Zoom&quot;, &quot;Hover Text&quot;, &quot;Display&quot;, &quot;Motion&quot;, &quot;Read & Speak&quot;, &quot;Audio Descriptions&quot;; w sekcji &quot;Hearing&quot; znajdują się opcje &quot;Hearing Devices&quot; oraz &quot;Audio&quot;; więcej opcji jest niewidocznych." "Sekcja ustawień dostępności" %}

Jak widać, macOS dzieli te ustawienia na poszczególne zmysły, które dane opcje mają wspierać. Stąd w kategorii wzroku mamy m.in. czytnik ekranu (VoiceOver), ale też ustawienia wyświetlacza czy animacji ruchowych, w słuchu – ustawienia dźwięku itd. Każda z tych opcji w menu posiada konkretne ustawienia, np. odnośnie animacji ruchowych:

{% figure "../../images/dobry-ziomek-system/macos-ruch.jpeg" "Aplikacja Ustawienia, zakładka &quot;Accessibility&quot;, podsekcja &quot;Motion&quot;; dostępne utawienia: &quot;Reduce motion&quot;, &quot;Dim flashing lights&quot;, &quot;Auto-play animated images&quot;, &quot;Prefer non-blinking cursor&quot;, &quot;Vehicle Motion Cues&quot;." "Sekcja ustawień dostępności dotyczących animacji ruchowych" %}

System od Apple pozwala na dostosowanie większości aspektów systemu, np. wyłączając autoodtwarzanie ruchomych obrazków (GIF-ów). I choć na początku ogrom opcji może przytłaczać, to sam fakt ich istnienia jest jak najbardziej pozytywny. W końcu jedne z najbardziej dostępnych rozwiązań to te, które można [najbardziej dostosować pod siebie](https://gwd.comandeer.pl/inkluzywnosc/preferencje-osoby-uzytkowniczej/)!

Windows również posiada dość rozbudowane opcje dostępności. Podobnie jak macOS udostępnia czytnik ekranowy, [Narratora](https://www.microsoft.com/en-us/windows/tips/narrator). W przypadku jednak tego systemu nie zdobył on nigdy większej popularności. Od lat na tej platformie królują [JAWS](https://vispero.com/jaws-screen-reader-software/) (płatny) oraz [NVDA](https://www.nvaccess.org/about-nvda/) (darmowy). Oprócz czytnika Windows oferuje choćby [lupę ekranową](https://support.microsoft.com/pl-pl/windows/u%C5%BCywanie-lupy-do-zapewnienia-lepszej-widoczno%C5%9Bci-element%C3%B3w-na-ekranie-414948ba-8b1c-d3bd-8615-0e5e32204198) (do powiększania fragmentów ekranu) czy [tryb wysokiego kontrastu](https://blog.comandeer.pl/czy-div-jest-dostepny#dost%C4%99pno%C5%9B%C4%87-to-nie-tylko-czytniki-ekranowe).

Systemy mobilne także dostarczają technologii asystujących. Zarówno Android, jak i iOS, mają wbudowane czytniki ekranowe – odpowiednio [TalkBack](https://support.google.com/accessibility/android/answer/6007100?hl=en) i VoiceOver. Mają także choćby opcję ograniczania animacji ruchowych. Także sporo linuksowych dystrybucji ma ustawienia dostępności, np. LInux Mint pozwala włączyć tryb wysokiego kontrastu i ma wbudowany czytnik ekranu ([Orcę](https://orca.gnome.org/)).

Innymi słowy: systemy operacyjne próbują dostarczyć niezbędnych narzędzi do tego, by mogło z nich korzystać jak najwięcej osób, w tym osoby z niepełnosprawnościami.

## System a przeglądarka

Jak zatem taka systemowa technologia asystująca przekłada się na przeglądarkę? To zależy. Wraz z rozwojem technologii sieciowych, osoby tworzące strony WWW dostały możliwość dowiedzenia się nieco więcej o systemie operacyjnym, na którym uruchomiona jest przeglądarka. Najczęściej dzięki nowym media queries w CSS-ie. Wśród nich wymienić można:

* [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) – informujące o ustawieniach dotyczących ograniczenia animacji ruchowych,
* [`forced-colors`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors) – informujące o trybie wymuszonych kolorów, czyli ograniczeniu palety dostępnych kolorów, jak w przypadku Windowsowego trybu wysokiego kontrastu,
* [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-color-scheme) – informujące o preferencjach osoby użytkowniczej co do doboru schematu kolorystycznego; inaczej mówiąc: czy woli jasny, czy ciemny motyw.

Część z systemowych ułatwień dostępu może być jednak "zakamuflowana". Dobrym przykładem są tu różnego rodzaju powiększenia. Działają one trochę jak zmniejszenie rozdzielczości: poszczególne elementy robią się większe, przez co są bardziej czytelne. Równocześnie jednak ogranicza to liczbę elementów widocznych w danej chwili na ekranie. Przeglądarka często interpretuje to jako mniejszy [viewport](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/CSSOM_view/Viewport_concepts). Co też dobrze pokazuje, jak zawodne jest opieranie responsywności na założeniu <q>mały ekran = urządzenie mobilne</q>.

Jeszcze inne technologie asystujące są całkowicie przezroczyste dla przeglądarki, jak np. czytniki ekranu. Nie ma żadnego sposobu, aby dowiedzieć się, że osoba odwiedzająca stronę używa czytnika ekranu. I to [akurat dobrze](https://axesslab.com/digital-apartheid/). Zwłaszcza, że stworzenie strony z zachowaniem standardów sieciowych i dobrych praktyk dostępności jest w większości przypadków wystarczające, by strona ta działała poprawnie we wszystkich popularnych czytnikach ekranu. Innymi słowy: wystarczy _dobrze_ wykonywać swoją pracę – jakkolwiek brutalnie by to nie brzmiało.

Podsumowując: przeglądarka i system to para zaufanych przyjaciół, która niektóre sekrety zostawia wyłącznie dla siebie. Ale to, czym się jednak z nami dzielą, powinno wystarczyć do stworzenia dostępnej, przyjaznej strony WWW.
