import { defaults, normalize } from './types.js';
/** Store the richest variant so hidden layer settings survive an A/B/C switch. */
export function mergeComparison(schema, previous, changes) {
    return normalize(schema, { ...defaults(schema), ...previous, ...changes });
}
export function comparisonVariants(variants, shared) {
    return Object.fromEntries(variants.map(effect => [effect.id, normalize(effect, shared)]));
}
