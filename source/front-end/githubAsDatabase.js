//@ts-check

import { request } from "@octokit/request";

import { parseOpérationsHautNiveauYaml, stringifyOpérationsHautNiveauYaml } from '../format-données/opérationsHautNiveau.js'

const initialRequestDefaults = {
    headers: {
        'user-agent': 'comptanar https://github.com/comptanar/comptanar.github.io',
    }
}

let theRequest = request.defaults(initialRequestDefaults)

function opérationsHautNiveauPath(year){
    return `exercices/${year}/opérationsHautNiveau.yml`
}

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

            const promisesToWait = [];

            const opérationsHautNiveauByYear = new Map();
            for(const {name, git_url} of exercicesDir){
                const year = Number(name)
                console.log('year', year);
                console.log('git url', git_url);
                
                const exerciceDirP = theRequest(git_url).then(({data: exerciceDirGitObj}) => {
                    console.log('exerciceFiles', year, exerciceDirGitObj);
                    
                    const treeFiles = exerciceDirGitObj.tree;

                    if(treeFiles.length >= 2){
                        throw TypeError(`Il ne devrait y avoir qu'un seul fichier opérationsHautNiveau.yml et il y a plusieurs fichiers`)
                    }

                    const opérationsHautNiveauTreeFile = treeFiles[0];

                    const {path, url} = opérationsHautNiveauTreeFile
                    console.log('opérationsHautNiveauFile', year, path, url);

                    const opérationsHautNiveauFileContentP = theRequest(url).then(({data: {encoding, content, sha}}) => {
                        if(encoding === 'base64'){
                            const ymlContent = atob(content)
                            console.log('ymlContent', ymlContent)

                            const opérationsHautNiveau = parseOpérationsHautNiveauYaml(ymlContent)
                            console.log('opérationsHautNiveau', opérationsHautNiveau)

                            opérationsHautNiveauByYear.set(year, {opérationsHautNiveau, sha})
                        }
                        else{
                            throw new TypeError(`type de fichier inconnu: ${encoding}. On ne sait gérer que 'base64'`)
                        }
                    })

                    promisesToWait.push(opérationsHautNiveauFileContentP)

                    return opérationsHautNiveauFileContentP
                })

                promisesToWait.push(exerciceDirP)

                return Promise.all(promisesToWait).then(() => opérationsHautNiveauByYear)
            }
        })
    },
    /**
     * @param {number} year
     * @param {string} sha
     * @param {OpérationHautNiveau[]} opérationsHautNiveau
     * @param {string?} message
     */
    writeExercice(year, sha, opérationsHautNiveau, message){
        return theRequest(`/repos/{owner}/{repo}/contents/${opérationsHautNiveauPath(year)}`, {
            method: 'PUT',
            message: message || `Mise à jour des opérations haut niveau de l'exercice ${year}`,
            sha,
            content: btoa(stringifyOpérationsHautNiveauYaml(opérationsHautNiveau))
        })
    }
}
