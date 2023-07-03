//@ts-check

/**

Ce fichier traduit en code des contraintes du Plan Général de Comptabilité
https://www.anc.gouv.fr/sites/anc/accueil/normes-francaises/reglementation-sectorielle.html

Il s'agit de contraintes légales, ou de conventions comptables

*/

const PRÉFIXE_COMPTE_CLIENT_VENTES = "4111C";

const SUFFIXE_COMPTE_POSSIBLES = ['1', '2', '3', '4', '5', '6', '7']

function suffixeEstValide(str){
    return [...str].every(char => SUFFIXE_COMPTE_POSSIBLES.includes(char))
}

function prochainSuffixe(précédent){
    if(!précédent){
        return SUFFIXE_COMPTE_POSSIBLES[0]
    }

    const précédentNombre = parseInt(précédent)
    let candidat = précédentNombre+1

    while(!suffixeEstValide(candidat.toString(10))){
        candidat++
    }

    return candidat
}

/**
 * 
 * @param {string[]} compteClientsExistants 
 * @returns 
 */
export function créerProchainCompteClient(compteClientsExistants){
    const suffixes = compteClientsExistants.map(compte => compte.slice(PRÉFIXE_COMPTE_CLIENT_VENTES.length))
    console.log('suffixes', suffixes)

    suffixes.sort((s1, s2) => parseInt(s1) - parseInt(s2))

    return PRÉFIXE_COMPTE_CLIENT_VENTES + prochainSuffixe(suffixes[0])
}
