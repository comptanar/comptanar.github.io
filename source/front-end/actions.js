//@ts-check

import { format } from 'date-fns';
import { fr } from 'date-fns/locale'

import githubAsDatabase from './githubAsDatabase.js'
import {rememberToken, forgetToken} from './localStorage.js'

import store from './store.js'

import { formatCompte } from './stringifiers.js'

export class ConflictError extends Error {}

/**
 * @param {string} token
 */
export function saveToken(token){
    store.mutations.setToken(token)
    githubAsDatabase.token = token
    
    return rememberToken(token)
}

export function logout(){
    console.info('logout')
    store.mutations.logout()
    githubAsDatabase.reset()

    return forgetToken()
}

export async function initDance(){
    if (store.state.githubToken) {
        githubAsDatabase.token = store.state.githubToken

        // Retrieve logged in user from access token
        const loginP = githubAsDatabase.getAuthenticatedUser()
            // @ts-ignore
            .then(({ login }) => {
                store.mutations.setLogin(login);
                return login;
            })

        store.mutations.setLogin(loginP);
        
        return loginP
    }
    else{
        return Promise.resolve(undefined)
    }

}

export function selectOrgAndRepo(org, repo){
    store.mutations.setOrgAndRepo(org, repo)

    githubAsDatabase.owner = org;
    githubAsDatabase.repo = repo;

    const exercicesP = githubAsDatabase.getExercices()
        .then(opérationsHautNiveauByYear => store.mutations.setOpérationsHautNiveauByYear(opérationsHautNiveauByYear))

    const personnesP = githubAsDatabase.getPersonnes()
        .then(store.mutations.setPersonnes)

    const salarié·esP = githubAsDatabase.getSalarié·es()
        .then(store.mutations.setSalarié·es)

    return Promise.all([exercicesP, personnesP, salarié·esP])
}

export function getUserOrgChoices(){
    const orgsP = githubAsDatabase.getOrgs()
    .then(orgs => {
        store.mutations.setUserOrgs(orgs)
        return orgs
    })

    store.mutations.setUserOrgs(orgsP)

    return orgsP
}

export function supprimerEnvoiFactureÀClient({ identifiantOpération, date, compteClient, numéroFacture }, retry = true) {
    const year = date.getFullYear()

    store.mutations.supprimerOpérationHautNiveau(year, identifiantOpération)
    
    const yearSha = store.state.opérationsHautNiveauByYear.get(year).sha

    const formattedDate = format(date, 'd MMMM yyyy', {locale: fr})

    return githubAsDatabase.writeExercice(
        year,
        yearSha,
        store.state.opérationsHautNiveauByYear.get(year).opérationsHautNiveau,
        `Suppression de la facture ${numéroFacture} envoyée au client ${compteClient} le ${formattedDate}`
    )
    .then(({data: {content: {sha}}}) => {
        // sha is the new modified content sha
        return store.mutations.updateOpérationsHautNiveauSha(year, sha)
    })
    .catch(e => {
        if (e.response?.status === 409) {
            if (retry) {
                githubAsDatabase.getExercices()
                    .then(store.mutations.setOpérationsHautNiveauByYear)
                    .then(() => supprimerEnvoiFactureÀClient({ identifiantOpération, date, compteClient, numéroFacture }, false))
            }
        } else {
            throw e
        }
    })
}

export function sauvegarderEnvoiFactureÀClient({
    identifiantOpération,
    compteClient,
    identifiantFacture,
    dateFacture,
    montantHT,
    montantTVA,
    compteProduit,
}, retry = true) {
    const date = new Date(dateFacture)
    const year = date.getFullYear()

    /** @type {EnvoiFactureClient} */
    const envoiFactureÀClient = {
        type: 'Envoi facture client',
        numéroFacture: identifiantFacture,
        date,
        compteClient,
        identifiantOpération,
        opérations: [
            {
                compte: compteProduit,
                montant: montantHT,
                sens: 'Débit'
            },
            {
                compte: '44566', // TVA
                montant: montantTVA,
                sens: 'Débit'
            }
        ]
    }

    const creation = store.state.opérationsHautNiveau.opérationsHautNiveau.some(o => o.identifiant === identifiantOpération)
    store.mutations.updateOpérationsHautNiveau(year, envoiFactureÀClient)
    const yearSha = store.state.opérationsHautNiveauByYear.get(year).sha

    const formattedDate = format(date, 'd MMMM yyyy', {locale: fr})

    return githubAsDatabase.writeExercice(
        year,
        yearSha,
        store.state.opérationsHautNiveauByYear.get(year).opérationsHautNiveau,
        `Modification de la facture ${identifiantFacture} envoyée au client ${compteClient} le ${formattedDate}`
    )
    .then(({data: {content: {sha}}}) => {
        return store.mutations.updateOpérationsHautNiveauSha(year, sha)
    })
    .catch(e => {
        if (e.response.status === 409) {
            if (retry) {
                if (creation) {
                    githubAsDatabase.getExercices()
                        .then(store.mutations.setOpérationsHautNiveauByYear)
                        .then(() => 
                            sauvegarderEnvoiFactureÀClient({
                                identifiantOpération,
                                compteClient,
                                identifiantFacture,
                                dateFacture,
                                montantHT,
                                montantTVA,
                                compteProduit,
                            }, false)
                        )
                } else {
                    throw new ConflictError()
                }
            }
        } else {
            throw e
        }
    })
}
export function envoyerFicheDePaie({
    identifiantOpération,
    nomSalarié·e,
    compteSalarié·e,
    rémunération,
    sécu,
    prélèvement,
    dateÉmission,
    débutPériodeStr,
    finPériodeStr
}, retry = true) {
    const date = new Date(dateÉmission)
    const year = date.getFullYear()
    const débutPériode = new Date(débutPériodeStr)
    const finPériode = new Date(finPériodeStr)

    /** @type {ÉmissionFicheDePaie} */
    const fiche = {
        identifiantOpération,
        type: 'Fiche de paie',
        date,
        débutPériode,
        finPériode,
        opérations: [
            {
                compte: formatCompte(641, compteSalarié·e),
                montant: rémunération,
                sens: 'Crédit'
            },
            {
                compte: formatCompte(645, compteSalarié·e),
                montant: sécu,
                sens: 'Crédit',
            },
            {
                compte: formatCompte(4421, compteSalarié·e),
                montant: prélèvement,
                sens: 'Crédit'
            },
        ]
    }

    const creation = store.state.opérationsHautNiveau.opérationsHautNiveau.some(o => o.identifiant === identifiantOpération)
    store.mutations.updateOpérationsHautNiveau(year, fiche)
    const yearSha = store.state.opérationsHautNiveauByYear.get(year).sha

    const formattedStart = format(débutPériode, 'd MMMM yyyy', {locale: fr})
    const formattedEnd = format(finPériode, 'd MMMM yyyy', {locale: fr})

    return githubAsDatabase.writeExercice(
        year,
        yearSha,
        store.state.opérationsHautNiveauByYear.get(year).opérationsHautNiveau,
        `Modification de la fiche de paie de ${nomSalarié·e} pour la période du ${formattedStart} au ${formattedEnd}`
    )
    .then(({data: {content: {sha}}}) => {
        return store.mutations.updateOpérationsHautNiveauSha(year, sha)
    })
    .catch(e => {
        if (e.response.status === 409) {
            if (retry) {
                if (creation) {
                    githubAsDatabase.getExercices()
                        .then(store.mutations.setOpérationsHautNiveauByYear)
                        .then(() =>
                            envoyerFicheDePaie({
                                identifiantOpération,
                                nomSalarié·e,
                                compteSalarié·e,
                                rémunération,
                                sécu,
                                prélèvement,
                                dateÉmission,
                                débutPériodeStr,
                                finPériodeStr
                            }, false)
                        )
                } else {
                    throw new ConflictError()
                }
            }
        } else {
            throw e
        }
    })
}

export function envoyerPersonne(personne, retry = true) {
    const creation = !store.state.personnes.data.some(p => p.identifiant === personne.identifiant)
    store.mutations.updatePersonne(personne)
    const sha = store.state.personnes.sha

    return githubAsDatabase.writePersonnes(
        sha,
        store.state.personnes.data,
        `Modification de ${personne.nom}`
    )
    .then(({ data: { content: { sha }}}) => {
        return store.mutations.updatePersonnesSha(sha)
    })
    .catch(e => {
        if (e.response?.status === 409) {
            if (retry) {
                if (creation) {
                    githubAsDatabase.getPersonnes()
                        .then(store.mutations.setPersonnes)
                        .then(() => envoyerPersonne(personne, false))
                } else {
                    throw new ConflictError()
                }
            }
        } else {
            throw e
        }
    })
}

export function supprimerPersonne(personne, retry = true) {
    store.mutations.supprimerPersonne(personne)
    const sha = store.state.personnes.sha

    return githubAsDatabase.writePersonnes(
        sha,
        store.state.personnes.data,
        `Suppression de ${personne.nom}`
    )
    .then(({ data: { content: { sha }}}) => {
        return store.mutations.updatePersonnesSha(sha)
    })
    .catch(e => {
        if (e.response?.status === 409) {
            if (retry) {
                return githubAsDatabase.getPersonnes()
                    .then(store.mutations.setPersonnes)
                    .then(() => supprimerPersonne(personne, false))
            }
        } else {
            throw e
        }
    })
}


export function envoyerSalarié·e({ identifiant, personne, suffixe }, retry = true) {
    const creation = !store.state.salarié·es.data.some(s => s.identifiant === identifiant)
    store.mutations.updateSalarié·e({
        identifiant,
        idPersonne: personne.identifiant,
        suffixeCompte: suffixe,
    })
    const sha = store.state.salarié·es.sha

    return githubAsDatabase.writeSalarié·es(
        sha,
        store.state.salarié·es.data,
    )
    .then(({ data: { content: { sha }}}) => {
        return store.mutations.updateSalarié·esSha(sha)
    })
    .catch(e => {
        if (e.response?.status === 409) {
            if (retry) {
                if (creation) {
                    githubAsDatabase.getSalarié·es()
                        .then(store.mutations.setSalarié·es)
                        .then(() => envoyerSalarié·e({ identifiant, personne, suffixe }, false))
                } else {
                    throw new ConflictError()
                }
            }
        } else {
            throw e
        }
    })
}

export function supprimerSalarié·e(salarié·e, retry = true) {
    store.mutations.supprimerSalarié·e(salarié·e)
    const sha = store.state.salarié·es.sha

    return githubAsDatabase.writeSalarié·es(
        sha,
        store.state.salarié·e.data,
    )
    .then(({ data: { content: { sha }}}) => {
        return store.mutations.updateSalarié·esSha(sha)
    })
    .catch(e => {
        if (e.response?.status === 409) {
            if (retry) {
                githubAsDatabase.getSalarié·es()
                    .then(store.mutations.setSalarié·es)
                    .then(() => supprimerSalarié·e(salarié·e, false))
            }
        } else {
            throw e
        }
    })
}