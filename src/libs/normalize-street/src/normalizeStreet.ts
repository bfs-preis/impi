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

import { globalReplace, translate, validateStringInput } from 'normalize-common';

export function normalizeStreet(street: string): string {
    const validatedStreet = validateStringInput(street, 'street');
    let street_normalized: string = "";

    //Mettre le nom de la rue en minuscule
    street_normalized = validatedStreet.toLowerCase();

    //Supprimer les accents: èéêëàáâôòóûùúïíîç
    street_normalized = translate(street_normalized, 'èéêëàáâôòóûùúïíîç', 'eeeeaaaooouuuiiic');

    //remplacer les 'Umlaut'
    street_normalized = globalReplace(street_normalized,'ä', 'ae');
    street_normalized = globalReplace(street_normalized,'ö', 'oe');
    street_normalized = globalReplace(street_normalized,'ü', 'ue');

    //Normaliser
    street_normalized = globalReplace(street_normalized,'strasse', 'str');
    street_normalized = globalReplace(street_normalized,'platz', 'pl');
    street_normalized = globalReplace(street_normalized,'weg', 'w');
    street_normalized = globalReplace(street_normalized,'avenue ', 'av ');
    street_normalized = globalReplace(street_normalized,'ave.', 'av ');
    street_normalized = globalReplace(street_normalized,'boulevard ', 'bd ');
    street_normalized = globalReplace(street_normalized,'bvd.', 'bd ');
    street_normalized = globalReplace(street_normalized,'chemin ', 'ch ');
    street_normalized = globalReplace(street_normalized,'impasse ', 'imp ');
    street_normalized = globalReplace(street_normalized,'place ', 'pl ');
    street_normalized = globalReplace(street_normalized,'route ', 'rte ');
    street_normalized = globalReplace(street_normalized,'rue ', 'r ');
    street_normalized = globalReplace(street_normalized,'ruelle ', 'rlle ');
    street_normalized = globalReplace(street_normalized,'piazza ', 'p ');
    street_normalized = globalReplace(street_normalized,'viazza ', 'v ');
    street_normalized = globalReplace(street_normalized,'via ', 'v ');
    street_normalized = globalReplace(street_normalized,'viale ', 'vl ');
    street_normalized = globalReplace(street_normalized,'viccolo ', 'vic ');

    //Supprimer les signes de ponctuation: .,;:-
    street_normalized = translate(street_normalized, '.,;:-', '     ');

    //Supprimer les séparateurs
    street_normalized = globalReplace(street_normalized, ' de l\'', ' ');
    street_normalized = globalReplace(street_normalized, ' de la ', ' ');
    street_normalized = globalReplace(street_normalized, ' da la ', ' ');
    street_normalized = globalReplace(street_normalized, ' de ', ' ');
    street_normalized = globalReplace(street_normalized, ' des ', ' ');
    street_normalized = globalReplace(street_normalized, ' du ', ' ');
    street_normalized = globalReplace(street_normalized, ' da ', ' ');
    street_normalized = globalReplace(street_normalized, ' al ', ' ');
    street_normalized = globalReplace(street_normalized, ' ai ', ' ');
    street_normalized = globalReplace(street_normalized, ' in ', ' ');
    street_normalized = globalReplace(street_normalized, ' d\'', ' ');
    street_normalized = globalReplace(street_normalized, ' della ', ' ');
    street_normalized = globalReplace(street_normalized, ' alla ', ' ');
    street_normalized = globalReplace(street_normalized, ' di ', ' ');
    street_normalized = globalReplace(street_normalized, ' delle ', ' ');
    street_normalized = globalReplace(street_normalized, ' del\'', ' ');
    street_normalized = globalReplace(street_normalized, ' del ', ' ');
    street_normalized = globalReplace(street_normalized, ' dei ', ' ');
    street_normalized = globalReplace(street_normalized, ' dell\'', ' ');
    street_normalized = globalReplace(street_normalized, ' bei ', ' b ');
    street_normalized = globalReplace(street_normalized, ' l\'', ' ');
    street_normalized = globalReplace(street_normalized, ' le ', ' ');
    street_normalized = globalReplace(street_normalized, ' la ', ' ');
    street_normalized = globalReplace(street_normalized, ' les ', ' ');

    //Racourcir les prépositions
    street_normalized = globalReplace(street_normalized,'hinterer ', 'hint ');
    street_normalized = globalReplace(street_normalized,'hinteren ', 'hint ');
    street_normalized = globalReplace(street_normalized,'hinteres ', 'hint ');
    street_normalized = globalReplace(street_normalized,'hintere ', 'hint ');
    street_normalized = globalReplace(street_normalized,'hinter ', 'hint ');
    street_normalized = globalReplace(street_normalized,'oberen ', 'ob ');
    street_normalized = globalReplace(street_normalized,'oberer ', 'ob ');
    street_normalized = globalReplace(street_normalized,'oberes ', 'ob ');
    street_normalized = globalReplace(street_normalized,'obere ', 'ob ');
    street_normalized = globalReplace(street_normalized,'ober ', 'ob ');
    street_normalized = globalReplace(street_normalized,'vorderen ', 'vord ');
    street_normalized = globalReplace(street_normalized,'vorderer ', 'vord ');
    street_normalized = globalReplace(street_normalized,'vorderes ', 'vord ');
    street_normalized = globalReplace(street_normalized,'vordere ', 'vord ');
    street_normalized = globalReplace(street_normalized,'vorder ', 'vord ');
    street_normalized = globalReplace(street_normalized,'unteren ', 'unt ');
    street_normalized = globalReplace(street_normalized,'unterer ', 'unt ');
    street_normalized = globalReplace(street_normalized,'unteres ', 'unt ');
    street_normalized = globalReplace(street_normalized,'untere ', 'unt ');
    street_normalized = globalReplace(street_normalized,'unter ', 'unt ');
    street_normalized = globalReplace(street_normalized,'mittleren ', 'mittl ');
    street_normalized = globalReplace(street_normalized,'mittlerer ', 'mittl ');
    street_normalized = globalReplace(street_normalized,'mittleres ', 'mittl ');
    street_normalized = globalReplace(street_normalized,'mittlere ', 'mittl ');
    street_normalized = globalReplace(street_normalized,'mittler ', 'mittl ');
    street_normalized = globalReplace(street_normalized,'aeusseren ', 'aeuss ');
    street_normalized = globalReplace(street_normalized,'aeusserer ', 'aeuss ');
    street_normalized = globalReplace(street_normalized,'aeusseres ', 'aeuss ');
    street_normalized = globalReplace(street_normalized,'aeussere ', 'aeuss ');
    street_normalized = globalReplace(street_normalized,'aeusser ', 'aeuss ');
    street_normalized = globalReplace(street_normalized,'inneren ', 'inn ');
    street_normalized = globalReplace(street_normalized,'innerer ', 'inn ');
    street_normalized = globalReplace(street_normalized,'inneres ', 'inn ');
    street_normalized = globalReplace(street_normalized,'innere ', 'inn ');
    street_normalized = globalReplace(street_normalized,'inner ', 'inn ');
    street_normalized = globalReplace(street_normalized,'kleines ', 'kl ');
    street_normalized = globalReplace(street_normalized,'kleiner ', 'kl ');
    street_normalized = globalReplace(street_normalized,'kleinen ', 'kl ');
    street_normalized = globalReplace(street_normalized,'kleine ', 'kl ');
    street_normalized = globalReplace(street_normalized,'klein ', 'kl ');
    street_normalized = globalReplace(street_normalized,'grosses ', 'gr ');
    street_normalized = globalReplace(street_normalized,'grosser ', 'gr ');
    street_normalized = globalReplace(street_normalized,'grossen ', 'gr ');
    street_normalized = globalReplace(street_normalized,'grosse ', 'gr ');
    street_normalized = globalReplace(street_normalized,'gross ', 'gr ');
    street_normalized = globalReplace(street_normalized,'petite ', 'pt ');
    street_normalized = globalReplace(street_normalized,'petit ', 'pt ');
    street_normalized = globalReplace(street_normalized,'grande ', 'gr ');
    street_normalized = globalReplace(street_normalized,'grand ', 'gr ');
    street_normalized = globalReplace(street_normalized,'san ', 's ');
    street_normalized = globalReplace(street_normalized,'santa ', 's ');
    street_normalized = globalReplace(street_normalized,'sankt ', 'st ');
    street_normalized = globalReplace(street_normalized,'saint ', 's ');
    street_normalized = globalReplace(street_normalized,'sainte ', 'ste ');
    street_normalized = globalReplace(street_normalized,'ancien ', 'anc ');           // NEU!!
    street_normalized = globalReplace(street_normalized,'ancienne ', 'anc ');          // NEU!
    street_normalized = globalReplace(street_normalized,'alte ', 'alt ');              // NEU!
    street_normalized = globalReplace(street_normalized,'alter ', 'alt ');             // NEU!
    street_normalized = globalReplace(street_normalized,'altes ', 'alt ');             // NEU!
    street_normalized = globalReplace(street_normalized,'alten ', 'alt ');             // NEU!

    street_normalized = globalReplace(street_normalized,'mont ', 'mt ');

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
    street_normalized = globalReplace(street_normalized,'\'', ' ');   //Anführungszeichen: "
    street_normalized = globalReplace(street_normalized,'"', ' ');    //Einfaches Anführungszeichen: '

    //Tout supprimer après une parenthèse (
    if (street_normalized.indexOf('(') > 0) {
        street_normalized = street_normalized.substr(0, street_normalized.indexOf('('));
    }

    //Tout supprimer après un slash
    if (street_normalized.indexOf('/') > 0) {
        street_normalized = street_normalized.substr(0, street_normalized.indexOf('/'));
    }

    //Mettre en majuscule
    street_normalized = street_normalized.trim();

    //Supprimer tous les espaces
    street_normalized = globalReplace(street_normalized,' ', '');

    return street_normalized;
}

export function normalizeStreetNumber(streetNumber: string): string {

    let streetNumber_normalized: string = "";

    if (typeof streetNumber !== 'string') {
        throw new Error("street not a string!");
    }

    //Mettre le nom de la rue en minuscule
    streetNumber_normalized = streetNumber.toLowerCase();

    //Supprimer les accents: èéêëàáâôòóûùúïíîç
    streetNumber_normalized = translate(streetNumber_normalized, 'èéêëàáâôòóûùúïíîç', 'eeeeaaaooouuuiiic');

    //remplacer les 'Umlaut'
    streetNumber_normalized = globalReplace(streetNumber_normalized,'ä', 'ae');
    streetNumber_normalized = globalReplace(streetNumber_normalized,'ö', 'oe');
    streetNumber_normalized = globalReplace(streetNumber_normalized,'ü', 'ue');


    //Supprimer les guillemets
    streetNumber_normalized = globalReplace(streetNumber_normalized,'\'', ' ');   //Anführungszeichen: "
    streetNumber_normalized = globalReplace(streetNumber_normalized,'"', ' ');    //Einfaches Anführungszeichen: '

    //Tout supprimer après une parenthèse (
    if (streetNumber_normalized.indexOf('(') > 0) {
        streetNumber_normalized = streetNumber_normalized.substr(0, streetNumber_normalized.indexOf('(') );
    }

    //Tout supprimer après un & (
    if (streetNumber_normalized.indexOf('&') > 0) {
        streetNumber_normalized = streetNumber_normalized.substr(0, streetNumber_normalized.indexOf('&'));
    }
    //Tout supprimer après un + (
    if (streetNumber_normalized.indexOf('+') > 0) {
        streetNumber_normalized = streetNumber_normalized.substr(0, streetNumber_normalized.indexOf('+'));
    }

    //Tout supprimer après un slash
    if (streetNumber_normalized.indexOf('/') > 0) {
        streetNumber_normalized = streetNumber_normalized.substr(0, streetNumber_normalized.indexOf('/'));
    }

    //Tout supprimer après un backslash
    if (streetNumber_normalized.indexOf('\\') > 0) {
        streetNumber_normalized = streetNumber_normalized.substr(0, streetNumber_normalized.indexOf('\\'));
    }


    //Supprimer tous les espaces
    streetNumber_normalized = globalReplace(streetNumber_normalized,' ', '');

    return streetNumber_normalized;
}

