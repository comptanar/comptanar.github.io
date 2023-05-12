// @ts-check

import { differenceInDays, differenceInMonths, formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function isPromise(x){
    return x === Object(x) && typeof x.then === 'function'
}

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

/** @type {(ops: OpérationDeCompte[]) => string} */
export const sommeFactures = ops => ops.reduce((total, { montant }) => total + montant, 0).toFixed(2)

export const formatCompte = (préfixe, suffixe) => (préfixe * Math.pow(10, 6 - préfixe.toString().length) + suffixe).toString()
