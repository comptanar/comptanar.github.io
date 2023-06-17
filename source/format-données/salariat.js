// @ts-check


import { stringify } from 'yaml'

import { estSalariat } from './predicates'
import { parseYamlArray } from './utils'

export const parseSalariat = (str) => parseYamlArray(str, 'une liste de contrats de salariat', estSalariat) 
export const stringifySalariatsYaml = (s) => stringify(s)

/**
 * @returns {Salariat}
 */
export function créerSalariatVide() {
    return {
        idPersonne: '',
        identifiant: Math.random().toString(32).slice(2),
        débutContrat: new Date(),
        finContrat: null,
    }
}