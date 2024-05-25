---
layout: post
title:  "#hot16challenge2"
author: Comandeer
date: 2020-06-06T17:53:00+0200
categories: na-luzie
comments: true
permalink: /hot16challenge2.html
---

[Zostałem nominowany przez pewnego łysola](https://youtu.be/R3WiHx-XYHM?t=186) do #hot16challenge2/#code16challenge. No więc ten…

## Zbiórka

Zacznijmy od rzeczy najważniejszej: cała akcja jest organizowana, by zebrać fundusze na walkę z koronawirusem. Więc jeśli możesz się dorzucić, to [zbiórka jest na SiePomaga.pl](https://www.siepomaga.pl/programista15k-debuguje). Z góry dzięki!

## Comandeer rapuje

Tak w sumie to nie, ale stwierdziłem, że to doskonały pretekst, by odkurzyć mój nieco zapomniany warsztat poetycki i napisać szesnastowersowy trzynastozgłoskowiec z rymami okalającymi. Nie spodziewajcie się niczego wielkiego, bo nie poeciłem tak po prawdzie od lat i już mocno zardzewiał mi mózg. No ale czego się nie robi w słusznej sprawie… Zatem – zapraszam i przepraszam:

<div id="wiersz" style="text-align: center;">
	<p>Patrzaj, druhu, jak piękna Sieć stronice swoje<br>
	roztwiera przed wiedzy żądnymi badaczami;<br>
	chociaż mogłaby wszakże także i przed nami<br>
	rozwinąć prastare, święte mądrości zwoje!</p>
	<p>Jakoby odwieczna, milcząca biblioteka —<br>
	zamknięta w cichym, kryształowym krzemieniu,<br>
	a trwalsza niż pomnik wykuty w wapieniu —<br>
	cierpliwie na cię, żałosny człowiecze, czeka.</p>
	<p>Wąska droga do jej mądrości zdroju wiedzie,<br>
	przez zdradliwe marginaliów cierniowe haszcze,<br>
	roztwarte jak bestii nienasyconej paszcze.<br>
	Poślij więc z rozwagą rozum swój na przedzie!</p>
	<p>Pomnij o braciach, co w drodze tej polegli…<br>
	Co ich na manowce zawiedli źli demoni;<br>
	zważ, byś uniknął losu takiego jak oni.<br>
	"Idź wyprostowany" — jak mędrcy ongiś rzekli.</p>
</div>

Ok, to tyle…

Że co? Że niby mam to zaśpiewać? No skoro tak bardzo nalegacie, to polecam puścić sobie [odpowiedni podkład muzyczny](https://www.youtube.com/watch?v=VboS3zloKb8) i nacisnąć magiczny przycisk poniżej:

<button id="magic">Magiczny przycisk</button>

<script>document.querySelector( '#magic' ).addEventListener( 'click', () => {
	const paragraphs = [ ...document.querySelectorAll( '#wiersz p' ) ];
	const text = paragraphs.map( ( paragraph ) => paragraph.innerText );
	const speechUtterance = new SpeechSynthesisUtterance();
	speechUtterance.lang = 'pl';
	speechSynthesis.cancel();
	function speak( paragraphs ) {
		const paragraph = paragraphs.shift();
		if ( paragraph ) {
			speechUtterance.text = paragraph;
			speechSynthesis.speak( speechUtterance );
			speechUtterance.onend = () => speak( paragraphs );
		} else { speechUtterance.onend = null;}
	};
	speak( text );
} );</script>

Mam nadzieję, że jesteście ukontentowani!

PS JS-owy kod obsługi przycisku ma 16 linijek, jakby kogoś to interesowało.

## Nominacje

Wypadałoby kogoś nominować… Ale że już trzy osoby ze świata polskiego webdevu z czterech które znam, zostały nominowane, to zostaje mi jedynie nominować Wojtka z [websightly](https://websightly.net/) i [koduje](https://www.youtube.com/koduje).
