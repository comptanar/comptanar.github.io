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
         * @param {OpérationHautNiveau} opérationHautNiveau
         */
        addOpérationHautNiveau(state, year, opérationHautNiveau){
            const {sha, opérationsHautNiveau} = state.opérationsHautNiveauByYear.get(year)

            opérationsHautNiveau.push(opérationHautNiveau)
            // now, the content of opérationsHautNiveau and the sha are de-synchronized temporarily

            state.opérationsHautNiveauByYear.set(year, {sha, opérationsHautNiveau})
        },
        updateOpérationsHautNiveauSha(state, year, newSha){
            const {sha, opérationsHautNiveau} = state.opérationsHautNiveauByYear.get(year)
            state.opérationsHautNiveauByYear.set(year, {sha: newSha, opérationsHautNiveau})
            // hopefully the opérationsHautNiveau and sha are now sychronized
        },
        supprimerOpérationHautNiveau(state, year, idOpération) {
            console.log(year, idOpération)
            const { sha, opérationsHautNiveau } = state.opérationsHautNiveauByYear.get(year)
            state.opérationsHautNiveauByYear.set(year,
                { sha, opérationsHautNiveau: opérationsHautNiveau.filter(op => op.identifiantOpération != idOpération) }
            )
        }
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