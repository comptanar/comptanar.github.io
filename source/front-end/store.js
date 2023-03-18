//@ts-check

import Store from "baredux";

import {rememberToken} from './localStorage.js';

export default Store({
    state: {
        // @ts-ignore
        githubToken: await rememberToken(),
        login: undefined, // Promise<string> | string
        repoName: "test-comptabilite-repo-6731",
    },
    mutations: {
        setToken(state, githubToken){
            state.githubToken = githubToken
        },
        setLogin(state, login) {
            state.login = login;
        },
        logout(state) {
            state.githubToken = undefined
            state.login = undefined
            state.repoName = undefined
        }
    },
});
