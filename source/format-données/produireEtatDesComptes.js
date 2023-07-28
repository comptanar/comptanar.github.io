//@ts-check

import {
  isActif,
  isPassif,
  isCompteDeTiers,
  isCharge,
  isProduit,
} from './comptabilité/planDeCompte.js'

import '../format-données/types/main.js'

/**
 * 
Un compte d’actif augmente avec un débit et diminue avec un crédit.
Un compte de passif augmente avec un crédit diminue avec un débit.
Un compte de charges augmente avec un débit diminue avec un crédit.
Un compte de produits augmente avec un crédit diminue avec un débit.

 * @param {OpérationDeCompte[]} opérationsDeCompte 
 * @returns {Map<string, number>}
 */
export default opérationsDeCompte => {
  /** @type {Map<string, number>} */
  const étatDesComptes = new Map()
  console.log(opérationsDeCompte)

  for (const { sens, compte, montant } of opérationsDeCompte) {
    if (compte == undefined || compte == '') {
      throw new Error('Nom de compte vide')
    }

    const montantActuel = étatDesComptes.get(compte) || 0

    if (isActif(compte) || isCharge(compte)) {
      if (sens === 'Débit') étatDesComptes.set(compte, montantActuel + montant)
      else étatDesComptes.set(compte, montantActuel - montant)
    } else {
      if (isPassif(compte) || isProduit(compte) || isCompteDeTiers(compte)) {
        if (sens === 'Crédit')
          étatDesComptes.set(compte, montantActuel + montant)
        else étatDesComptes.set(compte, montantActuel - montant)
      } else {
        throw new Error(`Compte inconnu: ${compte}`)
      }
    }
  }

  return étatDesComptes
}
