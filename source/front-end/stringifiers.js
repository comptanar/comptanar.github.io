// @ts-check

import { sum } from 'd3-array'
import { differenceInDays, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import store from './store.js'
import { initCompteSiBesoin } from './actions.js'

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

/** @type {(ops: OpérationDeCompte[]) => number} */
const sommeOpérations = ops => sum(ops.map(({ montant }) => montant))

const euroFormat = Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})
export const formatMontant = montant => euroFormat.format(montant)

export const afficherSommeOpérations = ops =>
  formatMontant(sommeOpérations(ops))

export const formatCompte = (préfixe, suffixe) =>
  (préfixe * Math.pow(10, 6 - préfixe.toString().length) + suffixe).toString()

export function libelleCompte(numCompte) {
  if (numCompte === '44566') {
    return 'dépôt TVA'
  }
  for (const personne of store.state.personnes.data) {
    if (personne.compteAssocié·e == undefined) {
      initCompteSiBesoin(personne, 'compteAssocié·e', '641')
    }
    if (numCompte === personne.compteAssocié·e) {
      return personne.nom
    }
  }
  return ''
}
