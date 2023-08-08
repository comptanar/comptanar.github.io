//@ts-check

/** @typedef {number} Montant */
/** @typedef {string} Compte */

/** @typedef { {identifiant: string} } Identifiable */
/** @typedef { {commentaire?: string} } Commentable */

/**
 * @typedef {Object} OpérationDeCompte
 * @property {Compte} compte
 * @property {Montant} montant
 * @property {'Crédit' | 'Débit'} sens
 * @property {OpérationHautNiveau["identifiant"]} [opérationHautNiveauCorrespondante]
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
 * @property {Compte} compteProduit
 * @property {Montant} montantHT
 * @property {TauxTVA} tauxTVA
 */

/**
 * @typedef {Object} SpécifiqueEnvoiFactureÀClient
 * @property {'Envoi facture à client'} type
 * @property {string} numéroFacture
 * @property {Compte} compteClient
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
 * @property {Compte} compteFournisseur
 * @property {LigneFacture[]} lignes
 *
 * @typedef {BaseOpérationHautNiveau & SpécifiqueRéceptionFactureFournisseur} RéceptionFactureFournisseur
 */

/**
 * @typedef {Object} SpécifiquePaiementFactureFournisseur
 * @property {'Paiement facture fournisseur'} type
 * @property {Compte} compteBancaire
 *
 * @typedef {BaseOpérationHautNiveau & SpécifiquePaiementFactureFournisseur} PaiementFactureFournisseur
 */

/**
 * @typedef {Object} SpécifiqueÉmissionFicheDePaie
 * @property {'Fiche de paie'} type
 * @property {Personne["identifiant"]} salarié·e
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
 * @property {Compte} compteBancaire
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
 * @property {string} [siret]
 * @property {Compte} [compteAssocié·e]
 * @property {Compte} [compteFournisseur]
 * @property {Compte} [compteClient]
 */

/** @typedef {_Personne & Identifiable & Commentable} Personne */

/**
 * @typedef {Object} _Salariat
 * @property {Personne["identifiant"]} idPersonne
 * @property {Date} débutContrat
 * @property {Date} [finContrat]
 */

/** @typedef {_Salariat & Identifiable & Commentable} Salariat */

/**
 * @typedef {Object} _Membre
 * @property {Personne["identifiant"]} idPersonne
 * @property {Date} débutPériode
 * @property {Date} [finPériode]
 */

/** @typedef {_Membre & Identifiable & Commentable} Membre */

/**
 * @template T
 * @typedef {{ sha: string | undefined, data: T }} WithSha<T>
 */
