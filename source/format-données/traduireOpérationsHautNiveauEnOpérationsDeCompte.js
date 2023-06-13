//@ts-check

import { sum } from "d3-array";
import "./types/main.js";

/**
 * @param {EnvoiFactureClient} efc
 * @returns {OpérationDeCompte[]}
 */
function traduireEnvoiFactureClientEnOpérationsDeCompte(efc) {
  let sommeMontant = 0;
  let sommeTVA = 0;
  console.log("lignes", efc.lignes);
  efc.lignes.forEach((ligne) => {
    console.log("ligne", ligne);
    sommeMontant += ligne.montantHT;
    sommeTVA += (ligne.montantHT * ligne.tauxTVA) / 100;
  });
  //opération client
  /** @type {OpérationDeCompte} */
  const op = {
    compte: efc.compteClient, // --> PB : string alors que nb attendu pour le nb compte
    montant: sommeMontant, //sum(efc.opérations.map((op) => op.montant)) --> PB : opérations est undefined
    sens: "Débit",
  };
  //opération TVA
  /** @type {OpérationDeCompte} */
  const opTVA = {
    compte: "44566",
    montant: sommeTVA,
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
