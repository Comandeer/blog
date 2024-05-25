---

layout: post
title: "Dostępna tęcza"
author: Comandeer
date: 2022-06-30T22:10:00+0200
tags: 
    - na-luzie
comments: true
permalink: /dostepna-tecza.html

---

Ostatnio rozmawiałem z przyjaciółką i nagle zeszliśmy na dziwne tematy, aż w końcu zaczęliśmy się zastanawiać, czy [tęczowa flaga](https://pl.wikipedia.org/wiki/T%C4%99czowa_flaga_(ruch_LGBT)) jest dostępna? A że dzisiaj ostatni dzień Miesiąca Dumy, stwierdziłem, że czemu by nie pochylić się nad tym eksperymentem myślowym?

## Co to znaczy "dostępna"?

Żeby móc łatwo orzec, czy coś jest dostępne, potrzebujemy odpowiedniego kryterium. Na szczeście w zakresie dostępności takie kryteria – ogólnie uznane na praktycznie całym świecie – istnieją. Są to [wytyczne WCAG](https://wcag21.lepszyweb.pl/). Do naszego przypadku (tęczowa flaga) najbardziej pasowałoby [kryterium 1.4.11 Kontrast elementów nietekstowych](https://wcag21.lepszyweb.pl/#kontrast-elementow-nietekstowych). Wymaga ono, by grafika miała współczynnik kontrastu 3:1 względem sąsiednich kolorów. Dla naszej flagi sąsiednim kolorem jest tak naprawdę tło strony – przyjmijmy, że będzie ona prezentowana na najbardziej standardowym białym tle. Zatem wypadałoby, żeby każdy kolor tej flagi kontrastował z tym tłem.

Ale co jeśli nie będziemy traktowali flagi jako monolitu i uznamy, że poszczególne kolory przecież sąsiadują ze sobą i każdy z nich jest na tyle ważny, że powinny one także kontrastować między sobą? Wówczas każdy kolor musi mieć współczynnik kontrastu 3:1 względem zarówno tła, jak i kolorów, z którymi się styka (np. pomarańczowy będzie musiał kontrastować z białym tłem, ale także czerwonym i żółtym).

Policzmy zatem, jaki jest kontrast w tęczy!

## Test dostępności

Zatem weźmy na tapet oryginalną flagę:

{% include figure.html src="/assets/images/dostepna-tecza/original.svg" alt="Tęczowa flaga z poziomymi pasami kolorów, od góry: czerwony, pomarańczowy, żółty, zielony, niebieski i fioletowy." %}

Plan jest taki, by zacząć od górnego koloru i sprawdzać przy pomocy narzędzia takiego jak [contrast ratio](https://contrast-ratio.com/). Na samej górze mamy czerwony (`#750787`). [Jego kontrast względem białego tła strony wynosi 4.86:1](https://contrast-ratio.com/#%23e40303-on-#fff). Jak na razie jest dobrze! Sprawdźmy zatem kontrast z kolejnym kolorem, pomarańczowym (`#ff8c00`) – [2.08:1](https://contrast-ratio.com/#%23e40303-on-%23ff8c00). Tu już zdecydowanie gorzej… Takie testy przeprowadzić trzeba dla każdej kombinacji kolorów. Wyniki przedstawiam w tabeli poniżej:

| Kolor        | Kod koloru | Kontrast z białym tłem | Kontrast z poprzednim kolorem |
| ------------ | ---------- | ---------------------- | ----------------------------- |
| Czerwony     | `#e40303`  | 4.86                   | –                             |
| Pomarańczowy | `#ff8c00`  | 2.33                   | 2.08                          |
| Żółty        | `#ffed00`  | 1.2                    | 1.92                          |
| Zielony      | `#008026`  | 5.1                    | 2.18                          |
| Niebieski    | `#004dff`  | 5.99                   | 1.17                          |
| Fioletowy    | `#750787`  | 9.82                   | 1.64                          |

Jeśli z kontrastem w stosunku do białego tła nie jest tak źle, tak kolory nie kontrastują wystarczająco ze sobą. Pora zatem to zmienić!

## Wprowadzamy zmiany

Spróbujmy zatem dobrać kolory tak, by wciąż należały do tej samej "rodziny", ale kontrastowały odpowiednio zarówno z białym tłem, jak i najbliższymi kolorami w sąsiedztwie. Metoda będzie następująca: najpierw ustalamy kolor względem tła, a następnie poprawiamy pod kontrast z poprzednim kolorem. Jeśli nie da się uzyskać zadowalającego efektu tak, żeby kontrast był zadowalający zarówno względem tła, jak i poprzedniego koloru, kontrast względem tła ma wyższy priorytet. Z racji tego, że czerwony kolor jest pierwszy i ma równocześnie odpowiedni kontrast względem tła, zostaje bez zmian. Niemniej pomarańczowy trzeba poprawić, a potem zapewne żółty względem nowego pomarańczowego, itd. itp.

I… kurczę, serio próbowałem tak dobrać kolory, żeby zarówno kontrast z białym tłem, jak i poprzednim kolorem był odpowiedni, ale… okazało się, że zdecydowanie mnie to zadanie przerosło. Jak kolory pasowały do tła, to znów nie do siebie nawzajem. Dlatego ostatecznie stworzyłem dwie wersje – jedną kontrastującą z tłem, drugą – kontrastującą między sąsiadującymi kolorami na fladze.

Nowe kolory dobrane względem tła prezentują się następująco:

| Kolor        | Oryginalny kod koloru | Obecny kod koloru | Kontrast z białym tłem |
| ------------ | --------------------- | ----------------- | ---------------------- |
| Czerwony     | `#e40303`             | `#e40303`         | 4.86                   |
| Pomarańczowy | `#ff8c00`             | `#df5c00`         | 3.7                    |
| Żółty        | `#ffed00`             | `#9a9a00`         | 3                      |
| Zielony      | `#008026`             | `#008026`         | 5.1                    |
| Niebieski    | `#004dff`             | `#004dff`         | 5.99                   |
| Fioletowy    | `#750787`             | `#750787`         | 9.82                   |

W zasadzie tylko dwa kolory się zmieniły, bo reszta dobrze kontrastowała od samego początku.

{% include figure.html src="/assets/images/dostepna-tecza/contrast-background.svg" alt="Tęczowa flaga dostosowana pod kontrast z białym tłem – zmienione zostały odcienie pomarańczowego i żółtego." %}

Z kolei kolory przygotowane z myślą o kontraście między poszczególnymi kolorami na fladze wyglądają następująco:

| Kolor        | Oryginalny kod koloru | Obecny kod koloru | Kontrast z poprzednim kolorem |
| ------------ | --------------------- | ----------------- | ----------------------------- |
| Czerwony     | `#e40303`             | `#e40303`         | –                             |
| Pomarańczowy | `#ff8c00`             | `#ffc200`         | 3                             |
| Żółty        | `#ffed00`             | `#aa5600`         | 3.2                           |
| Zielony      | `#008026`             | `#00f026`         | 3.33                          |
| Niebieski    | `#004dff`             | `#004dff`         | 3.84                          |
| Fioletowy    | `#750787`             | `#320022`         | 3.02                          |

W tej wersji kontrast z tłem można załatwić przy pomocy sztuczki: flaga wyświetlona zostanie z 2-pikselową, czarną ramką. Dzięki temu kontrast będzie wymagany właśnie między tą ramką a tłem, a na szczęście [czarny dobrze kontrastuje z bielą](https://contrast-ratio.com/#%23000-on-%23fff). Dlaczego sztuczka z ramką działa? Ponieważ wówczas tło strony sąsiaduje nie bezpośrednio z kolorami na fladze a właśnie z ramką. Oczywiście inną kwestią jest, czy ramka kontrastuje z kolorami na fladze… ale wówczas wracamy do punktu wyjścia, bo ramka musiałaby kontrastować zarówno z kolorami na fladze, jak i kolorem tła. Uznajmy, że skoro kontrastuje z tłem, to spełnia swoje zadanie. Nawet, jeśli będzie się zlewała z niektórymi kolorami na fladze, to powinna pokazywać zarys całej flagi (np. dolna część zleje się z fioletowym kolorem, ale już na górze ramka będzie się dobrze kontrastowała z żółtym i pomarańczowym).

{% include figure.html src="/assets/images/dostepna-tecza/contrast-colors.svg" style="border: 2px solid #000;" alt="Tęczowa flaga dostosowana pod kontrast pomiędzy poszczególnymi kolorami oraz z czarną ramką zapewniającą kontrast z białym tłem." %}

Tutaj zmian było już zdecydowanie więcej, jedynie dwa kolory ostały się bez zmian.

## Wnioski

Końcowe wyniki wyglądają zdecydowanie inaczej, niż się spodziewałem. Najdziwniejsze rzeczy zadziały się z żółtym, który wpadł w odcienie brązowego czy wręcz brudnozielonego. Podejrzewam, że to po części skutek uboczny mojego sposobu dobierania kolorów. Idąc od góry, żółty kontrastować musiał z pomarańczowym, który z kolei był odpowiednio dobierany pod czerwony. Tym sposobem liczba możliwości znacząco się skurczyła.

Natomiast inne kolory w dużej mierze dobrać się udało przy pomocy zmiany natężenia poszczególnych barw – a to jakiś ciemniejszy fiolet, a to jaśniejszy zielony… Prawdopodobnie o wiele lepsze rezultaty uzyskałbym w eksperymencie, gdybym używał [składni HSL](https://www.smashingmagazine.com/2021/07/hsl-colors-css/), która pozwala na bardzo łatwe manipulowanie nasyceniem i jasnością. Nie dość, że znacząco ułatwiłoby to pracę, to jeszcze pozwoliło dobrać lepiej kolory. No ale cóż, może za rok.

No i same flagi wyglądają… zdecydowanie gorzej, niż się spodziewałem. A w sumie szkoda – chyba jednak nie zacznę trendu na "dostępną tęczę".
