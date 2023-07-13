<script>
    // @ts-check

    import { tick } from 'svelte'
    import { format } from 'date-fns'
    import { fr } from 'date-fns/locale'
    import { sum } from 'd3-array'

    import Skeleton from '../Skeleton.svelte'
    import Tableau, { action } from '../Tableau.svelte'
    import SaveButton from '../SaveButton.svelte'
    import DateInput from "../DateInput.svelte";

    import { calculerTauxTVA } from '../../../format-données/comptabilité.js'
    import { créerAchatVide } from '../../../format-données/opérationsHautNiveau'
    import { displayDate } from '../../stringifiers'
    import { envoyerAchat, supprimerOpérationHautNiveau } from '../../actions'

    export let login
    export let logout
    /** @type {RéceptionFactureFournisseur[]} */
    export let achats
    export let org
    export let repo

    let formStart
    let table
    let editPromise
    /** @type {RéceptionFactureFournisseur} */
    let achatEnÉdition

    /**
     * @typedef {Object} LigneAchat
     * @property {string} compteProduit
     * @property {number} montantTTC
     * @property {number} montantTVA
     */

    /**
     * @param {LigneFacture} _
     * @returns {LigneAchat}
     */
    function ligneFactureToLigneAchat({montantHT, tauxTVA, compteProduit}){
        const montantTVA = montantHT*tauxTVA/100
        return {compteProduit, montantTVA, montantTTC : montantHT + montantTVA}
    }

    /** @type { LigneAchat[] } */
    let lignesAchats;
    function réceptionFactureFournisseurToLignesAchats(achat){
        if(!achat){
            lignesAchats = undefined
            return
        }

        lignesAchats = achat.lignes.map(ligneFactureToLigneAchat)
    }
    $: réceptionFactureFournisseurToLignesAchats(achatEnÉdition)

    function lignesAchatsToLignesFactures(lignesAchats){
        if(!lignesAchats || !achatEnÉdition){
            return
        }

        achatEnÉdition.lignes = lignesAchats.map(({compteProduit, montantTVA, montantTTC}) => {
            const montantHT = montantTTC - montantTVA;
            const tauxTVA = calculerTauxTVA(montantHT, montantTVA)
            return {montantHT, tauxTVA, compteProduit}
        })
    }
    $: lignesAchatsToLignesFactures(lignesAchats)

    function sauvegarderAchat() {
        editPromise = envoyerAchat(achatEnÉdition)

        editPromise.then(() => {
            editPromise = undefined
            table.edit(achats.findIndex(a => a.identifiantOpération === achatEnÉdition.identifiantOpération))
        })
    }

    async function màjFormulaire(achat) {
        achatEnÉdition = achat ?? créerAchatVide()

        await tick()
        formStart?.focus()
    }

    function ajouterLigneFacture(){
        lignesAchats.push({montantTTC: undefined, montantTVA: undefined, compteProduit: undefined})
        lignesAchats = lignesAchats; // re-render component
    }

    function supprimerLigneAchat(ligne){
        const index = lignesAchats.indexOf(ligne);

        if (index >= 0) { 
            lignesAchats.splice(index, 1);
            lignesAchats = lignesAchats; // re-render component
        }
    }

    function supprimer() {
        supprimerOpérationHautNiveau(achatEnÉdition)
        table.edit(undefined)
    }

    let tableConfig
    $: tableConfig = {
        globalActions: [ action(() => table.edit(-1), 'Nouvel achat', 'Alt+N') ],
        placeholder: 'Sélectionne un achat dans la liste pour en voir le détail ou le modifier',
        columns: ['Date', 'Fournisseur', 'Montant TTC', 'Montant TVA'],
        data: achats.map(a => [
            { content: displayDate(a.date), title: format(a.date, 'd MMMM yyyy', {locale: fr}) },
            { content: a.compteFournisseur },
            { content: sum(a.lignes.map(ligneFactureToLigneAchat).map(({montantTTC}) => montantTTC)) },
            { content: sum(a.lignes.map(ligneFactureToLigneAchat).map(({montantTVA}) => montantTVA)) },
        ])
    }
</script>

<Skeleton {login} {logout} {org} {repo} fullwidth>
    <Tableau bind:this={table} on:edit={e => màjFormulaire(achats[e.detail])} {...tableConfig}>
        <h1 slot="header">Achats réalisés par {org}</h1>
        <h2 slot="form-header">Achat</h2>

        <form on:submit|preventDefault={sauvegarderAchat}>
            <fieldset disabled={editPromise && editPromise[Symbol.toStringTag] === 'Promise'}>
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>
                    <div>Date de la facture</div>
                    <DateInput bind:date={achatEnÉdition.date} />
                </label>

                <label>
                    <div>Fournisseur</div>
                    <input bind:value={achatEnÉdition.compteFournisseur} placeholder="Restaurant PnP">
                </label>

                {#each lignesAchats || [] as ligne}
                    <fieldset class="ligne-achat">
                        <label>
                            <div>Numéro de compte</div>
                            <input bind:value={ligne.compteProduit}>
                        </label>
        
                        <label>
                            <div>Montant TTC (€)</div>
                            <input bind:value={ligne.montantTTC} step="0.01" min="0" type="number">
                        </label>
        
                        <label>
                            <div>Montant TVA (€) (à récupérer)</div>
                            <input bind:value={ligne.montantTVA} step="0.01" min="0" type="number">
                        </label>
                        <button type="button" on:click={e => supprimerLigneAchat(ligne)}>Supprimer ligne</button>
                    </fieldset>
                {/each}
                
                <button type="button" on:click={e => ajouterLigneFacture()}>Ajouter ligne</button>

                <SaveButton bind:promise={editPromise} />
                <button type="button" on:click={_ => table.edit(undefined)}>Abandonner les modifications</button>
                <button type="button" on:click={supprimer}>Supprimer</button>
            </fieldset>
        </form>
    </Tableau>
</Skeleton>

<style lang="scss">
    form {
        fieldset.ligne-achat:not(:only-of-type){
            border: 1px solid #333;
            padding: 1rem;
            margin: 2rem 0;
        }

        fieldset.ligne-achat:only-of-type button{
            display:none;
        }
    }

    h1 {
        margin: 0;
    }
</style>