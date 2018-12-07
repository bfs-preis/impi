import { normalizeStreet } from './normalizeStreet';
import { expect } from 'chai';

// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line

import 'mocha';
describe('manual tests', () => {

  it('should return hoehenw', () => {

    const result = normalizeStreet("Höhenweg");

    expect(result).to.equal('hoehenw');

  });

  it('should return hoeoehenw', () => {

    const result = normalizeStreet("Hööhenweg");

    expect(result).to.equal('hoeoehenw');

  });

  it('should return eeeeaaaooouuuiiic', () => {

    const result = normalizeStreet("èéêëàáâôòóûùúïíîç");

    expect(result).to.equal('eeeeaaaooouuuiiic');

  });

  it('should return hoehe', () => {

    const result = normalizeStreet("die Höhe");

    expect(result).to.equal('hoehe');

  });

  it('should return grei', () => {

    const result = normalizeStreet("A Gréi");
    expect(result).to.equal('grei');

  });

  it('should return grei', () => {
    const result = normalizeStreet("Gréi");
    expect(result).to.equal('grei');

  });

  it('should return smartin', () => {

    const result = normalizeStreet("A San Martin");
    expect(result).to.equal('smartin');

  });

  it('should return neuvecas', () => {

    const result = normalizeStreet("L'A Neuve CAS");
    expect(result).to.equal('neuvecas');

  });

  it('should return ry', () => {

    const result = normalizeStreet("A-Ry");
    expect(result).to.equal('ry');

  });
});

/*describe('gwr tests', () => {
  const gwrTest: string[][] = [
    ["Rue de l'Essert", "rl'essert"],
    ["Bahnhofstrasse", "bahnhofstr"],
    ["Ebertswilerstrasse", "ebertswilerstr"],
    ["Seestrasse", "seestr"],
    ["Im Hägeler", "imhaegeler"],
    ["Akazienstrasse", "akazienstr"],
    ["Jonentalstrasse", "jonentalstr"],
    ["Sagenmattstrasse", "sagenmattstr"],
    ["Unter der Fluh", "unterderfluh"],
    ["Wolhausenstrasse", "wolhausenstr"],
    ["Route de Saint-Cergue", "rtesaintcergue"],
    ["Niederglatterstrasse", "niederglatterstr"],
    ["Grossholzerstrasse", "grossholzerstr"],
    ["Oberdorfstrasse", "oberdorfstr"],
    ["Bendliweg", "bendliw"],
    ["Weidstrasse", "weidstr"],
    ["Zwillikerstrasse", "zwillikerstr"],
    ["Seehofmatt", "seehofmatt"],
    ["Rue des Vergers", "rvergers"],
    ["Seehofstrasse", "seehofstr"],
    ["Moosmatte", "moosmatte"],
    ["Winkelstrasse", "winkelstr"],
    ["Hämmenhubel", "haemmenhubel"],
    ["Höhrainstrasse", "hoehrainstr"],
    ["Zieglerweg", "zieglerw"],
    ["Ischlagweg", "ischlagw"],
    ["Moosstrasse", "moosstr"],
    ["Im Klosteracker", "imklosteracker"],
    ["Maiackerstrasse", "maiackerstr"],
    ["Moosgasse", "moosgasse"],
    ["Im Garten", "imgarten"],
    ["Guggerhofstrasse", "guggerhofstr"],
    ["Pilatusstrasse", "pilatusstr"],
    ["Zugerstrasse", "zugerstr"],
    ["Ilfisschachen", "ilfisschachen"],
    ["Chemin de Champ-Paris", "chchampparis"],
    ["Albisstrasse", "albisstr"],
    ["Propsteiweg", "propsteiw"],
    ["Tannrütistrasse", "tannruetistr"],
    ["Müllistrasse", "muellistr"],
    ["Rue de l'Avenir", "rl'avenir"],
    ["Rosrainstrasse", "rosrainstr"],
    ["Bachdörfli", "bachdoerfli"],
    ["Loorenstrasse", "loorenstr"],
    ["Alte Hedingerstrasse", "altehedingerstr"],
    ["Bifangstrasse", "bifangstr"],
    ["Zürichstrasse", "zuerichstr"],
    ["Kleinfeldstrasse", "kleinfeldstr"],
    ["Untergasse", "untergasse"],
    ["Fellerstrasse", "fellerstr"],
    ["Chemin des Coquilles", "chcoquilles"],
    ["Sonnenberg", "sonnenberg"],
    ["Am Hofibach", "amhofibach"],
    ["Erlenstrasse", "erlenstr"],
    ["Impasse des Hirondelles", "imphirondelles"],
    ["Obfelderstrasse", "obfelderstr"],
    ["Gehrenstrasse", "gehrenstr"],
    ["Pfruendhofstrasse", "pfruendhofstr"],
    ["Lüssirainstrasse", "luessirainstr"],
    ["Goldiger Berg", "goldigerberg"],
    ["Hasenbühlstrasse", "hasenbuehlstr"],
    ["Taneweier", "taneweier"],
    ["Antoniusweg", "antoniusw"],
    ["Obere Steinegg", "oberesteinegg"],
    ["Nelkenweg", "nelkenw"],
    ["Mettlenstrasse", "mettlenstr"],
    ["Weisserlenweg", "weisserlenw"],
    ["Obere Weid", "obereweid"],
    ["Im Nessel", "imnessel"],
    ["Pfändlergut", "pfaendlergut"],
    ["Hiltenweid", "hiltenweid"],
    ["Loorenfeldstrasse", "loorenfeldstr"],
    ["Chemin du Clos Genier", "chclosgenier"],
    ["Ottenbacherstrasse", "ottenbacherstr"],
    ["Stockmatt", "stockmatt"],
    ["In den Kurzen", "indenkurzen"],
    ["Rue Champ de la Pierre", "rchamppierre"],
    ["Albisbrunn", "albisbrunn"],
    ["Dorfstrasse", "dorfstr"],
    ["Mittelalbis", "mittelalbis"],
    ["Jonenbachstrasse", "jonenbachstr"],
    ["Gupfenstrasse", "gupfenstr"],
    ["Guschstrasse", "guschstr"]
  ];

  gwrTest.forEach((a: string[]) => {
    it('should ' + a[0] + ' return ' + a[1], () => {

      const result = normalizeStreet(a[0]);

      expect(result).to.equal(a[1]);

    });
  });
});*/