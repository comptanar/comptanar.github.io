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
        addOpérationHautNiveau(state, year, opérationHautNiveau) {
            const { sha, opérationsHautNiveau } = state.opérationsHautNiveauByYear.get(year)

            opérationsHautNiveau.push(opérationHautNiveau)

            state.opérationsHautNiveauByYear.set(year,{ sha, opérationsHautNiveau })
        },
        /**
         * Met à jour une opération de haut niveau dans la liste.
         * 
         * @param {any} state
         * @param {number} year
         * @param {OpérationHautNiveau} opérationHautNiveau
         */
        updateOpérationHautNiveau(state, year, opérationHautNiveau) {
            const { sha, opérationsHautNiveau } = state.opérationsHautNiveauByYear.get(year)
            const index = opérationsHautNiveau.findIndex(o => o.identifiantOpération === opérationHautNiveau.identifiantOpération)

            opérationsHautNiveau[index] = opérationHautNiveau

            state.opérationsHautNiveauByYear.set(year,{ sha, opérationsHautNiveau })
        },
        /**
         * @param {State} state 
         * @param {import("./githubAsDatabase.js").WithSha<Personne[]>} personnes 
         */
        setPersonnes(state, personnes) {
            state.personnes = personnes
        },
        addPersonne(state, personne) {
            if (state.personnes) {
                const { sha, data: personnes } = state.personnes
                personnes.push(personne)
    
                // Le SHA et le tableau sont temporairement désynchronisés, il faut penser à appeler
                // updatePersonnesSha avec le nouveau SHA ensuite
                state.personnes = { sha, data: personnes }
            }
        },
        /**
         * @param {State} state 
         * @param {Personne} personne 
         */
        updatePersonne(state, personne) {
            if (state.personnes) {
                const { sha, data: personnes } = state.personnes
                const index = personnes.findIndex(p => p.identifiant === personne.identifiant)
    
                personnes[index] = personne
    
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
                state.personnes = { sha, data: personnes.filter(p => p.identifiant !== personne.identifiant) }
            }
        },

        setSalarié·es(state, s) {
            state.salarié·es = s
        },
        addSalarié·e(state, salarié·e) {
            if (state.salarié·es) {
                const { sha, data: salarié·es } = state.salarié·es
                salarié·es.push(salarié·e)

                // Le SHA et le tableau sont temporairement désynchronisés, il faut penser à appeler
                // updateSalarié·esSha avec le nouveau SHA ensuite
                state.salarié·es = { sha, data: salarié·es }
            }
        },
        /**
         * 
         * @param {State} state 
         * @param {Salarié·e} salarié·e
         */
        updateSalarié·e(state, salarié·e) {
            if (state.salarié·es) {
                const { sha, data: salarié·es } = state.salarié·es
                const index = salarié·es.findIndex(s => s.identifiant === salarié·e.identifiant)

                salarié·es[index] = salarié·e

                // Le SHA et le tableau sont temporairement désynchronisés, il faut penser à appeler
                // updateSalarié·esSha avec le nouveau SHA ensuite
                state.salarié·es = { sha, data: salarié·es }
            }
        },
        updateSalarié·esSha(state, newSha) {
            state.salarié·es.sha = newSha
        },
        supprimerSalarié·e(state, salarié·e) {
            if (state.salarié·es) {
                state.salarié·es.data = state.salarié·es.data.filter(
                    s => s.identifiant !== salarié·e.identifiant
                )
            }
        }
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
