// @ts-check

import { sum } from 'd3-array'
import { differenceInDays, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import store from './store.js'

/**
 *
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
  return format(date, 'd MMMM yyyy', { locale: fr })
}

/**
 *
 * @param {Date} date
 * @returns {string}
 */
export function displayDate(date) {
  if (differenceInDays(date, new Date()) === 0) {
    return `Aujourd'hui`
  }

  return formatDate(date)
}

const euroFormat = Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})
/**
 *
 * @param {number} montant
 */
export const formatMontant = montant => {
  if (Number.isFinite(montant)) return euroFormat.format(montant)
  else return '-'
}

/**
 * 
 * @param {string} numCompte 
 * @returns {string}
 */
export function libelleCompte(numCompte) {
  if (numCompte === '44566') {
    return 'dépôt TVA'
  }
  for (const personne of store.state.personnes.data) {
    if (numCompte === personne.compteAssocié·e) {
      return personne.nom
    }
  }
  return ''
}
