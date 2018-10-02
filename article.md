title: "XXX"
perex: "XXX"
published: "21. dubna 2018"
coverimg: https://www.irozhlas.cz/sites/default/files/styles/zpravy_snowfall/public/uploader/komunalni-volby_1802_180823-084533_jab.png?itok=6XCgU6KR
coverimg_note: ""
styles: ["//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css"]
libraries: [jquery, "https://d3js.org/d3.v3.min.js", datatables, "https://code.jquery.com/ui/1.12.1/jquery-ui.js", "https://cdn.datatables.net/plug-ins/1.10.19/sorting/diacritics-sort.js"]
options: [noheader, nopic] #wide, noheader (, nopic)
---

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
	<div id="strany">
		<table id="tabulkaStran" class="display" style="width:100%"></table>
	</div>
	<div id="kandidati">
		<table id="tabulkaKandidatu" class="display" style="width:100%"></table>
	</div>
	<div id="vysledek">
	</div>
</div>
</wide>

_Zdroj dat: [volby.cz](https://volby.cz/pls/kv2018/kv?xjazyk=CZ&xid=1)_