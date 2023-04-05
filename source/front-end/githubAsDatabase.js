//@ts-check

import { request } from "@octokit/request";

const initialRequestDefaults = {
    headers: {
        'user-agent': 'comptanar https://github.com/comptanar/comptanar.github.io',
    }
}

let theRequest = request.defaults(initialRequestDefaults)

export default {
    reset(){
        theRequest = request.defaults(initialRequestDefaults)
    },
    set token(token){
        theRequest = theRequest.defaults({
            headers: {
                authorization: `token ${token}`,
            }
        })
    },
/*    set owner(owner){
        theRequest = theRequest.defaults({ owner })
    },
    set repo(repo){
        theRequest = theRequest.defaults({ repo })
    },*/
    getAuthenticatedUser() {
        return theRequest("/user")
            .then(({data}) => {
                const login = data.login

                return data
            })
    },
    getOrgs(){
        return theRequest("/user/orgs")
            .then(({data: organisations}) => {
                console.log('organisations', organisations)

                return organisations
            })
    },
    getRepo(owner, repo){
        return theRequest(`/repos/${owner}/${repo}`)
    },
    createComptabilityRepo(owner, name){
        const TEMPLATE_OWNER = 'comptanar'
        const TEMPLATE_REPO = 'comptabilite'

        return theRequest(`/repos/${TEMPLATE_OWNER}/${TEMPLATE_REPO}/generate`, {
            method: 'POST',
            owner,
            name
        })
    }
}
