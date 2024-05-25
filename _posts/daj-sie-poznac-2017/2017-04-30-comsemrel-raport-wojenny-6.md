---
layout: post
title:  "ComSemRel – raport wojenny #6"
author: Comandeer
date: 2017-04-30T21:00:00+0100
tags: 
    - daj-sie-poznac-2017
comments: true
permalink: /comsemrel-raport-wojenny-6.html
redirect_from:
    - /daj-sie-poznac-2017/2017/04/30/comsemrel-raport-wojenny-6.html
---

Liczycie na sensowny update, co? A tu nic takiego – ostatni tydzień minął mi na _posiadaniu życia_, co oczywiście przełożyło się na fakt, że nic sensownego w kodzie nie rzeźbiłem. Jak ostatnio wspominałem, równolegle do bunldera z obsługą TS-a rozwijam [podstawowy renderer](https://github.com/ComSemRel/renderer). I tym się właśnie zajmę w najbliższych dniach (bo wolne). Być może jutro ComSemRel nabędzie zdolności ~~zwyzywania~~ powitania użytkownika. A przynajmniej taką mam nadzieję.

Trochę głupio, że takie krótkie posty ostatnio, więc mały bonus. Jak już wspominałem, stworzyłem specjalną paczkę ([`@comsemrel/interfaces`](https://www.npmjs.com/package/@comsemrel/interfaces)), w której umieszczone są wszystkie interfejsy wykorzystywane przez różne pakiety wchodzące w skład ComSemRel. W tejże paczce znajduje się także interfejs `IRenderer`, składający się z dwóch innych interfejsów – `IInput` i `IOutput`. Wprowadziłem ten podział, gdyż IMO lepiej oddzielić wszystkie metody pobierania danych od użytkownika od wszystkich metod wyświetlania danych użytkownikowi. A renderer to nic innego jak mały programik, który pobiera i wyświetla – stąd taka a nie inna decyzja.

Serio nie mam co pisać… I nie, nie jest mi z tego powodu wstyd – i tak rozwój ComSemRela idzie lepiej niż przypuszczałem. Być może nawet zacznie działać do końca maja, jeśli choć ciut się zepnę do kupy.
