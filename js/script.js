// JS soubory ve složce /styles/ se do výsledného článku zakompilují automaticky

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

    document.getElementById("obec").style["padding-bottom"] = "30px";

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
  var nejvyssi = 0;
  var curID = 0;
  var nejStrana;

  $(".vysledek").each(function() {
    var vysledek = parseInt(this.value);
    curID++;
    if (isNaN(vysledek)) {
      vysledek = 0;
    }
    if (vysledek > nejvyssi) {
      nejvyssi = vysledek;
      if ($(window).width() < 560) {
        nejStrana = $(this).parent().parent().parent().parent().parent().parent().parent().prev().find(".nazevStrany")[0].textContent;
      } else {
        nejStrana = $(this).parent().parent().parent().parent().children()[0].textContent;
      }
    }
    rozdelenoHlasu = rozdelenoHlasu + vysledek;
  })

  var obec = $("#vyberObce").val().split(" (")[0];
  var vitez = nejStrana.substring(0,1) + nejStrana.substring(1).toLowerCase();
  

  if (rozdelenoHlasu == 100) {
    var html = '<button type="button" class="klikaci" onclick ="spocitejMandaty()">Spočítat mandáty</button></div>'
    html += '<div id="sdildiv"></div>';    
  } else if (rozdelenoHlasu > 100) {
    var html = '<button type="button" id="uber">Pro rozdělení mandátů je potřeba rozdat o ' + (rozdelenoHlasu - 100) + ' % hlasů méně</button></div>'
  } else {
    var html = '<button type="button" id="unter">Pro rozdělení mandátů je potřeba rozdat ještě ' + (100 - rozdelenoHlasu) + ' % hlasů</button></div>'
  }

  document.getElementById("zpetStrany").innerHTML = html;

  if (rozdelenoHlasu == 100) {
    sdilitko(obec, vitez);
  }
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

  nakresliGraf(strany, procenta, mandaty);

  document.getElementById("strany").style["padding-bottom"] = "30px";

  document.getElementById("zpetStrany").scrollIntoView();

  var html = '<button type="button" onclick="zpetNaKandidaty()">Zpět na kandidátky ↑</button>'

  document.getElementById("zpet").innerHTML = html;

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

function nakresliGraf(strany, procenta, mandaty) {

  var mandatyCelkem = mandaty.reduce(function(a, b) { return a + b; }, 0);

  for(i = 0; i < mandaty.length; i++) {
    mandaty[i] = Math.round(100 * mandaty[i] / mandatyCelkem, 1);
    procenta[i] = parseInt(procenta[i])
  }

  document.getElementById("vysledek").style["height"] = "600px";

  var colors = ['#deebf7', '#2171b5']

  var chart = Highcharts.chart('vysledek', {

      chart: {
          type: 'column'
      },
      title: {
          text: 'Zisk hlasů vs. mandátů'
      },
      xAxis: {
          categories: strany
      },
      yAxis: {
          title: {
              text: 'Zisk hlasů vs. mandátů'
          },
          labels: {
              format: '{value} %'
          }
      },
      tooltip: {
          pointFormat: '{point.series.name}: <b>{point.y} %<br/>',
          shared: true
      },
      exporting: {
          enabled: false
      },
      credits: {
          href: '',
          text: ''
      },
      series: [{
          name: 'Hlasy',
          data: procenta,
          color: colors[0]
      }, {
          name: 'Mandáty',
          data: mandaty,
          color: colors[1]
      }]
  });

}

function zpetNaKandidaty() {

  document.getElementById("strany").scrollIntoView();

}

function sdilitko(obec, vitez) {
  // vygenerování vyhodnocení
  var sdileciURL = "https://www.facebook.com/sharer/sharer.php?u=https://www.irozhlas.cz/zpravy-nahled/kandidatky-tipovacka";
  var sdileciURLtw = "https://twitter.com/intent/tweet?text=Dola%C4%8Fte%20formu%20na%20volby%3A%20vyzkou%C5%A1ejte%20si%20hlasov%C3%A1n%C3%AD%20ve%20sv%C3%A9%20obci%20nane%C4%8Disto.%20Tref%C3%ADte%20spr%C3%A1vn%C3%BD%20v%C3%BDsledek%3F&url=https%3A%2F%2Fwww.irozhlas.cz%2Fzpravy-nahled%2Fkandidatky-tipovacka";
  var text = '<button id="sdilitko">Sdílet</button>';
  text += '<button id="tweetitko">Tweetnout</button>';

  $("#sdildiv").html(text);

  $("#sdilitko").click(function() {
    window.open(sdileciURL,'test','left=20,top=20,width=550,height=650,toolbar=0,resizable=0,menubar=0');
  });

  $("#tweetitko").click(function() {
    window.open(sdileciURLtw,'test','left=20,top=20,width=550,height=250,toolbar=0,resizable=0,menubar=0');
  });

  // sdílítko - defaultní URL článku se dynamicky nahradí vygenerovanou
  $.ajax({
    url: 'https://nz6ctn80pc.execute-api.eu-central-1.amazonaws.com/prod?vals=' + JSON.stringify({ "obec": obec, "vitez": vitez}),
    type: "GET",
    crossDomain: !0,
    dataType: "json",
    success: function (response) {
      sdileciURL = "https://www.facebook.com/sharer/sharer.php?u=https://dev.datarozhlas.cz/kandidatky-tipovacka/share/" + response + ".html";
      sdileciURLtw = "https://twitter.com/intent/tweet?text=Levicov%C3%BD%20nevoli%C4%8D%2C%20m%C4%9Bstsk%C3%BD%20liber%C3%A1l%20nebo%20skute%C4%8Dn%C3%BD%20k%C5%99es%C5%A5an%3F%20Test%20prozrad%C3%AD%2C%20koho%20vol%C3%ADte%3A&url=https%3A%2F%2Fdev.datarozhlas.cz%2Fkandidatky-tipovacka%2Fshare%2F" + response + ".html";
      $("#sdilitko").click(function() {
        window.open(sdileciURL,'test','left=20,top=20,width=550,height=650,toolbar=0,resizable=0,menubar=0');
      });
      $("tweetitko").click(function() {
        window.open(sdileciURLtw,'test','left=20,top=20,width=550,height=250,toolbar=0,resizable=0,menubar=0');
      })
    }
  });
}
