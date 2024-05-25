---
layout: post
title:  "Web Intents i naiwniak, czyli dlaczego nie możemy mieć fajnych rzeczy?"
author: Comandeer
date: 2020-10-31T19:00:00+0100
tags: 
    - refleksje
    - standardy-sieciowe
comments: true
permalink: /web-intents-i-naiwniak-czyli-dlaczego-nie-mozemy-miec-fajnych-rzeczy.html
---

Wieki temu [Paul Kinlan](https://paul.kinlan.me/) zaproponował nowy standard internetowy: [Web Intents](https://en.wikipedia.org/wiki/Web_Intents). Osobiście czułem, że może to być jedna z większych rewolucji w historii Sieci. I co? I wyszło jak zawsze – czyli w sumie _nie_ wyszło…

## Web Intents – czyli co?

W największym skrócie: [Web Intents](https://www.w3.org/TR/web-intents/) miały być sposobem na komunikowanie się między stronami, ale także między stronami i aplikacjami natywnymi. Cały pomysł składał się z dwóch niezależnych części:

* możliwości "ogłoszenia się" przez odwiedzaną stronę jako oferującą obsługę danej intencji (np. [Photopea](https://www.photopea.com/) mogłaby się ogłosić jako usługa obsługująca intencję "edytuj" dla obrazków),
* możliwości stworzenia nowej intencji w odpowiedzi na działanie użytkownika (np. Facebook mógłby umieścić przy zdjęciach przycisk "Edytuj", który tworzyłby intencję "edytuj", dzięki czemu użytkownik mógłby edytować obrazek choćby we wspomnianej Photopei albo w GIMP-ie, który ma zainstalowany).

Wciąż istnieją [oryginalne przykłady działania](http://examples.webintents.org/), pokazujące wykorzystanie obydwu części standardu.

## Krótka lekcja historii

Gdzieś na samym początku 2011 roku znaleźć można [pierwsze wzmianki o Web Intents na listach mailingowych W3C](https://lists.w3.org/Archives/Public/public-device-apis/2011Jan/0009.html). W listopadzie tego samego roku powstaje [odrębna lista wyłącznie na potrzeby Web Intents](https://lists.w3.org/Archives/Public/public-web-intents/2011Nov/0000.html). Z kolei ostatni mail zostaje rozesłany 5 lat później i [ogłasza zamknięcie Web Intents Task Force](https://lists.w3.org/Archives/Public/public-web-intents/2015Oct/0000.html). To i tak jedynie symboliczne zatrzaśnięcie wieka trumny, bo [o śmierci inicjatywy wiedziano od dawna](https://paul.kinlan.me/what-happened-to-web-intents/).

<p class="note">W W3C główne prace nad standardami toczą się w tzw. grupach. W obrębie tych grup od czasu do czasu powoływane są tzw. <i lang="en">Task Forces</i> – tymczasowe podzespoły oddelegowane do pracy nad konkretnym problemem.</p>

Jednak pomysł na umożliwienie sensownej komunikacji między aplikacjami natywnymi a Siecią nie umarł razem z Web Intents. Wprost z nich powstały dwa inne pomysły: [Web Wishes](https://darobin.github.io/web-wish/) oraz [Web Activities](https://wiki.mozilla.org/WebAPI/WebActivities). Paul Kinlan również później [próbował reanimować pomysł](https://paul.kinlan.me/reinventing-web-intents/), ale bezskutecznie (mimo że zaproponowane przez niego rozwiązanie działa!). Niemniej Web Intents dały podwaliny pod dwa inne projekty Google'a: [Ballistę](https://github.com/chromium/ballista) i wreszcie [Fugu](https://web.dev/fugu-status/).

Ballista była projektem, z którego powstały Web Share (wraz z Web Share Target) oraz File Handling. Rzeczy te następnie stały się częścią projektu Fugu i obecnie są albo uznanymi standardami ([Web Share](https://w3c.github.io/web-share/) i [Web Share Target](https://w3c.github.io/web-share-target/level-2/)), albo mają eksperymentalne implementacje w Chrome ([File Handling](https://web.dev/pl/file-handling/)). Można zatem powiedzieć, że Web Intents weszły do przeglądarek tylnym wejściem…

## Nowy model interakcji z użytkownikiem

…tyle że nie. Owszem, wspomniane standardy pozwalają robić większość z tego, co oferowały kiedyś Web Intents. Ba, jakby połączyć Web Share i Web Share Target, to po przymrużeniu oczu takie jakby Web Intents z tego. Oto mogę _podzielić się_ obrazkiem z inną stroną, która niby udaje, że pozwala się ze sobą dzielić, a tak naprawdę jest edytorem grafiki. Tym sposobem można emulować intencję "edytuj". Ba, jak się do tego dorzuci File Handling, to nawet da się edytować obrazki z pulpitu w Photopei!

Tylko że Web Share Target wymaga zmian w manifeście, w sumie nie wiadomo, kiedy przeglądarka może daną stronę w ogóle uznać za odbierającą rzeczy, którymi dzieli się użytkownik, File Handling wymaga instalacji aplikacji webowej, czyli ta musi być PWA, do tego obydwa API są całkowicie różne (`navigator.share` vs `launchQueue.setConsumer`), a tak już poza wszystkim: _dzielenie się_ obrazkiem z edytorem grafiki?!

W przypadku Web Intents mieliśmy do czynienia z tak naprawdę nowym modelem interakcji z użytkownikiem. Użytkownik, klikając na przycisk, nie odpalał już ściśle określonej akcji. Użytkownik _wyrażał intencję_, np. wyrażał intencję zedytowania obrazka. I to, w jaki sposób to zrobi, zależało już wyłącznie od niego. A sama intencja pozwalała lepiej się porozumiewać pomiędzy aplikacjami i stronami. Bo podzielenie się obrazkiem z edytorem grafiki to jednak nie to samo, co poinformowanie tego edytora, że chcemy ten obrazek edytować.

Dodatkowo komunikacja była dwustronna. Aplikacja, w której wyraziliśmy intencję edycji obrazka, powinna wszak zedytowany obrazek otrzymać z powrotem. W przypadku Web Share komunikacja jest jednostronna – bo i po co strona ma czekać, aż ktoś podzieli się linkiem do niej na Twitterze? W przypadku jednak części intencji taka dwustronność komunikacji okazuje się niezbędna.

Jakby jeszcze było tego mało, Web Share działa głównie na urządzeniach mobilnych. W Chrome i Firefoksie na desktopach to API nie działa – tym samym stając się jeszcze mniej sensowną alternatywą dla pierwotnej propozycji.

Obecne propozycje są bardzo fragmentaryczne i nie oferują jednego, spójnego rozwiązania, które pozwalałoby jednym API obsługiwać wszystkie przypadki. Co więcej, traci się zmianę sposobu myślenia, jaką narzucały Web Intents. A właśnie ta zmiana sposobu myślenia, skupiona wokół prostego konceptu intencji, była tak rewolucyjna. Bo pod względem technologicznym, jak widać, da się to zrobić.

## Naiwniak

[Swego czasu bardzo kibicowałem Web Intents](https://webroad.pl/inne/3035-web-of-intents-czego-brakuje-dzisiejszej-sieci). Naprawdę wierzyłem, że [są w stanie w wielu miejscach wyprzeć rozwiązania oparte choćby na OAuth 2.0](https://webroad.pl/inne/3035-web-of-intents-czego-brakuje-dzisiejszej-sieci#comment-1733). Bo po co mam przekazywać edytorowi grafiki moje imię i nazwisko wraz z mailem, skoro chcę tak naprawdę jedynie zedytować obrazek? Jak bardzo życzeniowe to było myślenie w świecie, w którym [Sieć jest zdominowana przez monopolistów](https://www.politico.com/news/2020/10/10/feds-may-target-googles-chrome-browser-for-breakup-428468)…

Pomijając jednak względy etyczno-biznesowe, być może na Web Intents jest już za późno także z technicznych powodów. Od 2011, kiedy się pojawiły, Sieć jako platforma mocno napuchła. Próba pogodzenia wszystkich funkcji przeglądarek w jednym, wspólnym modelu interakcji z użytkownikiem brzmi jak najczarniejszy koszmar każdego developera dłubiącego w Blinku czy WebKicie. To, co jeszcze w 2011 było – z wielkimi trudnościami – możliwe, dzisiaj wydaje się mrzonką. Być może dlatego, zamiast jednego, spójnego modelu, dostajemy skrawki poszczególnych rozwiązań.

A być może po prostu nie ma drugiego Paula Kinlana, który byłby wystarczająco szalony, żeby wejść drugi raz do tej samej rzeki.
