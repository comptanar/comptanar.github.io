//@ts-check

import { request } from '@octokit/request'
import {Octokit} from 'octokit'

import '../format-données/types/main.js'

const initialRequestDefaults = {
  headers: {
    'user-agent': 'comptanar https://github.com/comptanar/comptanar.github.io',
  },
}

let theRequest = request.defaults(initialRequestDefaults)
/** @type {Octokit} */
let octokit;



export default {
  reset() {
    theRequest = request.defaults(initialRequestDefaults)
  },
  set token(token) {
    theRequest = theRequest.defaults({
      headers: {
        authorization: `token ${token}`,
      },
    })
    octokit = new Octokit({auth: token})
  },
  set owner(owner) {
    theRequest = theRequest.defaults({ owner })
  },
  set repo(repo) {
    theRequest = theRequest.defaults({ repo })
  },
  async getAuthenticatedUser() {
    const { viewer: { login, email, avatarUrl } } = await octokit.graphql(`{
      viewer {
        login
        email
        avatarUrl
      }
    }`);

    // PPP add organizations
    // https://docs.github.com/en/graphql/reference/objects#user
    // https://docs.github.com/en/graphql/reference/objects#organizationconnection

    return {login, email, avatarUrl}
  },
  getOrgs() {
    return theRequest('/user/orgs').then(({ data: organisations }) => {
      return organisations
    })
  },
  getRepo(owner, repo) {
    return theRequest(`/repos/${owner}/${repo}`)
  },
  createComptabilityRepo(owner, name) {
    const TEMPLATE_OWNER = 'comptanar'
    const TEMPLATE_REPO = 'comptabilite'

    return theRequest(`/repos/${TEMPLATE_OWNER}/${TEMPLATE_REPO}/generate`, {
      method: 'POST',
      owner,
      name,
    })
  },

  /**
   * @param {number} year
   * @param {string?} sha
   * @param {OpérationHautNiveau[]} opérationsHautNiveau
   * @param {string} [message]
   */
  /*writeExercice(year, sha, opérationsHautNiveau, message) {
    return theRequest(
      `/repos/{owner}/{repo}/contents/${opérationsHautNiveauPath(year)}`,
      {
        method: 'PUT',
        message:
          message ||
          `Mise à jour des opérations haut niveau de l'exercice ${year}`,
        sha,
        content: UTF8ToB64(
          stringifyOpérationsHautNiveauYaml(opérationsHautNiveau),
        ),
      },
    )
  },*/
  /**
   * @param {number} year
   * @param {string} sha
   * @param {string} [message]
   */
  /*deleteExercice(year, sha, message) {
    return theRequest(
      `/repos/{owner}/{repo}/contents/${opérationsHautNiveauPath(year)}`,
      {
        method: 'DELETE',
        sha,
        message: message || `Suppression de l'exercice ${year}`,
      },
    )
  },*/
  /**
   * Renvoie la liste des personnes stockée sur GitHub
   * @type {() => Promise<WithSha<Personne[]>>}
   */
  //getPersonnes: fileReader(personnesPath, parsePersonnes),
  /**
   * Sauvegarde une liste de personnes dans le dépôt GitHub
   * @param {string} sha
   * @param {Personne[]} personnes
   * @param {string} message
   */
  /*writePersonnes: fileWriter(
    personnesPath,
    'Mise à jour des personnes',
    stringifyPersonnesYaml,
  ),
  getSalariats: fileReader(salariatsPath, parseSalariat),
  writeSalariats: fileWriter(
    salariatsPath,
    'Mise à jour des salarié⋅es',
    stringifySalariatsYaml,
  ),*/
}
