import { EffectDefinition, Settings, defaults, normalize } from './types.js';

/** Store the richest variant so hidden layer settings survive an A/B/C switch. */
export function mergeComparison(schema:EffectDefinition, previous:Settings, changes:Settings):Settings {
 return normalize(schema,{...defaults(schema),...previous,...changes});
}

export function comparisonVariants(variants:EffectDefinition[], shared:Settings):Record<string,Settings> {
 return Object.fromEntries(variants.map(effect=>[effect.id,normalize(effect,shared)]));
}
