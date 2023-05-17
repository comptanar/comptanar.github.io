// @ts-check


import { stringify } from 'yaml'

import { estSalarié·e } from './predicates'
import { parseYamlArray } from './utils'

export const parseSalarié·es = (str) => parseYamlArray(str, 'une liste de salarié⋅es', estSalarié·e) 
export const stringifySalarié·esYaml = (s) => stringify(s)

/**
 * @returns {Salarié·e}
 */
export function créerSalarié·eVide() {
    return {
        idPersonne: '',
        suffixeCompte: 0,
        identifiant: Math.random().toString(32).slice(2),
    }
}