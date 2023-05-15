// @ts-check

import { sum } from 'd3-array'
import { differenceInDays, differenceInMonths, formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function displayDate(date){
    if(differenceInDays(date, new Date()) === 0){
        return `Aujourd'hui`
    }

    if (differenceInDays(date, new Date()) > 0) {
        return `dans ${formatDistanceToNow(date, {locale: fr})}`
    }
    
    if(differenceInMonths(date, new Date()) > -3){
        return `il y a ${formatDistanceToNow(date, {locale: fr})}`
    }
    
    return format(date, 'd MMMM yyyy', {locale: fr})
}

/** @type {(ops: OpérationDeCompte[]) => number} */
const sommeOpérations = ops => sum(ops.map(({ montant }) => montant))

const euroFormat = Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
export const afficherSommeOpérations = ops => euroFormat.format(sommeOpérations(ops))

export const formatCompte = (préfixe, suffixe) => (préfixe * Math.pow(10, 6 - préfixe.toString().length) + suffixe).toString()
