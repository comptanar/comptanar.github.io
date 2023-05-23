//@ts-check

import './types/types.js'

/**
 * @param {any} op
 * @returns {op is OpérationDeCompte}
 */
export function isOpérationDeCompte(op){
    return Object(op) === op &&
        typeof op.compte === 'string' &&
        Number.isFinite(op.montant) && 
        op.sens === 'Crédit' || op.sens === 'Débit';
}

/**
 * @param {any} op
 * @returns {op is BaseOpérationHautNiveau}
 */
function isBaseOpérationHautNiveau(op){
    return Object(op) === op &&
        typeof op.identifiantOpération === 'string' &&
        typeof op.type === 'string' &&
        op.date instanceof Date && // maybe weak, but it's complicated to find a better test for now
        Array.isArray(op.opérations) && op.opérations.every( isOpérationDeCompte )
}



/**
 * @param {any} op
 * @returns {op is OpérationHautNiveau}
 */
export function isOpérationHautNiveau(op){
    return isBaseOpérationHautNiveau(op) // faux ; PPP à raffiner plus tard
}

/**
 * @param {any} p 
 * @returns {p is Personne}
 */
export function estPersonne(p) {
    return Object(p) === p &&
        typeof p.nom === 'string' &&
        typeof p.identifiant === 'string'
}

/**
 * @param {any} s 
 * @returns {s is Salarié·e}
 */
export function estSalarié·e(s) {
    return Object(s) === s &&
        typeof s.suffixeCompte === 'number' &&
        typeof s.idPersonne === 'string'
}