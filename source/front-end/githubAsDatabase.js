//@ts-check

import { request } from "@octokit/request";

import { parseOpérationsHautNiveauYaml, stringifyOpérationsHautNiveauYaml } from '../format-données/opérationsHautNiveau.js'
import { parsePersonnes, stringifyPersonnesYaml } from "../format-données/personnes.js";
import { b64ToUTF8, UTF8ToB64 } from "./utf8Base64.js";
import { parseSalariat, stringifySalariatsYaml } from "../format-données/salariat.js";

import '../format-données/types/main.js'

const initialRequestDefaults = {
    headers: {
        'user-agent': 'comptanar https://github.com/comptanar/comptanar.github.io',
    }
}

let theRequest = request.defaults(initialRequestDefaults)

function opérationsHautNiveauPath(year) {
    return `exercices/${year}/operationsHautNiveau.yml`
}

const personnesPath = 'personnes.yml'
const salariatsPath = 'salariats.yml'

export default {
    reset() {
        theRequest = request.defaults(initialRequestDefaults)
    },
    set token(token) {
        theRequest = theRequest.defaults({
            headers: {
                authorization: `token ${token}`,
            }
        })
    },
    set owner(owner) {
        theRequest = theRequest.defaults({ owner })
    },
    set repo(repo) {
        theRequest = theRequest.defaults({ repo })
    },
    getAuthenticatedUser() {
        return theRequest("/user")
            .then(({ data }) => {
                const login = data.login

                return data
            })
    },
    getOrgs() {
        return theRequest("/user/orgs")
            .then(({ data: organisations }) => {
                console.log('organisations', organisations)

                return organisations
            })
    },
    getRepo(owner, repo) {
        return theRequest(`/repos/${owner}/${repo}`)
    },
    createComptabilityRepo(owner, name) {
        const TEMPLATE_OWNER = 'comptanar'
        const TEMPLATE_REPO = 'comptabilite'

        return theRequest(`/repos/${TEMPLATE_OWNER}/${TEMPLATE_REPO}/generate`, {
            method: 'POST',
            owner,
            name
        })
    },
    getExercices() {
        return theRequest(`/repos/{owner}/{repo}/contents/exercices`)
            .then(({ data: exercicesDir }) => {
                console.log('exercices', exercicesDir)

                const promisesToWait = [];

                const opérationsHautNiveauByYear = new Map();
                for (const { name, git_url } of exercicesDir) {
                    const year = Number(name)

                    const exerciceDirP = theRequest(git_url).then(({ data: exerciceDirGitObj }) => {

                        const treeFiles = exerciceDirGitObj.tree;

                        if (treeFiles.length >= 2) {
                            throw TypeError(`Il ne devrait y avoir qu'un seul fichier opérationsHautNiveau.yml et il y a plusieurs fichiers`)
                        }

                        const opérationsHautNiveauTreeFile = treeFiles[0];
                        const { url } = opérationsHautNiveauTreeFile

                        const opérationsHautNiveauFileContentP = theRequest(url).then(({ data: { encoding, content, sha } }) => {
                            if (encoding === 'base64') {
                                const ymlContent = b64ToUTF8(content)

                                const opérationsHautNiveau = parseOpérationsHautNiveauYaml(ymlContent)
                                opérationsHautNiveauByYear.set(year, { opérationsHautNiveau, sha })
                            }
                            else {
                                throw new TypeError(`type de fichier inconnu: ${encoding}. On ne sait gérer que 'base64'`)
                            }
                        })

                        promisesToWait.push(opérationsHautNiveauFileContentP)

                        return opérationsHautNiveauFileContentP
                    })

                    promisesToWait.push(exerciceDirP)
                }

                return Promise.all(promisesToWait).then(() => opérationsHautNiveauByYear)
            })
    },
    /**
     * @param {number} year
     * @param {string?} sha
     * @param {OpérationHautNiveau[]} opérationsHautNiveau
     * @param {string} [message]
     */
    writeExercice(year, sha, opérationsHautNiveau, message) {
        return theRequest(`/repos/{owner}/{repo}/contents/${opérationsHautNiveauPath(year)}`, {
            method: 'PUT',
            message: message || `Mise à jour des opérations haut niveau de l'exercice ${year}`,
            sha,
            content: UTF8ToB64(stringifyOpérationsHautNiveauYaml(opérationsHautNiveau))
        })
    },
    /**
     * @param {number} year
     * @param {string} sha
     * @param {string} [message]
     */
    deleteExercice(year, sha, message) {
        return theRequest(`/repos/{owner}/{repo}/contents/${opérationsHautNiveauPath(year)}`, {
            method: 'DELETE',
            sha,
            message: message || `Suppression de l'exercice ${year}`
        })
    },
    /**
     * Renvoie la liste des personnes stockée sur GitHub
     * @type {() => Promise<WithSha<Personne[]>>}
     */
    getPersonnes: fileReader(personnesPath, parsePersonnes),
    /**
     * Sauvegarde une liste de personnes dans le dépôt GitHub
     * @param {string} sha
     * @param {Personne[]} personnes 
     * @param {string} message 
     */
    writePersonnes: fileWriter(personnesPath, 'Mise à jour des personnes', stringifyPersonnesYaml),
    getSalariats: fileReader(salariatsPath, parseSalariat),
    writeSalariats: fileWriter(salariatsPath, 'Mise à jour des salarié⋅es', stringifySalariatsYaml),
}

// Quelques fonctions utilitaires :


/**
 * Génère une fonction de lecture de données stockées dans un fichier unique
 * @template T
 * @param {string} path 
 * @param {(data: string) => T} parser 
 * @returns {() => Promise<{ sha: string, data: T}>}
 */
function fileReader(path, parser) {
    return async () => {
        const { data: { encoding, content, sha } } = await theRequest(`/repos/{owner}/{repo}/contents/${path}`)

        if (typeof sha !== 'string') throw new TypeError()
        if (typeof content !== 'string') throw new TypeError()

        if (encoding === 'base64') {
            return { sha, data: parser(b64ToUTF8(content)) }
        } else {
            throw new TypeError(`Encodage du fichier ${path} incorrect : on attendait du base64, on a du ${encoding}`)
        }
    }
}

/**
 * Génère une fonction d'écriture de données dans un fichier unique
 * 
 * @template T
 * @param {string} path 
 * @param {string} defaultMessage 
 * @param {(T) => string} formatter 
 * @returns {(sha: string, data: T, message?: string) => Promise<import("@octokit/types").OctokitResponse<any>>}
 */
function fileWriter(path, defaultMessage, formatter) {
    return (sha, data, message) => theRequest(`/repos/{owner}/{repo}/contents/${path}`, {
        method: 'PUT',
        message: message || defaultMessage,
        sha,
        content: UTF8ToB64(formatter(data))
    })
}