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
 *      opérationsHautNiveauByYear: Map<number, WithSha<OpérationHautNiveau[]>> | undefined,
 *      personnes: WithSha<Personne[]> | undefined,
 *      salariats: WithSha<Salariat[]> | undefined,
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
    setGitAgent(state, gitAgent){
      state.gitAgent = gitAgent
    },
    setOpérationsHautNiveauByYear(state, opérationsHautNiveauByYear) {
      console.log('opérationsHautNiveauByYear', opérationsHautNiveauByYear)
      state.opérationsHautNiveauByYear = opérationsHautNiveauByYear
    },
    updateOpérationsHautNiveauSha(state, year, newSha) {
      const { sha, opérationsHautNiveau } =
        state.opérationsHautNiveauByYear.get(year)
      state.opérationsHautNiveauByYear.set(year, {
        sha: newSha,
        opérationsHautNiveau,
      })
      // hopefully the opérationsHautNiveau and sha are now sychronized
    },
    supprimerOpérationHautNiveau(state, year, idOpération) {
      const { sha, opérationsHautNiveau } =
        state.opérationsHautNiveauByYear.get(year)

      state.opérationsHautNiveauByYear.set(year, {
        sha,
        opérationsHautNiveau: opérationsHautNiveau.filter(
          op => op.identifiant !== idOpération,
        ),
      })
      // le sha et le contenu de opérationsHautNiveau sont désynchronisés temporairement
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
      let opérationsHautNiveauWithSha =
        state.opérationsHautNiveauByYear.get(année)

      if (!opérationsHautNiveauWithSha) {
        opérationsHautNiveauWithSha = {
          sha: undefined,
          opérationsHautNiveau: [],
        }
        state.opérationsHautNiveauByYear.set(année, opérationsHautNiveauWithSha)
      }

      if (!Array.isArray(nouvellesOpérationsHautNiveau)) {
        nouvellesOpérationsHautNiveau = [nouvellesOpérationsHautNiveau]
      }

      let { sha, opérationsHautNiveau } = opérationsHautNiveauWithSha
      opérationsHautNiveau = opérationsHautNiveau.concat(
        nouvellesOpérationsHautNiveau,
      )

      state.opérationsHautNiveauByYear.set(année, { sha, opérationsHautNiveau })
      // le sha et le contenu de opérationsHautNiveau sont désynchronisés temporairement
    },
    /**
     * Met à jour une opération de haut niveau dans la liste.
     *
     * @param {any} state
     * @param {number} year
     * @param {OpérationHautNiveau} opérationHautNiveau
     */
    updateOpérationHautNiveau(state, year, opérationHautNiveau) {
      const { sha, opérationsHautNiveau } =
        state.opérationsHautNiveauByYear.get(year)
      const index = opérationsHautNiveau.findIndex(
        o => o.identifiant === opérationHautNiveau.identifiant,
      )

      opérationsHautNiveau[index] = opérationHautNiveau

      state.opérationsHautNiveauByYear.set(year, { sha, opérationsHautNiveau })
    },
    /**
     * @param {State} state
     * @param {WithSha<Personne[]>} personnes
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
        const index = personnes.findIndex(
          p => p.identifiant === personne.identifiant,
        )

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
        state.personnes = {
          sha,
          data: personnes.filter(p => p.identifiant !== personne.identifiant),
        }
      }
    },

    setSalariats(state, salariats) {
      state.salariats = salariats
    },
    addSalariat(state, salariat) {
      if (state.salariats) {
        const { sha, data: salariats } = state.salariats
        salariats.push(salariat)

        // Le SHA et le tableau sont temporairement désynchronisés, il faut penser à appeler
        // updateSalariatsSha avec le nouveau SHA ensuite
        state.salariats = { sha, data: salariats }
      }
    },
    /**
     *
     * @param {State} state
     * @param {Salariat} salariat
     */
    updateSalariat(state, salariat) {
      if (state.salariats) {
        const { sha, data: salariats } = state.salariats
        const index = salariats.findIndex(
          s => s.identifiant === salariat.identifiant,
        )

        salariats[index] = salariat

        // Le SHA et le tableau sont temporairement désynchronisés, il faut penser à appeler
        // updateSalariatsSha avec le nouveau SHA ensuite
        state.salariats = { sha, data: salariats }
      }
    },
    updateSalariatsSha(state, newSha) {
      state.salariats.sha = newSha
    },
    supprimerSalariat(state, salariat) {
      if (state.salariats) {
        state.salariats.data = state.salariats.data.filter(
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
        .map(({ opérationsHautNiveau }) =>
          opérationsHautNiveau.filter(op => op.type === opType),
        )
        .flat(Infinity)
    : undefined
}

export const getEnvoiFactureÀClients = getSpecificOp('Envoi facture à client')
export const getFichesDePaie = getSpecificOp('Fiche de paie')
export const getAchats = getSpecificOp('Réception facture fournisseur')
