//@ts-check

import { format } from 'date-fns';
import { fr } from 'date-fns/locale'

import githubAsDatabase from './githubAsDatabase.js'
import {rememberToken, forgetToken} from './localStorage.js'

import store from './store.js'

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

    return exercicesP
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



export function créerEnvoiFactureÀClientVide(){
    const date = new Date()
    const year = date.getFullYear()

    /** @type {EnvoiFactureClient} */
    const envoiFactureÀClient = {
        type: 'Envoi facture client',
        numéroFacture: '',
        date,
        compteClient: '',
        identifiantOpération: Math.random().toString(32).slice(2),
        opérations: [
            {
                compte: '',
                montant: 0,
                sens: 'Débit'
            },
            {
                compte: '44566', // TVA
                montant: 0,
                sens: 'Débit'
            }
        ]
    }

    return envoiFactureÀClient
}

export function supprimerEnvoiFactureÀClient({ identifiantOpération, date, compteClient, numéroFacture }) {
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
}

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
}
