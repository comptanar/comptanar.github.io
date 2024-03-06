//@ts-check

/**
 * Ce fichier gère les interactions avec git (contenu, commits, branches, remotes, pull/pull, etc.)
 * et aussi le contenu sous-jacent et le filesystem
 * 
 * Normallement, aucun autre fichier ne devrait communiquer avec le fs directement
 * 
 * Ce fichier aspire à être neutre par rapport à Scribouilli ou Comptanar
 * Faire attention à ce qui y est importé 
 * et aux méthodes ajoutées
 */

import FS from '@isomorphic-git/lightning-fs'
import {listFiles, add, setConfig, remove, commit, merge, checkout, log, fetch, push, listBranches, listRemotes, branch, currentBranch, clone} from 'isomorphic-git'
import http from 'isomorphic-git/http/web/index.js'



const DEFAULT_CORS_PROXY_URL = 'https://cors.isomorphic-git.org'

/** @typedef {import('isomorphic-git')} isomorphicGit */
/** @typedef {import('isomorphic-git').GitAuth} GitAuth */

export default class GitAgent {
  #fs
  #remoteURL;
  #repoId;
  #corsProxyURL;
  #onAuth;
  #onMergeConflict;
  #onMergeSuccessful;

  // computed
  #origin;
  #hostname;
  #repoDirectory

  /**
   * @param { object } _
   * @param { string } _.repoId
   * @param { string } _.remoteURL
   * @param { string } [_.corsProxyURL]
   * @param { GitAuth } _.auth
   * @param { any } [_.onMergeConflict]
   * @param { any } [_.onMergeSuccessful]
   */
  constructor({
    repoId,
    remoteURL,
    corsProxyURL = DEFAULT_CORS_PROXY_URL,
    auth,
    onMergeConflict,
    onMergeSuccessful
  }) {
    this.#fs = new FS('comptanar')

    this.#repoId = repoId
    this.#remoteURL = remoteURL
    this.#onAuth = () => auth
    this.#onMergeConflict = onMergeConflict
    this.#onMergeSuccessful = onMergeSuccessful
    this.#corsProxyURL = corsProxyURL

    // computed
    this.#origin = new URL(this.#remoteURL).origin
    this.#hostname = new URL(this.#origin).hostname
    // filesystem directory
    this.#repoDirectory = `/${this.#hostname}/${this.#repoId}`

    Object.freeze(this)
  }

  
  /**
   *
   * @param {string} filename
   * @returns {string}
   */
  #path(filename) {
    return `${this.#repoDirectory}/${filename}`
  }
  
  /**
   * @summary helper to create ref strings for remotes
   *
   * @param {string} remote
   * @param {string} ref
   * @returns {string}
   */
  #createRemoteRef(remote, ref) {
    return `remotes/${remote}/${ref}`
  }

  /**
   *
   * @returns {ReturnType<isomorphicGit["clone"]>}
   */
  clone() {
    console.info('clone', this.#remoteURL)
    return clone({
      fs: this.#fs,
      dir: this.#repoDirectory,
      http,
      url: this.#remoteURL,
      // ref is purposefully omitted to get the default behavior (default repo branch)
      singleBranch: true,
      corsProxy: this.#corsProxyURL,
      depth: 5,
    })
  }

  /**
   *
   * @returns {ReturnType<isomorphicGit["currentBranch"]>}
   */
  currentBranch() {
    return currentBranch({
      fs: this.#fs,
      dir: this.#repoDirectory,
    })
  }

  /**
   *
   * @param {string} branchName
   * @param {boolean} [force]
   * @param {boolean} [checkout]
   * @returns {ReturnType<isomorphicGit["branch"]>}
   */
  branch(branchName, force = false, checkout = true) {
    return branch({
      fs: this.#fs,
      dir: this.#repoDirectory,
      ref: branchName,
      force,
      checkout,
    })
  }



  /**
   *
   * @returns {ReturnType<isomorphicGit["listRemotes"]>}
   */
  listRemotes() {
    return listRemotes({
      fs: this.#fs,
      dir: this.#repoDirectory,
    })
  }

  /**
   *
   * @param {string} [remote]
   * @returns {ReturnType<isomorphicGit["listBranches"]>}
   */
  listBranches(remote) {
    return listBranches({
      fs: this.#fs,
      dir: this.#repoDirectory,
      remote,
    })
  }

  /**
   * @summary This version of git push may fail if the remote repo
   * has unmerged changes
   *
   * @returns {ReturnType<isomorphicGit["push"]>}
   */
  falliblePush() {
    console.info('falliblePush')
    return push({
      fs: this.#fs,
      http,
      // ref is purposefully omitted to get the default (checked out branch)
      dir: this.#repoDirectory,
      corsProxy: this.#corsProxyURL,
      // See https://isomorphic-git.org/docs/en/onAuth#oauth2-tokens
      onAuth: this.#onAuth
    })
  }

  /**
   * @summary This version of git push tries to push
   * then tries to pull if the push fails
   * and tries again to push if the pull succeeded
   *
   * @returns {Promise<any>}
   */
  safePush() {
    console.info('safePush')
    return this.falliblePush()
      .catch(err => {
        console.log(
          'failliblePush error ! Assuming the error is that we are not up to date with the remote',
          err,
        )
        return this.fetchAndTryMerging().then(() => {
          console.log('pull/merge succeeded, try to push again')
          return this.falliblePush()
        })
      })
      .catch(err => {
        console.log(
          'the merge failed or the second push failed, there is nothing much we can try automatocally',
          err,
        )
        return err
      })
  }

  /**
   * @summary like git push --force
   *
   * @returns {ReturnType<isomorphicGit["push"]>}
   */
  forcePush() {
    console.info('forcePush')
    return push({
      fs: this.#fs,
      http,
      // ref is purposefully omitted to get the default (checked out branch)
      dir: this.#repoDirectory,
      force: true,
      corsProxy: this.#corsProxyURL,
      // See https://isomorphic-git.org/docs/en/onAuth#oauth2-tokens
      onAuth: this.#onAuth
    })
  }

  /**
   *
   * @returns {ReturnType<isomorphicGit["fetch"]>}
   */
  async fetch() {
    return fetch({
      fs: this.#fs,
      http,
      // ref is purposefully omitted to get the default (checked out branch)
      singleBranch: false, // we want all the branches
      dir: this.#repoDirectory,
      corsProxy: this.#corsProxyURL,
    })
  }

  /**
   *
   * @param {string} [ref]
   * @returns {Promise<import('isomorphic-git').CommitObject>}
   */
  currentCommit(ref = undefined) {
    return log({
        fs: this.#fs,
        dir: this.#repoDirectory,
        ref,
        depth: 1,
      })
      .then(commits => commits[0].commit)
  }

  /**
   *
   * @param {string} [ref]
   * @returns {ReturnType<isomorphicGit["checkout"]>}
   */
  checkout(ref = undefined) {
    return checkout({
      fs: this.#fs,
      dir: this.#repoDirectory,
      ref,
    })
  }

  /**
   *
   * @summary This function tries to merge
   * If it fails, it forwards the conflict to this.onMergeConflict with resolution propositions
   *
   * @returns {Promise<any>}
   */
  async tryMerging() {
    console.info('tryMerging')
    const [currentBranch, remotes] = await Promise.all([
      this.currentBranch(),
      this.listRemotes(),
    ])

    if (!currentBranch) {
      throw new TypeError('currentBranch is undefined')
    }

    const localBranch = currentBranch
    const remoteBranch = this.#createRemoteRef(remotes[0].remote, localBranch)

    return merge({
        fs: this.#fs,
        dir: this.#repoDirectory,
        // ours is purposefully omitted to get the default behavior (current branch)
        // assuming their is only one remote
        // assuming the remote and local branch have the same name
        theirs: remoteBranch,
        fastForward: true,
        abortOnConflict: true,
      })
      .then(() => {
        // this checkout is necessary to update FS files
        return this.checkout()
      })
      .then(() => {
        try{
          if(this.#onMergeSuccessful){
            this.#onMergeSuccessful()
          }
        }
        catch(e){
          // ignore this.#onMergeSuccessful error
        }
      })
      .catch(err => {
        console.log('merge error', err)

        this.#onMergeConflict &&
          this.#onMergeConflict([
            {
              message: `Garder la version actuelle collective de la comptabilité (et perdre les changements récents stockés uniquement sur cet ordinateur)`,
              resolution: async () => {
                const currentBranch = await this.currentBranch()
                if (!currentBranch) {
                  throw new TypeError('Missing currentBranch')
                }

                const remotes = await this.listRemotes()
                const firstRemote = remotes[0].remote
                const remoteBranches = await this.listBranches(firstRemote)
                const targetedRemoteBranch = this.#createRemoteRef(
                  firstRemote,
                  remoteBranches[0],
                )

                await this.checkout(targetedRemoteBranch)

                await this.branch(currentBranch, true, true)
              },
            },
            {
              message: `Garder la version actuelle de cet ordinateur (et perdre la version collective de la comptabilité)`,
              resolution: () => {
                return this.forcePush()
              },
            },
          ])
      })
  }

  /**
   * @summary Create a commit with the given message.
   *
   * @param {string} message
   *
   * @returns {ReturnType<isomorphicGit["commit"]>} sha of the commit
   */
  commit(message) {
    return commit({
      fs: this.#fs,
      dir: this.#repoDirectory,
      message,
    })
  }

  /**
   * @summary Remove file from git tree and from the file system
   *
   * @param {string} fileName
   * @returns {ReturnType<isomorphicGit["remove"]>}
   */
  async removeFile(fileName) {
    const path = this.#path(fileName)
    await this.#fs.promises.unlink(path)
    return remove({
      fs: this.#fs,
      dir: this.#repoDirectory,
      filepath: fileName,
    })
  }

  /**
   * @summary like a git pull but the merge is better customized
   *
   * @returns {Promise<any>}
   */
  async fetchAndTryMerging() {
    await this.fetch()
    await this.tryMerging()
  }

  /**
   *
   * @return {Promise<any>}
   */
  async pullOrCloneRepo() {

    let dirExists = true
    try {
      const stat = await this.#fs.promises.stat(this.#repoDirectory)
      dirExists = stat.isDirectory()
    } catch {
      dirExists = false
    }

    if (dirExists) {
      return this.fetchAndTryMerging()
    } else {
      return this.clone()
    }
  }

  /**
   * Assigne l'auteur et l'email pour les commits git
   *
   * On voudrait le faire en global, mais ça n'est pas possible actuellement avec isomorphic-git (1.24.2)
   * > Currently only the local $GIT_DIR/config file can be read or written. However support for the global ~/.gitconfig and system $(prefix)/etc/gitconfig will be added in the future.
   * Voir https://github.com/isomorphic-git/isomorphic-git/pull/1779
   *
   *
   * https://isomorphic-git.org/docs/en/setConfig
   *
   * Alors, on doit passer le repoName
   *
   * @param {string} login
   * @param {string} email
   * @returns {Promise<ReturnType<isomorphicGit["setConfig"]>>}
   */
  async setAuthor(login, email) {
    if (!login || !email) {
      return
    }

    await setConfig({
      fs: this.#fs,
      dir: this.#repoDirectory,
      path: 'user.name',
      value: login,
    })
    return setConfig({
      fs: this.#fs,
      dir: this.#repoDirectory,
      path: 'user.email',
      value: email,
    })
  }

  /**
   * @summary Get file content as Uint8Array
   *
   * @param {string} fileName
   * @returns {Promise<Uint8Array>}
   */
  async getFileAsUint8Array(fileName) {
    //@ts-expect-error not enough precise types, but when no encoding is passed, 
    // readFile should return a Uint8Array
    return this.#fs.promises.readFile(
      this.#path(fileName)
    )
  }


  /**
   * @summary Get file content as string
   *
   * @param {string} fileName
   * @returns {Promise<string>}
   */
  async getFile(fileName) {
    //@ts-expect-error not enough precise types, but when no encoding is passed, 
    // readFile should return a Uint8Array
    return this.#fs.promises.readFile(
      this.#path(fileName),
      { encoding: 'utf8' }
    )
  }

  /**
   * @summary Create or update a file and add it to the git staging area
   *
   * @param {string | Uint8Array} content
   * @param {string} fileName
   *
   * @returns {Promise<void>}
   */
  async writeFile(fileName, content) {
    // This condition is here just in case, but it should not happen in practice
    // Having an empty file name will not lead immediately to a crash but will result in
    // some bugs later, see https://github.com/Scribouilli/scribouilli/issues/49#issuecomment-1648226372
    if (fileName === '') {
      throw new TypeError('Empty file name')
    }

    await this.#fs.promises.writeFile(this.#path(fileName), content)
    await add({
      fs: this.#fs,
      filepath: fileName,
      dir: this.#repoDirectory,
    })
  }

  /**
   * @param {string} fileName
   * @param {string|Uint8Array} content
   * @param {string} [commitMessage]
   *
   * @returns {Promise<string>}
   */
  writeFileAndCommit(fileName, content, commitMessage = `Modification du fichier ${fileName}`) {
    return this.writeFile(fileName, content).then(() => {
      return this.commit(commitMessage)
    })
  }

  /**
 * @param {string} fileName
 * @param {string|Uint8Array} content
 * @param {string} [commitMessage]
 *
 * @returns {ReturnType<typeof GitAgent.prototype.safePush>}
 */
  writeFileAndPushChanges(fileName, content, commitMessage){
    return this.writeFileAndCommit(fileName, content, commitMessage)
      .then(() => this.safePush())
  }


  /**
   *
   * @param {string} dir
   * @returns
   */
  listFiles(dir) {
    return this.#fs.promises.readdir(this.#path(dir))
  }

  /**
   *
   * @param {string} [ref]
   * @returns
   */
  listAllFiles(ref = 'HEAD') {
    return listFiles({
      fs: this.#fs,
      ref,
      dir: this.#repoDirectory,
    })
  }

  /**
   *
   * @param {string} filename
   * @returns
   */
  async checkFileExistence(filename) {
    const stat = await this.#fs.promises.stat(this.#path(filename))
    return stat.isFile()
  }
}
