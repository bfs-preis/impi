import { NormalizationRule, createReplacementRules } from './base-normalizer.js';

/**
 * French/Italian/German separator removal rules.
 * Shared between street and city normalization.
 */
export const SEPARATOR_RULES: NormalizationRule[] = createReplacementRules([
    [' de l\'', ' '],
    [' de la ', ' '],
    [' da la ', ' '],
    [' de ', ' '],
    [' des ', ' '],
    [' du ', ' '],
    [' da ', ' '],
    [' al ', ' '],
    [' ai ', ' '],
    [' d\'', ' '],
    [' della ', ' '],
    [' alla ', ' '],
    [' di ', ' '],
    [' delle ', ' '],
    [' del\'', ' '],
    [' del ', ' '],
    [' dei ', ' '],
    [' dell\'', ' '],
]);

/**
 * French/Italian/German preposition abbreviation rules.
 * Shared between street and city normalization.
 */
export const PREPOSITION_ABBREVIATION_RULES: NormalizationRule[] = createReplacementRules([
    ['petite ', 'pt '],
    ['petit ', 'pt '],
    ['grande ', 'gr '],
    ['grand ', 'gr '],
    ['santa ', 's '],
    ['sankt ', 'st '],
    ['saint ', 's '],
    ['sainte ', 'ste '],
    ['ancien ', 'anc '],
    ['ancienne ', 'anc '],
    ['alte ', 'alt '],
    ['alter ', 'alt '],
    ['altes ', 'alt '],
    ['alten ', 'alt '],
]);

/**
 * Common prefix removal rules.
 * Removes leading articles/prepositions from normalized strings.
 * Shared between street and city normalization.
 */
export const COMMON_PREFIX_REMOVAL: string[] = [
    'beim ',  // 5 chars — must come before 'bei '
    'les ',   // 4 chars
    'auf ',
    'aux ',
    'bei ',
    'der ',
    'die ',
    'das ',
    'zum ',
    'le ',    // 3 chars
    'la ',
    'en ',
    'da ',
    'im ',
    'in ',
    'ai ',
    'al ',
    'am ',
    'l\'',    // 2 chars
    'a ',
];

/**
 * Quote removal and cleanup rules.
 * Shared between street and city normalization.
 */
export const QUOTE_REMOVAL_RULES: NormalizationRule[] = createReplacementRules([
    ['\'', ' '],
    ['"', ' '],
]);
