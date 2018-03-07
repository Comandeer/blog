---
layout: post
title:  "Kurtyna cienia"
author: Comandeer
date:   2018-03-07 21:35:00 +0100
categories: refleksje html-css
comments: true
---

W dniach 5 i 6 marca 2018 roku [postanowiono zabić deklaratywny Shadow DOM](https://github.com/whatwg/dom/issues/510#issuecomment-370980398). Stało się to w czasie meetingu Web Platform WG w Tokio.

Osobiście [bardzo cieszyłem się z powodu deklaratywnego Shadow DOM](https://blog.comandeer.pl/javascript/2017/10/31/deklaratywny-shadow-dom.html) (dSD). Niestety, radości tej nie podzielają twórcy przeglądarek, którzy uważają, że implementacja dSD jest zbyt trudna i może spowodować problemy z bezpieczeństwem przeglądarek. Jest to dziwne o tyle, że w dyskusji jako przykład wskazuje się `template`, którego kod byłby przecież wymarzonym kandydatem do wykorzystania jako podwaliny dSD.

Równocześnie stwierdzono, że ta funkcjonalność jest dość prosta do zaimplementowania przez developerów, nawet pokazano [przykładową implementację](https://github.com/whatwg/dom/issues/510#issuecomment-371015679). Niemniej fakt, że nie mówimy tutaj o natywnej funkcji, pociąga za sobą wszystkie minusy typowe dla nienatywnych rozwiązań (zależność od JS, możliwy FOUC, niższa wydajność…).

Trochę przypomina mi to sytuację z `setImmediate`, w której wszyscy poza Microsoftem stwierdzili, że nie zaimplementują tego, bo… [polyfilla bardzo łatwo napisać](https://www.nczonline.net/blog/2013/07/09/the-case-for-setimmediate/). Ale może jestem po prostu przewrażliwony.

Tak czy inaczej: koniec marzeń o deklaratywnym cieniu. A szkoda, wielka szkoda.