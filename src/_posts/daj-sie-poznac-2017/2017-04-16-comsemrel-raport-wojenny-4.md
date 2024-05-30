---
layout: post
title:  "ComSemRel – raport wojenny #4"
description: "Podsumowanie postępu prac nad ComSemRelem #4."
author: Comandeer
date: 2017-04-16T20:30:00+0100
tags:
    - daj-sie-poznac-2017
comments: true
permalink: /comsemrel-raport-wojenny-4.html
redirect_from:
    - /daj-sie-poznac-2017/2017/04/16/comsemrel-raport-wojenny-4.html
---

Od ostatniego raportu minął tydzień, więc pora przyznać się po raz kolejny, jak bardzo mało udało mi się zrobić. Na szczęście tym razem wymówką nie jest bynajmniej lenistwo, a permanentny brak czasu, który poświęcam na rzeczy inne niż konkurs i rozwijanie moich pet projektów (tak, mimo wszystko mam życie!).<!--more-->

Niemniej w tym tygodniu udało się zrobić zdecydowanie więcej niźli w poprzednim i _prawie_ mogę odznaczyć jeden z punktów na zeszłotygodniowej liście – ten o przeniesieniu interfejsów do oddzielnego repozytorium i pakietu. Co prawda przenieść przeniosłem i są obecnie dostępne jako [pakiet `@comsemrel/interfaces`](https://www.npmjs.com/package/@comsemrel/interfaces), niemniej nie udało mi się jeszcze do końca wymyślić, jak powinny wyglądać.

Na chwilę obecną mam 4 podstawowe intefejsy, które będą występować w większości comsemrelowych pakietów:

*   `ICommand` – to cudeńko ma na razie jedną metodę, `exec`, i w długiej perspektywie ma opisywać wszystkie komendy możliwe do wywołania przy pomocy programu `comsemrel`;
*   `IInput` – ten interfejs ma z kolei opisywać wszystkie sposoby na pobieranie danych od użytkownika (kreatory, pytania, opcje wyboru itd.);
*   `IOutput` – ten interfejs ma opisywać wszelkie sposoby pokazywania danych użytkownikowi (kolorowe komunikaty, confetti i inne takie);
*   `IRenderer` – połączenie `IInput` i `IOutput`.

Teraz wystarczy tylko sensownie je zaplanować.

Przy okazji chciałbym zwrócić uwagę na sztuczkę, którą zastosowałem, żeby uzyskać ładne interfejsy w osobnym pakiecie:

```bash
tsc src/index.ts --declaration --declarationDir dist --outDir temp && rimraf temp
```

Szukając rozwiązania mojego problemu, natknąłem się na [wątek na SO](http://stackoverflow.com/questions/35490195/declaring-interfaces-in-separate-files), w którym stwierdzono, że trzymanie intefejsów w oddzielnych plikach najlepiej zrealizować przy pomocy plików `.d.ts`, czyli tzw. plików deklaracji. Dlatego też generuję te pliki przy pomocy flag `--declaration` i `--declarationDir`. Z racji tego, że potrzebuję tylko plików `.d.ts`, bez przerobionych plików `.js`, to zapisuję pliki `.js` do folderu `temp`, który od razu usuwam przy pomocy `rimraf`. Hack brudny jak nie wiem co, ale działa – więc _who cares_?

Niemniej to nie rozwiązuje problemu do końca, bo TS przy próbie importu interfejsu z tak przygotowanego pakietu npm:

```javascript
import { ICommand } from '@comsemrel/interfaces';
```

rzuca się, że nie może go odnaleźć… Okazuje się, że [dla takich pakietów trzeba deklarować w pliku `package.json` miejsce przechowywania plików z deklaracjami](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html#including-declarations-in-your-npm-package). To sprawia, że moje pola `main` i `typings` wskazują na ten sam plik. I znów: brudne jak nie wiem, ale działa.

Tym sposobem udało mi się stworzyć zbiór interfejsów, które będę mógł z powodzeniem dzielić pomiędzy poszczególnymi częściami ComSemRela.
