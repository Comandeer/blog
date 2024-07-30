---
layout: post
title:  "Rewolucja klasowa"
description: "O tym, jak ES zmienił swój paradygmat obiektowy dzięki klasom."
author: Comandeer
date: 2021-04-29T00:24:00+0200
tags:
    - refleksje
    - javascript
comments: true
permalink: /rewolucja-klasowa.html
---

Swego czasu powszechną wiedzą było to, że klasy stanowiły wyłącznie cukier składniowy dla prototypów. Tak też sprawę ująłem w swojej książce ([<cite>JavaScript. Programowanie zaawansowane</cite>](https://helion.pl/ksiazki/javascript-programowanie-zaawansowane-tomasz-comandeer-jakut,jascpz.htm#format/e), s. 113). Wtedy (5 lat temu!), faktycznie, takie stwierdzenie dało się obronić. Z jednej strony dlatego, że klasy nie były tak rozbudowane jak obecnie, z drugiej dlatego, że były nowością i paradoksalnie łatwiej było je zrozumieć poprzez porównanie do już istniejącego mechanizmu. Ale od tego czasu sporo się zmieniło.<!--more-->

Widać wyraźnie, że TC39 próbuje ukryć niewygodny fakt istnienia gdzieś tam, na samym dnie prototypów w JS-ie i niemal wszystkie nowości związane z obiektówką dodaje bezpośrednio do klas. Ostatnio weszła naprawdę spora zmiana, składająca się z kilku propozycji połączonych razem: [możliwość definiowania pól (własności) w klasach](https://github.com/tc39/proposal-class-fields) (także [statycznych](https://github.com/tc39/proposal-static-class-features)). Równolegle wprowadzono [podział na publiczne i prywatne pola](https://github.com/tc39/proposal-private-methods). Tym sposobem nic nie stoi na przeszkodzie, by tworzyć takie kombinacje:

```javascript
class MyClass {
	static #x = 'whatever'; // 1

	getX() {
		return MyClass.#x;
	}
}

const myClass = new MyClass();

console.log( myClass.getX() );
```

Wykorzystuję w tej prostej klasie wszystkie 3 propozycje naraz (1): prywatne, statyczne pole klasy. Czyż to nie piękne?

Równocześnie prywatne własności nie trafiły ani do starej składni konstruktorów, ani do obiektów:

```javascript
function MyClass() {
	MyClass.#x = 'whatever'; // SyntaxError
}

const obj = {
	#x: 'whatever' // SyntaxError
};
```

Klasy stają się de facto nieustannie rozwijaną abstrakcją, nadbudowaną nad prototypami, i dostarczającą rzeczy niemożliwych do osiągnięcia w JS w inny sposób. Jeśli doda się do tego możliwość rozszerzania wbudowanych klas, takich jak `Array`, to można z czystym sumieniem stwierdzić, że [klasy nie są już dłużej cukrem składniowym](https://webreflection.medium.com/js-classes-are-not-just-syntactic-sugar-28690fedf078). Co więcej, są na tyle wystarczającą abstrakcją, że w wielu przypadkach znika potrzeba myślenia, co znajduje się pod nimi. Klasy faktycznie są w stanie zastąpić prototypy, które zostały zepchnięte do roli niskopoziomowego szczegółu implementacyjnego.

JS to jeden z nielicznych przykładów udanej rewolucji klasowej.
