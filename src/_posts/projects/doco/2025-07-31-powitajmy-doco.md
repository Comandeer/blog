---
layout: post
title: "Powitajmy Doco!"
description: "Powitajmy Doco – generator dokumentacji w TS-owych projektach!"
author: Comandeer
date: 2025-07-31T18:49:00+0200
project: doco
tags:
    - javascript
comments: true
permalink: /powitajmy-doco.html
---

W 2024 roku odbył się konkurs [100 commitów](https://100commitow.pl/). Założenia były proste: każda osoba w nim uczestnicząca miała rozwijać swój własny projekt open-source'owy. Konkurs trwał 100 dni i każdego dnia na głównego brancha powinien wpaść przynajmniej 1 commit – stąd nazwa konkursu. Stwierdziłem, że w sumie się zgłoszę, dzięki czemu będę miał motywację do pracy nad projektem. A że miał to być nowy projekt, to postawiłem na Doco – czyli generator dokumentacji.

Wytrzymałem jakieś 2 tygodnie. Okazało się, że tempo jednego commita dziennie totalnie mi nie odpowiada. Zwłaszcza w projekcie, w którym sporo rzeczy trzeba przekminić, zanim się owego commita zrobi. No więc mamy drugą połowę 2025 i stwierdziłem, że pora wrócić do Doco na _własnych_ warunkach.

<!--more-->

{% note %}Tak, zdaję sobie sprawę, że nie dokończyłem jeszcze [czasomierzy](https://blog.comandeer.pl/projekty/czasomierze/). Ale hej, zawsze lepiej nie dokończyć dwóch projektów niż jednego!{% endnote %}

## Oto Doco

> <p lang="en">I'm Doco. Umberto Doco.</p>

Doco to w założeniu ma być generator dokumentacji dla projektów napisanych w TS-ie lub JS-ie. Na potrzeby konkursu powstało nawet [oficjalne repozytorium](https://github.com/DocoJS/DocoJS), ale wkrótce zapewne zajdą w nim poważne zmiany.

Założenia przyświecające Doco są dość proste:

1. **Podstawą dokumentacji jest kod**. Dzięki TypeScriptowi łatwo można wygenerować informacje o typach, a dodatkowe komentarze w formatach takich jak [JSDoc](https://en.wikipedia.org/wiki/JSDoc) czy [TypeDoc](https://typedoc.org/) dostarczą reszty informacji.
2. **Czasami trzeba czegoś więcej niż kod**. W JSDocu można przemycić bardzo dużo, łącznie nawet z przykładami kodu. Ale nie wciśnie się tam całego poradnika. Dlatego Doco musi też obsługiwać dodatkową dokumentację, np. w postaci plików `.md`.
3. **Konfigurowalność, ale przy sensownych ustawieniach domyślnych**. Konfiguracja powinna umożliwiać dostosowanie niemal każdego aspektu działania Doco. Ale im większe możliwości konfiguracyjne, tym większa gęstwina opcji, w których można się pogubić. Dlatego też Doco powinno mieć sensowne ustawienia domyślne – tak, żeby w 80% przypadków nie trzeba było ruszać bardziej zaawansowanych opcji konfiguracyjnych.
4. **Rozszerzalność i modularność**. Doco w domyśle ma być prostym generatorem statycznych stron, a większość ficzerów będzie egzystować sobie radośnie w pluginach. Modularna budowa pozwoli na łatwe podmienianie pojedynczych kawałków całości, np. standardowy parser TS-a będzie można wymienić na własny. Rozszerzalność pozwoli też dodawać całkowicie nowe funkcjonalności, jak choćby obsługa generowania dokumentacji API w innych językach (Ruście, Go, itd.).
5. **Dobre wsparcie dla monorepo i wielu repozytoriów**. Coraz więcej projektów w ekosystemie JS-a korzysta z monorepo. Doco musi zatem ogarniać pracę z repozytoriami, w których jest więcej niż jeden pakiet npm. Równocześnie niektóre większe projekty podzielone są na kilka repozytoriów, dla których jednak powinna powstać ostatecznie jedna, połączona dokumentacja. Innymi słowy: Doco musi umieć obsłużyć obydwa te skrajne przypadki.

Podsumowując: to ma być taki [Docusaurus](https://docusaurus.io/) – generator statycznej strony zoptymalizowany pod generowanie dokumentacji. Główna różnica polega na tym, że gadzina nie ma wbudowanej obsługi generowania dokumentacji API bezpośrednio z kodu. W Doco z kolei byłby to trzon, wokół którego dodane byłyby pozostałe ficzery związane z generowaniem całych stron z dokumentacją.

## Architektura

Poczyniłem już nawet wstępne założenia architektoniczne. Doco składałoby się z następujących elementów:

{% figure "../../../images/powitajmy-doco/architektura.svg" "W środku znajduje się trzon Doco, wokół którego znajdują się parsery, generatory, motywy, pluginy i konfiguracja; dostarczają one dane Doco, które przy ich wykorzystaniu i na podstawie kodu źródłowego aplikacji generuje dokumentację." "Architektura na ładnym diagramie" %}

1. **Doco**. Trzon całości, który mieliłby konfigurację i na jej podstawie robił coś z kodem źródłowym aplikacji. Prawdopodobnie byłby to zwykły emiter zdarzeń i trochę kleju, żeby pospinać wszystkie pozostałe elementy. Trzon zawierałby także pewnie UI dla osób wystarczająco śmiałych, żeby spróbować tego używać w swoich projektach. A pisząc UI, mam na myśli prosty program CLI – na początek z jedną komendą: `doco build`.
2. **Parsery**. To prawdopodobnie będzie najbardziej kłopotliwe do stworzenia. Parsery powinny być bowiem rozszerzalne. Wystarczy spojrzeć na różnice między formatami JSDoc a TypeDoc. Ich składnia jest de facto identyczna, ale już semantyka poszczególnych elementów potrafi się subtelnie różnić. Stąd jeden parser może bezproblemowo sparsować obydwa formaty, ale musi umieć przy tym przetłumaczyć sparsowany kod na poprawną dokumentację. A przecież JSDoc ma sporo odmian, choćby z powodu istnienia kilku różnych parserów w ekosystemie (w tym takich antyków jak [jsduck](https://github.com/senchalabs/jsduck)). Nie wspominając już o projektach, które mają swoje własne wariacje na temat dokumentacji w kodzie. Parser będzie musiał to obsłużyć.
3. **Generatory**. One będą odpowiedzialne za wyplucie dokumentacji. Tutaj zadanie wydaje się stosunkowo proste i _wystarczy_ podpiąć jakiegoś gotowca, takiego jak [Astro](https://astro.build/) czy [Eleventy](https://www.11ty.dev/). Tyle teoria, bo w praktyce pewnie nie będzie to aż takie proste. Problem może stanowić format dodatkowej dokumentacji w projekcie. Nawet jeśli ograniczyć to wyłącznie do Markdowna, to jest wiele jego odmian ([CommonMark](https://commonmark.org/), [GFM](https://github.github.com/gfm/)…). Do tego dochodzą wynalazki pokroju [MDX-a](https://mdxjs.com/). Ktoś też może chcieć nieco zmienić sposób generowania Markdowna. Co oznacza, że generatory również muszą być do jakiegoś stopnia rozszerzalne.
4. **Motywy**. Dokumentacja musi ładnie wyglądać. Zatem muszą istnieć motywy. Tutaj wyzwaniem mogą być ficzery, które muszą coś dodawać do wygenerowanej treści, np. wyszukiwarka, która chce wyświetlić pole wyszukiwania. Motywy muszą mieć więc możliwość dodawania różnych rzeczy w konkretne miejsca layoutu. Musi też istnieć sensowny sposób na nadpisywanie poszczególnych elementów motywu. Można zastosować tutaj podejście z Jekylla: [motyw podzielony jest na wiele mniejszych części-plików](https://jekyllrb.com/docs/themes/#overriding-theme-defaults). Nadpisanie części motywu sprowadza się do stworzenia pliku o nazwie takiej samej jak istniejąca część. Wówczas Jekyll użyje stworzonego przez nas pliku, zamiast tego oryginalnego.
5. **Pluginy**. Wszystkie ficzery powinny być dodawane przez pluginy. To oznacza, że plugin powinien mieć dostęp do pozostałych części – parsera, generatora oraz motywu. Dzięki temu przykładowy plugin wyszukiwarki mógłby dodać do generatora krok związany z indeksacją treści, a następnie umieścić pole wyszukiwania w odpowiednim miejscu w motywie. A to oznacza, że pluginy muszą mieć dobrze zaprojektowane API.
6. **Konfiguracja**. To ona tak naprawdę będzie miejscem styku z osobą korzystającą z Doco. Dodawanie nowych pluginów, wybieranie motywu, podmienienie parsera – wszystko będzie się odbywać w pliku konfiguracyjnym. Oczywiście, nie ma sensu zmuszać nikogo do mozolnego uzupełniania wszystkiego samemu w każdym nowym projekcie, więc prawdopodobnie skończy się to powstaniem jakiejś paczki pokroju `@docojs/config-recommended` albo podobnej. Sama konfiguracja pewnie przybierze postać podobną do tej z [Rollupa](https://rollupjs.org/tutorial/#using-config-files) lub [ESLinta](https://eslint.org/docs/latest/use/configure/).

Jeśli przyjrzeć się obecnej zawartości repozytorium Doco, to powyższa lista wydaje się dość podobna do pomysłu, jaki miałem w trakcie konkursu. Nie ma co się jednak za bardzo przywiązywać. Zapewne w trakcie prac niejedno się jeszcze zmieni.

## Plan pracy

Nie ma jeszcze jakiegoś rozbudowanego planu pracy. Na pierwszy ogień pójdzie jednak prawdopodobnie API poszczególnych części składowych oraz przemyślenie formatu konfiguracji. Równocześnie pewnie ruszą prace nad "infrastrukturą", czyli tym, jak powinno funkcjonować monorepo dla projektu. Jak już repo będzie działać, a API będzie w miarę sensownie wyglądać, będzie można wziąć się za poszczególne części składowe. Prawdopodobnie równolegle będzie powstawać parser, jak i generator. Na sam koniec powstanie moduł spinający wszystko w całość.

Czy coś z tego wyjdzie? Zobaczymy. Plan jest, _wystarczy_ go zrealizować.
