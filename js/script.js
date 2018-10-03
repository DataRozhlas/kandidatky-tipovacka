// JS soubory ve složce /styles/ se do výsledného článku zakompilují automaticky

// přepočet mandátů podle: https://www.czso.cz/documents/10180/20536900/mandaty.pdf/efc81993-c19e-4fd1-9ce1-2f1dfbeae465?version=1.0

// při kliknutí do počtu hlasů se znovu načítá
// výběr okresních měst
// výpočet na Brně-sever: MZH 70, něco 20, něco 10, nevychází mandáty celkem


$.ajax({
  type: "GET",
  url: "https://data.irozhlas.cz/volby-obecni-2018/data/kandidatky/app/obce/nazvyobci.csv",
  dataType: "text",
  success: function(data) {hledatko($.csv.toObjects(data));}
});

function hledatko(data) {
  var nazvyObci = data.sort(function(a, b) {
    if(a.NAZEVFULL < b.NAZEVFULL) return -1;
    if(a.NAZEVFULL > b.NAZEVFULL) return 1;
    return 0;
  });

	var seznamObci = nazvyObci.map(function(d) {
		return d['NAZEVFULL'];
	});

  var obceHledatko = []
  seznamObci.forEach(function(obec){obceHledatko.push([obec, obec.split(" (")[0]]);});

  $('#vyberObce').autocomplete({
    delay: 500,
    source: function(request, response){
      var result = obceHledatko.filter(function(obec) {
        return obec[1].toLowerCase().includes(request.term.toLowerCase());
      });
      response(result.map(function(obec){return obec[0];}));
    },
    select: function(e) {
      document.getElementById("strany").innerHTML = 'Načítám data...'
      setTimeout(function() {
        document.getElementById("strany").innerHTML = 'Načítám data...'
        var zvolenaObec = document.getElementById("vyberObce").value;
        var index = seznamObci.indexOf(zvolenaObec);
        var idObce = nazvyObci[index]['KODZASTUP'];
        ukazStrany(zvolenaObec, idObce);
      }, 250);
    }
  });

	$('#vyberObce').on('change', function () {
		setTimeout(function() {
      document.getElementById("strany").innerHTML = 'Načítám data...'
			var zvolenaObec = document.getElementById("vyberObce").value;
			var index = seznamObci.indexOf(zvolenaObec);
			var idObce = nazvyObci[index]['KODZASTUP'];
			ukazStrany(zvolenaObec, idObce);
		}, 250);
	});
};

function ukazStrany(zvolenaObec, idObce) {
  $.ajax({
    type: "GET",
    url: "https://data.irozhlas.cz/volby-obecni-2018/data/kandidatky/tip/" + idObce + ".csv",
    dataType: "text",
    success: function(data) {pokracuj($.csv.toObjects(data));}
  });

	function pokracuj(strany) {
    var idStran = strany.map(function(d) {
      return d['StranaNr'];
    });

    var stranyBezId = strany.map(function(d) {
      delete(d['StranaNr']);
      return (d);
    });

    for(i = 0; i < stranyBezId.length; i++) {
      stranyBezId[i]['Hlasy (%)'] = 0
      stranyBezId[i]['Mandáty'] = 0;
    }

    var html = '<h3>Kandidující strany</h3>'
    html += '<table id="tabulkaStran" class="display" style="width:100%"></table>'
    html += '<div id="zpetStrany"><button type="button" id="unter">Pro rozdělení mandátů je potřeba rozdat ještě 100 % hlasů</button></div>'

    document.getElementById("strany").innerHTML = html;

		poskladejTabulkuStran(stranyBezId, idStran, idObce);

    $(function() {
      $('#tabulkaStran').DataTable({
          columnDefs: [
            { targets: 0, type: 'diacritics-neutralise' },
            { targets: [3, 4], orderable: false}
          ],
          "order": [[ 0, "asc" ]],
          responsive: {
              details: {
                  display: $.fn.dataTable.Responsive.display.childRowImmediate,
                  type: ''
              }
          },
          "ordering": true,
          "paging": false,
          "bInfo": false,
          "language": {
              "url": "https://interaktivni.rozhlas.cz/tools/datatables/Czech.json"
          }
      });
    });
	};
};

function prepocitejProcenta() {
  var rozdelenoHlasu = 0;

  $(".vysledek").each(function() {
    var vysledek = parseInt(this.value);
    if (isNaN(vysledek)) {
      vysledek = 0;
    }
    rozdelenoHlasu = rozdelenoHlasu + vysledek;
  })

  if (rozdelenoHlasu == 100) {
    var html = '<button type="button" id="klikaci" onclick ="spocitejMandaty()">Spočítat mandáty</button></div>'
  } else if (rozdelenoHlasu > 100) {
    var html = '<button type="button" id="uber">Pro rozdělení mandátů je potřeba rozdat o ' + (rozdelenoHlasu - 100) + ' % hlasů méně</button></div>'
  } else {
    var html = '<button type="button" id="unter">Pro rozdělení mandátů je potřeba rozdat ještě ' + (100 - rozdelenoHlasu) + ' % hlasů</button></div>'
  }

  document.getElementById("zpetStrany").innerHTML = html;

}

function spocitejMandaty() {
  var pocetStran = $(".nazevStrany").length
  var strany = [];
  var pocetKand = [];
  var pocetMand;
  var procenta = [];
  var falesnyPrah = [];
  var prah = 5;
  var prepocet = new Array(pocetStran);
  var mandaty = [];
  var mobil = false;

  // vstupy pro výpočet
  $(".nazevStrany").each(function(){strany.push($(this).text())})
  $(".pocetKand").each(function(){pocetKand.push($(this).text())});

  pocetMand = parseInt(pocetKand[0].substr(pocetKand[0].indexOf('/') + 1, pocetKand[0].length + 1));
  $(".vysledek").each(function(){procenta.push($(this).val())});

  // mobilní hack pt. 1
  if (procenta.length === pocetStran*2) {
    mobil = true;
    procenta = procenta.filter(function(procento, index) {return index % 2});
  }

  for(i = 0; i < pocetStran; i++) {
    mandaty.push(0);
    pocetKand[i] = parseInt(pocetKand[i].substr(0, pocetKand[i].indexOf('/')));
  }

  // výpočet falešného prahu (bod 3); u obcí, kde může být o třetinu víc kandidátů než mandátů, se nadbyteční kandidáti nepočítají
  for(i = 0; i < pocetStran; i++) {
    var pocetKandProFalesnyPrah = parseInt(pocetKand[i]);
    if(pocetKandProFalesnyPrah > pocetMand) {
      pocetKandProFalesnyPrah = pocetMand;
    }
    falesnyPrah[i] = parseInt(procenta[i]) * parseInt(pocetMand) / pocetKandProFalesnyPrah;
  }

  // snižování kvóra (bod 6)
  for(i = 1; i < 5; i++) {

    var pocetStranNadPrahem = 0;
    var pocetKandidatuNadPrahem = 0;

    for(j = 0; j < pocetStran; j++) {

      if(falesnyPrah[j] > prah) {
        pocetStranNadPrahem++;
        pocetKandidatuNadPrahem = pocetKandidatuNadPrahem + pocetKand[j];
      }

    }

    if(pocetStranNadPrahem < 2 || pocetKandidatuNadPrahem < pocetMand/2 || pocetKandidatuNadPrahem < 5) {
      prah--;
    }

  }

  // u jediné strany se kvórum nepočítá (bod 8)
  if(pocetStran == 1) {
    prah = 0;
  }

  // přepočet podle d'Hondta
  for(i = 0; i < pocetStran; i++) {
    prepocet[i] = new Array(pocetMand);
  }

  for(i = 0; i < pocetStran; i++) {
    // j je dělitel
    for(j = 1; j < pocetMand + 1; j++) {
      if(falesnyPrah[i] > prah) {
        prepocet[i][j-1] = procenta[i] * pocetKand[i] / j;
      } else {
        prepocet[i][j-1] = 0;
      }
    }
  }

  // přidělení mandátů
  var obsazeno = 0;
  var max = 101;

  while ( (obsazeno < pocetMand) & (max > 0) ) {

    // nalezení nejvyšší hodnoty
    var maxRow = prepocet.map(function(row) { return Math.max.apply(Math, row); });
    max = Math.max.apply(null, maxRow);

    // vymazání nejvyšší hodnoty a přidělení mandátu
    for(i = 0; i < pocetStran; i++) {
      for(j = 0; j < pocetMand; j++) {
        if( (prepocet[i][j] == max) & (max > 0) ) {
          prepocet[i][j] = 0;
          max = 101;
          if(mandaty[i] < pocetKand[i]) {
            mandaty[i] = parseInt(mandaty[i]) + 1;
            obsazeno++;
          }
        }
      }
    }
  }

  // mobilni hack pt. 2
  if (!mobil) {
    for(i = 0; i < pocetStran; i++) {
      document.getElementsByClassName("mandaty")[i].textContent = mandaty[i];
    }
  } else {
        for(i = 0; i < pocetStran; i++) {
        document.getElementsByClassName("mandaty")[(i*2)+1].textContent = mandaty[i];
    }
  }

}

function poskladejTabulkuStran(seznamStran, idStran, idObce) {
  var columns = poskladejHlavickuStran(seznamStran);

  $('#tabulkaStran').append('<tbody>');

  for (var i = 0; i < seznamStran.length; i++) {
    var row$ = $('<tr/>');

    for (var colIndex = 0; colIndex < columns.length; colIndex++) {
      var cellValue = seznamStran[i][columns[colIndex]];
      var nazevStrany = '\'' + seznamStran[i]['Strana'] + '\'';

      if (colIndex == 0) {
        cellValue = '<div class="nazevStrany">' + cellValue + '</div>';
      }

      if (colIndex == 1) {
        cellValue = '<div class="pocetKand">' + cellValue + '</div>';
      }

      if (colIndex == columns.length - 1) {
        cellValue = '<div class="mandaty">' + cellValue + '</div>';
      }

      if (colIndex == columns.length - 2) {
        cellValue = '<form onsubmit="return false"><div class="autocomplete percent"><input oninput="prepocitejProcenta()" class="vysledek" id="vysledekStrany" type="number" min="0" max="100" step="1" value="0"></div></form>'
      }

      if (cellValue == null) cellValue = "";
      row$.append($('<td/>').html(cellValue));

    }

    $('#tabulkaStran').append(row$);

  }

};

function poskladejHlavickuStran(seznamStran) {
  var columnSet = [];

  $('#tabulkaStran').append('<thead id="seznamStranHlavicka">');
  var headerTr$ = $('<tr>');

  for (var i = 0; i < seznamStran.length; i++) {
    var rowHash = seznamStran[i];

    for (var key in rowHash) {

      if ($.inArray(key, columnSet) == -1) {
        columnSet.push(key);
        headerTr$.append($('<th/>').html(key));
      }

    }

  }

  $('#seznamStranHlavicka').append(headerTr$);

  return columnSet;

};