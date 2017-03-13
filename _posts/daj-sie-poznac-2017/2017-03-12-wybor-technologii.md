---
layout: post
title:  "Wybór technologii"
author: Comandeer
date:   2017-03-12 22:50:00 +0100
categories: daj-sie-poznac-2017
comments: true
---

Skoro już ustaliłem, co chcę stworzyć w trakcie trwania konkursu (a przynajmniej zacząć), następnym logicznym krokiem będzie wybór technologii, które pomogą mi osiągnąć mój cel. Lista, jak na projekt w JS przystało, jest niepotrzebnie długa i udziwniona:

*   [TypeScript](https://www.typescriptlang.org/)
*   [tslint](https://palantir.github.io/tslint/)
*   [rollup](http://rollupjs.org/) + [rollup-plugin-typescript](https://github.com/rollup/rollup-plugin-typescript)
*   [jest](https://facebook.github.io/jest/)
*   [husky](https://github.com/typicode/husky) + [commitplease](https://github.com/jzaefferer/commitplease) + [commitizen](http://commitizen.github.io/cz-cli/) + [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)

Przyjrzyjmy się pokrótce wszystkim elementom z tej listy.

### TypeScript

Stało się… Po 10 latach pisania w JS-ie przyszedł ten moment, w którym postanowiłem, że zacznę używać jakiegoś języka kompilowalnego/transpilowanego do JS-a. Padło na TypeScript – mimo że średnio się dogadywałem z Microsoftem przez te lata. Postanowiłem dać mu jeszcze jedną szansę i mam mieszane uczucia.

Zacznijmy od tego, czemu akurat TypeScript? Powód jest prosty: mocniejsze OOP w JS i to, co mamy już nawet w nazwie, czyli typowanie. Dodatkowo wszystko to nadbudowane na starym, dobrym ES6. Brzmi jak szaleństwo w kontekście takiego języka jak JS, ale równocześnie: czemu nie? Moim pierwszym językiem był PHP, moim trzecim językiem najprawdopodobniej będzie Java, zatem z OOP jestem już dość dobrze zaznajomiony. TypeScript zatem zapowiada się na ciekawy eksperyment, zwłaszcza w kontekście aplikacji konsolowej.

No i kto nie chciałby mieć w JS interfejsów?

```typescript
interface IExample {
	test: string;
	wow( time: Date );
}
```

Akurat w przypadku aplikacji desktopowej takie możliwości można fajnie wykorzystać i mam nadzieję, że w jakiś sensowny sposób mi się to uda.

### tslint

Cóż tu dużo mówić: [ESLint](http://eslint.org/) dla kodu napisanego w TypeScript. Niemniej pierwsze wrażenie nie jest jakoś szczególnie pozytywne… Opcji jest, w porównaniu do ESLinta, wręcz zatrważająco mało. A już tych związanych ze stylem kodu praktycznie nie ma (wszystkie opcje dotyczące białych znaków wepchnięte w jedną [regułę `whitespace`](https://palantir.github.io/tslint/rules/whitespace/) – serio?!).

Dlatego chyba będę eksperymentował z innymi rozwiązaniami, np. [ESLintowym parserem dla TS-a](https://github.com/eslint/typescript-eslint-parser).

### rollup + rollup-plugin-typescript

TypeScript ma własny kompilator, który potrafi wypluwać wszystkie przetworzone pliki TS jako jeden plik JS. Problem polega na tym, że potrafi to zrobić tylko w dwóch przypadkach: gdy chcemy uzyskać JS w formacie [modułów AMD](https://github.com/amdjs/amdjs-api/blob/master/AMD.md) albo [modułów tworzonych przez SystemJS](https://github.com/ModuleLoader/es-module-loader/blob/v0.17.0/docs/system-register.md). Średnio satysfakcjonujące, gdy chce się tworzyć aplikację dla Node.js, który obsługuje na chwilę obecną [format CommonJS](https://nodejs.org/api/modules.html) (i tyle z "uniwersalnego formatu" z ES6).

Dlatego musiałem użyć także innego narzędzia, które łączy wszystkie przetworzone pliki TS w jeden plik JS. Padło na rollupa, z którym mam już dłuższą znajomość i dotąd mnie nie zawiódł.

### jest

Fajny framework do testowania aplikacji JS-owych od Facebooka, który zawiera w sobie wszystko: funkcje do testowania, do zbierania danych o pokryciu kodu itd. I tyle wiem. Ponoć jest fajne, ponoć jest dobre, ponoć jest wydajne. Wszyscy używają, stwierdziłem, że użyję i ja. Dojrzale.

### husky + commitplease + commitizen + conventional-changelog

Te wszystkie ustrojstwa pozwalają mi tworzyć ładne commit messages… i tyle. W przyszłości natomiast pozwolą ComSemRelowi generować automatycznie changelog na ich podstawie (ale to kiedyś).

---

Na chwilę obecną więcej technologii nie przewiduję, ale pewnie się (nie)stety mylę i pojawi się tego tałatajstwa więcej.

PS ComSemRel ma już [prymitywne logo](https://github.com/ComSemRel/comsemrel/blob/master/assets/logo.png). Dzięki, [winek](https://github.com/winek)!
