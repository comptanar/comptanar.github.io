//@ts-check

import store from '../store.js'

import {
  parseSalariats,
  stringifySalariatsYaml,
} from '../../format-données/salariats.js'


const salariatsPath = 'salariats.yml'

async function getSalariatsFromRepo() {
  const { gitAgent } = store.state

  if (!gitAgent)
    throw new TypeError('Missing gitAgent')

  const fileContent = await gitAgent.getFile(salariatsPath)
  if (fileContent) {
    return parseSalariats(fileContent)
  }
  else {
    return []
  }
}

export function salariatsRepoToStore(){
  return getSalariatsFromRepo().then(store.mutations.setSalariats)
}

function salariatsStoreToRepo(commitMessage = 'Mise à jour des salariats') {
  const { salariats, gitAgent } = store.state

  if (!gitAgent)
    throw new TypeError('Missing gitAgent')

  return gitAgent.writeFileAndPushChanges(
    salariatsPath,
    stringifySalariatsYaml(salariats),
    commitMessage
  )
}

/** @type {(salariat: Salariat) => Promise<void>} */
export function envoyerSalariat(salariat) {
  const creation = !store.state.salariats.some(
    s => s.identifiant === salariat.identifiant,
  )

  if (creation) {
    store.mutations.addSalariat(salariat)
    return salariatsStoreToRepo(`Ajout du salariat pour ${salariat.idPersonne}`)
  }
  else {
    store.mutations.updateSalariat(salariat)
    return salariatsStoreToRepo(`Modification du salariat de ${salariat.idPersonne}`)
  }
}

/** @type {(salariat: Salariat) => Promise<void>} */
export const supprimerSalariat = salariat => {
  store.mutations.supprimerSalariat(salariat)
  return salariatsStoreToRepo(`Suppression de la salariat de ${salariat.idPersonne}`)
}