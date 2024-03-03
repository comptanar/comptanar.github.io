//@ts-check

import store from '../store.js'

import {
  parsePersonnes,
  stringifyPersonnesYaml,
} from '../../format-données/personnes.js'


const personnesPath = 'personnes.yml'

async function getPersonnesFromRepo() {
  const { gitAgent } = store.state

  if (!gitAgent)
    throw new TypeError('Missing gitAgent')

  const fileContent = await gitAgent.getFile(personnesPath)
  if (fileContent) {
    return parsePersonnes(fileContent)
  }
  else {
    return []
  }
}

export function personnesRepoToStore(){
  return getPersonnesFromRepo().then(store.mutations.setPersonnes)
}

function personnesStoreToRepo(commitMessage = 'Mise à jour des personnes') {
  const { personnes, gitAgent } = store.state

  if (!gitAgent)
    throw new TypeError('Missing gitAgent')

  return gitAgent.writeFileAndPushChanges(
    personnesPath,
    stringifyPersonnesYaml(personnes),
    commitMessage
  )
}

/** @type {(personne: Personne) => Promise<void>} */
export function envoyerPersonne(personne) {
  const creation = !store.state.personnes.some(
    p => p.identifiant === personne.identifiant,
  )

  if (creation) {
    store.mutations.addPersonne(personne)
    return personnesStoreToRepo(`Ajout de la personne ${personne.nom}`)
  }
  else {
    store.mutations.updatePersonne(personne)
    return personnesStoreToRepo(`Modification de ${personne.nom}`)
  }
}

/** @type {(personne: Personne) => Promise<void>} */
export const supprimerPersonne = personne => {
  store.mutations.supprimerPersonne(personne)
  return personnesStoreToRepo(`Suppression de la personne ${personne.nom}`)
}