//@ts-check

import { sum } from 'd3-array'
import './types/main.js'

const calculMontantHT = lignes => sum(lignes.map(l => l.montantHT))

const calculTVA = lignes =>
  sum(lignes.map(l => (l.montantHT * l.tauxTVA) / 100))

/**
 * @param {EnvoiFactureÀClient} efc
 * @returns {OpérationDeCompte[]}
 */
function traduireEnvoiFactureÀClientEnOpérationsDeCompte(efc) {
  //gérer cas facture vide ??
  if (efc.lignes.length == 0) {
    return []
  }

  //opération client
  /** @type {OpérationDeCompte} */
  const op = {
    compte: efc.compteClient, //gérer cas compte vide
    montant: calculMontantHT(efc.lignes),
    sens: 'Débit',
  }
  //opération TVA
  /** @type {OpérationDeCompte} */
  const opTVA = {
    compte: '44566',
    montant: calculTVA(efc.lignes),
    sens: 'Crédit',
  }
  return [op, opTVA]
}

/**
 * @param {RéceptionFactureFournisseur} rff
 * @returns {OpérationDeCompte[]}
 */
function traduireRécéptionFactureFournisseurEnOpérationsDeCompte(rff) {
  /** @type {OpérationDeCompte} */
  const op = {
    compte: rff.compteFournisseur,
    montant: sum(rff.opérations.map(op => op.montant)),
    sens: 'Crédit',
  }

  return [op]
}

/**
 * @param {PaiementFactureFournisseur} rff
 * @returns {OpérationDeCompte[]}
 */
function traduirePaiementFactureFournisseurEnOpérationsDeCompte(rff) {
  /** @type {OpérationDeCompte} */
  const op = {
    compte: rff.compteBancaire,
    montant: sum(rff.opérations.map(op => op.montant)),
    sens: 'Crédit',
  }

  return [op].concat(rff.opérations)
}

/**
 * @param {ÉmissionFicheDePaie} efp
 * @returns {OpérationDeCompte[]}
 */
function traduireÉmissionFicheDePaieEnOpérationsDeCompte(efp) {
  let res = []
  efp.opérations?.forEach(ligneOp => {
    /** @type {OpérationDeCompte} */
    const op = {
      compte: ligneOp.compte,
      montant: ligneOp.montant,
      sens: 'Crédit',
    }

    res.push(op)
  })
  return res
}

/**
 * @param {OpérationHautNiveau[]} opérationsHautNiveau
 * @returns {OpérationDeCompte[]}
 */
export default opérationsHautNiveau => {
  /** @type {OpérationDeCompte[]} */
  let result = []

  for (const ophn of opérationsHautNiveau) {
    let newOps
    switch (ophn.type) {
      case 'Envoi facture à client':
        newOps = traduireEnvoiFactureÀClientEnOpérationsDeCompte(ophn)
        break
      case 'Paiement facture client':
        throw 'pas implémenté'
        break
      case 'Réception facture fournisseur':
        newOps = traduireRécéptionFactureFournisseurEnOpérationsDeCompte(ophn)
        break
      case 'Paiement facture fournisseur':
        newOps = traduirePaiementFactureFournisseurEnOpérationsDeCompte(ophn)
        break
      case 'Fiche de paie':
        newOps = traduireÉmissionFicheDePaieEnOpérationsDeCompte(ophn)
        break

      default:
        /** @type {never} */
        const _exhaustiveCheck = ophn
        return _exhaustiveCheck
    }
    result = result.concat(newOps)
    //console.log(ophn, newOps)
  }

  return result
}
