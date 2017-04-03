---
layout: post
title:  "ComSemRel – raport wojenny #2"
author: Comandeer
date:   2017-04-03 18:00:00 +0100
categories: daj-sie-poznac-2017
comments: true
---

Czas płynie nieubłaganie, zatem przyszła pora na kolejny raport wojenny z frontu walki o lepszą automatyzację release'ów.

### Walka pozycyjna

A wiadomości niemal nie ma. Przeciwnik umocnił swoją pozycję siecią niezwykle skomplikowanych fortyfikacji, zwanych w slangu wojskowym "dokumentacją" i niemal unicestwił moją armię złożoną z dobrych chęci i braku wolnego czasu. Im dłużej brnąłem w poszukiwaniu sensownej dokumentacji dla mojego karkołomnego przedsięwzięcia, tym bardziej utwierdzałem się w przekonaniu, że TypeScript takowej po prostu nie posiada…

A w gruncie rzeczy próbowałem zrobić rzecz prostą. Odkryłem bowiem, że TypeScript nie lubi ciągów tekstowych i jego funkcja `transpileModule` nie robi tak naprawdę nic sensownego: ani nie rzuca błędów, ani nie obsługuje plików z deklaracjami, ani nawet nie bardzo potrafi poradzić sobie ze standardowymi opcjami kompilatora. Natomiast "prawdziwy" kompilator operuje wyłącznie na plikach. Zatem jako zaradny programista nie spojrzałem, czy istnieje [rozwiązanie mojego problemu](https://github.com/ezolenko/rollup-plugin-typescript2), lecz postanowiłem je po prostu napisać! Zamysł był prosty: "oszukać" TypeScript i podsunąć mu jako prawdziwe pliki wirtualny system plików. Pod tą dumnie brzmiącą nazwą skrywa się… zwykły obiekt:

```javascript
{
	'nazwaPliku.ts': 'zawartość'
}
```

Wystarczyło jeszcze tylko ustalić, w jaki sposób podsunąć to TypeScriptowi. Na początku myślałem o chamskim nadpisaniu node'owego modułu `fs`, który jest odpowiedzialny za operacje na plikach, ale brzmi to po prostu słabo. Stwierdziłem, że przecież w TS (tak bardzo opartym na interfejsach) musi być jakiś _elegancki_ sposób na podstawienie obiektu zamiast normalnych plików. I faktycznie, jest, nazywa się `CompilerHost`… i praktycznie nie ma dokumentacji (a przynajmniej takowej nie znalazłem) – istnieje jedynie [opis API](http://ts2jsdoc.js.org/typescript/ts.CompilerHost.html). Niemniej wszystko wskazywało na to, że jestem na dobrej drodze!

Okazało się także, że [jakaś dobra dusza](http://blog.scottlogic.com/2015/01/20/typescript-compiler-api.html) już wcześniej robiła podobne dziwne rzeczy, co znacznie mi uprościło sprawę. Dzięki jej staraniom ostatecznie udało mi się przygotować [`@comsemrel/typescript-vfs-compiler`](https://www.npmjs.com/package/@comsemrel/typescript-vfs-compiler). Nawet działa, wystarczy dopieścić obsługę błędów, a następnie wsadzić do [`@comsemrel/rollup-plugin-typescript`](https://github.com/ComSemRel/rollup-plugin-typescript) i wymyślić, w jaki sposób dodać obsługę plików z definicją (bo na chwilę obecną jestem w stanie generować tylko dla pojedynczych plików `*.ts`, nie zaś do całego bundle'a, jaki mi wypluje Rollup). Jak już to zrobię, to jako ostatni krok wypada dopasować te klocki do [`@comandeer/rollup-lib-bundler`](https://www.npmjs.com/package/@comandeer/rollup-lib-bundler) i tym samym domknę temat mojego małego ekosystemu narzędzi.

### Plan ataku

To oczywiście oznacza, że sam ComSemRel wciąż leży nieco odłogiem, niemniej mam już rozrysowany na kartce zarys całej architektury, zatem zostaje _jedynie_ wdrożyć ją w życie. Dokonałem też wstępnego wyboru bibliotek, które posłużą mi do komunikacji z użytkownikiem:

*   [Yargs](http://yargs.js.org/) wyświetli użytkownikowi listę dostępnych komend wraz z ich opisem i pomocą,
*   [Inquirer.js](https://github.com/SBoudrias/Inquirer.js/) posłuży do zadawaniu mu pytań.

Dziwne połączenie, zważając na fakt, że te dwie biblioteki są zupełnie różne i wyznają inne wartości jeśli chodzi o styl. Niemniej tutaj na ratunek przychodzi mi TS ze swoimi interfejsami, dzięki którym będę mógł na nie nałożyć takie API, jakie tylko sobie zażyczę.

---

I to na razie tyle, w przyszłym tygodniu może się w końcu zacznie dziać coś sensownego.