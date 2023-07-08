//@ts-check

/**
 * @typedef {Object} OpérationDeCompte
 * @property {string} compte
 * @property {number} montant
 * @property {'Crédit' | 'Débit'} sens
 * @property {string} [opérationHautNiveauCorrespondante] // identifiant OpérationHautNiveau
 * @property {any} [détails]
 */

/**
 * @typedef {Object} BaseOpérationHautNiveau
 * @property {string} identifiantOpération
 * @property {string} type
 * @property {Date} date
 * @property {OpérationDeCompte[]} [opérations]
 */

/**
 * @typedef {Object} LigneFacture
 * @property {string} compteProduit
 * @property {number} montantHT
 * @property {number} tauxTVA
 */

/**
 * @typedef {Object} SpécifiqueEnvoiFactureÀClient
 * @property {'Envoi facture à client'} type
 * @property {string} numéroFacture
 * @property {string} compteClient
 * @property {LigneFacture[]} lignes
 *
 * @typedef {BaseOpérationHautNiveau & SpécifiqueEnvoiFactureÀClient} EnvoiFactureÀClient
 */

/**
 * @typedef {Object} SpécifiquePaiementFactureClient
 * @property {'Paiement facture client'} type
 * @property {string=} numéroFacture
 *
 * @typedef {BaseOpérationHautNiveau & SpécifiquePaiementFactureClient} PaiementFactureClient
 */

/**
 * @typedef {Object} SpécifiqueRéceptionFactureFournisseur
 * @property {'Réception facture fournisseur'} type
 * @property {string} compteFournisseur
 *
 * @typedef {BaseOpérationHautNiveau & SpécifiqueRéceptionFactureFournisseur} RéceptionFactureFournisseur
 */

/**
 * @typedef {Object} SpécifiquePaiementFactureFournisseur
 * @property {'Paiement facture fournisseur'} type
 * @property {string} compteBancaire
 *
 * @typedef {BaseOpérationHautNiveau & SpécifiquePaiementFactureFournisseur} PaiementFactureFournisseur
 */

/**
 * @typedef {Object} SpécifiqueÉmissionFicheDePaie
 * @property {'Fiche de paie'} type
 * @property {string} salarié·e // identifiant de personne
 * @property {Date} débutPériode
 * @property {Date} finPériode
 * @property {number} rémunération
 * @property {number} cotisations
 * @property {number} prélèvementÀLaSource
 *
 *
 * @typedef {BaseOpérationHautNiveau & SpécifiqueÉmissionFicheDePaie} ÉmissionFicheDePaie
 */

/** 
    @typedef {
        EnvoiFactureÀClient | 
        PaiementFactureClient |
        RéceptionFactureFournisseur |
        PaiementFactureFournisseur |
        ÉmissionFicheDePaie
    } OpérationHautNiveau
*/

/**
 * @typedef Personne
 * @property {string} nom
 * @property {string} identifiant
 * @property {'Physique' | 'Morale'} type
 * @property {string?} adresse
 * @property {number?} siret
 * @property {string?} compteAssocié·e
 * @property {string?} compteFournisseur
 * @property {string?} compteClient
 */

/**
 * @typedef {Object} Salariat
 * @property {string} idPersonne
 * @property {string} identifiant
 * @property {Date} débutContrat
 * @property {Date?} finContrat
 */

/**
 * @typedef {Object} Membre
 * @property {string} idPersonne
 * @property {string} identifiant
 * @property {Date} débutPériode
 * @property {Date?} finPériode
 */

/**
 * @template T
 * @typedef {{ sha: string | undefined, data: T }} WithSha<T>
 */
