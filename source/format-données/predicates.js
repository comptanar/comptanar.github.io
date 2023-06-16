//@ts-check

import './types/main.js'

/**
 * @param {any} op
 * @returns {op is OpérationDeCompte}
 */
export function isOpérationDeCompte(op) {
    return Object(op) === op &&
        typeof op.compte === 'string' &&
        Number.isFinite(op.montant) &&
        op.sens === 'Crédit' || op.sens === 'Débit';
}

/**
 * @param {any} op
 * @returns {op is BaseOpérationHautNiveau}
 */
function isBaseOpérationHautNiveau(op) {
    return Object(op) === op &&
        typeof op.identifiantOpération === 'string' &&
        typeof op.type === 'string' &&
        op.date instanceof Date && // maybe weak, but it's complicated to find a better test for now
        !op.opérations || (Array.isArray(op.opérations) && op.opérations.every(isOpérationDeCompte))
}



/**
 * @param {any} op
 * @returns {op is OpérationHautNiveau}
 */
export function isOpérationHautNiveau(op) {
    return isBaseOpérationHautNiveau(op) // faux ; PPP à raffiner plus tard
}

/**
 * @param {any} p
 * @returns {p is Personne}
 */
export function estPersonne(p) {
    return Object(p) === p &&
        typeof p.nom === 'string' &&
        typeof p.identifiant === 'string' &&
        typeof p.type === 'string' &&
        (p.type === 'Physique' || p.type === 'Morale') &&
        (!p.adresse || typeof p.adresse === 'string') &&
        (!p.siret || (typeof p.siret === 'string' && p.type === 'Morale')) &&
        (!p.compteAssocié·e || typeof p.compteAssocié·e === 'string') &&
        (!p.compteFournisseur || typeof p.compteFournisseur === 'string') &&
        (!p.compteClient || typeof p.compteClient === 'string')
}

/**
 * @param {any} s
 * @returns {s is Salarié·e}
 */
export function estSalarié·e(s) {
    return Object(s) === s &&
        s.débutContrat instanceof Date && !isNaN(s.débutContrat) &&
        s.finContrat !== null ? s.finContrat instanceof Date && !isNaN(s.finContrat) : true &&
    typeof s.idPersonne === 'string'
}

/**
 * 
 * @param {any} m
 * @returns {m is Membre}
 */
export function estMembre(m) {
    return Object(m) === m &&
        m.débutPériode instanceof Date && !isNaN(m.débutPériode) &&
        m.finPériode !== null ? m.finPériode instanceof Date && !isNaN(m.finPériode) : true &&
    typeof m.idPersonne === 'string'
}
