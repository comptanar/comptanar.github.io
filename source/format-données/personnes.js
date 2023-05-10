// @ts-check

import { parse, stringify } from 'yaml'

import { isPersonne } from './predicates'

/**
 * Une personne peut représenter une personne physique ou une personne morale
 */

/**
 * Parse un fichier YAML contenant une liste de personnes
 * @param {string} str 
 * @returns 
 */
export function parsePersonnes(str) {
    if(str.trim() === '')
        return [];

    const parsed = parse(str);

    if(Array.isArray(parsed) && parsed.every(isPersonne)) 
        return parsed
    else{
        throw new TypeError(
            `Problème dans le format de fichier qui n'est pas reconnu (devrait être une liste de personnes). Début du fichier:\n\n---\n${str.slice(0, 100)}\n---`
        )
    }
}

/**
 * @param {Personne[]} personnes 
 * @returns {string}
 */
export function stringifyPersonnesYaml(personnes) {
    return stringify(personnes)
}