---
layout: post
title:  "Uparte narzędzia"
description: "Czy nadmiar konfigurowalności jest dobry?"
author: Comandeer
date: 2024-01-31T20:59:00+0100
tags:
    - refleksje
    - javascript
comments: true
permalink: /uparte-narzedzia.html
---

Nie tak dawno temu na fejsowych grupkach poświęconych webdevowi zobaczyłem dwie rzeczy. Jedną z nich był news o nowej wersji jakiejś popularnej JS-owej biblioteki, w którym autor zastanawiał się, jak przetłumaczyć na polski słówko <i lang="en">opinionated</i>. Drugą był kod startera dla aplikacji w Next.js i Tailwindzie, który zawierał 20 plików konfiguracyjnych (22, jeśli doliczyć licencję i plik `README`). Co te posty mają ze sobą wspólnego? W sumie to nic, ale skłoniły mnie do dzisiejszej refleksji.<!--more-->

20 plików konfiguracyjnych. Swego czasu całe moje projekty posiadały mniej plików, niż ten starter konfiguracji. Ale potem coś się zdecydowanie zmieniło. Gdy teraz spoglądam na kod [swojego bundlera](https://github.com/Comandeer/rollup-lib-bundler), z przerażeniem stwierdzam, że metaplików (a więc zawierających jakąś konfigurację lub inne informacje o projekcie, nie zaś kod) jest podejrzanie wręcz dużo (15 plików i dwa katalogi). Na dobrą sprawę jest ich więcej niż faktycznego kodu. I z jednej strony to fantastycznie, że w JS-owym ekosystemie możemy sobie skonfigurować absolutnie wszystko, łącznie z dokładnym sposobem formatowania kodu. Tylko pytanie, czy na pewno potrzebujemy aż takiej swobody?

W PHP swego czasu rozwiązano ten problem dość efektywnie. Powstała ~~grupa trzymająca władzę~~ nieoficjalna organizacja tworząca standardy, [PHP Framework Interop Group (PHP-FIG)](https://www.php-fig.org/). Jej rekomendacje są przestrzegane przez większość PHP-owego światka, dzięki czemu ustalono m.in. [standard nazewnictwa i automatycznego wczytywania modułów](https://www.php-fig.org/psr/psr-4/) czy [sposób formatowania kodu](https://www.php-fig.org/psr/psr-12/). Jasne, te rekomendacje nie mają żadnej mocy prawnej i w teorii nic się nie stanie, jeśli kod w PHP nie będzie ich przestrzegał. Ale stały się de facto standardem w PHP-owym ekosystemie i większość _profesjonalnego_ kodu (zwłaszcza frameworków) będzie przestrzegała określonych przez PHP-FIG reguł. I dzięki temu, mimo że sam język nie definiuje dokładnych reguł dla wczytywania klas na podstawie ich nazwy, taka oddolna inicjatywa standaryzacyjna pozwoliła na stworzenie managera zależności, [Composera](https://getcomposer.org/). Tymczasem w ekosystemie JS-a teoretycznie mamy dość dobrze opisany sposób wczytywania modułów na poziomie samego języka. A mimo to ostatecznie niemal każdy framework ma swoje własne zdanie na temat tego, jak to powinno ostatecznie wyglądać. Nie wspominając już o tym, że manager pakietów też trzeba sobie najpierw wybrać.

I tutaj na scenę wkraczają <i lang="en">opinionated</i> rozwiązania. To angielskie słówko tłumaczy się dosłownie jako "uparty" i… podoba mi się to tłumaczenie. Bo tak, myślę, że potrzebujemy więcej upartych rozwiązań. Takich, które pozwalają zrobić coś w jeden, ściśle określony sposób. I których się nie da konfigurować. Dobrym przykładem może być formator kodu. Zwykle w projekcie używa się jednego sposobu zapisu. Co oznacza, że formator nie musi mieć miliarda opcji konfiguracyjnych, żeby dostosować każdy jeden przecinek i średnik. Wystarczy, żeby robił to tak, jak _powinno być_. Albo bundler. Konfiguracja webpacka jest już dzisiaj memem w branży, bo praktycznie nikt nie chce (czy wręcz nie jest w stanie) zrobić tego ręcznie. A przecież naprawdę sporo rzeczy można wyciągnąć bezpośrednio z pliku `package.json`, np. nazwy bundle'i, wersje Node'a, jakie mają być wspierane, itd. [Mój bundler właśnie coś takiego robi](https://github.com/Comandeer/rollup-lib-bundler#how-does-it-work), dzięki czemu nie potrzebuje żadnej dodatkowej konfiguracji. I chciałbym widzieć takich narzędzi zdecydowanie więcej.

Tak, cenię sobie konfigurowalność JS-owych narzędzi. Ale czasami po prostu chcę je zainstalować i nie musieć się ani razu zastanowić nad tym, czy aby na pewno są poprawnie skonfigurowane.
