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

const syncExercices = () => githubAsDatabase.getExercices().then(store.mutations.setOpérationsHautNiveauByYear)
const syncPersonnes = () => githubAsDatabase.getPersonnes().then(store.mutations.setPersonnes)
const syncSalarié·es = () => githubAsDatabase.getSalarié·es().then(store.mutations.setSalarié·es)

/**
 * Crée une fonction qui tente de faire une action un première fois,
 * et si GitHub signale un conflit, met à jour les données puis retente
 * une fois.
 * 
 * @param {() => Promise<any>} sync
 */
function ajouterRéessai(f, sync = syncExercices) {
    return async (...args) => {
        try {
            return await f(...args)
        } catch (e) {
            if (e.response?.status === 409) {
                await sync()
                return await f(...args)
            } else {
                throw e
            }
        }
    }
}

function makeConflictError(err) {
    if (err.response?.status === 409) {
        throw new ConflictError()
    } else {
        throw err
    }
}

export function selectOrgAndRepo(org, repo){
    store.mutations.setOrgAndRepo(org, repo)

    githubAsDatabase.owner = org;
    githubAsDatabase.repo = repo;

    const exercicesP = syncExercices()
    const personnesP = syncPersonnes()
    const salarié·esP = syncSalarié·es()

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

export const supprimerEnvoiFactureÀClient = ajouterRéessai(({ identifiantOpération, date, compteClient, numéroFacture }) => {
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
})

export function sauvegarderEnvoiFactureÀClient({
    identifiantOpération,
    compteClient,
    identifiantFacture,
    dateFacture,
    montantHT,
    montantTVA,
    compteProduit,
}) {
    const date = new Date(dateFacture)
    const formattedDate = format(date, 'd MMMM yyyy', {locale: fr})
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
    let writePromise
    if (creation) {
        const action = ajouterRéessai(() => {
            store.mutations.addOpérationHautNiveau(year, envoiFactureÀClient)
            const yearSha = store.state.opérationsHautNiveauByYear.get(year).sha
            return githubAsDatabase.writeExercice(
                year,
                yearSha,
                store.state.opérationsHautNiveauByYear.get(year).opérationsHautNiveau,
                `Création de la facture ${identifiantFacture} envoyée au client ${compteClient} le ${formattedDate}`
            )
        })

        writePromise = action()        
    } else {
        store.mutations.updateOpérationHautNiveau(year, envoiFactureÀClient)
        const yearSha = store.state.opérationsHautNiveauByYear.get(year).sha
        writePromise = githubAsDatabase.writeExercice(
            year,
            yearSha,
            store.state.opérationsHautNiveauByYear.get(year).opérationsHautNiveau,
            `Modification de la facture ${identifiantFacture} envoyée au client ${compteClient} le ${formattedDate}`
        ).catch(makeConflictError)
    }

    return writePromise.then(({data: {content: {sha}}}) => {
        return store.mutations.updateOpérationsHautNiveauSha(year, sha)
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
}) {
    const date = new Date(dateÉmission)
    const year = date.getFullYear()
    const débutPériode = new Date(débutPériodeStr)
    const finPériode = new Date(finPériodeStr)
    const formattedStart = format(débutPériode, 'd MMMM yyyy', {locale: fr})
    const formattedEnd = format(finPériode, 'd MMMM yyyy', {locale: fr})

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
    let writePromise
    if (creation) {
        const action = ajouterRéessai(() => {
            store.mutations.addOpérationHautNiveau(year, fiche)
            const yearSha = store.state.opérationsHautNiveauByYear.get(year).sha
            return githubAsDatabase.writeExercice(
                year,
                yearSha,
                store.state.opérationsHautNiveauByYear.get(year).opérationsHautNiveau,
                `Création de la fiche de paie de ${nomSalarié·e} pour la période du ${formattedStart} au ${formattedEnd}`
            )
        })

        writePromise = action()
    } else {
        store.mutations.updateOpérationHautNiveau(year, fiche)
        const yearSha = store.state.opérationsHautNiveauByYear.get(year).sha

        writePromise = githubAsDatabase.writeExercice(
            year,
            yearSha,
            store.state.opérationsHautNiveauByYear.get(year).opérationsHautNiveau,
            `Modification de la fiche de paie de ${nomSalarié·e} pour la période du ${formattedStart} au ${formattedEnd}`
        ).catch(makeConflictError)
    }
    
    return writePromise.then(({data: {content: {sha}}}) => {
        return store.mutations.updateOpérationsHautNiveauSha(year, sha)
    })
}

export function envoyerPersonne(personne) {
    const creation = !store.state.personnes.data.some(p => p.identifiant === personne.identifiant)
    let writePromise
    if (creation) {
        const action = ajouterRéessai(() => {
            store.mutations.addPersonne(personne)
            const sha = store.state.personnes.sha
            writePromise =  githubAsDatabase.writePersonnes(
                sha,
                store.state.personnes.data,
                `Ajout de ${personne.nom}`
            )
        }, syncPersonnes)

        writePromise = action()
    } else {
        store.mutations.updatePersonne(personne)
        const sha = store.state.personnes.sha
        writePromise = githubAsDatabase.writePersonnes(
            sha,
            store.state.personnes.data,
            `Modification de ${personne.nom}`
        ).catch(makeConflictError)
    }
    
    return writePromise.then(({ data: { content: { sha }}}) => {
        return store.mutations.updatePersonnesSha(sha)
    })
}

export const supprimerPersonne = ajouterRéessai(personne => {
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
}, syncPersonnes)

export function envoyerSalarié·e({ identifiant, personne, suffixe }, retry = true) {
    const creation = !store.state.salarié·es.data.some(s => s.identifiant === identifiant)
    let writePromise
    if (creation) {
        const action = ajouterRéessai(() => {
            store.mutations.addSalarié·e({
                identifiant,
                idPersonne: personne.identifiant,
                suffixeCompte: suffixe,
            })
            const sha = store.state.salarié·es.sha
            writePromise = githubAsDatabase.writeSalarié·es(
                sha,
                store.state.salarié·es.data,
            )
        }, syncPersonnes)

        writePromise = action()
    } else {
        store.mutations.updateSalarié·e({
            identifiant,
            idPersonne: personne.identifiant,
            suffixeCompte: suffixe,
        })
        const sha = store.state.salarié·es.sha
        writePromise = githubAsDatabase.writeSalarié·es(
            sha,
            store.state.salarié·es.data,
        ).catch(makeConflictError)
    }
    
    return writePromise.then(({ data: { content: { sha }}}) => {
        return store.mutations.updateSalarié·esSha(sha)
    })
}

export const supprimerSalarié·e = ajouterRéessai((salarié·e) => {
    store.mutations.supprimerSalarié·e(salarié·e)
    const sha = store.state.salarié·es.sha

    return githubAsDatabase.writeSalarié·es(
        sha,
        store.state.salarié·e.data,
    )
    .then(({ data: { content: { sha }}}) => {
        return store.mutations.updateSalarié·esSha(sha)
    })
}, syncSalarié·es)