// @ts-check

import { stringify } from 'yaml'

import { estPersonne } from './predicates'
import { parseYamlArray } from './utils'

/**
 * Une personne peut représenter une personne physique ou une personne morale
 */

/**
 * Parse un fichier YAML contenant une liste de personnes
 * @param {string} str 
 * @returns {Personne[]}
 */
export const parsePersonnes = (str) => parseYamlArray(str, 'une liste de personnes', estPersonne) 

/**
 * @param {Personne[]} personnes
 * @returns {string}
 */
export const stringifyPersonnesYaml = (personnes) => stringify(personnes)

/**
 * @returns {Personne}
 */
export function créerPersonneVide() {
    return {
        identifiant: Math.random().toString(32).slice(2),
        nom: '',
        type: 'Physique',
        adresse: null,
        compteAssocié·e: null,
        compteClient: null,
        compteFournisseur: null,
        comptePersonnel: null,
        siret: null,
    }
}