//@ts-check

import { parse, stringify } from 'yaml'

import { isOpérationHautNiveau } from './predicates.js';
import { parseArray } from './utils.js';


/**
 * @param {string} str
 * @returns {OpérationHautNiveau[]}
 */
export const parseOpérationsHautNiveauYaml = (str) => parseArray(
    str,
    'une liste d\'opérations de haut niveau',
    isOpérationHautNiveau,
    (key, value) => {
        if ((key === 'date' || key === 'débutPériode' || key === 'finPériode') && typeof value === 'string'){
            return new Date(value)
        }

        return value
    },
)

/**
 * @param {OpérationHautNiveau[]} ops
 * @returns {string}
 */
export function stringifyOpérationsHautNiveauYaml(ops){
    return stringify(ops)
}

