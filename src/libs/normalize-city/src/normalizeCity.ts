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

export function normalizeCity(city: string): string {
    const validatedCity = validateStringInput(city, 'city');
    let city_normalized: string = "";

    //Mettre le nom de la rue en minuscule
    city_normalized = validatedCity.toLowerCase();

    //Supprimer les accents: èéêëàáâôòóûùúïíîç
    city_normalized = translate(city_normalized, 'èéêëàáâôòóûùúïíîç', 'eeeeaaaooouuuiiic');

    //remplacer les 'Umlaut'
    city_normalized = globalReplace(city_normalized,'ä', 'ae');
    city_normalized = globalReplace(city_normalized,'ö', 'oe');
    city_normalized = globalReplace(city_normalized,'ü', 'ue');

    //Supprimer les signes de ponctuation: .,;:-
    city_normalized = translate(city_normalized, '.,;:-/+&', '        ');

    //Supprimer les séparateurs
    city_normalized = globalReplace(city_normalized,' de l\'', ' ');
    city_normalized = globalReplace(city_normalized,' de la ', ' ');
    city_normalized = globalReplace(city_normalized,' da la ', ' ');
    city_normalized = globalReplace(city_normalized,' de ', ' ');
    city_normalized = globalReplace(city_normalized,' des ', ' ');
    city_normalized = globalReplace(city_normalized,' du ', ' ');
    city_normalized = globalReplace(city_normalized,' da ', ' ');
    city_normalized = globalReplace(city_normalized,' al ', ' ');
    city_normalized = globalReplace(city_normalized,' ai ', ' ');
    city_normalized = globalReplace(city_normalized,' d\'', ' ');
    city_normalized = globalReplace(city_normalized,' della ', ' ');
    city_normalized = globalReplace(city_normalized,' alla ', ' ');
    city_normalized = globalReplace(city_normalized,' di ', ' ');
    city_normalized = globalReplace(city_normalized,' delle ', ' ');
    city_normalized = globalReplace(city_normalized,' del\'', ' ');
    city_normalized = globalReplace(city_normalized,' del ', ' ');
    city_normalized = globalReplace(city_normalized,' dei ', ' ');
    city_normalized = globalReplace(city_normalized,' dell\'', ' ');

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
    city_normalized = globalReplace(city_normalized,'petite ', 'pt ');
    city_normalized = globalReplace(city_normalized,'petit ', 'pt ');
    city_normalized = globalReplace(city_normalized,'grande ', 'gr ');
    city_normalized = globalReplace(city_normalized,'grand ', 'gr ');
    city_normalized = globalReplace(city_normalized,'santa ', 's ');
    city_normalized = globalReplace(city_normalized,'sankt ', 'st ');
    city_normalized = globalReplace(city_normalized,'saint ', 's ');
    city_normalized = globalReplace(city_normalized,'sainte ', 'ste ');
    city_normalized = globalReplace(city_normalized,'ancien ', 'anc ');           // NEU!!
    city_normalized = globalReplace(city_normalized,'ancienne ', 'anc ');          // NEU!
    city_normalized = globalReplace(city_normalized,'alte ', 'alt ');              // NEU!
    city_normalized = globalReplace(city_normalized,'alter ', 'alt ');             // NEU!
    city_normalized = globalReplace(city_normalized,'altes ', 'alt ');             // NEU!
    city_normalized = globalReplace(city_normalized,'alten ', 'alt ');             // NEU!

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
    city_normalized = globalReplace(city_normalized,'\'', ' ');   //Anführungszeichen: "
    city_normalized = globalReplace(city_normalized,'"', ' ');    //Einfaches Anführungszeichen: '

    //Tout supprimer après une parenthèse (
    if (city_normalized.indexOf('(') > 0) {
        city_normalized = city_normalized.substr(0, city_normalized.indexOf('(') - 1);
    }

    //Mettre en majuscule
    city_normalized = city_normalized.trim();

    //Supprimer tous les espaces
    city_normalized = globalReplace(city_normalized,' ', '');

    return city_normalized;
}

