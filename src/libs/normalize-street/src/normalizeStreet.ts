import {
    globalReplace, translate, validateStringInput, applyRules,
    SEPARATOR_RULES, PREPOSITION_ABBREVIATION_RULES, COMMON_PREFIX_REMOVAL, QUOTE_REMOVAL_RULES,
    createReplacementRules
} from 'normalize-common';

/**
 * Street-specific abbreviation rules (German/French/Italian street types).
 */
const STREET_TYPE_RULES = createReplacementRules([
    ['strasse', 'str'],
    ['platz', 'pl'],
    ['weg', 'w'],
    ['avenue ', 'av '],
    ['ave.', 'av '],
    ['boulevard ', 'bd '],
    ['bvd.', 'bd '],
    ['chemin ', 'ch '],
    ['impasse ', 'imp '],
    ['place ', 'pl '],
    ['route ', 'rte '],
    ['rue ', 'r '],
    ['ruelle ', 'rlle '],
    ['piazza ', 'p '],
    ['viazza ', 'v '],
    ['via ', 'v '],
    ['viale ', 'vl '],
    ['viccolo ', 'vic '],
]);

/**
 * Street-specific German adjective abbreviation rules.
 */
const GERMAN_ADJECTIVE_RULES = createReplacementRules([
    ['hinterer ', 'hint '],
    ['hinteren ', 'hint '],
    ['hinteres ', 'hint '],
    ['hintere ', 'hint '],
    ['hinter ', 'hint '],
    ['oberen ', 'ob '],
    ['oberer ', 'ob '],
    ['oberes ', 'ob '],
    ['obere ', 'ob '],
    ['ober ', 'ob '],
    ['vorderen ', 'vord '],
    ['vorderer ', 'vord '],
    ['vorderes ', 'vord '],
    ['vordere ', 'vord '],
    ['vorder ', 'vord '],
    ['unteren ', 'unt '],
    ['unterer ', 'unt '],
    ['unteres ', 'unt '],
    ['untere ', 'unt '],
    ['unter ', 'unt '],
    ['mittleren ', 'mittl '],
    ['mittlerer ', 'mittl '],
    ['mittleres ', 'mittl '],
    ['mittlere ', 'mittl '],
    ['mittler ', 'mittl '],
    ['aeusseren ', 'aeuss '],
    ['aeusserer ', 'aeuss '],
    ['aeusseres ', 'aeuss '],
    ['aeussere ', 'aeuss '],
    ['aeusser ', 'aeuss '],
    ['inneren ', 'inn '],
    ['innerer ', 'inn '],
    ['inneres ', 'inn '],
    ['innere ', 'inn '],
    ['inner ', 'inn '],
    ['kleines ', 'kl '],
    ['kleiner ', 'kl '],
    ['kleinen ', 'kl '],
    ['kleine ', 'kl '],
    ['klein ', 'kl '],
    ['grosses ', 'gr '],
    ['grosser ', 'gr '],
    ['grossen ', 'gr '],
    ['grosse ', 'gr '],
    ['gross ', 'gr '],
    ['san ', 's '],
    ['mont ', 'mt '],
]);

/**
 * Street-specific additional prefix for 'bei' separator.
 */
const STREET_SEPARATOR_EXTRA = createReplacementRules([
    [' bei ', ' b '],
    [' l\'', ' '],
    [' le ', ' '],
    [' la ', ' '],
    [' les ', ' '],
]);

/**
 * Street-specific prefix removal — includes 'au ' which is not in city normalization.
 */
const STREET_PREFIX_REMOVAL = ['au ', ...COMMON_PREFIX_REMOVAL];

export function normalizeStreet(street: string): string {
    const validatedStreet = validateStringInput(street, 'street');
    let result = validatedStreet.toLowerCase();

    // Remove accents
    result = translate(result, 'èéêëàáâôòóûùúïíîç', 'eeeeaaaooouuuiiic');

    // Replace umlauts
    result = globalReplace(result, 'ä', 'ae');
    result = globalReplace(result, 'ö', 'oe');
    result = globalReplace(result, 'ü', 'ue');

    // Street type abbreviations
    result = applyRules(result, STREET_TYPE_RULES);

    // Remove punctuation
    result = translate(result, '.,;:-', '     ');

    // Remove separators (shared)
    result = applyRules(result, SEPARATOR_RULES);
    result = applyRules(result, STREET_SEPARATOR_EXTRA);

    // German adjective abbreviations (street-specific)
    result = applyRules(result, GERMAN_ADJECTIVE_RULES);

    // Preposition abbreviations (shared)
    result = applyRules(result, PREPOSITION_ABBREVIATION_RULES);

    // Remove leading prefixes (shared + street-specific)
    // Apply repeatedly — multiple prefixes may chain (e.g. "l'a " → remove "l'" then "a ")
    let prefixRemoved = true;
    while (prefixRemoved) {
        prefixRemoved = false;
        for (const prefix of STREET_PREFIX_REMOVAL) {
            if (result.startsWith(prefix)) {
                result = result.substring(prefix.length);
                prefixRemoved = true;
                break;
            }
        }
    }

    // Remove quotes
    result = applyRules(result, QUOTE_REMOVAL_RULES);

    // Truncate at parenthesis
    const parenIndex = result.indexOf('(');
    if (parenIndex > 0) {
        result = result.substring(0, parenIndex);
    }

    // Truncate at slash
    const slashIndex = result.indexOf('/');
    if (slashIndex > 0) {
        result = result.substring(0, slashIndex);
    }

    result = result.trim();
    result = globalReplace(result, ' ', '');

    return result;
}

export function normalizeStreetNumber(streetNumber: string): string {
    let result = validateStringInput(streetNumber, 'street number').toLowerCase();

    // Remove accents
    result = translate(result, 'èéêëàáâôòóûùúïíîç', 'eeeeaaaooouuuiiic');

    // Replace umlauts
    result = globalReplace(result, 'ä', 'ae');
    result = globalReplace(result, 'ö', 'oe');
    result = globalReplace(result, 'ü', 'ue');

    // Remove quotes
    result = applyRules(result, QUOTE_REMOVAL_RULES);

    // Truncate at special characters
    for (const char of ['(', '&', '+', '/', '\\']) {
        const idx = result.indexOf(char);
        if (idx > 0) {
            result = result.substring(0, idx);
        }
    }

    result = globalReplace(result, ' ', '');

    return result;
}
