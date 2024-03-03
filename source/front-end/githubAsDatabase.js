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
  
}
