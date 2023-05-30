//@ts-check

import { stringify } from 'yaml'

import { isOpérationHautNiveau } from './predicates.js';
import { parseYamlArray } from './utils.js';


/**
 * @param {string} str
 * @returns {OpérationHautNiveau[]}
 */
export const parseOpérationsHautNiveauYaml = (str) => parseYamlArray(
    str,
    'une liste d\'opérations de haut niveau',
    isOpérationHautNiveau,
    (key, value) => {
        if ((key === 'date' || key === 'débutPériode' || key === 'finPériode') && typeof value === 'string'){
            return new Date(value)
        }

        return value
    },
)

/**
 * @param {OpérationHautNiveau[]} ops
 * @returns {string}
 */
export function stringifyOpérationsHautNiveauYaml(ops){
    return stringify(ops)
}

/**
 * @returns {EnvoiFactureClient}
 */
export function créerEnvoiFactureÀClientVide() {
    return {
        type: 'Envoi facture client',
        numéroFacture: '',
        date: new Date(),
        compteClient: '',
        identifiantOpération: Math.random().toString(32).slice(2),
        lignes: [
            {
                compteProduit: '',
                montantHT: 0,
                tauxTVA: 0
            }
        ],
        opérations: [
            {
                compte: '44566', // TVA
                montant: 0,
                sens: 'Débit'
            }
        ]
    }
}

/**
 * @returns {ÉmissionFicheDePaie}
 */
export function créerFicheDePaieVide(){
    const date = new Date()
    return {
        type: 'Fiche de paie',
        date,
        débutPériode: date,
        finPériode: date,
        identifiantOpération: Math.random().toString(32).slice(2),
        opérations: []
    }
}

/**
 * 
 * @returns {RéceptionFactureFournisseur}
 */
export function créerAchatVide() {
    const date = new Date()
    return {
        type: 'Réception facture fournisseur',
        compteFournisseur: '',
        date,
        opérations: [
            {
                compte: '',
                montant: 0,
                sens: 'Crédit'
            },
        ],
        identifiantOpération: Math.random().toString(32).slice(2),
    }
}