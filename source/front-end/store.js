//@ts-check

import Store from "baredux";

import {rememberToken} from './localStorage.js';

/**
 * @typedef {{
 *      githubToken: string,
 *      login: Promise<string> | string,
 *      userOrgs: any,
 *      org: string,
 *      repo: string,
 *      opérationsHautNiveauByYear: Map<number, OpérationHautNiveau[]> | undefined,
 *      personnes: import("./githubAsDatabase.js").WithSha<Personne[]> | undefined,
 *      salarié·es: import("./githubAsDatabase.js").WithSha<Salarié·e[]> | undefined,
 * }} State
 */

const store = Store({
    state: {
        // @ts-ignore
        githubToken: await rememberToken(),
        login: undefined, // Promise<string> | string
        userOrgs: undefined,
        org: undefined,
        repo: undefined,
        opérationsHautNiveauByYear: undefined,
        personnes: undefined,
        salarié·es: undefined,
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
         * @param {State} state 
         * @param {import("./githubAsDatabase.js").WithSha<Personne[]>} personnes 
         */
        setPersonnes(state, personnes) {
            state.personnes = personnes
        },
        /**
         * @param {State} state 
         * @param {Personne} personne 
         */
        updatePersonne(state, personne) {
            if (state.personnes) {
                const { sha, data: personnes } = state.personnes
                const index = personnes.findIndex(p => p.identifiant === personne.identifiant)
    
                if (index === -1) {
                    personnes.push(personne)
                } else {
                    personnes[index] = personne
                }
    
                // Le SHA et le tableau sont temporairement désynchronisés, il faut penser à appeler
                // updatePersonnesSha avec le nouveau SHA ensuite
                state.personnes = { sha, data: personnes }
            }
        },
        updatePersonnesSha(state, newSha) {
            state.personnes.sha = newSha
        },
        /**
         * @param {State} state 
         * @param {Personne} personne 
         */
        supprimerPersonne(state, personne) {
            if (state.personnes) {
                const { sha, data: personnes } = state.personnes
                console.log(personne.identifiant)
                state.personnes = { sha, data: personnes.filter(p => p.identifiant !== personne.identifiant) }
            }
        },

        setSalarié·es(state, s) {
            state.salarié·es = s
        },
        addSalarié·e(state, s) {
            const { sha, salarié·es } = state.salarié·es
            salarié·es.push(s)
            // Le SHA et le tableau sont temporairement désynchronisés, il faut penser à appeler
            // updateSalarié·esSha avec le nouveau SHA ensuite
            state.salarié·es = { sha, salarié·es }
        },
        updateSalarié·esSha(state, newSha) {
            state.salarié·es.sha = newSha
        },
    }
});

export default store;

const getSpecificOp = opType => state => {
    const {opérationsHautNiveauByYear} = state

    return opérationsHautNiveauByYear ?
        [...opérationsHautNiveauByYear.values()]
            .map(({opérationsHautNiveau}) => opérationsHautNiveau.filter(op => op.type === opType))
            .flat(Infinity) :
        undefined;
}

export const getEnvoiFactureÀClients = getSpecificOp('Envoi facture client')
export const getFichesDePaie = getSpecificOp('Fiche de paie')
