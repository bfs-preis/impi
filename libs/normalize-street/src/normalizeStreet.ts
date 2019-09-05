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

export function normalizeStreet(street: string): string {

    String.prototype.globalReplace = function (this: string, search: string, replace: string) {
        let s = this;
        return s.split(search).join(replace);
    };

    let street_normalized: string = "";

    if (typeof street !== 'string') {
        throw new Error("street not a string!");
    }

    //Mettre le nom de la rue en minuscule
    street_normalized = street.toLowerCase();

    //Supprimer les accents: èéêëàáâôòóûùúïíîç
    street_normalized = translate(street_normalized, 'èéêëàáâôòóûùúïíîç', 'eeeeaaaooouuuiiic');

    //remplacer les 'Umlaut'
    street_normalized = street_normalized.globalReplace('ä', 'ae');
    street_normalized = street_normalized.globalReplace('ö', 'oe');
    street_normalized = street_normalized.globalReplace('ü', 'ue');

    //Normaliser
    street_normalized = street_normalized.globalReplace('strasse', 'str');
    street_normalized = street_normalized.globalReplace('platz', 'pl');
    street_normalized = street_normalized.globalReplace('weg', 'w');
    street_normalized = street_normalized.globalReplace('avenue ', 'av ');
    street_normalized = street_normalized.globalReplace('ave.', 'av ');
    street_normalized = street_normalized.globalReplace('boulevard ', 'bd ');
    street_normalized = street_normalized.globalReplace('bvd.', 'bd ');
    street_normalized = street_normalized.globalReplace('chemin ', 'ch ');
    street_normalized = street_normalized.globalReplace('impasse ', 'imp ');
    street_normalized = street_normalized.globalReplace('place ', 'pl ');
    street_normalized = street_normalized.globalReplace('route ', 'rte ');
    street_normalized = street_normalized.globalReplace('rue ', 'r ');
    street_normalized = street_normalized.globalReplace('ruelle ', 'rlle ');
    street_normalized = street_normalized.globalReplace('piazza ', 'p ');
    street_normalized = street_normalized.globalReplace('viazza ', 'v ');
    street_normalized = street_normalized.globalReplace('via ', 'v ');
    street_normalized = street_normalized.globalReplace('viale ', 'vl ');
    street_normalized = street_normalized.globalReplace('viccolo ', 'vic ');

    //Supprimer les signes de ponctuation: .,;:-
    street_normalized = translate(street_normalized, '.,;:-', '     ');

    //Supprimer les séparateurs
    street_normalized = street_normalized.globalReplace(' de l\'', ' ');
    street_normalized = street_normalized.globalReplace(' de la ', ' ');
    street_normalized = street_normalized.globalReplace(' da la ', ' ');
    street_normalized = street_normalized.globalReplace(' de ', ' ');
    street_normalized = street_normalized.globalReplace(' des ', ' ');
    street_normalized = street_normalized.globalReplace(' du ', ' ');
    street_normalized = street_normalized.globalReplace(' da ', ' ');
    street_normalized = street_normalized.globalReplace(' al ', ' ');
    street_normalized = street_normalized.globalReplace(' ai ', ' ');
    street_normalized = street_normalized.globalReplace(' in ', ' ');
    street_normalized = street_normalized.globalReplace(' d\'', ' ');
    street_normalized = street_normalized.globalReplace(' della ', ' ');
    street_normalized = street_normalized.globalReplace(' alla ', ' ');
    street_normalized = street_normalized.globalReplace(' di ', ' ');
    street_normalized = street_normalized.globalReplace(' delle ', ' ');
    street_normalized = street_normalized.globalReplace(' del\'', ' ');
    street_normalized = street_normalized.globalReplace(' del ', ' ');
    street_normalized = street_normalized.globalReplace(' dei ', ' ');
    street_normalized = street_normalized.globalReplace(' dell\'', ' ');
    street_normalized = street_normalized.globalReplace(' bei ', ' b ');
    street_normalized = street_normalized.globalReplace(' l\'', ' ');
    street_normalized = street_normalized.globalReplace(' le ', ' ');
    street_normalized = street_normalized.globalReplace(' la ', ' ');
    street_normalized = street_normalized.globalReplace(' les ', ' ');

    //Racourcir les prépositions
    street_normalized = street_normalized.globalReplace('hinterer ', 'hint ');
    street_normalized = street_normalized.globalReplace('hinteren ', 'hint ');
    street_normalized = street_normalized.globalReplace('hinteres ', 'hint ');
    street_normalized = street_normalized.globalReplace('hintere ', 'hint ');
    street_normalized = street_normalized.globalReplace('hinter ', 'hint ');
    street_normalized = street_normalized.globalReplace('oberen ', 'ob ');
    street_normalized = street_normalized.globalReplace('oberer ', 'ob ');
    street_normalized = street_normalized.globalReplace('oberes ', 'ob ');
    street_normalized = street_normalized.globalReplace('obere ', 'ob ');
    street_normalized = street_normalized.globalReplace('ober ', 'ob ');
    street_normalized = street_normalized.globalReplace('vorderen ', 'vord ');
    street_normalized = street_normalized.globalReplace('vorderer ', 'vord ');
    street_normalized = street_normalized.globalReplace('vorderes ', 'vord ');
    street_normalized = street_normalized.globalReplace('vordere ', 'vord ');
    street_normalized = street_normalized.globalReplace('vorder ', 'vord ');
    street_normalized = street_normalized.globalReplace('unteren ', 'unt ');
    street_normalized = street_normalized.globalReplace('unterer ', 'unt ');
    street_normalized = street_normalized.globalReplace('unteres ', 'unt ');
    street_normalized = street_normalized.globalReplace('untere ', 'unt ');
    street_normalized = street_normalized.globalReplace('unter ', 'unt ');
    street_normalized = street_normalized.globalReplace('mittleren ', 'mittl ');
    street_normalized = street_normalized.globalReplace('mittlerer ', 'mittl ');
    street_normalized = street_normalized.globalReplace('mittleres ', 'mittl ');
    street_normalized = street_normalized.globalReplace('mittlere ', 'mittl ');
    street_normalized = street_normalized.globalReplace('mittler ', 'mittl ');
    street_normalized = street_normalized.globalReplace('aeusseren ', 'aeuss ');
    street_normalized = street_normalized.globalReplace('aeusserer ', 'aeuss ');
    street_normalized = street_normalized.globalReplace('aeusseres ', 'aeuss ');
    street_normalized = street_normalized.globalReplace('aeussere ', 'aeuss ');
    street_normalized = street_normalized.globalReplace('aeusser ', 'aeuss ');
    street_normalized = street_normalized.globalReplace('inneren ', 'inn ');
    street_normalized = street_normalized.globalReplace('innerer ', 'inn ');
    street_normalized = street_normalized.globalReplace('inneres ', 'inn ');
    street_normalized = street_normalized.globalReplace('innere ', 'inn ');
    street_normalized = street_normalized.globalReplace('inner ', 'inn ');
    street_normalized = street_normalized.globalReplace('kleines ', 'kl ');
    street_normalized = street_normalized.globalReplace('kleiner ', 'kl ');
    street_normalized = street_normalized.globalReplace('kleinen ', 'kl ');
    street_normalized = street_normalized.globalReplace('kleine ', 'kl ');
    street_normalized = street_normalized.globalReplace('klein ', 'kl ');
    street_normalized = street_normalized.globalReplace('grosses ', 'gr ');
    street_normalized = street_normalized.globalReplace('grosser ', 'gr ');
    street_normalized = street_normalized.globalReplace('grossen ', 'gr ');
    street_normalized = street_normalized.globalReplace('grosse ', 'gr ');
    street_normalized = street_normalized.globalReplace('gross ', 'gr ');
    street_normalized = street_normalized.globalReplace('petite ', 'pt ');
    street_normalized = street_normalized.globalReplace('petit ', 'pt ');
    street_normalized = street_normalized.globalReplace('grande ', 'gr ');
    street_normalized = street_normalized.globalReplace('grand ', 'gr ');
    street_normalized = street_normalized.globalReplace('san ', 's ');
    street_normalized = street_normalized.globalReplace('santa ', 's ');
    street_normalized = street_normalized.globalReplace('sankt ', 'st ');
    street_normalized = street_normalized.globalReplace('saint ', 's ');
    street_normalized = street_normalized.globalReplace('sainte ', 'ste ');
    street_normalized = street_normalized.globalReplace('ancien ', 'anc ');           // NEU!!
    street_normalized = street_normalized.globalReplace('ancienne ', 'anc ');          // NEU!
    street_normalized = street_normalized.globalReplace('alte ', 'alt ');              // NEU!
    street_normalized = street_normalized.globalReplace('alter ', 'alt ');             // NEU!
    street_normalized = street_normalized.globalReplace('altes ', 'alt ');             // NEU!
    street_normalized = street_normalized.globalReplace('alten ', 'alt ');             // NEU!

    street_normalized = street_normalized.globalReplace('mont ', 'mt ');

    if (street_normalized.substr(0, 3) === 'le ') {
        street_normalized = street_normalized.substr(3);
    }

    if (street_normalized.substr(0, 3) === 'la ') {
        street_normalized = street_normalized.substr(3);
    }

    if (street_normalized.substr(0, 3) === 'en ') {
        street_normalized = street_normalized.substr(3);
    }

    if (street_normalized.substr(0, 3) === 'au ') {
        street_normalized = street_normalized.substr(3);
    }

    if (street_normalized.substr(0, 3) === 'da ') {
        street_normalized = street_normalized.substr(3);
    }

    if (street_normalized.substr(0, 3) === 'im ') {
        street_normalized = street_normalized.substr(3);
    }

    if (street_normalized.substr(0, 3) === 'in ') {
        street_normalized = street_normalized.substr(3);
    }

    if (street_normalized.substr(0, 3) === 'ai ') {
        street_normalized = street_normalized.substr(3);
    }

    if (street_normalized.substr(0, 3) === 'al ') {
        street_normalized = street_normalized.substr(3);
    }

    if (street_normalized.substr(0, 3) === 'am ') {
        street_normalized = street_normalized.substr(3);
    }

    if (street_normalized.substr(0, 2) === 'l\'') {
        street_normalized = street_normalized.substr(2);
    }

    if (street_normalized.substr(0, 2) === 'a ') {
        street_normalized = street_normalized.substr(2);
    }

    if (street_normalized.substr(0, 4) === 'les ') {
        street_normalized = street_normalized.substr(4);
    }

    if (street_normalized.substr(0, 4) === 'auf ') {
        street_normalized = street_normalized.substr(4);
    }

    if (street_normalized.substr(0, 4) === 'aux ') {
        street_normalized = street_normalized.substr(4);
    }

    if (street_normalized.substr(0, 4) === 'bei ') {
        street_normalized = street_normalized.substr(4);
    }

    if (street_normalized.substr(0, 4) === 'der ') {
        street_normalized = street_normalized.substr(4);
    }

    if (street_normalized.substr(0, 4) === 'die ') {
        street_normalized = street_normalized.substr(4);
    }

    if (street_normalized.substr(0, 4) === 'das ') {
        street_normalized = street_normalized.substr(4);
    }

    if (street_normalized.substr(0, 4) === 'zum ') {
        street_normalized = street_normalized.substr(4);
    }                                                             // NEU!

    if (street_normalized.substr(0, 5) === 'beim ') {
        street_normalized = street_normalized.substr(5);
    }

    //Supprimer les guillemets
    street_normalized = street_normalized.globalReplace('\'', ' ');   //Anführungszeichen: "
    street_normalized = street_normalized.globalReplace('"', ' ');    //Einfaches Anführungszeichen: '

    //Tout supprimer après une parenthèse (
    if (street_normalized.indexOf('(') > 0) {
        street_normalized = street_normalized.substr(0, street_normalized.indexOf('(') - 1);
    }

    //Tout supprimer après un slash
    if (street_normalized.indexOf('/') > 0) {
        street_normalized = street_normalized.substr(0, street_normalized.indexOf('/') - 1);
    }

    //Mettre en majuscule
    street_normalized = street_normalized.trim();

    //Supprimer tous les espaces
    street_normalized = street_normalized.globalReplace(' ', '');

    return street_normalized;
}

export function normalizeStreetNumber(streetNumber: string): string {

    String.prototype.globalReplace = function (this: string, search: string, replace: string) {
        let s = this;
        return s.split(search).join(replace);
    };

    let streetNumber_normalized: string = "";

    if (typeof streetNumber !== 'string') {
        throw new Error("street not a string!");
    }

    //Mettre le nom de la rue en minuscule
    streetNumber_normalized = streetNumber.toLowerCase();

    //Supprimer les accents: èéêëàáâôòóûùúïíîç
    streetNumber_normalized = translate(streetNumber_normalized, 'èéêëàáâôòóûùúïíîç', 'eeeeaaaooouuuiiic');

    //remplacer les 'Umlaut'
    streetNumber_normalized = streetNumber_normalized.globalReplace('ä', 'ae');
    streetNumber_normalized = streetNumber_normalized.globalReplace('ö', 'oe');
    streetNumber_normalized = streetNumber_normalized.globalReplace('ü', 'ue');


    //Supprimer les guillemets
    streetNumber_normalized = streetNumber_normalized.globalReplace('\'', ' ');   //Anführungszeichen: "
    streetNumber_normalized = streetNumber_normalized.globalReplace('"', ' ');    //Einfaches Anführungszeichen: '

    //Tout supprimer après une parenthèse (
    if (streetNumber_normalized.indexOf('(') > 0) {
        streetNumber_normalized = streetNumber_normalized.substr(0, streetNumber_normalized.indexOf('(') - 1);
    }

    //Tout supprimer après un & (
    if (streetNumber_normalized.indexOf('&') > 0) {
        streetNumber_normalized = streetNumber_normalized.substr(0, streetNumber_normalized.indexOf('&') - 1);
    }
    //Tout supprimer après un + (
    if (streetNumber_normalized.indexOf('+') > 0) {
        streetNumber_normalized = streetNumber_normalized.substr(0, streetNumber_normalized.indexOf('+') - 1);
    }

    //Tout supprimer après un slash
    if (streetNumber_normalized.indexOf('/') > 0) {
        streetNumber_normalized = streetNumber_normalized.substr(0, streetNumber_normalized.indexOf('/') - 1);
    }

    //Tout supprimer après un backslash
    if (streetNumber_normalized.indexOf('\\') > 0) {
        streetNumber_normalized = streetNumber_normalized.substr(0, streetNumber_normalized.indexOf('\\') - 1);
    }


    //Supprimer tous les espaces
    streetNumber_normalized = streetNumber_normalized.globalReplace(' ', '');

    return streetNumber_normalized;
}

function translate(s: string, sFrom: string, sTo: string) {
    let out: string = s;
    for (let i = 0; i < sFrom.length; i++) {
        out = out.split(sFrom.charAt(i)).join(sTo.charAt(i));
    }
    return out;
}