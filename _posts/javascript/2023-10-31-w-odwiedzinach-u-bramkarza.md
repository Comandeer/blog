---
layout: post
title:  "W odwiedzinach u Bramkarza"
author: Comandeer
date:   2023-10-31 19:13:00 +0100
categories: javascript eksperymenty
comments: true
permalink: /w-odwiedzinach-u-bramkarza.html
---

Słońce leniwie chowało się za widnokręgiem, rozrzucając pomarańczowe smugi po bezchmurnym, alabastrowym niebie, jakby było wielkim krakenem rozczapierzającym swoje macki. Szedłem złotożółtą plażą kontrastującą z lazurową tonią oceanu, w której odbijały się heroiczne zmagania niebios z wodną bestią. Piasek chrzęścił pod moimi stopami, jakby szepcząco skarżąc się na brutalność mego kroku. Widziałem go – siedział na leżaku, udając, że życiodajna ognista kula wciąż góruje na nieboskłonie, a jej kapryśne promienie tylko czekają, by smagać jego bladą skórę. Gdy stanąłem nad nim i pochyliłem się, miał zamknięte oczy. Drapieżny mrok rzucanego przeze mnie cienia zmusił go do spojrzenia na mnie – spojrzenia jakże zaskoczonego i pytającego. Powolnym, acz zdecydowanym, ruchem dłoni zdjąłem okulary przeciwsłoneczne i, patrząc cynicznie w jego wciąż nierozumiejące oczy, powiedziałem spokojnie ochrypłym głosem: "Wstawaj, Bramkarzu, mamy Node'a do spalenia".

## Zmiana krajobrazu

Nieco ponad rok temu [stworzyłem Bramkarza](https://blog.comandeer.pl/bramkarz.html), po czym [szybko odesłałem go na urlop](https://blog.comandeer.pl/bramkarz-na-urlopie.html). Od tamtego czasu trochę się pozmieniało w krajobrazie narzędzi do "pilnowania" kodu odpalanego w Node.js. [Hagana](https://github.com/yaakov123/hagana), czyli pierwowzór Bramkarza, w sumie umarła mniej więcej w tym samym czasie i nie dostała żadnej aktualizacji od lipca tamtego roku. Natomiast pojawiło się nowe narzędzie tego typu, [`@sandworm/guard`](https://www.npmjs.com/package/@sandworm/guard)… mające _jedno_ pobranie tygodniowo i zaktualizowane 9 miesięcy temu. Innymi słowy: również podzieliło los Bramkarza. Więc pod względem userlandowych rozwiązań za dużo się nie wydarzyło.

Wydarzyło się za to po stronie samego Node'a. Pojawił się bowiem [eksperymentalny system uprawnień](https://nodejs.org/docs/latest-v20.x/api/permissions.html). Dzięki niemu można m.in. blokować operacje na plikach. Gdy uruchomi się Node'a z flagą `--experimental-permission`, domyślnie wszystkie operacje na plikach będą blokowane:

```shell
node --experimental-permission
Welcome to Node.js v20.5.0.
Type ".help" for more information.
>
Access to FileSystemWrite is restricted.
[…]
> const { readFile } = require( 'node:fs/promises' )
undefined
> await readFile( './test' )
Uncaught Error: Access to this API has been restricted
    at open (node:internal/fs/promises:595:19)
    at readFile (node:internal/fs/promises:1042:20)
    at REPL2:1:39 {
  code: 'ERR_ACCESS_DENIED',
  permission: 'FileSystemRead',
  resource: '/Users/comandeer/test'
}
```

Można też m.in. ograniczać URL-e, do których mają mieć dostęp poszczególne moduły. Tym samym Bramkarz jest jeszcze mniej potrzebny.

## Bindingi

Niemniej przez ten rok udało mi się też rozwiązać inną zagadkę związaną z Bramkarzem. Ubolewałem mocno nad tym, że poprawne zabezpieczenie zarówno modułów CJS, jak i modułów ESM, wymaga tak naprawdę stworzenia dwóch różnych implementacji [wbudowanego modułu `fs`](https://nodejs.org/docs/latest-v20.x/api/fs.html). Dodatkowo wersja dla ESM była mocno upierdliwa. Okazuje się jednak, że byłem w błędzie!

W jednym ze swoich projektów używam [paczki `mock-fs`](https://www.npmjs.com/package/mock-fs) do testów. Jej zadaniem jest stworzenie fałszywego systemu plików w pamięci, dzięki czemu ma się pełną kontrolę nad tym, jakie pliki są dostępne dla aplikacji. Myślałem, że paczka ta robi to, co ja w Bramkarzu: żmudnie nadpisuje wszystkie metody modułu `fs`. Spodziewałem się więc, że nie zadziała, gdy przepiszę mój kod na ESM. Ale przepisałem, a testy dalej działały… Zafrapowało mnie to i odkryłem wówczas [pewien fragment w dokumentacji](https://www.npmjs.com/package/mock-fs#upgrading-to-version-4):

> <span lang="en">Instead of overriding all methods of the built-in `fs` module, the library now overrides `process.binding('fs')`.</span>
>
> [Zamiast nadpisywać wszystkie metody z wbudowanego modułu `fs`, ta biblioteka nadpisuje teraz `process.binding( 'fs' )`.]

Prawdę mówiąc, nie słyszałem wcześniej o tajemniczym `process.binding()`, a [oficjalna dokumentacja milczy na ten temat](https://nodejs.org/docs/latest-v20.x/api/process.html). Na całe szczęście istnieje internet i [szybkie googlowanie dało mi odpowiedź](https://stackoverflow.com/a/46908813/9025529). Ta niepozorna funkcja stanowi łącznik między JS-owymi częściami Node'a, a tymi napisanymi w innych językach (głównie C++). W rzeczywistości bowiem wbudowany moduł `fs` to JS-owa nakładka na bibliotekę do operacji na plikach napisaną w C++. I w jakiś sposób ta nakładka musi się z tym kodem w innym języku porozumiewać. Tym jest właśnie `process.binding()` – zwraca funkcje pozwalające na wywołanie kodu C++! I z jakiegoś powodu jest ona dostępna z poziomu użytkownika Node'a. nie jedynie z wewnątrz samego Node'a.

Co więcej, zwracany binding można do woli nadpisywać, a zmiany są widoczne dla całego procesu, omijając przy tym problem oddzielnych wersji dla ESM i CJS. Tym samym nadpisać dowolną operację na plikach można także w następujący sposób:

```javascript
import { mkdir } from 'node:fs/promises'; // 4
import { binding } from 'node:process'; // 1

const fsBinding = binding( 'fs' ); // 2

fsBinding.mkdir = console.error; // 3

await mkdir( './whatever' ); // 5
```

Importuję funkcję `binding()` z wbudowanego modułu `node:process`, reprezentującego aktualny proces (1). Następnie zapisuję sobie do zmiennej bindingi dla modułu `fs` (2). Potem nadpisuję metodę `mkdir()` z bindingów na wywołanie `console.error()` (3). W ramach testów importuję funkcję `mkdir()` z wbudowanego modułu `fs` (4), po czym wywołuję ją z argumentem `./whatever` (5). Warto przy tym zauważyć, że nadpisanie bindingu dla `mkdir` następuje _po_ zaimportowaniu `mkdir()` z modułu `fs`.

Domyślnie [funkcja `mkdir` tworzy nowy katalog](https://nodejs.org/docs/latest-v20.x/api/fs.html#fspromisesmkdirpath-options). Jednak odpalenie powyższego kodu sprawi, że zamiast stworzyć nowy katalog, funkcja `mkdir()` po prostu wyświetli w konsoli argumenty przekazane jej bindingowi:

```shell
./whatever 511 false Symbol(fs_use_promises_symbol)
```

Co prawda rezultat, który otrzymujemy, nie do końca pokrywa się z tym, jakie parametry przyjmuje funkcja `mkdir()`, ale da się dość łatwo zgadnąć, który argument za co odpowiada:

* `./whatever` to przekazana przez nas ścieżka do nowego katalogu,
* `511` to [chmod](https://en.wikipedia.org/wiki/Chmod#Numerical_permissions) nowego katalogu,
* `false` to informacja, czy katalogi mają być tworzone rekursywnie (jeślibyśmy przekazali ścieżkę typu `./whatever/innyever`),
* `Symbol(fs_use_promises_symbol)` to oznaczenie, że wywołano obiecankową wersję funkcji `mkdir()`.

W ten sposób udało nam się nadpisać funkcję `mkdir()` _w trakcie_ działania programu. Gdybym wiedział o tym cudeńku wcześniej, to na pewno bym użył tego w trakcie pisania Bramkarza.

A tak… no cóż, kolejna cegiełka do mojej kolekcji ciekawej, acz średnio przydatnej wiedzy o JS-ie.
