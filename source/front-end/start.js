//@ts-check

import page from "page";

import Welcome from './composants/screens/Welcome.svelte'
import ChooseOrganisation from './composants/screens/ChooseOrganisation.svelte'

import store from './store.js'
import {logout, saveToken, loginInitDance} from './actions.js'

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
            logout: logout
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
    function mapStateToProps(state){
        return {
            login: state.login,
            logout: logout
        }
    }

    const chooseOrganisation = new ChooseOrganisation({
        target: svelteTarget,
        props: mapStateToProps(store.state),
    });

    replaceComponent(chooseOrganisation, mapStateToProps);
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
    .then(token => {
        console.log('after save', token)

        url.searchParams.delete(GITHUB_TOKEN_SEARCH_PARAM)
        history.replaceState(undefined, '', url)
    })
    .catch(err => {
        console.error('Saving token failed', err)
    })
    
}

loginInitDance()
.catch(error => {
    console.error('login dance error', error)

    logout()
        .then(() => page('/'))
})

page.start();
