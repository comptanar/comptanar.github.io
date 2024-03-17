//@ts-check

import page from 'page'

import { rememberToken } from './localStorage.js'
import githubAsDatabase from './githubAsDatabase.js'

import {replaceComponent} from './routeComponentLifeCycle.js'

import Welcome from './composants/screens/Welcome.svelte'
import ChooseOrganisation from './composants/screens/ChooseOrganisation.svelte'
import Comptabilite from './composants/screens/Comptabilite.svelte'
import FacturesVentes from './composants/screens/FacturesVentes.svelte'

import FichesDePaie from './composants/screens/FichesDePaie.svelte'
import Personnes from './composants/screens/Personnes.svelte'
import Salariats from './composants/screens/Salariats.svelte'
import Achats from './composants/screens/Achats.svelte'
import CompteResultat from './composants/screens/CompteResultat.svelte'
import ImportBanque from './composants/screens/ImportBanque.svelte'
import ResolutionDesynchronisation from './composants/screens/ResolutionDesynchronisation.svelte'

import store, {
  getAchats,
  getEnvoiFactureÀClients,
  getFichesDePaie,
} from './store.js'

import {
  logout,
  saveToken,
  getUserOrgChoices,
  setOrgAndRepo,
} from './actions/index.js'

import './types.js'

/** @typedef {import("./store.js").ComptanarState} ComptanarState */


console.info('start')


/**
 * Component rendering loop
 */
const svelteTarget = document.body


function logoutAndRedirect() {
  logout().then(() => page('/'))
}

/** @type {import('page').Callback} */
function loginMiddleware(_, next){
  if(store.state.githubToken && store.state.user){
    next()
  }
  else{
    return rememberToken().then(token => {
      if(token){
        store.mutations.setToken(token)
        githubAsDatabase.token = token
        
        // this gets the authenticated user, and is also the occasion to check token validity
        return githubAsDatabase.getAuthenticatedUser()
        .then(user => {
          console.log('getAuthenticatedUser', user)
          store.mutations.setUser(user)
          next()
        })
        .catch(() => {
          // PPP store error in store for informative message
          logoutAndRedirect()
        })
      }
      else{
        page('/')
      }
    })
  }
}


/**
 * Routes
 */
page('/', () => {
  console.info('route', '/')
  if (store.state.user) {

    Promise.resolve(store.state.user).then(user => {
      console.info('Logged in as', user.login, 'Moving to /choose-organisation')
      page('/choose-organisation')
    })
  }

  /**
   * @param {ComptanarState} state  
   */
  function mapStateToProps(state) {
    return {
      user: state.user,
      logout: logoutAndRedirect,
    }
  }

  // @ts-ignore
  const welcome = new Welcome({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  })

  replaceComponent(welcome, mapStateToProps)
})

page('/after-oauth-login', () => {
  console.info('/after-oauth-login', location.href.toString())
  const TOCTOCTOC_TOKEN_SEARCH_PARAM = 'access_token'

  // Store access token in URL into browser localStorage and replace URL to the same without the token
  const url = new URL(location.href)

  const urlToken = url.searchParams.get(TOCTOCTOC_TOKEN_SEARCH_PARAM)
  console.log('urlToken', urlToken)

  if (urlToken) {
    saveToken(urlToken)
      .then(() => {
        url.searchParams.delete(TOCTOCTOC_TOKEN_SEARCH_PARAM)
        return githubAsDatabase.getAuthenticatedUser()
        .then(user => {
          store.mutations.setUser(user)
          page('/choose-organisation')
        })
      })
      .catch(err => {
        page('/')
        // PPP add error notif
        console.error('Saving token failed', err)
      })
  }
  else{
    page('/')
    // PPP add error notif
    console.error(`Expected a ${TOCTOCTOC_TOKEN_SEARCH_PARAM} param in URL and found none`, url)
  }
})


page('/choose-organisation', loginMiddleware, () => {
  console.info('route', '/choose-organisation')

  getUserOrgChoices()

  /**
   * @param {ComptanarState} state  
   */
  function mapStateToProps(state) {
    if(!state.user){
      throw new TypeError('Missing user')
    }

    return {
      user: state.user,
      logout: logoutAndRedirect,
      possibleOrganisations: state.userOrgs,
    }
  }

  const chooseOrganisation = new ChooseOrganisation({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  })

  replaceComponent(chooseOrganisation, mapStateToProps)
})

page('/comptabilite/', loginMiddleware, ({ querystring }) => {
  console.info('route', '/comptabilite/', querystring)

  const params = new URLSearchParams(querystring)

  const org = params.get('org') || undefined
  const repo = params.get('repo') || undefined

  if(!org){
    throw new TypeError(`Missing org param in url`)
  }
  if(!repo){
    throw new TypeError(`Missing org param in url`)
  }

  setOrgAndRepo(org, repo)

  /**
   * @param {ComptanarState} state  
   */
  function mapStateToProps(state) {
    return {
      user: state.user,
      logout: logoutAndRedirect,
      org,
      repo,
      conflict: state.conflict
    }
  }

  const comptabilite = new Comptabilite({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  })

  replaceComponent(comptabilite, mapStateToProps)
})

page('/comptabilite/ventes', loginMiddleware, ({ querystring }) => {
  console.info('route', '/comptabilite/ventes', querystring)
  const params = new URLSearchParams(querystring)

  const org = params.get('org') || undefined
  const repo = params.get('repo') || undefined

  if(!org){
    throw new TypeError(`Missing org param in url`)
  }
  if(!repo){
    throw new TypeError(`Missing org param in url`)
  }

  setOrgAndRepo(org, repo)

  /**
   * @param {ComptanarState} state  
   */
  function mapStateToProps(state) {
    return {
      user: state.user,
      logout: logoutAndRedirect,
      org,
      repo,
      conflict: state.conflict,
      personnes: state.personnes || [],
      envoiFactureàClients: getEnvoiFactureÀClients(state),
    }
  }

  const factures = new FacturesVentes({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  })

  replaceComponent(factures, mapStateToProps)
})

page('/comptabilite/fiches-de-paie', loginMiddleware, ({ querystring }) => {
  const params = new URLSearchParams(querystring)

  const org = params.get('org') || undefined
  const repo = params.get('repo') || undefined
  
  if(!org){
    throw new TypeError(`Missing org param in url`)
  }
  if(!repo){
    throw new TypeError(`Missing org param in url`)
  }

  setOrgAndRepo(org, repo)

  /**
   * @param {ComptanarState} state  
   */
  function mapStateToProps(state) {
    return {
      user: state.user,
      logout: logoutAndRedirect,
      org,
      repo,
      conflict: state.conflict,
      personnes: state.personnes || [],
      salariats: state.salariats || [],
      fichesDePaie: getFichesDePaie(state),
    }
  }

  const fichesDePaie = new FichesDePaie({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  })

  replaceComponent(fichesDePaie, mapStateToProps)
})

page('/comptabilite/personnes', loginMiddleware, ({ querystring }) => {
  const params = new URLSearchParams(querystring)

  const org = params.get('org') || undefined
  const repo = params.get('repo') || undefined
  
  if(!org){
    throw new TypeError(`Missing org param in url`)
  }
  if(!repo){
    throw new TypeError(`Missing org param in url`)
  }

  setOrgAndRepo(org, repo)

  /**
   * @param {ComptanarState} state  
   */
  function mapStateToProps(state) {
    return {
      user: state.user,
      logout: logoutAndRedirect,
      org,
      repo,
      conflict: state.conflict,
      personnes: state.personnes || []
    }
  }

  const personnes = new Personnes({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  })

  replaceComponent(personnes, mapStateToProps)
})

page('/comptabilite/achats', loginMiddleware, ({ querystring }) => {
  const params = new URLSearchParams(querystring)

  const org = params.get('org') || undefined
  const repo = params.get('repo') || undefined
  
  if(!org){
    throw new TypeError(`Missing org param in url`)
  }
  if(!repo){
    throw new TypeError(`Missing org param in url`)
  }

  setOrgAndRepo(org, repo)

  /**
   * @param {ComptanarState} state  
   */
  function mapStateToProps(state) {
    return {
      user: state.user,
      logout: logoutAndRedirect,
      achats: getAchats(state) ?? [],
      org,
      repo,
      conflict: state.conflict,
      personnes: state.personnes || [],
    }
  }

  const achats = new Achats({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  })

  replaceComponent(achats, mapStateToProps)
})

page('/comptabilite/salariats', loginMiddleware, ({ querystring }) => {
  const params = new URLSearchParams(querystring)

  const org = params.get('org') || undefined
  const repo = params.get('repo') || undefined
  
  if(!org){
    throw new TypeError(`Missing org param in url`)
  }
  if(!repo){
    throw new TypeError(`Missing org param in url`)
  }

  setOrgAndRepo(org, repo)

  /**
   * @param {ComptanarState} state  
   */
  function mapStateToProps(state) {
    return {
      user: state.user,
      logout: logoutAndRedirect,
      org,
      repo,
      conflict: state.conflict,
      personnes: state.personnes || [],
      salariats: state.salariats || [],
    }
  }

  const composant = new Salariats({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  })
  replaceComponent(composant, mapStateToProps)
})

page('/comptabilite/compte-resultat', loginMiddleware, ({ querystring }) => {
  const params = new URLSearchParams(querystring)

  const org = params.get('org') || undefined
  const repo = params.get('repo') || undefined
  
  if(!org){
    throw new TypeError(`Missing org param in url`)
  }
  if(!repo){
    throw new TypeError(`Missing org param in url`)
  }

  setOrgAndRepo(org, repo)

  /**
   * @param {ComptanarState} state  
   */
  function mapStateToProps(state) {
    return {
      user: state.user,
      logout: logoutAndRedirect,
      achats: getAchats(state) ?? [],
      org,
      repo,
      conflict: state.conflict,
      opérationsHautNiveauByYear: state.opérationsHautNiveauByYear,
    }
  }

  const compteRésultat = new CompteResultat({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  })

  replaceComponent(compteRésultat, mapStateToProps)
})

page('/comptabilite/import-banque', loginMiddleware, ({ querystring }) => {
  const params = new URLSearchParams(querystring)

  const org = params.get('org') || undefined
  const repo = params.get('repo') || undefined
  
  if(!org){
    throw new TypeError(`Missing org param in url`)
  }
  if(!repo){
    throw new TypeError(`Missing org param in url`)
  }

  setOrgAndRepo(org, repo)

  /**
   * @param {ComptanarState} state  
   */
  function mapStateToProps(state) {
    const lignesBancairesParAnnée =
      state.opérationsHautNiveauByYear &&
      new Map(
        [...state.opérationsHautNiveauByYear]
          .map(/** @type { (_: [number, OpérationHautNiveau[]]) => [number, LigneBancaire[]]} */ ([année, opérationsHautNiveau]) => [
            année,
            //@ts-expect-error nah, that's correct based on the 'type' property
            opérationsHautNiveau.filter(
              ({ type }) => type === 'Ligne bancaire',
            ),
          ])
          .filter(([_, lignesBancaires]) => lignesBancaires.length >= 1)
          // @ts-ignore feature récente, pas encore dans lib.d.ts (août 2023)
          .toSorted(([année1], [année2]) => année2 - année1),
      )

    return {
      user: state.user,
      logout: logoutAndRedirect,
      org,
      repo,
      conflict: state.conflict,
      lignesBancairesParAnnée,
    }
  }

  const importBanque = new ImportBanque({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  })

  replaceComponent(importBanque, mapStateToProps)
})

page('/resolution-desynchronisation', loginMiddleware, ({querystring}) => {
  const params = new URLSearchParams(querystring)

  const _org = params.get('org')
  const _repo = params.get('repo')
  
  if(!_org){
    throw new TypeError(`Missing org param in url`)
  }
  if(!_repo){
    throw new TypeError(`Missing org param in url`)
  }

  const org = _org
  const repo = _repo

  setOrgAndRepo(org, repo)

  /**
   * @param {ComptanarState} state  
   */
  function mapStateToProps(state) {
    return {
      user: state.user,
      logout: logoutAndRedirect,
      org,
      repo,
      conflict: state.conflict,
    }
  }

  const resolutionDesync = new ResolutionDesynchronisation({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  })

  replaceComponent(resolutionDesync, mapStateToProps)
})

page.start()