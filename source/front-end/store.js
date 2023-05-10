//@ts-check

import Store from "baredux";

import {rememberToken} from './localStorage.js';

const store = Store({
    state: {
        // @ts-ignore
        githubToken: await rememberToken(),
        login: undefined, // Promise<string> | string
        userOrgs: undefined,
        org: undefined,
        repo: undefined,
        opérationsHautNiveauByYear: undefined,
        /** @type {{ sha: string, personnes: Personne[] } | undefined} */
        personnes: undefined,
    },
    mutations: {
        // Dans un store baredux, les mutations sont des fonctions qui modifient les données de manière synchrone

        setToken(state, githubToken){
            state.githubToken = githubToken
        },
        setLogin(state, login) {
            state.login = login
        },
        setUserOrgs(state, orgs){
            state.userOrgs = orgs
        },
        logout(state) {
            state.githubToken = undefined
            state.login = undefined
            state.userOrgs = undefined
        },
        setOrgAndRepo(state, org, repo) {
            state.org = org
            state.repo = repo
        },
        setOpérationsHautNiveauByYear(state, opérationsHautNiveauByYear){
            console.log('opérationsHautNiveauByYear', opérationsHautNiveauByYear)
            state.opérationsHautNiveauByYear = opérationsHautNiveauByYear
        },
        updateOpérationsHautNiveauSha(state, year, newSha){
            const {sha, opérationsHautNiveau} = state.opérationsHautNiveauByYear.get(year)
            state.opérationsHautNiveauByYear.set(year, {sha: newSha, opérationsHautNiveau})
            // hopefully the opérationsHautNiveau and sha are now sychronized
        },
        supprimerOpérationHautNiveau(state, year, idOpération) {
            const { sha, opérationsHautNiveau } = state.opérationsHautNiveauByYear.get(year)
            state.opérationsHautNiveauByYear.set(year,
                { sha, opérationsHautNiveau: opérationsHautNiveau.filter(op => op.identifiantOpération != idOpération) }
            )
        },
        /**
         * Met à jour une opération de haut niveau dans la liste.
         * Elle est ajoutée à la liste si elle n'y était pas avant.
         * 
         * @param {any} state
         * @param {number} year
         * @param {OpérationHautNiveau} opérationHautNiveau
         */
        updateOpérationsHautNiveau(state, year, opérationHautNiveau) {
            const { sha, opérationsHautNiveau } = state.opérationsHautNiveauByYear.get(year)
            const index = opérationsHautNiveau.findIndex(o => o.identifiantOpération === opérationHautNiveau.identifiantOpération)

            if (index === -1) {
                opérationsHautNiveau.push(opérationHautNiveau)
            } else {
                opérationsHautNiveau[index] = opérationHautNiveau
            }

            state.opérationsHautNiveauByYear.set(year,{ sha, opérationsHautNiveau })
        },
        /**
         * @param {*} state 
         * @param {{ sha: string, personnes: Personne[] }} personnes 
         */
        setPersonnes(state, personnes) {
            state.personnes = personnes
        },
        /**
         * @param {*} state 
         * @param {Personne} personne 
         */
        addPersonne(state, personne) {
            const { sha, personnes } = state.personnes
            personnes.push(personne)
            state.personnes = { sha, personnes }
        },
    }
});

export default store;

export function getEnvoiFactureÀClients(state){
    const {opérationsHautNiveauByYear} = state

    return opérationsHautNiveauByYear ?
        [...opérationsHautNiveauByYear.values()]
            .map(({opérationsHautNiveau}) => opérationsHautNiveau.filter(op => op.type === 'Envoi facture client'))
            .flat(Infinity) :
        undefined;
}