//@ts-check

import Store from "baredux";
import page from "page";

import Welcome from './composants/screens/Welcome.svelte'
import Database from './githubAsDatabase.js'

import {rememberToken, forgetToken} from './localStorage.js'

const storedToken = await rememberToken()

const GITHUB_TOKEN_SEARCH_PARAM = "access_token"

// @ts-ignore
const store = new Store({
    state: {
        // @ts-ignore
        accessToken: new URL(location).searchParams.get(GITHUB_TOKEN_SEARCH_PARAM) || storedToken,
        login: undefined, // Promise<string> | string
        repoName: "test-comptabilite-repo-6731",
    },
    mutations: {
        setLogin(state, login) {
            state.login = login;
        },
        logout(state) {
            state.accessToken = undefined
            state.login = undefined
            state.repoName = undefined
        }
    },
});

function logout(){
    console.info('logout')
    store.mutations.logout()

    forgetToken()
    .then(() => page('/'))
}


// Store access token in browser localStorage
const url = new URL(location.href)
if (url.searchParams.has(GITHUB_TOKEN_SEARCH_PARAM)) {
    rememberToken(store.state.accessToken)

    url.searchParams.delete(GITHUB_TOKEN_SEARCH_PARAM)
    history.replaceState(undefined, '', url)
}

console.log('token', store.state.accessToken)

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
 * Init script
 */
let databaseAPI
if (store.state.accessToken) {
    databaseAPI = Database()

    // Retrieve logged in user from access token
    databaseAPI.token = store.state.accessToken;

    const loginP = databaseAPI.getAuthenticatedUser()
        // @ts-ignore
        .then(({ login }) => {
            store.mutations.setLogin(login);
            return login;
        })
        //.catch(msg => handleErrors(msg));

    store.mutations.setLogin(loginP);
    
/*
    const siteRepoConfigP = loginP.then((login) => {
        return databaseAPI.getRepository(login, store.state.repoName).catch(msg => handleErrors(msg));
    })

    store.mutations.setSiteRepoConfig(siteRepoConfigP)
    siteRepoConfigP.catch((error) => handleErrors(error))*/
} else {
    //history.replaceState(undefined, '', store.state.basePath + "/")
}




/**
 * Routes
 */

page("/", () => {
    if (store.state.login) {
        const repoName = store.state.repoName;

        Promise.resolve(store.state.login).then((login) => {
            
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



page.start();