//@ts-check

import Store from "baredux";

import {rememberToken} from './localStorage.js';

export default Store({
    state: {
        // @ts-ignore
        githubToken: await rememberToken(),
        login: undefined, // Promise<string> | string
        userOrgs: undefined,
        org: undefined,
        repo: undefined,
        opérationsHautNiveauByYear: undefined
    },
    mutations: {
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
        /**
         * @param {any} state
         * @param {number} year
         * @param {EnvoiFactureClient} envoiFactureÀClient
         */
        addOpérationHautNiveau(state, year, envoiFactureÀClient){
            const {sha, opérationsHautNiveau} = state.opérationsHautNiveauByYear.get(year)

            opérationsHautNiveau.push(envoiFactureÀClient)
            // now, the content of opérationsHautNiveau and the sha are de-synchronized temporarily

            state.opérationsHautNiveauByYear.set(year, {sha, opérationsHautNiveau})
        },
        updateOpérationsHautNiveauSha(state, year, newSha){
            const {sha, opérationsHautNiveau} = state.opérationsHautNiveauByYear.get(year)
            state.opérationsHautNiveauByYear.set(year, {sha: newSha, opérationsHautNiveau})
            // hopefully the opérationsHautNiveau and sha are now sychronized
        }
    }
});
