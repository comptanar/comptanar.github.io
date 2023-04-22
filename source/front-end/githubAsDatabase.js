//@ts-check

import { request } from "@octokit/request";

import { parseOpérationsHautNiveauYaml } from '../format-données/opérationsHautNiveau.js'

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
    set owner(owner){
        theRequest = theRequest.defaults({ owner })
    },
    set repo(repo){
        theRequest = theRequest.defaults({ repo })
    },
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
    },
    getExercices(){
        return theRequest(`/repos/{owner}/{repo}/contents/exercices`)
        .then(({data: exercicesDir}) => {
            console.log('exercices', exercicesDir)
            
            const files = exercicesDir.files

            console.log('files', files);

            const promisesToWait = [];

            const opérationsHautNiveauByYear = new Map();
            for(const {name, urls: {git}} of files){
                const year = Number(name)
                console.log('year', year);
                console.log('git url', git);
                
                const exerciceDirP = theRequest(git).then(({data: exerciceDir}) => {
                    const exerciceFiles = exerciceDir.files
                    console.log('exerciceFiles', year, exerciceFiles);
                  
                    if(exerciceFiles.length >= 2){
                        throw TypeError(`Il ne devrait y avoir qu'un seule fichier opérationsHautNiveau.yml et il y a plusieurs fichiers`)
                    }

                    const opérationsHautNiveauFile = exerciceFiles[0];

                    const {name, urls: {git}} = opérationsHautNiveauFile
                    console.log('opérationsHautNiveauFile', year, name, git);

                    const opérationsHautNiveauFileContentP = theRequest(git).then(({data: {content, type}}) => {
                        if(type === 'base64'){
                            const ymlContent = btoa(content)
                            console.log('ymlContent', ymlContent)

                            const opérationsHautNiveau = parseOpérationsHautNiveauYaml(ymlContent)
                            console.log('opérationsHautNiveau', opérationsHautNiveau)

                            opérationsHautNiveauByYear.set(year, opérationsHautNiveau)
                        }
                        else{
                            throw new TypeError(`type de fichier inconnu: ${type}. On ne sait gérer que 'base64'`)
                        }
                    })

                    promisesToWait.push(opérationsHautNiveauFileContentP)
                })

                promisesToWait.push(exerciceDirP)

                return Promise.all(promisesToWait).then(() => opérationsHautNiveauByYear)
            }
        })
    }
}
