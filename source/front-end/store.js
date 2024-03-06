//@ts-check

import Store from 'baredux'

import '../format-données/types/main.js'
import GitAgent from './GitAgent.js'

/**
 * @typedef {{
 *      githubToken: string,
 *      user: string,
 *      userOrgs: any,
 *      org: string,
 *      repo: string,
 *      gitAgent: GitAgent,
 *      conflict: any,
 *      opérationsHautNiveauByYear: Map<number, OpérationHautNiveau[]> | undefined,
 *      personnes: Personne[] | undefined,
 *      salariats: Salariat[] | undefined,
 * }} State
 */

const store = Store({
  state: {
    // @ts-ignore
    githubToken: undefined,
    user: undefined,
    userOrgs: undefined,
    org: undefined,
    repo: undefined,
    gitAgent: undefined,
    opérationsHautNiveauByYear: undefined,
    personnes: undefined,
    salariats: undefined,
    conflict: undefined
  },
  mutations: {
    // Dans un store baredux, les mutations sont des fonctions qui modifient les données de manière synchrone

    setToken(state, githubToken) {
      state.githubToken = githubToken
    },
    setUser(state, user) {
      state.user = user
    },
    setUserOrgs(state, orgs) {
      state.userOrgs = orgs
    },
    logout(state) {
      state.githubToken = undefined
      state.user = undefined
      state.userOrgs = undefined
      state.org = undefined
      state.repo = undefined
      state.gitAgent = undefined
      state.opérationsHautNiveauByYear = undefined
      state.personnes = undefined
      state.salariats = undefined
    },
    setOrgAndRepo(state, org, repo) {
      state.org = org
      state.repo = repo
    },
    setConflict(state, conflict){
      state.conflict = conflict
    },
    setGitAgent(state, gitAgent){
      state.gitAgent = gitAgent
    },
    setOpérationsHautNiveauByYear(state, opérationsHautNiveauByYear) {
      console.log('opérationsHautNiveauByYear', opérationsHautNiveauByYear)
      state.opérationsHautNiveauByYear = opérationsHautNiveauByYear
    },
    supprimerOpérationHautNiveau(state, year, idOpération) {
      const opérationsHautNiveau = state.opérationsHautNiveauByYear.get(year)

      state.opérationsHautNiveauByYear.set(year, opérationsHautNiveau.filter(
        op => op.identifiant !== idOpération,
      ))
    },
    supprimerAnnéeOpérationHautNiveau(state, année) {
      state.opérationsHautNiveauByYear.delete(année)
    },
    /**
     * @param {any} state
     * @param {number} année
     * @param {OpérationHautNiveau | OpérationHautNiveau[]} nouvellesOpérationsHautNiveau
     */
    addOpérationsHautNiveau(state, année, nouvellesOpérationsHautNiveau) {
      let opérationsHautNiveau =
        state.opérationsHautNiveauByYear.get(année)

      if (!opérationsHautNiveau) {
        opérationsHautNiveau = []
        state.opérationsHautNiveauByYear.set(année, opérationsHautNiveau)
      }

      if (!Array.isArray(nouvellesOpérationsHautNiveau)) {
        nouvellesOpérationsHautNiveau = [nouvellesOpérationsHautNiveau]
      }

      opérationsHautNiveau = opérationsHautNiveau.concat(
        nouvellesOpérationsHautNiveau,
      )

      state.opérationsHautNiveauByYear.set(année, opérationsHautNiveau)
    },
    /**
     * Met à jour une opération de haut niveau dans la liste.
     *
     * @param {any} state
     * @param {number} year
     * @param {OpérationHautNiveau} opérationHautNiveau
     */
    updateOpérationHautNiveau(state, year, opérationHautNiveau) {
      const opérationsHautNiveau = state.opérationsHautNiveauByYear.get(year)
      const index = opérationsHautNiveau.findIndex(
        o => o.identifiant === opérationHautNiveau.identifiant,
      )

      opérationsHautNiveau[index] = opérationHautNiveau

      state.opérationsHautNiveauByYear.set(year, opérationsHautNiveau )
    },
    /**
     * @param {State} state
     * @param {Personne[]} personnes
     */
    setPersonnes(state, personnes) {
      state.personnes = personnes
    },
    addPersonne(state, personne) {
      if (state.personnes) {
        const personnes = state.personnes
        personnes.push(personne)

        state.personnes = personnes
      }
    },
    /**
     * @param {State} state
     * @param {Personne} personne
     */
    updatePersonne(state, personne) {
      if (state.personnes) {
        const personnes = state.personnes
        const index = personnes.findIndex(
          p => p.identifiant === personne.identifiant,
        )

        personnes[index] = personne

        state.personnes = personnes 
      }
    },
    /**
     * @param {State} state
     * @param {Personne} personne
     */
    supprimerPersonne(state, personne) {
      if (state.personnes) {
        const personnes = state.personnes
        state.personnes = personnes.filter(p => p.identifiant !== personne.identifiant)
      }
    },

    setSalariats(state, salariats) {
      state.salariats = salariats
    },
    addSalariat(state, salariat) {
      if (state.salariats) {
        const salariats = state.salariats
        salariats.push(salariat)
        state.salariats = salariats 
      }
    },
    /**
     *
     * @param {State} state
     * @param {Salariat} salariat
     */
    updateSalariat(state, salariat) {
      if (state.salariats) {
        const salariats = state.salariats
        const index = salariats.findIndex(
          s => s.identifiant === salariat.identifiant,
        )

        salariats[index] = salariat

        state.salariats = salariats 
      }
    },
    supprimerSalariat(state, salariat) {
      if (state.salariats) {
        state.salariats = state.salariats.filter(
          s => s.identifiant !== salariat.identifiant,
        )
      }
    },
  },
})

export default store

/**
 *
 * @param {OpérationHautNiveau["type"]} opType
 * @returns {(state: any) => any}
 */
const getSpecificOp = opType => state => {
  const { opérationsHautNiveauByYear } = state

  return opérationsHautNiveauByYear
    ? [...opérationsHautNiveauByYear.values()]
        .map(opérationsHautNiveau =>
          opérationsHautNiveau.filter(op => op.type === opType),
        )
        .flat(Infinity)
    : undefined
}

export const getEnvoiFactureÀClients = getSpecificOp('Envoi facture à client')
export const getFichesDePaie = getSpecificOp('Fiche de paie')
export const getAchats = getSpecificOp('Réception facture fournisseur')
