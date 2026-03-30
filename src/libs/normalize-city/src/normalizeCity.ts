import {
    globalReplace, translate, validateStringInput, applyRules,
    SEPARATOR_RULES, PREPOSITION_ABBREVIATION_RULES, COMMON_PREFIX_REMOVAL, QUOTE_REMOVAL_RULES,
    NormalizationRule
} from 'normalize-common';

/**
 * City-specific truncation rules.
 * Truncate at positional prepositions (sur, sous, pres, etc.).
 */
const CITY_TRUNCATION_RULES: NormalizationRule[] = [
    ' sur ', ' sous ', ' pres ', ' en ', ' devant ', ' sopra ',
    ' in ', ' im ', ' bei ', ' am ', ' an ',
    ' l\' ', ' le ', ' la ', ' les ',
    ' b ', ' a ', ' i ', ' s ', ' san ', ' p ', ' pr ', ' e ', ' l '
].map(search => ({ type: 'truncateAt' as const, search }));

export function normalizeCity(city: string): string {
    const validatedCity = validateStringInput(city, 'city');
    let result = validatedCity.toLowerCase();

    // Remove accents
    result = translate(result, 'èéêëàáâôòóûùúïíîç', 'eeeeaaaooouuuiiic');

    // Replace umlauts
    result = globalReplace(result, 'ä', 'ae');
    result = globalReplace(result, 'ö', 'oe');
    result = globalReplace(result, 'ü', 'ue');

    // Remove punctuation (city includes more chars than street)
    result = translate(result, '.,;:-/+&', '        ');

    // Remove separators (shared)
    result = applyRules(result, SEPARATOR_RULES);

    // City-specific truncation at positional prepositions
    result = applyRules(result, CITY_TRUNCATION_RULES);

    // Preposition abbreviations (shared)
    result = applyRules(result, PREPOSITION_ABBREVIATION_RULES);

    // Remove leading prefixes (shared)
    // Apply repeatedly — multiple prefixes may chain
    let prefixRemoved = true;
    while (prefixRemoved) {
        prefixRemoved = false;
        for (const prefix of COMMON_PREFIX_REMOVAL) {
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
        result = result.substring(0, parenIndex - 1);
    }

    result = result.trim();
    result = globalReplace(result, ' ', '');

    return result;
}
