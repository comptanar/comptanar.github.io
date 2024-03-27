// @ts-check

import { stringify } from 'yaml'

import { estSalariat } from './predicates'
import { parseYamlArray } from './utils'

/**
 * 
 * @param {string} str 
 * @returns {Salariat[]}
 */ 
export const parseSalariats = str =>
  parseYamlArray(
    str,
    'une liste de contrats de salariat',
    estSalariat,
    (key, value) => {
      if (
        (key === 'débutContrat' || key === 'finContrat') &&
        typeof value === 'string'
      ) {
        return new Date(value)
      }

      return value
    },
  )

/**
 * 
 * @param {Salariat[]} s 
 * @returns {string}
 */
export const stringifySalariatsYaml = s => stringify(s)

/**
 * @returns {Salariat}
 */
export function créerSalariatVide() {
  return {
    idPersonne: '',
    identifiant: Math.random().toString(32).slice(2),
    débutContrat: new Date(),
    finContrat: undefined,
  }
}
