<script>
    //@ts-check
    
    import {differenceInDays, differenceInMonths, formatDistanceToNow, format} from 'date-fns';
    import { fr } from 'date-fns/locale'
    import { sum } from 'd3-array'


    import Skeleton from '../Skeleton.svelte'
    import Loader from '../Loader.svelte'

    import '../../../format-données/types.js'
    import { tick } from 'svelte';
    import Tableau from '../Tableau.svelte';

    export let login
    export let logout
    export let org
    export let envoiFactureàClients
    export let supprimerEnvoiFactureÀClient
    export let sauvegarderEnvoiFactureÀClient
    /** @type {() => EnvoiFactureClient} */
    export let créerEnvoiFactureÀClientVide

    // infos du formulaire
    let compteClient
    let identifiantFacture
    let dateFacture

    let montantHT
    let montantTVA
    let compteProduit

    // élément <input> qui correspond toujours au premier champ du formulaire d'édition
    let formStart

    let factureEnModification = undefined

    let factureSent = undefined;

    /** @type Tableau */
    let table
    let tableConfig

    const sommeFactures = ops => ops.reduce((total, { montant }) => total + montant, 0).toFixed(2)
    $: tableConfig = {
        placeholder: 'Sélectionne une facture dans la liste pour voir toutes ses informations ou les modifier.',
        globalActions: [
            { name: 'Nouvelle facture', shortcut: 'Alt+N', run: () => table.edit(-1) }
        ],
        itemActions: [
            { name: 'Supprimer', run: supprimerEnvoiFactureÀClient }
        ],
        columns: [ 'Date', 'Client', 'Montant total', '(dont montant HT)' ],
        data: envoiFactureàClients === undefined
            ? []
            : envoiFactureàClients.sort((a, b) => b.date - a.date).map(facture => [
                { content: displayDate(facture.date), title: format(facture.date, 'd MMMM yyyy', {locale: fr}) },
                { content: facture.compteClient },
                { content: `${sommeFactures(facture.opérations)} €` },
                { content: `${sommeFactures(facture.opérations.filter(({ compte }) => compte !== '44566'))} €` },
            ])
    }

    /**
     * Cette fonction enregistre (ou enregistre les modifications apportées à) une facture
     * dans le dépôt. Elle passe ensuite à la facture à éditer ensuite si elle existe, sinon
     * elle vide juste le formulaire.
     */
    function sauvegarderFacture(){
        factureSent = sauvegarderEnvoiFactureÀClient({
            identifiantOpération: factureEnModification.identifiantOpération,
            compteClient,
            identifiantFacture,
            dateFacture,
            montantHT,
            montantTVA,
            compteProduit,
        })

        factureSent.then(() => {
            factureSent = undefined
            // Nécessaire pour que la facture soit bien marquée comme sélectionnée dans le tableau
            table.edit(envoiFactureàClients.findIndex(f => f.identifiantOpération === factureEnModification.identifiantOpération))
        })
    }

    function isPromise(x){
        return x === Object(x) && typeof x.then === 'function'
    }

    function displayDate(date){
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

    /**
     * Les données de la facture et le formulaire n'étant pas construits exactement de la même façon
     * on ne peut pas facilement utiliser le data binding de Svelte, donc on fait la mise à jour à
     * la main quand on en a besoin avec cette fonction.
     * 
     * @param {EnvoiFactureClient} f
     */
    async function màjFormulaire(f) {
        factureEnModification = f === undefined ? créerEnvoiFactureÀClientVide() : f
        compteClient = factureEnModification.compteClient
        identifiantFacture = factureEnModification.numéroFacture
        dateFacture = format(factureEnModification.date, 'yyyy-MM-dd')

        const sommeMontants = (total, op) => total + op.montant
        montantHT = factureEnModification.opérations.filter(o => o.compte !== '44566').reduce(sommeMontants, 0)
        montantTVA = factureEnModification.opérations.filter(o => o.compte === '44566').reduce(sommeMontants, 0)
        compteProduit = factureEnModification.opérations.find(o => o.compte !== '44566').compte

        // On attend que Svelte ai redessiné la vue
        await tick()
        // puis on met le focus sur le premier champ du formulaire, comme ça on peut
        // directement commencer à le remplir sans devoir cliquer dedans
        if (formStart) {
            formStart.focus()
        }
    }

    function annulerÉdition() {
        table.edit(undefined)
    }
</script>

<Skeleton {login} {logout} fullwidth>
    <Tableau bind:this={table} on:edit={(e) => { màjFormulaire(envoiFactureàClients[e.detail]) }} {...tableConfig}>
        <h1 slot="header">
            Voici la liste des factures pour 
            <code>{org}</code>
        </h1>

        <svelte:fragment slot="form-header">
            {#if identifiantFacture}
                <h2>Facture «&nbsp;{identifiantFacture}&nbsp;»</h2>
            {:else}
                <h2>Facture (sans identifiant)</h2>
            {/if}
        </svelte:fragment>

        {#if factureEnModification}
            <form on:submit|preventDefault={sauvegarderFacture}>
                <fieldset disabled={isPromise(factureSent)}>
                    <label>
                        <div>Client</div>
                        <input bind:this={formStart} bind:value={compteClient} placeholder="411xxxx">
                    </label>
                    <label>
                        <div>Identifiant de facture</div>
                        <input bind:value={identifiantFacture} type="text">
                    </label>
                    <label>
                        <div>Date</div>
                        <input bind:value={dateFacture} type="date">
                    </label>
                    <label>
                        <div>Montant HT (€)</div>
                        <input bind:value={montantHT} step="0.01" type="number">
                    </label>
                    <label>
                        <div>Montant TVA (€)</div>
                        <input bind:value={montantTVA} step="0.01" type="number">
                    </label>
                    <label>
                        <div>Compte Produit</div>
                        <input bind:value={compteProduit} placeholder="706xxx">
                    </label>

                    <div class="button-with-loader">
                        <button type="submit">Enregistrer</button>
                        {#await factureSent}
                            <Loader></Loader>
                        {:catch err}
                            Problème avec l'envoi de la facture {err}
                        {/await}
                    </div>
                    <button on:click={annulerÉdition}>Abandonner les modifications</button>
                </fieldset>
            </form>
        {/if}
    </Tableau>
</Skeleton>

<style lang="scss">
    form {
        label input{
            margin-left: 1rem;
        }

        .button-with-loader{
            display: flex;
            flex-direction: row;
            align-items: flex-start;
        }
    }

    form {
        background-color: white;
        grid-area: form-body;
        padding: 2rem;
    }

    h1 {
        margin: 0;
    }
</style>