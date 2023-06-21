// @ts-check

import { sum } from 'd3-array'
import { differenceInDays, differenceInMonths, formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function displayDate(date) {
    if (differenceInDays(date, new Date()) === 0) {
        return `Aujourd'hui`
    }

    return format(date, 'd MMMM yyyy', { locale: fr })
}

/** @type {(ops: OpérationDeCompte[]) => number} */
const sommeOpérations = (ops) => sum(ops.map(({ montant }) => montant));

const euroFormat = Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});
export const formatMontant = (montant) => euroFormat.format(montant);

export const afficherSommeOpérations = (ops) =>
  formatMontant(sommeOpérations(ops));

export const formatCompte = (préfixe, suffixe) =>
  (préfixe * Math.pow(10, 6 - préfixe.toString().length) + suffixe).toString();

export function libelleCompte(numCompte) {
  if (numCompte == "44566") {
    return "dépôt TVA";
  }

  if (numCompte.startsWith("3793")) {
    return "David";
  }

  if (numCompte.startsWith("93")) {
    return "Maïtanée";
  }

  if (numCompte.startsWith("34")) {
    return "Sabine";
  }

  return "";
}
