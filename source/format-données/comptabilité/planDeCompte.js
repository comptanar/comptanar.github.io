//@ts-check

/**
 * Cette fonction retourne un résultat faux (certains comptes 5 sont des passifs)
 * mais suffisamment vrai
 *
 * @param {string} compte
 * @returns {boolean}
 */
export function isActif(compte) {
  return (
    compte.startsWith('2') || compte.startsWith('3') || compte.startsWith('5')
  )
}

/**
 * Cette fonction retourne un résultat faux (certains comptes 1 sont des actifs)
 * mais suffisamment vrai
 *
 * @param {string} compte
 * @returns {boolean}
 */
export function isPassif(compte) {
  return compte.startsWith('1')
}

/**
 * @param {string} compte
 * @returns {boolean}
 */
export function isCompteDeTiers(compte) {
  return compte.startsWith('4')
}

/**
 * @param {string} compte
 * @returns {boolean}
 */
export function isProduit(compte) {
  return compte.startsWith('7')
}

/**
 * @param {string} compte
 * @returns {boolean}
 */
export function isCharge(compte) {
  return compte.startsWith('6')
}

export function isAchat(compte) {
  return (
    compte.startsWith('60') ||
    compte.startsWith('61') ||
    compte.startsWith('62')
  )
}

/**
 * Incomplet
 * PPP: à compléter ou, idéalement, générer automatiquement
 */
/** @type {Map<string, string>} */
export const planDeCompte = new Map(
  Object.entries({
    6061: 'Fournitures non stockables (eau, énergie…)',
    60611: 'Eau', // convention Condillac Expertise (premier comptable EB)
    6063: 'Fournitures d’entretien et petit équipement',
    6064: 'Fournitures administratives',
    607: 'Achats de marchandises',
    608: 'Frais accessoires d’achat',
    609: 'Rabais, remises et ristournes obtenus sur achat',
    6132: 'Locations immobilières',
    61321: 'Loyers box garage', // convention Condillac Expertise (premier comptable EB)
    6135: 'Locations mobilières',
    616: "Primes d'assurances",
    6226: 'Honoraires',
    6251: 'Voyages et déplacements',
    6252: 'Hôtels', // convention Condillac Expertise (premier comptable EB)
    626: 'Frais postaux et de télécommunications',
    627: 'Services bancaires et assimilés',
  }),
)
