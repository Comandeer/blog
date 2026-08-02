---
layout: post
title:  "Kosmiczna zabawa"
description: "Jak to chciałem użyć pewnej biblioteki komponentów, ale po swojemu"
author: Comandeer
date: 2025-09-15T00:23:00+0200
tags:
    - eksperymenty
comments: true
permalink: /kosmiczna-zabawa.html
---

Ostatnio trafiłem na projekt [Cosmic UI](https://www.cosmic-ui.com/) – biblioteki gotowych komponentów UI utrzymanych w stylistyce sci-fi. Stwierdziłem wówczas, że wygląda to całkiem interesująco i w sumie fajnie byłoby użyć tego do jakiegoś małego projekciku. Wówczas nie wiedziałem jeszcze, na co się piszę…<!--more-->

## Początkowe rozczarowanie

Jak przystało na porządnego użytkownika dowolnego frameworka, ochoczo kliknąłem przycisk <i lang="en">Get started</i>. Jednak w miarę czytania mój entuzjazm powoli opadał. Pierwszym problemem był wykorzystany technologiczny stos. Cosmic UI opierało się na [Ark UI](https://ark-ui.com/), [Reakcie](https://react.dev/) i [Tailwindzie](https://tailwindcss.com/), z dodatkiem [Zaga](https://zagjs.com/) do bardziej złożonych komponentów. Zatem na technologiach, których raczej nie użyłbym do małego, pobocznego projektu. Jednak o wiele większym problemem był fakt, że… Cosmic UI nie było pakietem npm.

Żeby zainstalować dowolny komponent, należy _skopiować_ jego kod z dokumentacji i wkleić do swojego projektu. Niemniej komponenty zależą od siebie nawzajem i żeby mieć [ładne przyciski](https://www.cosmic-ui.com/docs/button), muszę tak naprawdę najpierw zainstalować [komponent ramki](https://www.cosmic-ui.com/docs/frame). A żeby zainstalować komponent ramki, muszę dokładnie przeczytać jego dokumentację, bo przy okazji wymaga on instalacji paczki do [renderowania SVG](https://www.npmjs.com/package/@left4code/svg-renderer). W tym momencie zapaliła mi się czerwona lampka, ale postanowiłem ją zignorować. W końcu to naprawdę są ładne komponenty, nie może być aż tak źle, prawda?

## Odwrócona inżynieria wsteczna

Skoro nie mogłem użyć Cosmic UI w jego oryginalnej postaci, stwierdziłem, że zrobię to ~~dobrze~~ po swojemu. Co w tym miejscu oznacza, że zaglądnę w bebechy biblioteki i znajdę, w jaki sposób generowane są te fancy komponenty. W tym celu posłużyłem się niezwykle zaawansowanym narzędziem, służącym do inżynierii wstecznej aplikacji webowych – [inspektorem elementów w Chrome](https://developer.chrome.com/docs/devtools/inspect-mode). Dzięki niemu odkryłem, że sztuczka, wbrew pozorom, jest dość prosta. Za wygląd komponentów odpowiadają grafiki SVG, na które następnie naniesione zostały pozostałe elementy interfejsu. W uproszczeniu kod każdego komponentu wygląda mniej więcej tak:

```html
<div class="component">
	<svg class="component__background">[…]</svg>
    <div class="component__content">[…]</div>
</div>
```

Element `.component` zawiera w sobie dwa elementy: grafikę SVG oraz kontener z treścią komponentu. Cały komponent jest pozycjonowany relatywnie, natomiast sama grafika – absolutnie. Dzięki temu może być użyta jako tło dla komponentu. Tę technikę (przy użyciu `div`a zamiast SVG) zobaczyć można na poniższym przykładzie:

{% include 'embed' src="https://codepen.io/Comandeer/pen/VYvJNVE" %}

Skoro więc sztuczka jest tak prosta, wystarczy wyciągnąć SVG z kodu i pora na CS-a… znaczy na poboczny projekt. Tylko pojawił się pewien problem: w [repozytorium Cosmic UI](https://github.com/rizkimuhammada/cosmic-ui) nie było żadnego pliku SVG. To była druga czerwona lampka, którą zignorowałem. Zacząłem więc szperać w kodzie. Zauważyłem, że wszystkie komponenty używają komponentu `Frame`. On sam z kolei opisany był jako służący do wyświetlania niestandardowych ramek SVG dla pozostałych komponentów. Spojrzałem na przykład użycia:

```tsx
<Frame
  className="drop-shadow-2xl drop-shadow-primary/50"
  paths={JSON.parse(
    '[{"show":true,"style":{"strokeWidth":"1","stroke":"var(--color-frame-1-stroke)","fill":"var(--color-frame-1-fill)"},"path":[["M","37","12"],["L","0% + 59","12"],["L","0% + 85","0% + 33"],["L","79","0% + 12"],["L","50% - 3","12"],["L","50% + 16","30"],["L","100% - 35","30"],["L","100% - 16","47"],["L","100% - 16","100% - 47.05882352941177%"],["L","100% - 8","100% - 44.85294117647059%"],["L","100% - 9","100% - 16.666666666666668%"],["L","100% - 17","100% - 14.705882352941176%"],["L","100% - 17","100% - 30"],["L","100% - 34","100% - 12"],["L","50% + 13","100% - 12"],["L","50% + 15","100% - 26"],["L","50% - 11","100% - 12"],["L","37","100% - 12"],["L","19","100% - 30"],["L","19","0% + 50.490196078431374%"],["L","10","0% + 48.529411764705884%"],["L","10","0% + 20.098039215686274%"],["L","0% + 19.000000000000004","0% + 18.38235294117647%"],["L","19","29"],["L","37","12"]]},{"show":true,"style":{"strokeWidth":"1","stroke":"var(--color-frame-2-stroke)","fill":"var(--color-frame-2-fill)"},"path":[["M","50% + 10","15"],["L","50% + 19","15"],["L","50% + 24","0% + 20"],["L","50% + 16","0% + 20"],["L","50% + 10","15"]]},{"show":true,"style":{"strokeWidth":"1","stroke":"var(--color-frame-3-stroke)","fill":"var(--color-frame-3-fill)"},"path":[["M","50% + 25","15"],["L","50% + 34","15"],["L","50% + 40","0% + 21"],["L","50% + 31","0% + 21"],["L","50% + 25","15"]]},{"show":true,"style":{"strokeWidth":"1","stroke":"var(--color-frame-4-stroke)","fill":"var(--color-frame-4-fill)"},"path":[["M","50% + 40","15"],["L","50% + 52","15"],["L","50% + 61","0% + 23"],["L","50% + 49","0% + 23"],["L","50% + 40","15"]]},{"show":true,"style":{"strokeWidth":"1","stroke":"var(--color-frame-5-stroke)","fill":"var(--color-frame-5-fill)"},"path":[["M","36","3"],["L","0% + 58","0"],["L","0% + 84","0% + 40"],["L","81","0% + 0"],["L","50% - 1","4"],["L","50% + 5","6"],["L","50% + 54","7"],["L","50% + 74","23"],["L","100% - 32","21"],["L","100% - 8","42"],["L","100% - 9","100% - 52.450980392156865%"],["L","100% + 0","100% - 50.245098039215684%"],["L","100% + 0","100% - 15.196078431372548%"],["L","100% - 7","100% - 13.480392156862745%"],["L","100% - 7","100% - 27"],["L","100% - 29","100% - 3"],["L","50% + 14","100% + 0"],["L","50% + 21","100% - 31"],["L","50% - 13","100% + 0"],["L","37","100% - 4"],["L","11","100% - 28"],["L","10","0% + 55.3921568627451%"],["L","0","0% + 52.94117647058823%"],["L","1","0% + 18.627450980392158%"],["L","11","0% + 16.666666666666668%"],["L","11","25"],["L","36","3"]]}]'
  )}
/>

```

I wówczas zrozumiałem, czemu w całym repozytorium nie było plików SVG. Te były bowiem dynamiczne renderowane dla każdego komponentu osobno przy pomocy wspomnianego już wcześniej renderera SVG, pakietu npm `@left4code/svg-renderer`. Każdy komponent dostawał tablicę [ścieżek SVG](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/d#path_commands), które następnie były mielone do faktycznych SVG. Co więcej, sposób działania biblioteki oznaczał, że każdy komponent, który trafiał ostatecznie do przeglądarki, miał swoją kopię takiego SVG. Zatem jeśli na stronie było 50 przycisków, oznaczało to, że każdy z tych przycisków ma swoje SVG. Wisienką na torcie jest fakt, że taka tablica ścieżek jest ciągiem tekstowym, wsadzonym do [`JSON.parse()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse), co – bez żadnego wyraźnego powodu – sprawia, że całość jest całkowicie niesformatowana w edytorze kodu.

To była trzecia czerwona lampka i fakt, że ją zignorowałem, skłania mnie do refleksji, czy aby nie jestem masochistą. Postanowiłem bowiem _wyciągnąć_ te ścieżki z kodu i stworzyć z nich pliki SVG samodzielnie.

## Ramki zagłady

W celu _ekstrakcji_ ramek postanowiłem napisać skrypt… w Pythonie. Bo jak się już bawić, to na całego!

### Sprytny plan

Plan był dość prosty:

1. Ściągnąć repozytorium Cosmic UI.
2. Przy pomocy skryptu wyszukać wszystkie pliki komponentów.
3. Znaleźć w nich ścieżki.
4. Zmielić ścieżki do [elementów `path`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/path).
5. Wygenerować [sprite'a SVG](https://css-tricks.com/svg-symbol-good-choice-icons/) i zapisać go do pliku.

Stwierdziłem, że repozytorium ściągnę ręcznie, zatem skrypt musiał poprawnie wykonać kroki 2-5. Nie zostało nic innego, jak go napisać.

### Wyszukiwanie plików komponentów

Krótki rzut oka na repozytorium Cosmic UI powiedział mi, że pliki z poszczególnymi komponentami są ulokowane w katalogu `src/components/ui`. Wystarczyło zatem, żeby skrypt do niego wszedł i pobrał listę wszystkich plików `.tsx`. Ale żeby było ładniej, zadecydowałem przy tym, że ścieżka do katalogu ze ściągniętym repozytorium będzie przekazywana jako argument do pythonowego skryptu.

W Pythonie istnieje klasa [`ArgumentParser` w module `argparse`](https://docs.python.org/3/library/argparse.html#argparse.ArgumentParser). Pozwala ona tworzyć proste aplikacje CLI, które przyjmują argumenty. Wykorzystajmy ją do obsługi przekazywania ścieżki:

```python
from argparse import ArgumentParser # 1

def parse_arguments(): # 2
	arg_parser = ArgumentParser( # 3
		prog = 'Extract SVGs', # 4
		description = 'Extract SVGs from Cosmic UI', # 5
	)
	arg_parser.add_argument( 'dir' ) # 6
	args = arg_parser.parse_args() # 7

	return args # 8

def main(): # 9
	args = parse_arguments() # 10

main() # 11
```

Na początku importujemy klasę z odpowiedniego modułu (1). Następnie tworzymy funkcję `parse_arguments()` (2). W niej tworzymy nową instancję `ArgumentParser`a (3). Jako argumenty przekazujemy do konstruktora nazwę naszego "programu" (4) oraz jego krótki opis (5). Następnie dodajemy nowy argument, `dir` (6). Na samym końcu parsujemy przekazane przez terminal parametry do zmiennej `args` (7) i je zwracamy (8). Żeby było ładniej, stworzymy przy okazji funkcję `main()` (9), która będzie opakowaniem na całą logikę aplikacji. Na razie zawiera jedynie parsowanie argumentów (10). Na samym końcu wywołujemy `main()` (11).

Jeśli zapiszemy teraz nasz skrypt i wywołamy go w terminalu z flagą `--help`, zauważymy, że wyświetla się nazwa oraz opis przekazane do konstruktora `ArgumentParser` wraz z krótką instrukcją obsługi:

```
$ python ./extract-svgs.py --help

usage: Extract SVGs [-h] dir

Extract SVGs from Cosmic UI

positional arguments:
  dir

options:
  -h, --help  show this help message and exit
```

Ok, skoro wiemy już, jak przekazać ścieżkę do katalogu z Cosmic UI, pora wyciągnąć przy jej pomocy ścieżki do plików. W tym celu stworzymy funkcję `get_component_paths()`, która jako argument przyjmuje ścieżkę do katalogu z Cosmic UI:

```python
from os.path import abspath, join as join_path, isfile # 1

[…]

def get_component_paths( dir_path: str ) -> list[str]: # 2
	cosmic_ui_path = abspath( dir_path ) # 3
	component_dir_path = abspath( join_path( cosmic_ui_path, 'src/components/ui' ) ) # 4
	component_paths = list( # 5
		filter( # 6
			lambda path: isfile( path ), # 7
			map( # 8
				lambda path: abspath( join_path( components_dir_path, path ) ), # 10
				listdir( component_dir_path ) # 9
			)
		)

	)

	component_paths.append( abspath( join_path( cosmic_ui_path, 'src/pages/home.tsx' ) ) ) # 11

	return component_paths # 12

def main():
	args = parse_arguments()
	component_paths = get_component_paths( args.dir ) # 13

[…]
```

Na początek importujemy potrzebne funkcje z modułu `os.path` (1). Następnie definiujemy funkcję `get_component_paths()` (2), która przyjmuje ścieżkę do katalogu Cosmic UI i zwraca listę ścieżek do plików z komponentami. Przy pomocy [funkcji `abspath()`](https://docs.python.org/3/library/os.path.html#os.path.abspath)  konwertujemy ścieżkę do Cosmic UI na ścieżkę absolutną (3). To zabezpieczenie na wypadek, gdyby ktoś wywołał skrypt ze ścieżką względną (`python extract-svgs.py ./cosmic-ui`). Następnie [dołączamy](https://docs.python.org/3/library/os.path.html#os.path.join) do tej ścieżki ścieżkę do katalogu `src/components/ui` i konwertujemy całość na ścieżkę absolutną (4). Żeby wyciągnąć listę samych komponentów, tworzymy nową listę `component_paths` (5), która jest wynikiem [przefiltrowania](https://docs.python.org/3/library/functions.html#filter) (6) [funkcją `isfile()`](https://docs.python.org/3/library/os.path.html#os.path.isfile) (7) wszystkich absolutnych ścieżek do komponentów. Ścieżki te uzyskamy poprzez [zmapowanie](https://docs.python.org/3/library/functions.html#map) (8) wyniku funkcji `listdir()` na katalogu komponentów – a więc listy wszystkich elementów wewnątrz tego katalogu – (9) na listę ścieżek absolutnych, uzyskanych poprzez dołączenie ścieżki do elementu do ścieżki katalogu komponentów i wrzucenie tego do `abspath()` (10). W obydwu przypadkach korzystamy z [lambdy](https://docs.python.org/3/glossary.html#term-lambda) – odpowiednika funkcji strzałkowych w JS-ie. W składni JS-owej wyglądałoby to następująco:

```javascript
const componentPaths = listDir( componentDirPath )
	.map( element => absPath( joinPath( componentDirPath, element ) ) )
	.filter( element => isFile( element ) )
```

Osobiście uważam, że zdecydowanie czytelniej niż w Pythonie.

Do tak stworzonej listy [dorzucamy](https://docs.python.org/3/library/stdtypes.html#list.append) jeszcze plik `src/pages/home.tsx` (11). Robimy to, ponieważ strona główna Cosmic UI ma kilka ciekawych kształtów ramek, które nie są użyte w żadnym komponencie. Następnie zwracamy tak stworzoną listę ścieżek (12) i dorzucamy wywołanie funkcji `get_component_paths()` do funkcji `main()` (13).

### Znajdowanie ścieżek

Pora na trudniejszą część zadania: znalezienie ścieżek SVG w plikach komponentów. Moją pierwszą myślą było zaprzęgnięcie do tego jakiegoś parsera TS-a z prawdziwego zdarzenia. Ale szybko odrzuciłem ten pomysł. Każde wystąpienie ścieżki SVG trzymało się bowiem takiego samego schematu:

```tsx
<Frame
	paths={JSON.parse(
		'tutaj ścieżki'
	)}
/>
```

A to oznaczało, że można tutaj zastosować wyrażenia regularne! Ułóżmy zatem [odpowiednie wyrażenie regularne](https://regex101.com/r/ORcE4G/1):

```
paths={JSON.parse\(\s*'(?P<path>[^']+)'
```

Rozbijmy je na części:

1. `paths={JSON.parse\(` szuka dokładnie takiego fragmentu w kodzie; `\` (znak ucieczki) przed `(`  ma związek z tym, że w wyrażeniach regularnych `()` służą do oznaczania grup;
2. `\s*` jest "na wszelki wypadek" i oznacza "w tym miejscu może wystąpić dowolna liczba białych znaków lub nie być żadnego";
3. `'(?P<path>[^']+)'` tworzy grupę o nazwie `path`, w której znajduje się co najmniej jeden znak inny niż `'`; grupa ta jest otoczona `'`.

To wyrażenie powinno wyszukać wszystkie ścieżki SVG w kodzie komponentów. Dodajmy je zatem do kodu:

```python
[…]
from re import finditer # 1

SVG_REGEX = 'paths={JSON.parse\\(\\s*\'(?P<path>[^\']+)\'' # 2

[…]

def parse_component( component_path: str ) -> list[str]: # 7
	symbols: list[str] = [] # 8

	component_content = open( component_path, mode='r' ).read() # 9
	svg_paths = finditer( SVG_REGEX, component_content ) # 10

	for path in svg_paths: # 11
		symbols.append( path.group( 'path' ) ) # 12

	return symbols # 13

def parse_components( component_paths: list[str] ) -> list[str]: # 3
	symbols: list[str] = [] # 4

	for component_path in component_paths: # 5
		symbols = symbols + parse_component( component_path ) # 6

	return symbols; # 7

def main():
	args = parse_arguments()
	component_paths = get_component_paths( args.dir )
	symbols = parse_components( component_paths ) # 14

	print( symbols )

main()
```

Na sam początek importujemy [funkcję `finditer()` z modułu `re`](https://docs.python.org/3/library/re.html#re.finditer) (1), która pozwala na wyszukanie wszystkich dopasowań do wyrażenia regularnego w jakimś ciągu tekstowym. Następnie tworzymy zmienną `SVG_REGEX` (2), w której umieszczamy nasze wyrażenie regularne. Z racji tego, że jest ono umieszczone w kodzie jako zwykły ciąg tekstowy, znaki ucieczki są podwójne (zatem `\\s` zamiast `\s` itd.) – inaczej traktowane byłyby jako znaki ucieczki w ciągu tekstowym. Następnie tworzymy funkcję `parse_components()` (3), która przyjmuje listę ścieżek do plików komponentów i zwraca listę wyciągniętych z nich i sparsowanych ścieżek. Sparsowane ścieżki trzymamy w liście `symbols` (4). Docelowo ma trzymać [elementy `symbol`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/symbol) , stąd nazwa. Następnie dla każdego pliku komponentu (5) wywołujemy funkcję `parse_component()` (6). Z uwagi na to, że `parse_component()` może zwrócić listę ścieżek (bo w pliku może być więcej niż jedna ścieżka), stosujemy tutaj łączenie list (`nowa_lista = lista1 + lista2` – tu z kolei Python jest zdecydowanie elegantszy niż JS!). Na końcu zwracamy listę symboli.

Funkcja `parse_component()` (7) tworzy swoją własną listę `symbols` (8), a następnie otwiera plik komponentu i czyta jego treść (9), by potem wyszukać w niej ścieżek przy pomocy wyrażenia regularnego `SVG_REGEX` (10). Z każdej znalezionej ścieżki (11) wyciąga jedynie wartość grupy `path` i wrzuca ją do tablicy `symbols` (12), którą następnie zwraca (13). Na sam koniec dorzucamy wywołanie `parse_components()` do funkcji `main()` (14) i dorzucamy `print()` (15), żeby zobaczyć, czy coś się nie skrzaczyło. Naszym oczom powinna się ukazać… ściana liter i cyfr. Co na tym etapie oznacza tyle, że nasz skrypt faktycznie _coś_ z komponentów wyciąga. Teraz pora to sparsować do sensownej postaci!

### Mielenie ścieżek

Przyjrzyjmy się, co tak naprawdę siedzi w każdym komponencie `Frame`. Jego magiczna własność `paths` zawiera JSON-a mniej więcej o takim kształcie:

```json
{
	"show": true,
	"style": {
		"style": "css"
    },
	"path": [
		[ "M", "17", "0" ]
	]
}
```

Nie odkryłem, co robi `show`, ale `style` i `path` były proste do odgadnięcia. Własność `style` zawiera po prostu style CSS dla danej ścieżki, natomiast `path` – tzw. [komendy ścieżki](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/d#path_commands). Krótka analiza artykułu na MDN zasugerowała mi, że powyższy kod JSON jest odpowiednikiem mniej więcej takiego SVG:

```xml
<svg xmlns="http://www.w3.org/2000/svg">
	<path d="M 17,0" style="style: css;" />
</svg>
```

Skoro tak, to sparsowanie tego do używalnej formy nie powinno stanowić większego problemu! Przystąpmy zatem do pracy. Na początek stwórzmy funkcję `create_symbol()`:

```python
[…]
import json # 1
[…]
SYMBOL_WIDTH = 100 # 14
SYMBOL_HEIGHT = 100 # 15

current_symbol = 1; # 11

[…]

def create_symbol( svg_string: str ) -> str: # 2
	global current_symbol
	paths: list[str] = [] # 3
	path_data = json.loads( svg_string ) # 4

	for path in path_data: # 5
		path_coords = create_path_commands( path[ 'path' ] ) # 6
		path_style = create_path_style( path[ 'style' ] ) # 7
		paths.append( f'<path d="{path_coords}" style="{path_style}"/>' ) # 8

	symbol = f'<symbol id="cosmic-{current_symbol}" viewBox="0 0 {SYMBOL_WIDTH} {SYMBOL_HEIGHT}">{''.join( paths )}</symbol>' # 9

	current_symbol += 1 # 13

	return symbol # 10

[…]
```

Na początek importujemy [moduł `json`](https://docs.python.org/3/library/json.html#module-json) (1), odpowiedzialny za pracę z JSON-em. Następnie definiujemy funkcję `create_symbol()` (2), która będzie generować elementy `symbol` z poprawnymi ścieżkami. Wewnątrz niej tworzymy zmienną `paths` (3), która będzie przechowywać stworzone elementy `path`. Następnie do zmiennej `path_data` parsujemy przy pomocy [funkcji `json.loads()`](https://docs.python.org/3/library/json.html#json.loads) wyciągnięte przez nas ścieżki z komponentów (4). Dla każdej wyciągniętej ścieżki (5) tworzymy komendy ścieżki  przy pomocy funkcji `create_path_commands()` (6) oraz style przy pomocy funkcji `create_path_style()` (7), a następnie na tej podstawie generujemy element `path` (przy pomocy [f-stringu](https://docs.python.org/3/glossary.html#term-f-string)) i wsadzamy go do listy `paths` (8). Na samym końcu tworzymy z tego element `symbol` (9) i go zwracamy (10). System sprite'ów wymaga, żeby każdy symbol miał swoje id, więc tworzymy go według wzoru `cosmic-<kolejna liczba>`. Licznik trzymany w globalnej zmiennej `current_symbol` (11). Wewnątrz funkcji `create_symbol()` zaznaczamy jej użycie słówkiem kluczowym `global` (12), następnie wykorzystujemy przy tworzeniu elementu `symbol` (9), a potem – zwiększamy o 1 jej wartość (13). Dodatkowo każdy symbol ma określony [viewbox](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/viewBox) przy pomocy zmiennych `SYMBOL_WIDTH` (14) i `SYMBOL_HEIGHT` (15) – w naszym przypadku obydwie te zmienne mają wartość `100`.

Funkcję `create_symbol()` wsadzamy teraz do `parse_component()` (1):

```python
def parse_component( component_path: str ) -> list[str]:
	symbols: list[str] = []

	component_content = open( component_path, mode='r' ).read()
	svg_paths = finditer( SVG_REGEX, component_content )

	for path in svg_paths:
		symbols.append( create_symbol( path.group( 'path' ) ) ) # 1

	return symbols
```

Przyjrzyjmy się jeszcze funkcjom generującym style i komendy ścieżki. Na początek `create_path_style()`:

```python
def create_path_style( style ) -> str:
	style_string_parts: list[str] = [] # 1

	for property, value in style.items(): # 2
		style_string_parts.append( f'{property}: {value}' ) # 3

	return ';'.join( style_string_parts ) # 4
```

Tworzymy listę `style_string_parts`, następnie dla [każdej pary klucz → wartość ze słownika](https://docs.python.org/3/library/stdtypes.html#dict.items) `style` (2) tworzymy nową regułę CSS (3). Na samym końcu [łączymy](https://docs.python.org/3/library/stdtypes.html#str.join) wszystkie reguły CSS w jeden ciąg tekstowy, odgradzając poszczególne z nich średnikami (4).

Natomiast funkcja `create_path_commands()` prezentuje się następująco:

```python
def create_path_commands( path ) -> str:
	commands: list[str] = [] # 1

	for command_data in path: # 2
		command_name = command_data.pop( 0 ) # 3
		x = command_data.pop( 0 ) # 4
		y = command_data.pop( 0 ) # 5

		commands.append( f'{command_name} {x},{y}' ) # 6

	return ' '.join( commands ) # 7
```

Tworzymy listę `commands` (1). Następnie z każdej komendy zapisanej w JSON-ie (2) wyciągamy jej nazwę, czyli pierwszy element listy (3), współrzędną na osi X, zatem drugi element listy (4), oraz współrzędną na osi Y, czyli trzeci element listy (5). Formatujemy to jako poprawną komendę ścieżki i wrzucamy do listy `commands` (6). Na końcu robimy z komend jeden ciąg tekstowy i go zwracamy (7).

{% note %}

W kodzie za każdym razem pobieramy pierwszy element listy, ponieważ <code>pop()</code> usuwa element listy i go zwraca. Tym samym po usunięciu pierwszego elementu ten drugi staje się pierwszy itd.

{% endnote %}

Jeśli teraz uruchomimy nasz skrypt, dostaniemy gotowe do użycia elementy `symbol`! Dla testów możemy skopiować dowolny, opatulić go w `svg` i spróbować użyć:

```html
<svg><!-- tutaj dowolny symbol --></svg>

<svg>
	<use href="#symbol-1" />
</svg>
```

Gdy otworzymy taki plik HTML, to okaże się, że… nie działa. A po otwarciu konsoli w Chrome wita nas piękny komunikat błędu:

```
Error: <path> attribute d: Expected number, "M 14,6 L 50% - 7,6 L 50% - …".
```

Spojrzałem zatem dokładniej w kod Cosmic UI. I wówczas odkryłem, że w JSON-ie nie do końca są ścieżki. Były tam też… działania matematyczne, takie jak `100% - 40`. Pogrzebałem trochę głębiej i odkryłem, że faktyczne wartości dla ścieżek są [obliczane na bieżąco](https://github.com/rizkimuhammada/cosmic-ui/blob/fd677955959290be06438c1656b8141391951deb/src/utils/frame.ts#L18-L41), na podstawie wielkości poszczególnych komponentów. To był ten moment, w którym chciałem porzucić cały projekt, ale [zainwestowałem już za dużo czasu](https://en.wikipedia.org/wiki/Sunk_cost#Fallacy_effect). Nie zostało mi nic innego, jak dodać obliczenia do mojego skryptu.

{% figure "../../images/kosmiczna-zabawa/kontemplacja.png" "Fotomontaż: Ben Affleck z moją twarzą, stojący oparty o drzwi i palący papierosa." "Ja, kontemplujący swoje złe decyzje życiowe" %}

Na szczęście nie okazało się to jakoś przesadnie trudne. Na sam początek trzeba zmienić funkcję `create_path_commands()`:

```python
def create_path_commands( path ) -> str:
	commands: list[str] = []

	for command_data in path:
		command_name = command_data.pop( 0 )
		x = calculate_coord( command_data.pop( 0 ), 'x' ) # 1
		y = calculate_coord( command_data.pop( 0 ), 'y' ) # 2

		commands.append( f'{command_name} {x},{y}' )

	return ' '.join( commands )
```

Teraz zmienne `x` i `y` tworzymy przez wywołanie funkcji `calculate_coord()`, do której przekazujemy odpowiednią wartość z listy `command_data` oraz oś, do której koordynat należy (1, 2).

Sama funkcja `calculate_coord()` przedstawia się następująco:

```python
from re import finditer, search # 2

[…]

CALC_REGEX = '^(?P<left>\\d+(?:\\.\\d+)?%?)\\s*(?P<operator>[\\-+*/])\\s*(?P<right>\\d+(?:\\.\\d+)?%?)$' # 4

[…]

def calculate_coord( coord: str, axis: str ) -> str:
	if coord.find( '%' ) == -1: # 1
		return coord

	calculation = search( CALC_REGEX, coord ) # 3

	if calculation == None: # 5
		return coord; # 6

	left = get_coord_value( calculation.group( 'left' ), axis ) # 7
	operator = calculation.group( 'operator' ) # 8
	right = get_coord_value( calculation.group( 'right' ), axis ) # 9

	match operator: # 10
		case '-':
			return f'{int( left - right )}' # 11
		case '+':
			return f'{int( left + right )}' # 12
		case '*':
			return f'{int( left * right )}' # 13
		case '/':
			return f'{int( left / right )}' # 14
```

Na sam początek sprawdzamy, czy koordynat [zawiera znak](https://docs.python.org/3/library/stdtypes.html#str.find) `%` (1). Jeśli nie, zwracamy przekazany koordynat bez zmian (Cosmic UI _zawsze_ stosuje procenty w obliczeniach, stąd ten warunek). Następnie przy pomocy funkcji `search()` z modułu `re` (2) wyszukujemy dopasowanie (3) do wyrażenia regularnego `CALC_REGEX` (4) wewnątrz przekazanego koordynatu. Jeśli go nie znajdujemy (5), zwracamy koordynat bez zmian (6). W innym wypadku wyciągamy z dopasowania lewą stronę działania (7), operator (8) oraz prawą stronę działania (9). Następnie [sprawdzamy, jaki mamy operator](https://docs.python.org/3/reference/compound_stmts.html#index-18) (10) i w zależności od tego, wykonujemy odpowiednie działanie – odejmowanie (11), dodawanie (12), mnożenie (13) lub dzielenie (14).

Przyjrzyjmy się jeszcze wyrażeniu regularnemu:

```
^(?P<left>\d+(?:\.\d+)?%?)\s*(?P<operator>[\-+*/])\s*(?P<right>\d+(?:\.\d+)?%?)$
```

1. `^` oznacza, że dopasowanie musi się zaczynać od początku ciągu;
2. `(?P<left>\d+(?:\.\d+)?%?)` to grupa oznaczająca lewą stronę działania:
   1. `?P<left>` nadaje nazwę `left` grupie,
   2. `\d+` oznacza "co najmniej jedną cyfrę",
   3. `(?:\.\d+)?` oznacza "w tym miejscu może wystąpić kropka, po której następuje co najmniej jedna cyfra" (czyli liczby po przecinku),
   4. `%?` oznacza "w tym miejscu może wystąpić znak procenta";
3. `\s*(?P<operator>[\-+*/])\s*` to operator (znak `-`, `+`, `*` lub `/`), który może być otoczony z obydwu stron białymi znakami;
4. `(?P<right>\d+(?:\.\d+)?%?)` to grupa oznaczająca prawą stronę działania; jest identyczna, jak dla lewej strony;
5. `$` oznacza, że dopasowanie musi się kończyć na końcu ciągu; w połączeniu z `^` sprawia, że cały ciąg musi być dopasowany.

Natomiast funkcja `get_coord_value()` odpowiednio konwertuje każdą stronę działania:

```python
def get_coord_value( raw_value: str, axis: str ) -> float:
	if raw_value.find( '%' ) == -1: # 1
		return float( raw_value ) # 2

	raw_number = float( raw_value.replace( '%', '' ) ) # 3

	return float( ( raw_number / 100 ) * ( SYMBOL_WIDTH if axis == 'x' else SYMBOL_HEIGHT ) ) # 4
```

Jeśli przekazany ciąg nie zawiera znaku `%` (1), wówczas konwertujemy go na liczbę zmiennoprzecinkową i zwracamy (2). W  innym wypadku usuwamy z liczby znak procenta i konwertujemy ją na liczbę zmiennoprzecinkową (3). Następnie konwertujemy procenty na odpowiednią wartość (4):

1. dzielimy `raw_number` przez 100,
2. mnożymy to przez szerokość symbolu, jeśli to koordynat dla osi X, lub przez wysokość symbolu, jeśli to koordynat dla osi Y.

Tak przekonwertowaną wartość zwracamy.

Jeśli teraz przetestujemy nasz skrypt, to otrzymamy działające symbole 🎉! Tylko że nie do końca…

{% figure "../../images/kosmiczna-zabawa/komponent-problem.png" "Zniekształcone, nachodzące na siebie linie, tworzące bliżej nieokreślone kształty." "Comandeer, Sztuka abstrakcyjna, 2025, kodem na monitorze" %}

Po raz kolejny zagłębiłem się w kod Cosmic UI, szukając przyczyny takiego zachowania. Intuicja podpowiadała, że coś jest nie tak z obliczeniami – ale empiryczne sprawdzenie ich dla kilku losowych komponentów pokazywało, że wszystko jest liczone poprawnie. W końcu zauważyłem pewną rzecz w komponencie `dialog`. A dokładniej dwie ścieżki obok siebie w JSON-ie:

```json
[
	["L", "100% - 7", "100% - 33.33333333333332%"],
	["L", "100% - 7", "100% - 40"]
]
```

Wówczas doszło do mnie, na czym polega problem. Mój skrypt jak najbardziej liczył poprawnie! Problem polegał na tym, że ustawiłem wysokość i szerokość symboli na 100. Przy tych wartościach pierwsza ścieżka na osi Y miała koordynat ok. 66.7, natomiast druga – 60. Niemniej żaden komponent Cosmic UI nigdy nie miał takich małych rozmiarów! Jeśli przyjmiemy, że najmniejszy rozmiar to 150×150 (a w rzeczywistości praktycznie zawsze był większy), to wówczas drugi z tych koordynatów będzie _zawsze_ większy. Zmieniłem zatem wielkość symbolu na 640×480 i… zaczęło działać.

{% figure "../../images/kosmiczna-zabawa/komponent-final.png" "Poprawnie wygenerowany komponent, przypominający kształtem i kolorem element interfejsu komputera z powieści sci-fi." "Comandeer, Komponent sci-fi, 2025, kodem na monitorze" %}

### Zapisanie SVG

Została zatem ostatnia część do zrobienia: zapisanie tego w postaci sprite'a SVG.

```python
def create_svg( symbols: list[str] ) -> str: # 1
	return f'<svg xmlns="http://www.w3.org/2000/svg">{''.join( symbols )}</svg>' # 3

def save_svg( svg_content: str ) -> None: # 2
	svg_path = abspath( './cosmic.svg' ) # 5

	with open( svg_path, 'w', encoding = 'utf-8' ) as file: # 4
		file.write( svg_content ) # 6

def main():
	args = parse_arguments()
	component_paths = get_component_paths( args.dir )
	symbols = parse_components( component_paths )
	svg_content = create_svg( symbols ) # 7
	save_svg( svg_content ) # 8
```

Tworzymy dwie nowe funkcje – `create_svg()` (1), która przyjmuje listę wygenerowanych symboli i zwraca SVG jako ciąg tekstowy, oraz `save_svg()` (2), która przyjmuje ten ciąg i zapisuje go do pliku. Funkcja `create_svg()` łączy wszystkie symbole w jeden ciąg tekstowy, a następnie wkłada go do środka znacznika `svg` i zwraca tak stworzony ciąg (3). Z kolei funkcja `save_svg()` otwiera plik SVG (4) pod ścieżką `./cosmic.svg` (5) i zapisuje do niego ciąg tekstowy z kodem SVG (6). Na sam koniec dorzucamy obydwie funkcje do funkcji `main()` (7, 8).

Tym sposobem udało nam się wyciągnąć wszystkie kształty z Cosmic UI i wygenerować sprite'a SVG. Możemy być z siebie dumni! [Całość skryptu](https://gist.github.com/Comandeer/1c5ce5d7ca2143ba17b64c635f7f57e8) (z lekkimi zmianami względem tego postu) jest na Giście.

## Smutny koniec

Gdy już się udało to wszystko zrobić, [doszło do mnie, że to bez sensu](https://www.youtube.com/watch?v=-nOkR7HjyO4)… Bo z uwagi na to, jak są generowane te ramki (jako jeden duży kształt w SVG), nie są one responsywne. A to wyklucza je z większości zastosowań, jakie mógłbym dla nich mieć.

Zrobienie tak stylizowanego interfejsu w sposób w pełni responsywny jest trudne. Nie wiem, jakbym podszedł do takiego problemu. To, co mi chodzi po głowie, to podzielenie tych ramek na części, np.:

1. część dla lewego górnego rogu,
2. część dla prawego górnego rogu,
3. część dla lewego dolnego rogu,
4. część dla prawego dolnego rogu
5. powtarzalne obramowanie dla góry,
6. powtarzalne obramowanie dla dołu,
7. powtarzalne obramowanie dla lewej strony,
8. powtarzalne obramowanie dla prawej strony,
9. powtarzalny wzór tła dla środka kontenera z treścią.

Dzięki powtarzalnym obramowaniom i tłu możliwe byłoby rozciąganie faktycznej treści teoretycznie w nieskończoność – zarówno w poziomie, jak i pionie. Jedynie same rogi pozostawały zawsze takie same.

Ale Cosmic UI, niestety, nie oferuje takiego rozwiązania. No cóż, na osłodę łez zostaje przynajmniej [font Orbitron](https://fonts.google.com/specimen/Orbitron), który w Cosmic UI dopełniał całości iluzji, a którego użycie raczej będzie mnie kosztowało zdecydowanie mniej pracy.
