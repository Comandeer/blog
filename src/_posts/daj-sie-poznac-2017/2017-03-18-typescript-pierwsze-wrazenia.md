---
layout: post
title:  "TypeScript – pierwsze wrażenia"
description: Moje subiektywne wrażenia po pierwszej styczności z TypeScriptem.
author: Comandeer
date: 2017-03-18T23:40:00+0100
tags:
    - daj-sie-poznac-2017
comments: true
permalink: /typescript-pierwsze-wrazenia.html
redirect_from:
    - /daj-sie-poznac-2017/2017/03/18/typescript-pierwsze-wrazenia.html
---

Od rozpoczęcia konkursu minęło już trochę czasu, więc miałem go nieco, by zaznajomić się – choćby w podstawowym stopniu – z TypeScriptem. Oto garść moich wstępnych przemyśleń.<!--more-->

## Typowanie, typowanie wszędzie…

Jeśli mówimy o TypeScripcie, w wyobraźni w dużej mierze mamy po prostu obraz JS-a z dołożoną składnią do wyrażania typów. Tylko tyle i aż tyle. Pomysł nowy nie jest i [swego czasu mógł się nawet pojawić w przeglądarkach](http://2ality.com/2015/02/soundscript.html), niemniej ostatecznie skończyło się na preprocesorze. Co prawda TypeScript ma konkurencję (np. [Flow](https://flowtype.org/)), ale i tak to on dzierży palmę pierwszeństwa wśród JS-ów z typowaniem.

Nic zatem dziwnego, że TypeScript tak naprawdę nie istnieje bez typowania i nie ma żadnego sensu w pisaniu kodu przy użyciu tego narzędzia, jeśli typowania chcemy uniknąć.

```typescript
// To jest TypeScript.
function fn( parameter: string ): void {}

// A to nie.
function fn( parameter ) {}
```

Niemniej typowanie w TS ma jedną, zasadniczą wadę: istnieje tylko na poziomie transpilacji i jest bezpowrotnie tracone po tym procesie. A to oznacza, że jeśli tworzymy bibliotekę i ktoś będzie używał jej jako JS-owego kodu (nie zaś TS-owego), to… typowanie w niczym mu nie pomoże. Zatem albo wszystko piszemy w TS-ie, albo typowanie pomoże tylko i wyłącznie nam, jako autorom. A szkoda, czasami przydałaby się opcja przeniesienia typowania także na etap wykonywania kodu (coś jak [StronglyTyped](https://github.com/leaverou/StronglyTyped/)).

## Bundle'owanie to jakaś porażka

O tym [wspominałem w jednym z poprzednich wpisów](https://blog.comandeer.pl/daj-sie-poznac-2017/2017/03/12/wybor-technologii.html). TypeScript nie potrafi w bundle'owanie i każdy przerobiony plik wypluwa do wskazanego katalogu. I robi to na tyle nieudolnie, że nawet pliki, które po transpilacji są puste, znajdują się w `dist/`. Słabo. Stąd potrzeba używania np. rollupa (stwarzającego inne problemy, ale o tym inną razą).

I zanim ktoś zwróci uwagę na to, że TypeScript potrafi wypluwać jeden plik: nie, zwracanie jednego pliku dla modułów AMD czy System.js to nie ficzer.

### Interfejsy

W gruncie rzeczy wydaje mi się, że Microsoft popelnił błąd i swój język powinien nazwać InterfaceScript. Typowanie w ogóle mnie nie zachwyciło, natomiast możliwość definowania interfejsów dla wszystkiego – o, to coś zupełnie innego!

```typescript
interface ICommand {
  name: string;
  exec(): void;
}
```

Dzięki temu można sobie ładnie zaplanować całe publiczne API zanim przystąpi się do napisania choćby jednej linijki kodu. Zwłaszcza, że w porównaniu do interfejsów w PHP czy Javie, te w TypeScripcie przypominają bardziej tzw. <i>schema</i>, czyli po prostu szablon dla konkretnego obiektu (coś, co występuje np. w [ODM-ach](http://mongoosejs.com/docs/guide.html)). Oprócz samych metod możemy bowiem definiować także własności, a nawet opcjonalne własności i metody. I wszystko z typowaniem. Piękne, po prostu piękne!

Oczywiście nie może być _za_ pięknie, więc totalnie zwalono interfejsy dla konstruktorów klas (co jest [dokładnie opisane w dokumentacji](https://www.typescriptlang.org/docs/handbook/interfaces.html#difference-between-the-static-and-instance-sides-of-classes) jako efekt uboczny składni samego JS-a), kóre [zmuszają do dziwnych akrobacji](https://github.com/ComSemRel/comsemrel/blob/master/src/createCliApp.ts). Niemniej na to dziwactwo mogę przymknąć oko.

Jest jeszcze jedna rzecz, która co prawda nie należy już do interfejsów, ale pozwoliła mi nie tworzyć dodatkowego interfejsu, a mianowicie: [typy generyczne](https://www.typescriptlang.org/docs/handbook/generics.html). Tym sposobem zamiast tworzyć `ICommandCollection` wystarczyło użyć `Set<ICommand>` (tak, to natywny `Set`!). Coś pięknego, naprawdę pięknego!

---

Czy TS mi się podoba? Jak na razie napisałem tylko kilka interfejsów i kilka linijek kodu na boku. I muszę przyznać, że na razie mi się podoba. Nigdy nie sądziłem, że na bardziej Javowy JS nie będę kręcił nosem, a jednak. Jest znośnie, solidne 7/10.
