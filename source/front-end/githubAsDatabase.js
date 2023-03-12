//@ts-check

import { request } from "@octokit/request";

const initialRequestDefaults = {
    headers: {
        "user-agent": "comptanar https://github.com/comptanar/comptanar.github.io",
    }
}

export default function Database(){
    
    let theRequest = request.defaults(initialRequestDefaults)

    return {
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
        set owner(owner){
            theRequest = theRequest.defaults({ owner })
        },
        set repo(repo){
            theRequest = theRequest.defaults({ repo })
        },
        getAuthenticatedUser() {
            return theRequest("https://api.github.com/user")
                .then(({data}) => {
                    const login = data.login
                    this.owner = login;

                    return data
                })
        }
    }



}