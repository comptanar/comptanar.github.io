//@ts-check

import page from "page";

import Welcome from './composants/screens/Welcome.svelte'
import ChooseOrganisation from './composants/screens/ChooseOrganisation.svelte'
import Comptabilite from "./composants/screens/Comptabilite.svelte";
import Factures from "./composants/screens/Factures.svelte";
import FichesDePaie from './composants/screens/FichesDePaie.svelte'
import Personnes from './composants/screens/Personnes.svelte'
import Salarié·es from './composants/screens/Salarié·es.svelte'
import Achats from './composants/screens/Achats.svelte'

import store, {getAchats, getEnvoiFactureÀClients, getFichesDePaie} from './store.js'
import {
    logout, saveToken, initDance, getUserOrgChoices, selectOrgAndRepo,
    envoyerFicheDePaie,
    supprimerPersonne, envoyerPersonne,
    envoyerSalarié·e, supprimerSalarié·e,
} from './actions.js'
import { créerEnvoiFactureÀClientVide, créerFicheDePaieVide } from '../format-données/opérationsHautNiveau'

console.info('start')

/**
 * Component rendering loop
 */
const svelteTarget = document.body;

let currentComponent;
let currentMapStateToProps = (_) => { };

function replaceComponent(newComponent, newMapStateToProps) {
    if (!newMapStateToProps) {
        throw new Error("Missing _mapStateToProps in replaceComponent");
    }

    if (currentComponent) currentComponent.$destroy();

    currentComponent = newComponent;
    currentMapStateToProps = newMapStateToProps;
}

function render(state) {

    const props = currentMapStateToProps(state);
    // @ts-ignore
    if (props) {
        currentComponent.$set(props);
    }
}

store.subscribe(render);


function logoutAndRedirect(){
    logout().then(() => page('/'))
}

/**
 * Routes
 */
page("/", () => {
    console.info('route', '/')
    if (store.state.login) {
        const repoName = store.state.repoName;

        Promise.resolve(store.state.login).then((login) => {
            console.info('Logged in as', login, 'Moving to /choose-organisation')
            page('/choose-organisation')
        });
    }

    function mapStateToProps(state){
        return {
            login: state.login,
            logout: logoutAndRedirect
        }
    }

    // @ts-ignore
    const welcome = new Welcome({
        target: svelteTarget,
        props: mapStateToProps(store.state),
    });

    replaceComponent(welcome, mapStateToProps);
});


page('/choose-organisation', () => {
    console.info('route', '/choose-organisation')

    getUserOrgChoices()

    function mapStateToProps(state){
        return {
            login: state.login,
            logout: logoutAndRedirect,
            possibleOrganisations: state.userOrgs
        }
    }

    const chooseOrganisation = new ChooseOrganisation({
        target: svelteTarget,
        props: mapStateToProps(store.state),
    });

    replaceComponent(chooseOrganisation, mapStateToProps);
})

page('/comptabilite/', ({ querystring }) => {
    console.info('route', '/comptabilite/', querystring)

    const params = new URLSearchParams(querystring)

    const org = params.get('org');
    const repo = params.get('repo');

    selectOrgAndRepo(org, repo)

    function mapStateToProps(state){
        return {
            login: state.login,
            logout: logoutAndRedirect,
            org,
            repo
        }
    }

    const comptabilite = new Comptabilite({
        target: svelteTarget,
        props: mapStateToProps(store.state),
    });

    replaceComponent(comptabilite, mapStateToProps);
})

page('/comptabilite/factures', ({ querystring }) => {
    console.info('route', '/comptabilite/factures', querystring)
    const params = new URLSearchParams(querystring)

    const org = params.get('org');
    const repo = params.get('repo');

    selectOrgAndRepo(org, repo)

    function mapStateToProps(state){
        return {
            login: state.login,
            logout: logoutAndRedirect,
            org,
            repo,
            envoiFactureàClients : getEnvoiFactureÀClients(state)
        }
    }

    const factures = new Factures({
        target: svelteTarget,
        props: mapStateToProps(store.state),
    });

    replaceComponent(factures, mapStateToProps);
})

page('/comptabilite/fiches-de-paie', ({ querystring }) => {
    const params = new URLSearchParams(querystring)

    const org = params.get('org');
    const repo = params.get('repo');

    selectOrgAndRepo(org, repo)

    function mapStateToProps(state){
        return {
            login: state.login,
            logout: logoutAndRedirect,
            org,
            repo,
            personnes: state.personnes?.data ?? [],
            fichesDePaie: getFichesDePaie(state),
        }
    }

    const factures = new FichesDePaie({
        target: svelteTarget,
        props: mapStateToProps(store.state),
    });

    replaceComponent(factures, mapStateToProps);
})

page('/comptabilite/personnes', ({ querystring }) => {
    const params = new URLSearchParams(querystring)

    const org = params.get('org');
    const repo = params.get('repo');

    selectOrgAndRepo(org, repo)

    function mapStateToProps(state){
        return {
            login: state.login,
            logout: logoutAndRedirect,
            org,
            repo,
            personnes: state.personnes?.data ?? [],
            envoyerPersonne,
            supprimerPersonne,
        }
    }

    const factures = new Personnes({
        target: svelteTarget,
        props: mapStateToProps(store.state),
    });

    replaceComponent(factures, mapStateToProps);
})

page('/comptabilite/salarié·es', ({ querystring }) => {
    const params = new URLSearchParams(querystring)

    const org = params.get('org');
    const repo = params.get('repo');

    selectOrgAndRepo(org, repo)

    function mapStateToProps(state){
        return {
            login: state.login,
            logout: logoutAndRedirect,
            org,
            repo,
            personnes: state.personnes?.data ?? [],
            salarié·es: state.salarié·es?.data ?? [],
            envoyerSalarié·e,
            supprimerSalarié·e,
        }
    }

    const factures = new Salarié·es({
        target: svelteTarget,
        props: mapStateToProps(store.state),
    });

    replaceComponent(factures, mapStateToProps);
})

page('/comptabilite/achats', ({ querystring }) => {
    const params = new URLSearchParams(querystring)

    const org = params.get('org');
    const repo = params.get('repo');

    selectOrgAndRepo(org, repo)

    function mapStateToProps(state){
        return {
            login: state.login,
            logout: logoutAndRedirect,
            achats: getAchats(state) ?? [],
            org,
            repo,
        }
    }

    const factures = new Achats({
        target: svelteTarget,
        props: mapStateToProps(store.state),
    });

    replaceComponent(factures, mapStateToProps);
})

/**
 * Init script
 */

const GITHUB_TOKEN_SEARCH_PARAM = "access_token"

// Store access token in URL into browser localStorage and replace URL to the same without the token
const url = new URL(location.href)

const urlToken = url.searchParams.get(GITHUB_TOKEN_SEARCH_PARAM)

if (urlToken) {
    saveToken(urlToken)
    .then(() => {
        url.searchParams.delete(GITHUB_TOKEN_SEARCH_PARAM)
        history.replaceState(undefined, '', url)
    })
    .catch(err => {
        console.error('Saving token failed', err)
    })
}

initDance()
.catch(error => {
    console.error('init dance error', error)
})
.then(login => {
    if(!login){
        page.start({dispatch: false});
        console.info('no valid login found, redirected to / route')

        logout()
            .then(() => page('/'))
    }
    else{
        page.start();
    }
})

