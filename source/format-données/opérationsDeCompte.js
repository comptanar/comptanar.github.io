//@ts-check

import { stringify } from 'yaml'

import { isOpérationDeCompte } from './predicates.js'
import { parseYamlArray } from './utils.js'
/**
 * @param {string} str
 * @returns {OpérationDeCompte[]}
 */
export const parseOpérationsDeCompteYaml = str =>
  parseYamlArray(str, "une liste d'opérations de compte", isOpérationDeCompte)

/**
 * @param {OpérationDeCompte[]} o
 * @return {string}
 */
export const stringifyOpérationsDeCompteYaml = o => stringify(o)
