//@ts-check

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

import store from '../store.js'

import { formatDate } from '../stringifiers.js'
import {
  parseOpérationsHautNiveauYaml,
  stringifyOpérationsHautNiveauYaml,
} from '../../format-données/opérationsHautNiveau.js'


const EXERCICES_DIR = 'exercices'

/**
 * 
 * @param {number} year 
 * @returns 
 */
function opérationsHautNiveauPath(year) {
  return `${EXERCICES_DIR}/${year}/operationsHautNiveau.yml`
}


async function getExercicesFromRepo() {
  const { gitAgent } = store.state

  if (!gitAgent)
    throw new TypeError('Missing gitAgent')

  const allFiles = await gitAgent.listAllFiles()
  const exerciceFiles = allFiles.filter(f => f.startsWith(EXERCICES_DIR + '/') && f.includes('operationsHautNiveau.yml'))

  const exerciceEntriesPs = exerciceFiles.map(async filename => {
    const yearMatch = filename.match(/\d{4}/)
    if (!yearMatch)
      throw new TypeError(`No year found in ${filename}`)

    const year = Number(yearMatch[0])
    const fileContent = await gitAgent.getFile(filename)
    const opérationsHautNiveau = parseOpérationsHautNiveauYaml(fileContent)

    return [year, opérationsHautNiveau]
  })

  return Promise.all(exerciceEntriesPs).then(exerciceEntries => new Map(exerciceEntries))
}

export const exercicesRepoToStore = () => getExercicesFromRepo()
  .then(store.mutations.setOpérationsHautNiveauByYear)

/**
 * 
 * @param {number} year 
 * @param {string} [commitMessage]
 * @returns {Promise<void>}
 */
function exerciceStoreToRepo(year, commitMessage = `Mise à jour de l'exercice ${year}`){
  const { opérationsHautNiveauByYear, gitAgent } = store.state

  const opérationsHautNiveau = opérationsHautNiveauByYear.get(year)

  if (!gitAgent)
    throw new TypeError('Missing gitAgent')

  return gitAgent.writeFileAndPushChanges(
    opérationsHautNiveauPath(year),
    stringifyOpérationsHautNiveauYaml(opérationsHautNiveau),
    commitMessage
  )
}


/**
 * Enregistre une opération de haut niveau dans la base de donnée.
 *
 * @param {OpérationHautNiveau} op
 * @param {string} messageCréation
 * @param {string} messageÉdition
 * @returns
 */
export function envoyerOpérationHautNiveau(op, messageCréation, messageÉdition) {
  const year = op.date.getFullYear()

  const opérationsHautNiveau = store.state.opérationsHautNiveauByYear.get(year)

  const creation =
    !opérationsHautNiveau ||
    !opérationsHautNiveau.some(
      o => o.identifiant === op.identifiant,
    )

  if (creation) {
    store.mutations.addOpérationsHautNiveau(year, op)
    return exerciceStoreToRepo(year, messageCréation)
  } else {
    store.mutations.updateOpérationHautNiveau(year, op)
    return exerciceStoreToRepo(year, messageÉdition)
  }
}

/**
 * Enregistre plusieurs opérations haut niveau dans la base de donnée.
 *
 * @param {number} year
 * @param {OpérationHautNiveau[]} ops
 * @param {string} commitMessage
 * @returns
 */
export function envoyerPlusieursOpérationsHautNiveau(
  year,
  ops,
  commitMessage,
) {
  store.mutations.addOpérationsHautNiveau(year, ops)
  return exerciceStoreToRepo(year, commitMessage)
}

/** @type {(_: OpérationHautNiveau) => Promise<void>} */
export const supprimerOpérationHautNiveau = ({ identifiant, date }) => {
  const year = date.getFullYear()
  const formattedDate = format(date, 'd MMMM yyyy', { locale: fr })

  store.mutations.supprimerOpérationHautNiveau(year, identifiant)
  return exerciceStoreToRepo(year, `Suppression d'une opération du ${formattedDate}`)
}

/**
 *
 * @param {EnvoiFactureÀClient} envoiFactureÀClient
 * @returns {Promise<any>} // Résout quand l'opération a bien été sauvegardée
 */
export function sauvegarderEnvoiFactureÀClient(envoiFactureÀClient) {
  const date = envoiFactureÀClient.date
  const formattedDate = formatDate(date)

  return envoyerOpérationHautNiveau(
    envoiFactureÀClient,
    `Création de la facture ${envoiFactureÀClient.numéroFacture} envoyée au client ${envoiFactureÀClient.compteClient} le ${formattedDate}`,
    `Modification de la facture ${envoiFactureÀClient.numéroFacture} envoyée au client ${envoiFactureÀClient.compteClient} le ${formattedDate}`,
  )
}

/**
 *
 * @param {LigneBancaire[]} lignes
 * @returns {Promise<any>} // Résout quand l'opération a bien été sauvegardée
 */
export function sauvegarderLignesBancaires(lignes) {
  const lignesParAnnée = new Map()

  for (const ligne of lignes) {
    const année = ligne.date.getFullYear()
    let lignesDeCetteAnnée = lignesParAnnée.get(année)

    if (lignesDeCetteAnnée) {
      lignesDeCetteAnnée.push(ligne)
    } else {
      lignesParAnnée.set(année, [ligne])
    }
  }

  return Promise.all(
    [...lignesParAnnée].map(([année, lignes]) => {
      return envoyerPlusieursOpérationsHautNiveau(
        année,
        lignes,
        `Création de ${lignes.length} lignes bancaires pour l'année ${année}`,
      )
    }),
  )
}

/**
 * @param {ÉmissionFicheDePaie} émissionFicheDePaie
 * @param {Personne} salarié·e
 * @returns
 */
export function envoyerFicheDePaie(émissionFicheDePaie, salarié·e) {
  const formattedStart = formatDate(émissionFicheDePaie.débutPériode)
  const formattedEnd = formatDate(émissionFicheDePaie.finPériode)

  return envoyerOpérationHautNiveau(
    émissionFicheDePaie,
    `Création de la fiche de paie de ${salarié·e.nom} pour la période du ${formattedStart} au ${formattedEnd}`,
    `Modification de la fiche de paie de ${salarié·e.nom} pour la période du ${formattedStart} au ${formattedEnd}`,
  )
}

/**
 * @param {RéceptionFactureFournisseur} réceptionFactureFournisseur
 * @returns
 */
export function envoyerAchat(réceptionFactureFournisseur) {
  const date = réceptionFactureFournisseur.date
  const formattedDate = formatDate(date)

  return envoyerOpérationHautNiveau(
    réceptionFactureFournisseur,
    `Création de l'achat du ${formattedDate}`,
    `Modification de l'achat du ${formattedDate}`,
  )
}

