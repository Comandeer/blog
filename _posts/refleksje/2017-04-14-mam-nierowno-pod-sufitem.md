---
layout: post
title:  "Mam nierówno pod sufitem"
description: "Czyli czemu wkurzam się na różne kursy w Sieci."
author: Comandeer
date: 2017-04-14T12:00:00+0100
tags:
    - refleksje
    - daj-sie-poznac-2017
comments: true
permalink: /mam-nierowno-pod-sufitem.html
redirect_from:
    - /refleksje/daj-sie-poznac-2017/2017/04/14/mam-nierowno-pod-sufitem.html
---

Z ciekawości przeglądnąłem sobie ostatnio statystyki WebKrytyka (by sprawdzić, czy nowy [agregator treści](http://www.polskifrontend.pl/) przyniósł trochę ruchu) i zauważyłem, że ostatnio wpadło mi trochę ruchu z [Wykopu](http://www.wykop.pl/). Poszukałem skąd dokładnie pochodzi ten przypływ użytkowników i znalazłem [wątek dotyczący kursów Mirosława Zelenta](http://www.wykop.pl/wpis/23156181/). Cóż, od pewnych rzeczy – jak widać – nie sposób się uwolnić.<!--more-->

Nigdy nie sądziłem, że napisanie krytyki tych kursów (zresztą podobnie jak artykułu o Angularze) zapewni mi stały napływ ruchu przez najbliższe _lata_. Wciąż najwięcej odwiedzających mam właśnie z powodu tych artykułów. I za każdym razem natykam się na pewnego rodzaju ścianę. I zawsze jest to ta sama ściana: "te kursy są dobre, bo dobrze wprowadzają do tematu". [Nie inaczej było i w tej dyskusji](http://www.wykop.pl/wpis/23156181/#comment-83470343):

{% capture src %}{{ '/assets/images/wykop-koment.png' | absolute_url }}{% endcapture %}
{% include 'figure' alt="" src=src %}

>jejku, ten komentarz to jakaś totalna porażka. Jak można przyczepiać się do wszystkiego. Jest oczywistym, że poradniki Zelenta, to nie jakieś sprawdzone wzorce projektowe gotowe do wykorzystania, tylko coś co ma wprowadzić nas w dane zagadnienie (w tym przypadku front-end) i przy tym nie zniechęcić na starcie.
>Mam wrażenie, że wszyscy krytycy mają nie równo pod sufitem. Elo.

Pomijam już fakt, że po raz kolejny okazuję się wariatem, który ma "nierówno pod sufitem", bo to akurat norma w tych _dyskusjach_ (nie zliczę, ile pod rzeczonymi artykułami usunąłem tego typu komentarzy…). Bardziej mnie ciekawi to niesamowite przeświadczenie, że jeśli coś jest dla początkujących, to może być całkowicie bylejakie, szerzące dezinformację i najzwyczajniej w świecie szkodliwe. A zjawisko dziwnej pobłażliwości dla tego typu kursów tylko tę szkodliwość potęguje.

Tak, powtórzę to raz jeszcze: **BEZREFLEKSYJNE PRZYZWOLENIE NA NIEŚCISŁOŚCI MERYTORYCZNE W KURSACH PRZEZNACZONYCH DLA POCZĄTKUJĄCYCH JEST SZKODLIWE DLA SIECI!!!**

Przykładów tej szkodliwości za długo szukać nie trzeba. Wystarczy przyjrzeć się [4. odcinkowi kursu HTML](http://miroslawzelent.pl/kurs-html/listy-przewijanie-strony/), poświęconemu automatycznemu przewijaniu strony. Znajduje się w nim taki kod JS:

```javascript
jQuery(function($)
		{
			//zresetuj scrolla
			$.scrollTo(0);

			$('#link1').click(function() { $.scrollTo($('#budowacrt'), 500); });
			$('#link2').click(function() { $.scrollTo($('#zasadacrt'), 500); });
			$('#link3').click(function() { $.scrollTo($('#maskicrt'), 500); });
			$('#link4').click(function() { $.scrollTo($('#wadyzaletycrt'), 500); });
			$('#link5').click(function() { $.scrollTo($('#parametrycrt'), 500); });
			$('#link6').click(function() { $.scrollTo($('#budowalcd'), 500); });
			$('#link7').click(function() { $.scrollTo($('#zasadalcd'), 500); });
			$('#link8').click(function() { $.scrollTo($('#matrycelcd'), 500); });
			$('#link9').click(function() { $.scrollTo($('#wadyzaletylcd'), 500); });
			$('#link10').click(function() { $.scrollTo($('#parametrylcd'), 500); });
			$('#link11').click(function() { $.scrollTo($('#dsub'), 500); });
			$('#link12').click(function() { $.scrollTo($('#dvi'), 500); });
			$('#link13').click(function() { $.scrollTo($('#hdmi'), 500); });
			$('#link14').click(function() { $.scrollTo($('#przyszlosc'), 500); });
			$('#link15').click(function() { $.scrollTo($('#zrodla'), 500); });

			$('.scrollup').click(function() { $.scrollTo($('body'), 1000); });
		}
		);
```

Ten skrypt jest wręcz zbrodnią – zarówno jeśli chodzi o UX strony, jak i o sposób pisania kodu. Pominę już fakt, że wszystkie te wywołania `$.fn.click` można było zastąpić przez:

```javascript
$( '#spis a' ).click( function( evt ) {
  $.scrollTo( $( evt.target.getAttribute( 'href' ) ), 500 );
} );
```

Wystarczyło zrobić _poprawne_ linki w menu. Gorsze są 2 pierwsze linijki:

```javascript
//zresetuj scrolla
$.scrollTo(0);
```

Te dwie linijki **ZABIJAJĄ** jakikolwiek sens istnienia przycisku "Wstecz" w przeglądarce, wymuszając przy każdym wczytaniu czy odświeżeniu strony przewinięcie jej na samą górę. Wyobraźmy sobie sytuację, że przeglądamy listę tysiąca najlepszych sosów w historii i zainteresował nas jakiś na pozycji 778. Klikamy na niego i w tej samej karcie przeglądarki wczytuje nam się strona z tym sosem. Po zapoznaniu się z nim klikamy "Wstecz", by powrócić do długiej listy i… zostajemy przeniesieni na samą górę strony. Na miejscu webmastera wynająłbym ochronę, bo myślę, że nie byłbym jedynym, który miałby ochotę mu połamać wszystkie palce po kolei.

I takie praktyki, stanowiące książkowy antyprzykład tworzenia zarówno łatwego w utrzymaniu kodu jak i przyjaznej użytkownikowi strony, są propagowane w polskiej Sieci. Co więcej: istnieje ciche przyzwolenie na to, a każdego, kto się ośmieli to skrytykować, wyzywa się od wariatów i męskiego narządu płciowego. Więc się pytam: czemu jako społeczność webdevowa nie tylko po cichu przyzwalamy na patologię, lecz wręcz oczerniamy tych, którzy tę patologię próbują zwalczać _merytoryczną_ krytyką?

Powtórzę to, co powtarzałem wielokrotnie: nie mam nic do sposobu prowadzenia kursów Mirosława Zelenta. Ba, sam przyznałem w krytyce, że miło się go słucha (więc nie, panie stranger13, nie przyczepiłem się do wszystkiego)… tylko, że tego typu dwie linijki sprawiają, że nie mogę takich kursów polecić. Co więcej, jako siedzący w tym nieco, odczuwam moralny obowiązek piętnowania tego typu praktyk.

I nie, powtarzanie jak mantry argumentu, że "początkujący sięgną do innych źródeł w celu weryfikacji" nie sprawi, że ta bujda stanie się prawdą. Nie sięgają i efekty tego doskonale widać po stronach prezentowanych np. [na grupach dla początkujących](https://www.facebook.com/groups/742940452405327/) czy [forach dyskusyjnych](https://forum.pasja-informatyki.pl/236206/blad-nie-dziala-scroll).

Może i mam nierówno pod sufitem, ale na przyzwolenie na gwałcenie dobrych praktyk w kursach nigdy się nie zgodzę.
