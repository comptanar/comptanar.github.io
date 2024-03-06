//@ts-check

import { rememberToken, forgetToken } from '../localStorage.js'

import githubAsDatabase from '../githubAsDatabase.js'
import GitAgent from '../GitAgent.js'
import store from '../store.js'

import {personnesRepoToStore} from './personnes.js'
import {salariatsRepoToStore} from './salariats.js'
import {exercicesRepoToStore} from './exercices.js'

import '../../format-données/types/main.js'


/**
 * @param {string} token
 */
export function saveToken(token) {
  store.mutations.setToken(token)
  githubAsDatabase.token = token

  return rememberToken(token)
}

export function logout() {
  console.info('logout')
  store.mutations.logout()
  githubAsDatabase.reset()

  return forgetToken()
}


/**
 *
 * @param {string} owner // may be an individual Github user or an organisation
 * @param {string} repoName
 * @returns {string}
 */
export function makeRepoId(owner, repoName) {
  return `${owner}/${repoName}`
}


export function syncRepoToStore(){
  return Promise.all([exercicesRepoToStore(), personnesRepoToStore(), salariatsRepoToStore()])
}

/**
 * 
 * @param {string} org 
 * @param {string} repo 
 * @returns 
 */
export async function setOrgAndRepo(org, repo) {
  const previousOrg = store.state.org
  const previousRepo = store.state.repo

  if(previousOrg === org && previousRepo === repo){
    return 
  }
  // org and repo are new

  store.mutations.setOrgAndRepo(org, repo)

  githubAsDatabase.owner = org
  githubAsDatabase.repo = repo

  const repoId = makeRepoId(org, repo)

  const gitAgent = new GitAgent({
    repoId,
    remoteURL: `https://github.com/${repoId}.git`,
    auth: {
      username: store.state.githubToken,
      password: 'x-oauth-basic',
    },
    onMergeConflict: resolutionOptions => {
      store.mutations.setConflict(resolutionOptions)
    },
  })

  store.mutations.setGitAgent(gitAgent)

  const {login, email} = store.state.user

  await gitAgent.pullOrCloneRepo()
  await gitAgent.setAuthor(login, email)

  return syncRepoToStore()
}

export function getUserOrgChoices() {
  const orgsP = githubAsDatabase.getOrgs().then(orgs => {
    store.mutations.setUserOrgs(orgs)
    return orgs
  })

  store.mutations.setUserOrgs(orgsP)

  return orgsP
}


/**
 *
 * @param {import('./../store.js').ResolutionOption['resolution']} resolution
 * @returns {import('./../store.js').ResolutionOption['resolution']}
 */
export function addConflictRemovalAndRedirectToResolution(resolution) {
  return function (/** @type {any} */ ...args) {
    return resolution(...args).then(() => {
      store.mutations.setConflict(undefined)
      history.back()
    })
  }
}