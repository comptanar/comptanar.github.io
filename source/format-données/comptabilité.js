//@ts-check

/**

Ce fichier traduit en code des contraintes du Plan Général de Comptabilité
https://www.anc.gouv.fr/sites/anc/accueil/normes-francaises/reglementation-sectorielle.html

Il s'agit de contraintes légales, ou de conventions comptables

*/

import { sum } from 'd3-array'

import './types/main.js'

/**
 * === Plan comptable - comptes ===
 */

const PRÉFIXE_COMPTE_CLIENT_VENTES = '4111C'

const SUFFIXE_COMPTE_POSSIBLES = ['1', '2', '3', '4', '5', '6', '7']

function suffixeEstValide(str) {
  return [...str].every(char => SUFFIXE_COMPTE_POSSIBLES.includes(char))
}

function prochainSuffixe(précédent) {
  if (!précédent) {
    return SUFFIXE_COMPTE_POSSIBLES[0]
  }

  const précédentNombre = parseInt(précédent)
  let candidat = précédentNombre + 1

  while (!suffixeEstValide(candidat.toString(10))) {
    candidat++
  }

  return candidat
}

/**
 *
 * @param {string[]} compteClientsExistants
 * @returns
 */
export function créerProchainCompteClient(compteClientsExistants) {
  const suffixes = compteClientsExistants.map(compte =>
    compte.slice(PRÉFIXE_COMPTE_CLIENT_VENTES.length),
  )
  console.log('suffixes', suffixes)

  suffixes.sort((s1, s2) => parseInt(s2) - parseInt(s1))

  return PRÉFIXE_COMPTE_CLIENT_VENTES + prochainSuffixe(suffixes[0])
}

/**
 * === TVA ===
 */

/** @type {Set<TauxTVA>} */
export const tauxTVAPossibles = new Set([20, 10, 5.5, 0, 'Non applicable'])

/**
 * @param {TauxTVA} tva
 * @returns {number}
 */
export function tauxTVAEnNombre(tva) {
  if (tva === 'Non applicable') {
    return 0
  }
  if (Number.isFinite(tva)) {
    return tva / 100
  }

  throw new TypeError(`Taux de TVA non géré: ${tva} (${typeof tva})`)
}

export function arrondirMontant(montant) {
  return Math.round(montant * 100) / 100
}

/**
 *
 * @param {LigneFacture} _
 * @returns {number}
 */
export function calculTVALigne({ montantHT, tauxTVA }) {
  return arrondirMontant(montantHT * tauxTVAEnNombre(tauxTVA))
}

/**
 *
 * @param {LigneFacture} ligneFacture
 * @returns {number}
 */
export function calculTTCLigne(ligneFacture) {
  return ligneFacture.montantHT + calculTVALigne(ligneFacture)
}

/**
 * Cette fonction fait ce qu'elle peut pour approximer le taux de TVA
 * en faisant notamment l'hypothèse que le taux de TVA ne peut avoir qu'un seul chiffre après la virgule
 * (genre 5,5%)
 *
 * @param {number} montantTVA
 * @param {number} montantHT
 * @returns {number}
 */
export function déduireTauxTVA(montantHT, montantTVA) {
  if (montantHT === 0) {
    return 0
  }
  return Number(((montantTVA * 100) / montantHT).toFixed(1))
}

/**
 * @param {EnvoiFactureÀClient | RéceptionFactureFournisseur} _
 * @returns {number}
 */
export function calculHTFacture({ lignes }) {
  return sum(lignes.map(({ montantHT }) => montantHT))
}

/**
 * @param {EnvoiFactureÀClient | RéceptionFactureFournisseur} _
 * @returns {number}
 */
export function calculTVAFacture({ lignes }) {
  return sum(lignes.map(calculTVALigne))
}

/**
 * @param {EnvoiFactureÀClient | RéceptionFactureFournisseur} _
 * @returns {number}
 */
export function calculTTCFacture({ lignes }) {
  return sum(lignes.map(calculTTCLigne))
}
