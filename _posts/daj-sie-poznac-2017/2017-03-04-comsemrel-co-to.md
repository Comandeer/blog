---
layout: post
title:  "ComSemRel – co to?"
author: Comandeer
date: 2017-03-04T22:40:00+0100
tags:
    - daj-sie-poznac-2017
    - javascript
comments: true
permalink: /comsemrel-co-to.html
redirect_from:
    - /daj-sie-poznac-2017/javascript/2017/03/04/comsemrel-co-to.html
---

Skoro do 31 maja będę musiał _z wielką przyjemnością_ rozwijać projekt o jakże pięknej nazwie ComSemRel, wypadałoby przynajmniej napisać, co to takiego.

## Geneza

Podstawowa mantra obecnego webdevu (i w sumie programowania w ogóle) to: automatyzacja. Automatyzujemy wszystko, co tylko się da. Zautomatyzowaliśmy już "kompilowanie" modułów JS, przerabianie SCSS na CSS, minifikację, konkatenację, publikowanie strony na serwerze, nawet blogi są w dużej mierze zautomatyzowane ([Jekyll](http://jekyllrb.com/) – FTW!). Ostało się już naprawdę mało bastionów, w których trzeba robić coś ręcznie (automatyzacja pisania kodu – soon…). Jednym z nich bez wątpienia jest żmudny proces publikowania nowych wersji naszych super-mega-hiper bibliotek/frameworków/skryptów w przeróżnych managerach pakietów.

Tradycyjnie wygląda to tak, że wypychamy zmiany do naszego repozytorium na GitHubie, czekamy, aż CI (np. [Travis](https://travis-ci.org/)) sobie to ładnie potestuje, pokaże się zielony znaczek "build passing" (albo i nie…) i dopiero wtedy zajmujemy się całym procesem:

*   zmieniamy wersję naszego pakietu w odpowiednich miejscach (np. w `package.json`),
*   uaktualniamy changelog,
*   budujemy odpowiednie paczki,
*   pushujemy do oddzielnego brancha czy wręcz oddzielnego repozytorium z odpowiednim [tagiem](https://git-scm.com/book/en/v2/Git-Basics-Tagging),
*   szykujemy [release'a na GitHuba](https://help.github.com/articles/creating-releases/),
*   prawdopodobnie szykujemy też release'a do rejestru naszego managera pakietów,
*   przepisujemy notatki z changeloga do release'a,
*   rwiemy sobie włosy z głowy, bo coś po drodze poszło nie tak.

A to często tylko wierzchołek góry lodowej, bo czasami trzeba jeszcze uaktualnić dokumentację, zrobić dziwne rzeczy na stronie itd. Brzmi jak idealne miejsce do wprowadzenia automatyzacji.

Nic zatem dziwnego, że powstał projekt, który te czynności chce faktycznie zautomatyzować: [semantic-release](https://github.com/semantic-release/semantic-release). Jego główne założenia można streścić w kilku punktach:

*   jedyny słuszny system wersjonowania to [semantic versioning](http://semver.org/) (stąd zresztą nazwa),
*   dzięki temu można przy pomocy niewyszukanej heurystyki ustalić, jaka wersja powinna być opublikowana,
*   a sama publikacja wersji następuje po każdym _udanym_ pushu (czyli takim, który przejdzie testy w środowisku CI).

Skoro zatem jest automatyzacja, to można rozejść się do domów i spokojnie korzystać przy kubku herbaty, prawda?

## Co mi się nie podoba?

Cóż, nie do końca. Owszem, semantic-release rozwiązuje najbardziej palące problemy i jego główne założenia są jak najbardziej słuszne i sensowne, _ale_… Jest kilka rzeczy, które nie do końca mi pasują:

*   Jedyny słuszny manager pakietów to npm. I to się sprawdza pod warunkiem, że cały nasz system stoi na node.js. Jak nie stoi, to zaczyna się robić mniej ciekawie.
*   Jedyny słuszny hosting kodu to GitHub, a jedyne słuszne CI to Travis. Czasami przydałaby się możliwość integracji choćby z GitLabem/Bitbucketem i Jenkinsem/Circle CI.
*   Generowanie changelogu na podstawie wszystkich commitów jest rozwiązaniem fajnym, ale nie dla wszystkich workflowów. Bardzo ciekawym rozwiązaniem byłaby możliwość generowania changelogu jedynie na podstawie merge commitów, czyli commitów włączających branche z poszczególnymi commitami do głównego brancha.
*   semantic-release jest niesamowicie radykalne jeśli chodzi o automatyzację i w żaden sposób nie umożliwia ręcznego ustalenia kolejnej publikowanej wersji. A to się czasami przydaje (np. ręczne wymuszenie wersji 1.0.0).
*   Radykalność sięga jeszcze dalej, ponieważ nie ma żadnego sposobu, żeby odpalić release lokalnie na komputerze. Tzn jest jeden: ustawienie odpowiednich zmiennych środowiskowych i udawanie, że jest się środowiskiem CI. Dość słabe.
*   Cały proces jest podzielony na 2 komendy: `semantic-release pre` i `semantic-release post`. Miało to chyba podnieść elastyczność, ale elastyczność przy takim narzucie ściśle określonych konwencji średnio działa. Idealnie byłoby mieć jedną komendę.
*   semantic-release wyrzuca z `package.json` pole `version` (jest dostępne tylko w pakiecie na npm). Jak dla mnie średnio sensowne. I w sumie to jest główny powód, dla którego w temat wszedłem.
*   Jedyne słuszne wersjonowanie kodu to semantic versioning. A czasami przyda się [sentimental versioning](http://sentimentalversioning.org/)!

Część z powyższych wad można rozwiązać przy pomocy [pluginów](https://github.com/semantic-release/semantic-release#plugins), ale system pluginów do najbardziej elastycznych również nie należy. Jest raptem 5 miejsc, w które można się wpiąć: ustalenie nowej wersji, wygenerowanie changeloga, sprawdzenie, czy należy robić release (sprawdzenie, czy build faktycznie zielony itp.), sprawdzenie, czy została określona odpowiednia wersja i czy faktycznie powinna być opublikowana (brzmi trochę jakby zrobione na siłę) oraz ustalenie, jaka była ostatnia opublikowana wersja. Wciąż zatem jesteśmy ograniczani. A ja _nienawidzę_ ograniczeń, a do tego cierpię na poważny przypadek [syndromu NIH](https://en.wikipedia.org/wiki/Not_invented_here). Dlatego też postanowiłem stworzyć ComSemRel!

## Główne założenia

Główne założenia ComSemRel są bardzo proste:

-   Brak przywiązania do konkretnego managera pakietów. Oczywiście domyślnie ComSemRel będzie współpracował z npm, ale nie powinno być większego problemu z przystosowaniem go do innego managera, jak choćby [Composera](https://getcomposer.org/).
-   To oznacza, że konfiguracja ComSemRela nie może się znajdować w pliku `package.json`, bo… może go po prostu nie być. Trzeba pomyśleć nad plikiem typu `.comsemrel.yml` czy `.comsemrelrc`. I tak, zamierzam tutaj użyć [YAML-a](https://en.wikipedia.org/wiki/YAML), bo to bardzo przyjemny format jest.
-   Brak przywiązania do konkretnego managera pakietów sprawia także, że ComSemRel fajnie byłoby zrobić w całości jako program konsolowy, instalowany globalnie (`npm install -g comsemrel`). To oznacza, że nie będzie takiego podziału jak w semantic-release, gdzie są tak naprawdę 2 programy konsolowe, z których jeden służy do generowania konfiguracji, a drugi do faktycznego tworzenia release'u. Będzie jeden program z kilkoma komendami (`init`, `release` itd.).
-   Pluginem będzie **absolutnie wszystko**. Trzon ComSemRela to będzie po prostu parser konfiguracji i… odpalacz pluginów. Oczywiście konfiguracja w dużej mierze będzie po prostu spisem pluginów. A jeśli ktoś nie stworzy żadnej konfiguracji, zostanie użyty domyślny zbiór pluginów. Chyba nie da się tego zrobić bardziej user friendly.
-   Na pewno będą pluginy dla GitHuba, npm i Travisa, ale mam także w planach, w ramach możliwości, dla BitBucketa, Composera i Circle CI. Tak samo jak mam zamiar wspierać co najmniej 2 formaty generowanych changelogów.
-   Będzie możliwość ręcznego stworzenia release'a (po prostu wystarczy odpalić `comsemrel release`). Program po prostu zapyta, czy aby na pewno chce się stworzyć release poza środowiskiem CI i tyle.
-   Będzie także możliwość wymuszania konkretnej wersji release'a – czy to specjalnie sformatowaną informacją w commicie, czy też przez przekazanie jej jako parametru do polecenia `release` (`comsemrel release --version=major`).
-   Nie będzie usuwania `version` z `package.json`!

Całość mam zamiar napisać przy użyciu [TypeScriptu](https://www.typescriptlang.org/), bo słyszałem o nim tyle dobrych rzeczy, a nigdy nic w nim nie napisałem. Teraz się nadarza okazja!

Podsumowując: ComSemRel to będzie lepsze (bo _własne_) semantic-release. Ambitnie? Jak zawsze w przypadku moich projektów! Czy uda mi się skończyć? Wątpię, ale plany są.

PS przygarnę PR-a z ładnym logo!

{% capture src %}{{ '/assets/images/bender-kill.jpg' | absolute_url }}{% endcapture %}
{% include 'figure' alt="KILL ALL HUMANS" src=src %}
