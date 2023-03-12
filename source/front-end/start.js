import Store from "baredux";

// import page from "page";

const ACCESS_TOKEN_STORAGE_KEY = "comptanar_github_access_token"

// @ts-ignore
const store = new Store({
    state: {
        // @ts-ignore
        accessToken: new URL(location).searchParams.get("access_token") || localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY),
        login: undefined, // Promise<string> | string
        origin: undefined, // Promise<string> | string
        repoName: "test-comptabilite-repo-6731",
        basePath: location.hostname.endsWith(".github.io") ? "/scribouilli" : ""
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