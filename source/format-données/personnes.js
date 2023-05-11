// @ts-check

import { parse, stringify } from 'yaml'

import { isPersonne } from './predicates'
import { parseArray } from './utils'

/**
 * Une personne peut représenter une personne physique ou une personne morale
 */

/**
 * Parse un fichier YAML contenant une liste de personnes
 * @param {string} str 
 * @returns {Personne[]}
 */
export const parsePersonnes = (str) => parseArray(str, 'une liste de personnes', isPersonne) 

/**
 * @param {Personne[]} personnes
 * @returns {string}
 */
export const stringifyPersonnesYaml = (personnes) => stringify(personnes)