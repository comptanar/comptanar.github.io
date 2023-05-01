//@ts-check

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



export function créerEnvoiFactureÀClient({compteClient, identifiantFacture, dateFacture, montantHT, montantTVA, compteProduit}){
    const date = new Date(dateFacture)

    const year = date.getFullYear()

    /** @type {EnvoiFactureClient} */
    const envoiFactureÀClient = {
        type: 'Envoi facture client',
        numéroFacture: identifiantFacture,
        date,
        compteClient,
        identifiantOpération: Math.random().toString(32).slice(2),
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

    store.mutations.addOpérationHautNiveau(year, envoiFactureÀClient)
    const yearSha = store.state.opérationsHautNiveauByYear.get(year).sha

    return githubAsDatabase.writeExercice(
        year, 
        yearSha, 
        store.state.opérationsHautNiveauByYear.get(year).opérationsHautNiveau, 
        `Rajout de la facture ${identifiantFacture} envoyée au client ${compteClient} le ${dateFacture}`
    )
    .then(({data: {content: {sha}}}) => {
        // sha is the new modified content sha
        return store.mutations.updateOpérationsHautNiveauSha(year, sha)
    })

}