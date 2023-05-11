// @ts-check

import { parse } from 'yaml'

export function parseArray(str, description, check, reviver) {
    if(str.trim() === '')
        return [];

    const parsed = parse(str, reviver);

    if(Array.isArray(parsed) && parsed.every(check)) 
        return parsed
    else{
        throw new TypeError(
            `Problème dans le format de fichier qui n'est pas reconnu (devrait être ${description}). Début du fichier:\n\n---\n${str.slice(0, 100)}\n---`
        )
    }
}