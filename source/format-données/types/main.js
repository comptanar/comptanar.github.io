//@ts-check

/** @typedef {number} Montant */

/** @typedef { {identifiant: string} } Identifiable */
/** @typedef { {commentaire?: string} } Commentable */

/**
 * @typedef {Object} OpérationDeCompte
 * @property {string} compte
 * @property {Montant} montant
 * @property {'Crédit' | 'Débit'} sens
 * @property {string} [opérationHautNiveauCorrespondante] // identifiant OpérationHautNiveau
 * @property {any} [détails]
 */

/**
 * @typedef {Object} _BaseOpérationHautNiveau
 * @property {string} type
 * @property {Date} date
 * @property {OpérationDeCompte[]} [opérations]
 */

// https://www.economie.gouv.fr/cedef/taux-tva-france-et-union-europeenne
/**
 * @typedef { 'Non applicable' | 0 | 5.5 | 10 | 20 } TauxTVA
 */

/**
 * @typedef {_BaseOpérationHautNiveau & Identifiable & Commentable} BaseOpérationHautNiveau
 */

/**
 * @typedef {Object} LigneFacture
 * @property {string} compteProduit
 * @property {Montant} montantHT
 * @property {TauxTVA} tauxTVA
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
 * @property {string} [numéroFacture]
 *
 * @typedef {BaseOpérationHautNiveau & SpécifiquePaiementFactureClient} PaiementFactureClient
 */

/**
 * @typedef {Object} SpécifiqueRéceptionFactureFournisseur
 * @property {'Réception facture fournisseur'} type
 * @property {string} compteFournisseur
 * @property {LigneFacture[]} lignes
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
 * @property {Montant} rémunération
 * @property {Montant} cotisations
 * @property {Montant} prélèvementÀLaSource
 *
 *
 * @typedef {BaseOpérationHautNiveau & SpécifiqueÉmissionFicheDePaie} ÉmissionFicheDePaie
 */

/**
 * @typedef {Object} SpécifiqueLigneBancaire
 * @property {'Ligne bancaire'} type
 * @property {string} compteBancaire
 * @property {Montant} montant
 * @property {Date} date
 * @property {string} description
 *
 * @typedef {BaseOpérationHautNiveau & SpécifiqueLigneBancaire} LigneBancaire
 */

/** 
    @typedef {
        EnvoiFactureÀClient | 
        PaiementFactureClient |
        RéceptionFactureFournisseur |
        PaiementFactureFournisseur |
        ÉmissionFicheDePaie |
        LigneBancaire
    } OpérationHautNiveau
*/

/**
 * @typedef _Personne
 * @property {string} nom
 * @property {'Physique' | 'Morale'} type
 * @property {string} [adresse]
 * @property {number} [siret]
 * @property {string} [compteAssocié·e]
 * @property {string} [compteFournisseur]
 * @property {string} [compteClient]
 */

/** @typedef {_Personne & Identifiable & Commentable} Personne */

/**
 * @typedef {Object} _Salariat
 * @property {string} idPersonne
 * @property {Date} débutContrat
 * @property {Date} [finContrat]
 */

/** @typedef {_Salariat & Identifiable & Commentable} Salariat */

/**
 * @typedef {Object} _Membre
 * @property {string} idPersonne
 * @property {Date} débutPériode
 * @property {Date} [finPériode]
 */

/** @typedef {_Membre & Identifiable & Commentable} Membre */

/**
 * @template T
 * @typedef {{ sha: string | undefined, data: T }} WithSha<T>
 */
