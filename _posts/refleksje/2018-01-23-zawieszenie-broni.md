---
layout: post
title:  "Zawieszenie broni"
author: Comandeer
date:   2018-01-23 23:30:00 +0100
categories: refleksje a11y
comments: true
permalink: /zawieszenie-broni.html
redirect_from:
    - /refleksje/a11y/2018/01/23/zawieszenie-broni.html
---

Ostatnio pisałem o [wieloletnim konflikcie pomiędzy WHATWG i W3C](https://blog.comandeer.pl/refleksje/a11y/2018/01/05/pyrrusowe-zwyciestwo.html). Nie spodziewałem się jednak, że przynajmniej częściowo zostanie zażegnany – i to tak pokojowo.

## Ale co się stało?

Dużo. Po pierwsze [wspomniany w poprzednim wpisie PR](https://github.com/whatwg/html/pull/3326) został [włączony do specyfikacji HTML LS](https://github.com/whatwg/html/pull/3326#event-1423841798). To zdecydowanie upodobniło definicję `main` w HTML LS do tej w HTML 5.x. Na tym się jednak nie skończyło. Anne van Kesteren przygotował bowiem [drugi PR](https://github.com/whatwg/html/pull/3354), który [został zmerge'owany dzisiaj (23 stycznia 2018)](https://github.com/whatwg/html/pull/3354#event-1436763140), a który to usuwał ostatnią poważną różnicę pomiędzy definicjami: możliwość używania więcej niż jednego _widocznego_ elementu `main`. Tym samym [słynne issue #100 zostało ostatecznie zamknięte](https://github.com/whatwg/html/issues/100#event-1436763021). Obydwie definicje, choć brzmiały inaczej, mówiły już to samo. Ba, po zmianach poczynionych przez WHATWG wersja definicji `main` w HTML LS stała się wręcz _lepsza_ od tej w HTML 5.x. Dlatego też niemal od razu W3C zdobyło się na gest i [postanowiło zmienić swoją definicję na tą z HTML LS](https://github.com/w3c/html/issues/1153). I [zrobiło to](https://github.com/w3c/html/issues/1153#event-1437396048), raptem kilka godzin później.

Tym samym największa różnica pomiędzy HTML LS i HTML 5.x **przestała istnieć**.

## Treść porozumienia

Główne zmiany w stosunku do starszej wersji z HTML 5.x to zamiana sformułowania <q>main contents</q> na <q>dominant contents</q> a także wprowadzenie pojęcia "hierarchicznie poprawnego elementu `main`" (ang. <i lang="en">hierarchically correct `main` element</i>).

Pierwsza zmiana jest dość dyskusyjna. Główna treść a dominująca treść niby oznaczają to samo, niemniej pierwszy zwrot wydaje się bardziej jednoznaczny. No ale dobra, można to przeżyć.

Druga zmiana ogranicza kontekst występowania `main`. Wcześniej HTML 5.x pozwalało umieszczać `main` w wielu dziwnych miejscach, np. w `section`. Obecna wersja wymusza, żeby `main` było bezpośrednio w `body`, ewentualnie `div`, `form` bez dostępnej nazwy (z powodu [wymogów ASP .NET](https://github.com/whatwg/html/pull/3354#issuecomment-358898757)) lub custom elemencie. Możliwe jest też umieszczenie `main` bezpośrednio w `html`, jeśli tworzona przez nas strona nie posiada ani `head`, ani `body` (co jest dozwolone przez specyfikację).

## I co teraz?

Nic. Choć definicje _w końcu_ są takie same, specyfikacja HTML 5.x wciąż zawiera o wiele więcej przykładów, a także dodatkowych, pomocnych uwag, które wyjaśniają najczęstsze problemy z używaniem `main`. Z tego też powodu zdania nie zmieniam i wciąż uważam, że W3C umie lepiej w dostępność i semantykę. I WHATWG też to zauważyło, chociaż zajęło im to _prawie 3 lata_.

Niemniej dla mnie osobiście cała sytuacja jest bezprecedensowa i daje nadzieję, że w końcu dostępność stanie się integralną częścią procesów standaryzacyjnych, co wszystkim nam wyjdzie na dobre.
