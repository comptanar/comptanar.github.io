//@ts-check

import { sum } from "d3-array";
import "./types/main.js";

function calculMontantHT(lignes) {
  let sommeMontant = 0;
  lignes.forEach((ligne) => {
    sommeMontant += ligne.montantHT;
  });
  return sommeMontant;
}

function calculTVA(lignes) {
  let sommeTVA = 0;
  lignes.forEach((ligne) => {
    sommeTVA += (ligne.montantHT * ligne.tauxTVA) / 100;
  });
  return sommeTVA;
}

/**
 * @param {EnvoiFactureClient} efc
 * @returns {OpérationDeCompte[]}
 */
function traduireEnvoiFactureClientEnOpérationsDeCompte(efc) {
  //gérer cas facture vide ??
  if (efc.lignes.length == 0) {
    return [];
  }

  //opération client
  /** @type {OpérationDeCompte} */
  const op = {
    compte: efc.compteClient, //gérer cas compte vide
    montant: calculMontantHT(efc.lignes),
    sens: "Débit",
  };
  //opération TVA
  /** @type {OpérationDeCompte} */
  const opTVA = {
    compte: "44566",
    montant: calculTVA(efc.lignes),
    sens: "Crédit",
  };
  return [op, opTVA];
}

/**
 * @param {RéceptionFactureFournisseur} rff
 * @returns {OpérationDeCompte[]}
 */
function traduireRécéptionFactureFournisseurEnOpérationsDeCompte(rff) {
  /** @type {OpérationDeCompte} */
  const op = {
    compte: rff.compteFournisseur,
    montant: sum(rff.opérations.map((op) => op.montant)),
    sens: "Crédit",
  };

  return [op].concat(rff.opérations);
}

/**
 * @param {PaiementFactureFournisseur} rff
 * @returns {OpérationDeCompte[]}
 */
function traduirePaiementFactureFournisseurEnOpérationsDeCompte(rff) {
  /** @type {OpérationDeCompte} */
  const op = {
    compte: rff.compteBancaire,
    montant: sum(rff.opérations.map((op) => op.montant)),
    sens: "Crédit",
  };

  return [op].concat(rff.opérations);
}

/**
 * @param {Achat} a
 * @returns {OpérationDeCompte[]}
 */
function traduireAchatEnOpérationsDeCompte(a) {
  /** @type {OpérationDeCompte} */
  const op = {
    compte: a.opérations[0].compte,
    montant: sum(a.opérations.map((op) => op.montant)),
    sens: "Crédit",
  };

  return [op].concat(a.opérations);
}

/**
 * @param {ÉmissionFicheDePaie} efp
 * @returns {OpérationDeCompte[]}
 */
function traduireÉmissionFicheDePaieEnOpérationsDeCompte(efp) {
  let res = [];
  efp.opérations?.forEach((ligneOp) => {
    /** @type {OpérationDeCompte} */
    const op = {
      compte: ligneOp.compte,
      montant: ligneOp.montant,
      sens: "Crédit",
    };

    res.push(op);
  });
  return res;
}

/**
 * @param {OpérationHautNiveau[]} opérationsHautNiveau
 * @returns {OpérationDeCompte[]}
 */
export default (opérationsHautNiveau) => {
  /** @type {OpérationDeCompte[]} */
  let result = [];

  for (const ophn of opérationsHautNiveau) {
    let newOps;
    switch (ophn.type) {
      case "Envoi facture client":
        newOps = traduireEnvoiFactureClientEnOpérationsDeCompte(ophn);
        break;
      case "Paiement facture client":
        throw "pas implémenté";
        break;
      case "Réception facture fournisseur":
        newOps = traduireRécéptionFactureFournisseurEnOpérationsDeCompte(ophn);
        break;
      case "Paiement facture fournisseur":
        newOps = traduirePaiementFactureFournisseurEnOpérationsDeCompte(ophn);
        break;
      case "Achat":
        newOps = traduireAchatEnOpérationsDeCompte(ophn);
        break;
      case "Fiche de paie":
        newOps = traduireÉmissionFicheDePaieEnOpérationsDeCompte(ophn);
        break;

      default:
        /** @type {never} */
        const _exhaustiveCheck = ophn;
        return _exhaustiveCheck;
    }
    result = result.concat(newOps);
    //console.log(ophn, newOps)
  }

  return result;
};
