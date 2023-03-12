//@ts-check

import Store from "baredux";

import page from "page";

import Welcome from './composants/screens/Welcome.svelte'

import Database from './githubAsDatabase.js'

const ACCESS_TOKEN_STORAGE_KEY = "comptanar_github_access_token"

// @ts-ignore
const store = new Store({
    state: {
        // @ts-ignore
        accessToken: new URL(location).searchParams.get("access_token") || localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY),
        login: undefined, // Promise<string> | string
        origin: undefined, // Promise<string> | string
        repoName: "test-comptabilite-repo-6731",
    },
    mutations: {
        setLogin(state, login) {
            state.login = login;
        },
        invalidateToken(state) {
            state.accessToken = undefined
            localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
            console.log("Token has been invalidated")
        }
    },
});


// Store access_token in browser
const url = new URL(location.href)
if (url.searchParams.has("access_token")) {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, store.state.accessToken)

    url.searchParams.delete("access_token")
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

    // Retrieve logged in user from access_token
    databaseAPI.token = store.state.accessToken;

    const loginP = databaseAPI.getAuthenticatedUser()
        // @ts-ignore
        .then(({ login }) => {
            store.mutations.setLogin(login);
            return login;
        }).catch(msg => handleErrors(msg));

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
    /*if (store.state.login) {
        const repoName = store.state.repoName;

        Promise.resolve(store.state.login).then(async (login) => {
            return checkRepositoryAvailabilityThen(login, repoName, () => {
                page("/atelier-list-pages");
            })
        });
    }*/

    function mapStateToProps(state){
        return {login: state.login}
    }

    // @ts-ignore
    const welcome = new Welcome({
        target: svelteTarget,
        props: mapStateToProps(store.state),
    });

    replaceComponent(welcome, mapStateToProps);
});



page.start();