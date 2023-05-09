<script>
    //@ts-check
    
    import {differenceInDays, differenceInMonths, formatDistanceToNow, format} from 'date-fns';
    import { fr } from 'date-fns/locale'
    import { sum } from 'd3-array'


    import Skeleton from '../Skeleton.svelte'
    import Loader from '../Loader.svelte'

    import '../../../format-données/types.js'

    export let login
    export let logout
    export let org
    export let envoiFactureàClients
    export let créerEnvoiFactureÀClient
    export let supprimerEnvoiFactureÀClient

    let compteClient
    let identifiantFacture
    let dateFacture
    //let lignes

    let montantHT
    let montantTVA
    let compteProduit

    let factureEnCoursDÉdition = undefined

    let factureSent = undefined;

    function créerFacture(e){
        factureSent = créerEnvoiFactureÀClient({compteClient, identifiantFacture, dateFacture, montantHT, montantTVA, compteProduit})

        factureSent.then(() => {
            factureSent = undefined
            e.target.reset()
        })
    }

    function isPromise(x){
        return x === Object(x) && typeof x.then === 'function'
    }

    function displayDate(date){
        if(differenceInDays(date, new Date()) === 0){
            return `Aujourd'hui`
        }
        
        if(differenceInMonths(date, new Date()) > -3){
            return `il y a ${formatDistanceToNow(date, {locale: fr})}`
        }
        
        return format(date, 'd MMMM yyyy', {locale: fr})
    }

    function supprimerFacture(facture) {
        supprimerEnvoiFactureÀClient(facture)
    }

    /**
     * @param {EnvoiFactureClient} facture
     */
    function commencerModification(facture) {
        factureEnCoursDÉdition = facture

        compteClient = facture.compteClient
        identifiantFacture = facture.numéroFacture
        dateFacture = format(facture.date, 'yyyy-MM-dd')

        const sommeMontants = (total, op) => total + op.montant
        montantHT = facture.opérations.filter(o => o.compte !== '44566').reduce(sommeMontants, 0)
        montantTVA = facture.opérations.filter(o => o.compte !== '44566').reduce(sommeMontants, 0)
        compteProduit = facture.opérations.find(o => o.compte !== '44566').compte
    }

    function annulerÉdition() {
        factureEnCoursDÉdition = undefined
    }
</script>

<Skeleton {login} {logout}>
    <h1>Voici les factures de l'organisation <code>{org}</code></h1>

    <h2>Liste des factures</h2>
    {#if envoiFactureàClients}
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Client</th>
                <th>Montant total</th>
                <th>(dont montant HT)</th>
            </tr>
        </thead>
        <tbody>
            {#each envoiFactureàClients as facture}
                <tr class:edition={facture === factureEnCoursDÉdition}>
                    <td title="{format(facture.date, 'd MMMM yyyy', {locale: fr})}">{displayDate(facture.date)}</td>
                    <td>{facture.compteClient}</td>
                    <td>{sum(facture.opérations.map(({montant}) => montant))}&nbsp;€</td>
                    <td>{sum(facture.opérations.filter(({compte}) => compte !== '44566').map(({montant}) => montant))}&nbsp;€</td>
                    <td><button on:click={_ => supprimerFacture(facture)}>Supprimer</button></td>
                    <td><button on:click={_ => commencerModification(facture)}>Modifier</button></td>
                </tr>
            {/each}
        </tbody>

    </table>
    {/if}


    <h2>Saisir les données d'une facture</h2>

    {#if factureEnCoursDÉdition}
        <div class="info">
            <p>
                ℹ️ Tu es en train de modifier la facture <em>{factureEnCoursDÉdition.numéroFacture}</em>
            </p>
            <button on:click={annulerÉdition}>Annuler l'édition</button>
        </div>
    {/if}

    <form on:submit|preventDefault={créerFacture}>
        <fieldset disabled={isPromise(factureSent)}>
            <label>
                <div>Client</div>
                <input bind:value={compteClient} placeholder="411xxxx">
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
                {#if factureEnCoursDÉdition}
                    <button type="submit">Modifier la facture</button>
                {:else}
                    <button type="submit">Créer la facture</button>
                {/if}
                {#await factureSent}
                    <Loader></Loader>
                {:catch err}
                    Problème avec l'envoi de la facture {err}
                {/await}
            </div>
        </fieldset>
    </form>
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

    .edition {
        background: #71cbff;
    }

    .info {
        background: #71cbff;
        margin: 1em 0;
        padding: 1em;
        display: flex;
        justify-content: space-between;

        em {
            font-weight: bold;
        }
    }
</style>