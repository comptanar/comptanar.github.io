// @ts-check

import { parse } from "yaml";

/**
 * Parse une chaîne YAML qui représente une liste
 *
 * @template T
 * @param {string} str le YAML à parser
 * @param {string} descriptionFormatAttendu une explication textuelle de ce qui est attendu (exemple : « une liste de factures »)
 * @param {(element: any) => boolean} prédicat valide le type de chaque élément de la liste
 * @param {((key, value) => unknown) | undefined} reviver? applique des transformations à chaque élément parsé
 * @returns {T[]} la liste parsée
 */
export function parseYamlArray(
  str,
  descriptionFormatAttendu,
  prédicat,
  reviver = undefined
) {
  if (str.trim() === "") return [];

  const parsed = reviver === undefined ? parse(str) : parse(str, reviver);

  if (Array.isArray(parsed) && parsed.every(prédicat)) return parsed;
  else {
    throw new TypeError(
      `Problème dans le format de fichier qui n'est pas reconnu (devrait être ${descriptionFormatAttendu}). Début du fichier:\n\n---\n${str.slice(
        0,
        100
      )}\n---`
    );
  }
}
