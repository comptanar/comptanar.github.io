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
 * @typedef {Object} SpécifiqueEnvoiFactureClient
 * @property {'Envoi facture client'} type
 * @property {string} numéroFacture
 * @property {string} compteClient
 * @property {LigneFacture[]} lignes
 *
 * @typedef {BaseOpérationHautNiveau & SpécifiqueEnvoiFactureClient} EnvoiFactureClient
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
 * @property {Date} débutPériode
 * @property {Date} finPériode
 *
 * @typedef {BaseOpérationHautNiveau & SpécifiqueÉmissionFicheDePaie} ÉmissionFicheDePaie
 */

/**
 * @typedef {Object} SpécifiqueAchat
 * @property {'Achat'} type
 * @property {string} motif
 *
 * @typedef {BaseOpérationHautNiveau & SpécifiqueAchat} Achat
 */

/** 
    @typedef {
        EnvoiFactureClient | 
        PaiementFactureClient |
        RéceptionFactureFournisseur |
        PaiementFactureFournisseur |
        ÉmissionFicheDePaie |
        Achat
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
