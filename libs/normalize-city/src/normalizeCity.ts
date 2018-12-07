/*Die Strassen werden wie folgt umgewandelt.

Wichtig ist:

-              Strasse identisch
GWR_ESTRID = IMPI_ESTRID (Strasse mit Funktion angeglichen und Treffer in GDE oder in PLZ  verwendet)
-              HNR identisch
GWR_HNR = IMPI_HNR
-              PLZ4 identisch
GWR PLZ4 = IMPI_PLZ4

-              Gemeinde und / oder Ort identisch
Idealerweise auch GWR_GDENR = IMPI_GDENR  und
GWR_PLZZ = IMPI PLZZ (Oder GWR_PLZ_ORT = IMPI_PLZ_ORT)

--------------------------------------------------------------*/

declare global {
    interface String {
        globalReplace(search: string, replace: string): string;
    }
}

export function normalizeCity(city: string): string {

    String.prototype.globalReplace = function (this: string, search: string, replace: string) {
        let s = this;
        return s.split(search).join(replace);
    };

    let city_normalized: string = "";

    if (typeof city !== 'string') {
        throw new Error("city not a string!");
    }

    //Mettre le nom de la rue en minuscule
    city_normalized = city.toLowerCase();

    //Supprimer les accents: èéêëàáâôòóûùúïíîç
    city_normalized = translate(city_normalized, 'èéêëàáâôòóûùúïíîç', 'eeeeaaaooouuuiiic');

    //remplacer les 'Umlaut'
    city_normalized = city_normalized.globalReplace('ä', 'ae');
    city_normalized = city_normalized.globalReplace('ö', 'oe');
    city_normalized = city_normalized.globalReplace('ü', 'ue');

    //Supprimer les signes de ponctuation: .,;:-
    city_normalized = translate(city_normalized, '.,;:-/+&', '        ');

    //Supprimer les séparateurs
    city_normalized = city_normalized.globalReplace(' de l\'', ' ');
    city_normalized = city_normalized.globalReplace(' de la ', ' ');
    city_normalized = city_normalized.globalReplace(' da la ', ' ');
    city_normalized = city_normalized.globalReplace(' de ', ' ');
    city_normalized = city_normalized.globalReplace(' des ', ' ');
    city_normalized = city_normalized.globalReplace(' du ', ' ');
    city_normalized = city_normalized.globalReplace(' da ', ' ');
    city_normalized = city_normalized.globalReplace(' al ', ' ');
    city_normalized = city_normalized.globalReplace(' ai ', ' ');
    city_normalized = city_normalized.globalReplace(' d\'', ' ');
    city_normalized = city_normalized.globalReplace(' della ', ' ');
    city_normalized = city_normalized.globalReplace(' alla ', ' ');
    city_normalized = city_normalized.globalReplace(' di ', ' ');
    city_normalized = city_normalized.globalReplace(' delle ', ' ');
    city_normalized = city_normalized.globalReplace(' del\'', ' ');
    city_normalized = city_normalized.globalReplace(' del ', ' ');
    city_normalized = city_normalized.globalReplace(' dei ', ' ');
    city_normalized = city_normalized.globalReplace(' dell\'', ' ');

    //Tout supprimer après
    if (city_normalized.indexOf(' sur ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' sur '))
    }
    if (city_normalized.indexOf(' sous ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' sous '))
    }
    if (city_normalized.indexOf(' pres ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' pres '))
    }
    if (city_normalized.indexOf(' en ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' en '))
    }
    if (city_normalized.indexOf(' devant ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' devant '))
    }
    if (city_normalized.indexOf(' sopra ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' sopra '))
    }
    if (city_normalized.indexOf(' in ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' in '))
    }
    if (city_normalized.indexOf(' im ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' im '))
    }
    if (city_normalized.indexOf(' bei ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' bei '))
    }
    if (city_normalized.indexOf(' am ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' am '))
    }
    if (city_normalized.indexOf(' an ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' an '))
    }
    if (city_normalized.indexOf(' l\' ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' l\' '))
    }
    if (city_normalized.indexOf(' le ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' le '))
    }
    if (city_normalized.indexOf(' la ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' la '))
    }
    if (city_normalized.indexOf(' les ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' les '))
    }
    if (city_normalized.indexOf(' b ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' b '))
    }
    if (city_normalized.indexOf(' a ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' a '))
    }
    if (city_normalized.indexOf(' i ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' i '))
    }
    if (city_normalized.indexOf(' s ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' s '))
    }
    if (city_normalized.indexOf(' san ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' san '))
    }
    if (city_normalized.indexOf(' p ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' p '))
    }
    if (city_normalized.indexOf(' pr ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' pr '))
    }
    if (city_normalized.indexOf(' e ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' e '))
    }
    if (city_normalized.indexOf(' l ') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf(' l '))
    }


    //Racourcir les prépositions
    city_normalized = city_normalized.globalReplace('petite ', 'pt ');
    city_normalized = city_normalized.globalReplace('petit ', 'pt ');
    city_normalized = city_normalized.globalReplace('grande ', 'gr ');
    city_normalized = city_normalized.globalReplace('grand ', 'gr ');
    city_normalized = city_normalized.globalReplace('santa ', 's ');
    city_normalized = city_normalized.globalReplace('sankt ', 'st ');
    city_normalized = city_normalized.globalReplace('saint ', 's ');
    city_normalized = city_normalized.globalReplace('sainte ', 'ste ');
    city_normalized = city_normalized.globalReplace('ancien ', 'anc ');           // NEU!!
    city_normalized = city_normalized.globalReplace('ancienne ', 'anc ');          // NEU!
    city_normalized = city_normalized.globalReplace('alte ', 'alt ');              // NEU!
    city_normalized = city_normalized.globalReplace('alter ', 'alt ');             // NEU!
    city_normalized = city_normalized.globalReplace('altes ', 'alt ');             // NEU!
    city_normalized = city_normalized.globalReplace('alten ', 'alt ');             // NEU!

    if (city_normalized.substr(0, 3) === 'le ') {
        city_normalized = city_normalized.substr(3);
    }

    if (city_normalized.substr(0, 3) === 'la ') {
        city_normalized = city_normalized.substr(3);
    }

    if (city_normalized.substr(0, 3) === 'en ') {
        city_normalized = city_normalized.substr(3);
    }

    if (city_normalized.substr(0, 3) === 'da ') {
        city_normalized = city_normalized.substr(3);
    }

    if (city_normalized.substr(0, 3) === 'im ') {
        city_normalized = city_normalized.substr(3);
    }

    if (city_normalized.substr(0, 3) === 'in ') {
        city_normalized = city_normalized.substr(3);
    }

    if (city_normalized.substr(0, 3) === 'ai ') {
        city_normalized = city_normalized.substr(3);
    }

    if (city_normalized.substr(0, 3) === 'al ') {
        city_normalized = city_normalized.substr(3);
    }

    if (city_normalized.substr(0, 3) === 'am ') {
        city_normalized = city_normalized.substr(3);
    }

    if (city_normalized.substr(0, 2) === 'l\'') {
        city_normalized = city_normalized.substr(2);
    }

    if (city_normalized.substr(0, 2) === 'a ') {
        city_normalized = city_normalized.substr(2);
    }

    if (city_normalized.substr(0, 4) === 'les ') {
        city_normalized = city_normalized.substr(4);
    }

    if (city_normalized.substr(0, 4) === 'auf ') {
        city_normalized = city_normalized.substr(4);
    }

    if (city_normalized.substr(0, 4) === 'aux ') {
        city_normalized = city_normalized.substr(4);
    }

    if (city_normalized.substr(0, 4) === 'bei ') {
        city_normalized = city_normalized.substr(4);
    }

    if (city_normalized.substr(0, 4) === 'der ') {
        city_normalized = city_normalized.substr(4);
    }

    if (city_normalized.substr(0, 4) === 'die ') {
        city_normalized = city_normalized.substr(4);
    }

    if (city_normalized.substr(0, 4) === 'das ') {
        city_normalized = city_normalized.substr(4);
    }

    if (city_normalized.substr(0, 4) === 'zum ') {
        city_normalized = city_normalized.substr(4);
    }                                                             // NEU!

    if (city_normalized.substr(0, 5) === 'beim ') {
        city_normalized = city_normalized.substr(5);
    }

    //Supprimer les guillemets
    city_normalized = city_normalized.globalReplace('\'', ' ');   //Anführungszeichen: "
    city_normalized = city_normalized.globalReplace('"', ' ');    //Einfaches Anführungszeichen: '

    //Tout supprimer après une parenthèse (
    if (city_normalized.indexOf('(') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf('(') - 1);
    }

    //Mettre en majuscule
    city_normalized = city_normalized.trim();

    //Supprimer tous les espaces
    city_normalized = city_normalized.globalReplace(' ', '');

    return city_normalized;
}

function translate(s: string, sFrom: string, sTo: string) {
    let out: string = s;
    for (let i = 0; i < sFrom.length; i++) {
        out = out.split(sFrom.charAt(i)).join(sTo.charAt(i));
    }
    return out;
}