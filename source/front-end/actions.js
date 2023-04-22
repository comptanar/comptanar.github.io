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
    throw `PPP 
    - recup les données de l'exercice en cours
    - ajouter une opération haut niveau d'envoi de facture
    - synchroniser avec le repo git
    
    Le faire de manière optimiste
    `


}