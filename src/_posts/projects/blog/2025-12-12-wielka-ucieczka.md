---
layout: post
title: "Wielka ucieczka"
description: "Czasami Markdown i Liquid się gryzą i trzeba je jakoś pogodzić."
author: Comandeer
date: 2025-12-12T00:00:00+0100
project: blog
tags:
    - adwent-2025
    - javascript
comments: true
permalink: /wielka-ucieczka.html
---

W [Eleventy](https://www.11ty.dev/) pliki `.md` to nie do końca _zwykły_ [Markdown](https://commonmark.org/). Eleventy pozwala w nich bowiem mieszać Markdowna ze składnią [Liquida](https://liquidjs.com/index.html). To działa bardzo fajnie… do momentu, w którym nie dochodzi do _konfliktów_.<!--more-->

## Poważne kłótnie

Gdy pisałem artykuł o dygresjach, próbowałem pokazać, jak wygląda składnia nowego rozwiązania. Użyłem wówczas zapisu ze znakami ucieczki:

```
{\% note %}Treść dygresji{\% endnote %}
```

Wszystko po to, żeby Eleventy nie potraktował tego jako kodu w składni Liquida i nie wygenerował dygresji.

Myślałem, że w ten prymitywny sposób udało mi się ominąć problem. A potem pojawił się wpis o tworzeniu dyskusji przy pomocy GitHub Actions i okazało się, że tak nie do końca:

{% figure "../../../images/wielka-ucieczka/blad.png" "Błąd renderowania bloczka kodu: z wartości zmiennej &quot;GITHUB_TOKEN&quot; został jedynie znak &quot;$&quot;." "Przykład uciętej zmiennej środowiskowej" %}

Ten fragment kodu miał wyglądać następująco:

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # 17
```

GitHub Actions do wstawiania wartości zmiennych używa takiej samej składni co Liquid, czyli wąsów ({% raw%}`{{ }}`{% endraw %}). Zatem Eleventy spróbowało podstawić wartość zmiennej z Liquida o nazwie `secrets.GITHUB_TOKEN` do treści. Takiej zmiennej jednak nie ma, więc ostatecznie zostało puste miejsce.

Stwierdziłem zatem, że coś trzeba z tym zrobić. W końcu musi być jakiś sposób, żeby ominąć problem nakładających się składni!

## Rozwiązanie

Zajrzałem więc do dokumentacji Liquida. Okazało się, że, faktycznie, jest coś, co pozwoli mi rozwiązać mój problem: [tag `raw`](https://liquidjs.com/tags/raw.html). Jeśli otoczy się nim fragment treści, to nie będzie on parsowany przez Liquida. Tym samym – powinien przetrwać w niezmienionej formie i wylądować w wynikowym pliku HTML!

Co jeszcze ciekawsze, okazało się, że… już kiedyś ten tag zastosowałem. A dokładniej: we [wpisie o formatowaniu tekstu przy pomocy metody `Array#reduce()`](https://github.com/Comandeer/blog/blob/662e87d6ecd8fd683b95fc587aa4678cb939db45/src/_posts/javascript/2017-05-21-reduce-i-formatowanie-tekstu.md#L204). Jakoś totalnie o tym zapomniałem. Niemniej, ponownie uzbrojony w tę wiedzę mogłem teraz poprawić problematyczne wpisy!

Tylko że… jestem leniwym i zapominalskim człowiekiem. Raz, że nie chce mi się wszędzie pisać tego tagu `raw`; dwa – nie jest mi on potrzebny na tyle często, żebym o nim pamiętał. Przy kolejnym tego typu problemie jeszcze raz bym musiał przechodzić cały proces przypominania sobie o tym rozwiązaniu. Wypadałoby to jakoś zautomatyzować!

## _Dobre_ rozwiązanie

Na szczęście Eleventy udostępnia [preprocesory](https://www.11ty.dev/docs/config-preprocessors/). Pozwalają one zmodyfikować pliki wpisów, zanim trafią one do parserów Liquida i Markdowna. Jest więc to idealny moment, żeby zaaplikować tag `raw` w odpowiednich miejscach!

Tak wygląda mój preprocesor:

```javascript
const codeBlockRegex = /^```(?:.+)?\n(?:.|\n)+?\n```\n/gmu; // 4

export function createLiquidPreprocessor( eleventyConfig ) { // 1
	eleventyConfig.addPreprocessor( 'liquidPreprocessor', 'md', ( _, content ) => { // 2
		return content.replaceAll( codeBlockRegex, '{\% raw %}$&{\% endraw %}' ); // 3
	} );
}
```

{% note %}Cóż, tag `raw` to ten jeden, w którym trzeba stosować znaki ucieczki – tego już się raczej nie da obejść…{% endnote %}

Tworzymy funkcję `createLiquidPreprocessor()` (1), którą eksportujemy. Ta funkcja jako argument przyjmuje [obiekt konfiguracyjny Eleventy](https://www.11ty.dev/docs/config/). Wywołujemy jego metodę `#addPreprocessor()` (2) i przekazujemy mu nasz preprocesor. Podajemy jego nazwę (`liquidPreprocessor`) oraz rozszerzenie pliku, dla którego ma się odpalać (`md`). Sam preprocesor przekazujemy jako callback. Jego drugi argument to treść pliku z wpisem. Z callbacku zwracamy treść z podmienionymi wszystkimi blokami kodu na takie otoczone tagiem `raw` (3). Bloki kodu wykrywamy przy pomocy wyrażenia regularnego (4):

1. <code>^&#96;&#96;&#96;</code> oznacza linię, która zaczyna się od potrójnego grawisa (&#96;),
2. `(?:.+)?` oznacza nazwę języka, która może składać się z dowolnej liczby dowolnych znaków (`.+`) oraz może wystąpić raz lub wcale (`?`),
3. `\n` oznacza nową linię, następującą po grawisach i opcjonalnej nazwie języka,
4. `(?:.|\n)+?` oznacza zawartość bloczka kodu, która może składać się z dowolnych znaków oraz nowych linii,
5. <code>\n&#96;&#96;&#96;\n</code> oznacza zakończenie bloczka, czyli potrójny grawis otoczony znakami nowej linii (inaczej mówiąc: linia, w której znajdują się wyłącznie trzy grawisy).

Natomiast samą podmianę robimy przy pomocy wzorca `'{% raw %}{% raw %}$&{\% endraw %}{% endraw %}'`. Metoda `#replaceAll()` pozwala używać [specjalnych wyrażeń](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_string_as_the_replacement), które dają dostęp do rzeczy znalezionych przez wyrażenie regularne. W naszym wypadku używamy wyrażenia `$&` oznaczającego cały znaleziony ciąg.

Ostatnim etapem jest zaimportowanie funkcji `createLiquidPreprocessor()` w pliku `eleventyConfig.js` i wywołanie jej. Od teraz wszystkie bloczki kodu w plikach `.md` będą automatycznie otaczane przy pomocy tagów `raw`!

To rozwiązanie ma jedną wadę: nie pozwala używać podstawiania zmiennych Liquidowych wewnątrz bloczków kodu:

```javascript
const zmienna = '{{ zmiennaZLiquida }}';
```

Zamiast wartości zmiennej, powyższy kod wyświetli po prostu {% raw %}`{{ zmiennaZLiquida }}`{% endraw %}. Niemniej od momentu powstania bloga ani razu tego nie potrzebowałem, więc… brzmi jak coś, co mogę odłożyć na później.

Tak oto niniejszy blog ulepszył się o kolejną, małą rzecz!
