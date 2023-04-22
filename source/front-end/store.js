//@ts-check

import Store from "baredux";

import {rememberToken} from './localStorage.js';

export default Store({
    state: {
        // @ts-ignore
        githubToken: await rememberToken(),
        login: undefined, // Promise<string> | string
        userOrgs: undefined,
        org: undefined,
        repo: undefined,
        opérationsHautNiveauByYear: undefined
    },
    mutations: {
        setToken(state, githubToken){
            state.githubToken = githubToken
        },
        setLogin(state, login) {
            state.login = login
        },
        setUserOrgs(state, orgs){
            state.userOrgs = orgs
        },
        logout(state) {
            state.githubToken = undefined
            state.login = undefined
            state.userOrgs = undefined
        },
        setOrgAndRepo(state, org, repo) {
            state.org = org
            state.repo = repo
        },
        setOpérationsHautNiveauByYear(state, opérationsHautNiveauByYear){
            state.opérationsHautNiveauByYear = opérationsHautNiveauByYear
        }
    },
});
