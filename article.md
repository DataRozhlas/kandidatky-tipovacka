title: "Dolaďte formu na volby: vyzkoušejte si hlasování ve své obci nanečisto. Trefíte správný výsledek?"
<<<<<<< HEAD
perex: "V simulátoru od datových novinářů Českého rozhlasu si můžete vyzkoušet, jak se volba projeví na zisku křesel. Poradíme taky, jak na křížkování kandidátů."
published: "4. října 2018"
coverimg: https://www.irozhlas.cz/sites/default/files/styles/zpravy_snowfall/public/uploader/volby2_181003-225854_miz.png?itok=ms9Xmckr
coverimg_note: "Volby. Foto Martin Pařízek, ČRo."
=======
perex: "V našem simulátoru si můžete vyzkoušet, jak se volba projeví na zisku křesel. Poradíme také, jak na křížkování kandidátů."
published: "21. dubna 2018"
coverimg: https://www.irozhlas.cz/sites/default/files/styles/zpravy_snowfall/public/uploader/komunalni-volby_1802_180823-084533_jab.png?itok=6XCgU6KR
coverimg_note: ""
>>>>>>> korektury
styles: ["//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css"]
libraries: [jquery, datatables, "https://code.jquery.com/ui/1.12.1/jquery-ui.js", "https://cdn.datatables.net/plug-ins/1.10.19/sorting/diacritics-sort.js", highcharts]
options: [] #wide, noheader (, nopic)
---

Obecní volby jsou podle politologů v Česku ty vůbec nejsložitější. Jedním z důvodů je množství stran, hnutí a nezávislých kandidátů, kteří se obci od obce liší. Obyvatelé měst navíc volí dvakrát: kromě magistrátu také na radnici městské části. Proto nejprve přinášíme přehled, kdo kandiduje zrovna u vás.

Je to prosté, stačí do <span style="background-color: #2171b5;color: white;display: inline;border-radius: 5px;">modrého</span> okna začít psát název své obce. U pomalejšího připojení k internetu může načtení kandidátky chvíli trvat.

<wide>
<div id="container">
	<div id="obec">
		<h3>Obec</h3>
		<form onsubmit="return false">
			<div class="autocomplete" style="width:300px;">
				<input id="vyberObce" name="vyberObce" type="text" placeholder="Napište jméno obce">
			</div>
		</form>
	</div>
	<div id="strany"><table id="tabulkaStran" class="display" style="width:100%"></table></div>
	<div id="kandidati"><table id="tabulkaKandidatu" class="display" style="width:100%"></table></div>
	<wide><div id="vysledek" style="width:100%"></div></wide>
	<div id="zpet"></div>
</div>
</wide>

_Zdroj dat: [volby.cz](https://volby.cz/pls/kv2018/kv?xjazyk=CZ&xid=1)_

_U Prahy 9 a obce Lišov simulace nepočítá s volebními obvody, celou kandidátku kvůli zjednodušení výpočtu považuje za jediný volební obvod._

Zároveň si můžete tipnout výsledek voleb a sledovat, jak se zisk hlasů promítne do počtu mandátů pro jednotlivé strany. Přepočet samozřejmě není jedna k jedné: mandátů není stejně jako hlasů, proto je mezi oběma čísly rozdíl. Jak velký, ukazuje graf pod kandidátkou.

Mandáty obvykle připadnou pouze stranám, které získají alespoň pět procent hlasů. Ty zbylé se z přidělování křesel vyřadí. Systém pro obecní volby nicméně do jisté míry fandí slabším: pokud překoná pětiprocentní práh pouze jedna strana, hranice postupně klesne až na jedno procento.

I to si můžete v simulátoru vyzkoušet: dejte jedné straně 96 a více procent, zbytek jiným subjektům a sledujte, kdo získá mandáty. Podobnou výjimkou je snížení volebního prahu pro strany, které nenaplnily kandidátku.

<right><h3>Interaktivní kandidátky</h3>Konkrétní kandidáty ve své obci si můžete prohlédnout na <a href = "https://www.irozhlas.cz/volby/obecni-volby-2018-politika-kandidatky-demografie_1808231045_jab">interaktivních kandidátkách iRozhlasu</a>.</right>

Pro přepočet hlasů na mandáty se používá d'Hondtova metoda, která mírně nahrává velkým stranám. Jak přesně výpočet funguje, [popisuje například encyklopedie Wikipedia](https://cs.wikipedia.org/wiki/D%27Hondtova_metoda). Ve větších zastupitelstvech je vliv metody poměrně malý, u těch menších nicméně nahrává úspěšným stranám – nepoměr mezi podílem hlasů a mandátů řeší tím, že „přebytečné“ mandáty daruje těm, které už nějaký mandát mají. Podobný efekt má d'Hondtova metoda také při volbách do Poslanecké sněmovny, kde „ohýbá“ výsledky hlavně v malých krajích.

Roli d'Hondtovy metody v kombinaci s volebním prahem jsme ilustrovali na volbách do Poslanecké sněmovny v roce 2017. Simulaci si můžete [vyzkoušet v samostatném článku](https://www.irozhlas.cz/volby/svobodni-a-zeleni-ve-snemovne-vyzkousejte-si-co-udela-posun-petiprocentni_1710240615_zlo).

## Zrádné křížkování

Nejčastěji kritizované je u obecních voleb hlasování pro jednotlivé členy kandidátky, tedy křížkování. V simulátoru hlasy pro jednotlivé členy nenajdete; pokud si ale chcete prohlédnout všechny kandidáty ve své obci, prohlédněte si naše [interaktivní kandidátky](https://www.irozhlas.cz/volby/obecni-volby-2018-politika-kandidatky-demografie_1808231045_jab). Zjistíte z nich například to, za koho kandidát nastoupil před čtyřmi lety.

Volič tak může dát hlas jedné kandidátní listině a konkrétním kandidátům z konkurenčních stran; těch může být tolik jako všech mandátů v obci. Takzvané _panašování_ tedy umožňuje volit napříč stranami. Křížky pro jednu stranu se odečtou od listiny, které dal kandidát hlavní hlas.

Pokud má ovšem kandidát přeskočit lépe postavené kolegy, musí získat o deset procent hlasů víc, než je průměrný počet hlasů na kandidáta ze stejné listiny. To je hlavně ve velkých městech poměrně obtížné. Příklady, kde se přepočet chová zrádně, ukazují na příkladu [politologové Otto Eibl a Miloš Gregor](http://polit.fss.muni.cz/volebni-system-ktery-neni-takovy-jaky-se-zda/) nebo [Deník veřejné správy](http://www.dvs.cz/clanek.asp?id=6670736).

Detailní popis volebního systému do obecních zastupitelstev včetně výjimek [najdete na webu ČSÚ](https://www.czso.cz/documents/10180/20536900/mandaty.pdf/efc81993-c19e-4fd1-9ce1-2f1dfbeae465?version=1.0).

Každý volič tak může dát hlas jedné kandidátní listině a konkrétním kandidátům z konkurenčních stran; těch může být tolik, jako všech mandátů v obci. Takzvané _panašování_ tedy umožňuje volit napříč stranami. Křížky pro jednu stranu se odečtou od listiny, které dal kandidát hlavní hlas.

Pokud má ovšem kandidát přeskočit lépe postavené kolegy, musí získat o deset procent hlasů víc, než je průměrný počet hlasů na kandidáta ze stejné listiny. To je hlavně ve velkých městech poměrně obtížné. Situace, kdy se přepočet chová zrádně, ukazují na příkladu [politologové Otto Eibl a Miloš Gregor](http://polit.fss.muni.cz/volebni-system-ktery-neni-takovy-jaky-se-zda/) nebo [Deník veřejné správy](http://www.dvs.cz/clanek.asp?id=6670736).

Detailní popis volebního systému do obecních zastupitelstev včetně výjimek [najdete na webu ČSÚ](https://www.czso.cz/documents/10180/20536900/mandaty.pdf/efc81993-c19e-4fd1-9ce1-2f1dfbeae465?version=1.0).