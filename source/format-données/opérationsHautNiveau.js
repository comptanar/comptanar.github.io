//@ts-check

import { stringify } from 'yaml'

import { isOpérationHautNiveau } from './predicates.js'
import { parseYamlArray } from './utils.js'

import './types/main.js'

/**
 * @param {string} str
 * @returns {OpérationHautNiveau[]}
 */
export const parseOpérationsHautNiveauYaml = str =>
  parseYamlArray(
    str,
    "une liste d'opérations de haut niveau",
    isOpérationHautNiveau,
    (key, value) => {
      if (
        (key === 'date' || key === 'débutPériode' || key === 'finPériode') &&
        typeof value === 'string'
      ) {
        return new Date(value)
      }

      return value
    },
  )

/**
 * @param {OpérationHautNiveau[]} ops
 * @returns {string}
 */
export function stringifyOpérationsHautNiveauYaml(ops) {
  return stringify(ops)
}

/**
 * @returns {EnvoiFactureÀClient}
 */
export function créerEnvoiFactureÀClientVide() {
  return {
    type: 'Envoi facture à client',
    numéroFacture: '',
    date: new Date(),
    compteClient: '',
    identifiant: Math.random().toString(32).slice(2),
    lignes: [
      {
        compteProduit: '',
        montantHT: 0,
        tauxTVA: 'Non applicable',
      },
    ],
  }
}

/**
 * @returns {ÉmissionFicheDePaie}
 */
export function créerFicheDePaieVide() {
  const date = new Date()
  return {
    type: 'Fiche de paie',
    date,
    débutPériode: date,
    finPériode: date,
    identifiant: Math.random().toString(32).slice(2),
    salarié·e: '',
    rémunération: NaN,
    cotisations: NaN,
    prélèvementÀLaSource: NaN,
  }
}

/**
 *
 * @returns {RéceptionFactureFournisseur}
 */
export function créerAchatVide() {
  return {
    type: 'Réception facture fournisseur',
    identifiant: Math.random().toString(32).slice(2),
    compteFournisseur: '',
    date: new Date(),
    lignes: [
      {
        compteProduit: '',
        montantHT: 0,
        tauxTVA: 'Non applicable',
      },
    ],
  }
}

/**
 *
 * @returns {LigneBancaire}
 */
export function créerLigneBancaireVide() {
  const date = new Date()
  return {
    identifiant: Math.random().toString(32).slice(2),
    type: 'Ligne bancaire',
    date,
    compteBancaire: '',
    description: '',
    montant: 0,
  }
}
