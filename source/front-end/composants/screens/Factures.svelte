<script>
    //@ts-check
    
    import {differenceInDays, differenceInMonths, formatDistanceToNow, format} from 'date-fns';
    import { fr } from 'date-fns/locale'
    import { sum } from 'd3-array'


    import Skeleton from '../Skeleton.svelte'
    import Loader from '../Loader.svelte'
    import Modal from '../Modal.svelte'

    import '../../../format-données/types.js'

    export let login
    export let logout
    export let org
    export let envoiFactureàClients
    export let créerEnvoiFactureÀClient
    export let supprimerEnvoiFactureÀClient

    let questionSauvegarde

    let changementsNonSauvegardés = false

    let compteClient
    let identifiantFacture
    let dateFacture
    //let lignes

    let montantHT
    let montantTVA
    let compteProduit

    let prochaineFactureÀModifier = undefined
    let factureEnModification = undefined

    let factureSent = undefined;

    function créerFacture(e){
        // TODO: gérer quand on est en mode "modification"
        factureSent = créerEnvoiFactureÀClient({compteClient, identifiantFacture, dateFacture, montantHT, montantTVA, compteProduit})

        factureSent.then(() => {
            factureSent = undefined
            e.target.reset()
            changementsNonSauvegardés = false
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

    function marquerCommeModifié() {
        changementsNonSauvegardés = true
    }

    /**
     * @param {EnvoiFactureClient} facture
     */
    function commencerModification(facture) {
        if (changementsNonSauvegardés) {
            prochaineFactureÀModifier = facture
            questionSauvegarde.showModal()
        } else {
            factureEnModification = facture
            màjFormulaire()
        }
    }

    function màjFormulaire() {
        compteClient = factureEnModification.compteClient
        identifiantFacture = factureEnModification.numéroFacture
        dateFacture = format(factureEnModification.date, 'yyyy-MM-dd')

        const sommeMontants = (total, op) => total + op.montant
        montantHT = factureEnModification.opérations.filter(o => o.compte !== '44566').reduce(sommeMontants, 0)
        montantTVA = factureEnModification.opérations.filter(o => o.compte === '44566').reduce(sommeMontants, 0)
        compteProduit = factureEnModification.opérations.find(o => o.compte !== '44566').compte
        changementsNonSauvegardés = false
    }

    function annulerÉdition() {
        factureEnModification = undefined
        changementsNonSauvegardés = false
        compteClient = ''
        identifiantFacture = ''
        dateFacture = ''
        montantHT = 0
        montantTVA = 0
        compteProduit = ''
    }

    function nePlusÉditer() {
        prochaineFactureÀModifier = undefined
        questionSauvegarde.close()
    }

    function effacerEtÉditer() {
        factureEnModification = prochaineFactureÀModifier
        màjFormulaire()
        questionSauvegarde.close()
    }

    function sauvegarderPuisÉditer() {
        // TODO: not always a creation, sometimes an edition
        if (factureEnModification) {
            // TODO: enregistrer les modifications
        } else {
            factureSent = créerEnvoiFactureÀClient({compteClient, identifiantFacture, dateFacture, montantHT, montantTVA, compteProduit})
        }

        factureSent.then(() => {
            factureSent = undefined
            factureEnModification = prochaineFactureÀModifier
            màjFormulaire()
        })

        questionSauvegarde.close()
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
                <tr class:edition={factureEnModification === facture}>
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

    {#if factureEnModification}
        <div class="info">
            <p>
                ℹ️ Tu es en train de modifier la facture <em>{factureEnModification.numéroFacture}</em>
            </p>
            <button on:click={annulerÉdition}>Annuler l'édition</button>
        </div>
    {/if}

    <form on:submit|preventDefault={créerFacture}>
        <fieldset disabled={isPromise(factureSent)}>
            <label>
                <div>Client</div>
                <input on:change={marquerCommeModifié} bind:value={compteClient} placeholder="411xxxx">
            </label>
            <label>
                <div>Identifiant de facture</div>
                <input on:change={marquerCommeModifié} bind:value={identifiantFacture} type="text">
            </label>
            <label>
                <div>Date</div>
                <input on:change={marquerCommeModifié} bind:value={dateFacture} type="date">
            </label>
            <label>
                <div>Montant HT (€)</div>
                <input on:change={marquerCommeModifié} bind:value={montantHT} step="0.01" type="number">
            </label>
            <label>
                <div>Montant TVA (€)</div>
                <input on:change={marquerCommeModifié} bind:value={montantTVA} step="0.01" type="number">
            </label>
            <label>
                <div>Compte Produit</div>
                <input on:change={marquerCommeModifié} bind:value={compteProduit} placeholder="706xxx">
            </label>

            <div class="button-with-loader">
                {#if factureEnModification}
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

    <Modal bind:dialog={questionSauvegarde} on:close={nePlusÉditer}>
        <p>Certaines informations entrées dans le formulaire n'ont pas encore été sauvegardées.<p>
        <button on:click={effacerEtÉditer}>Les effacer et modifier l'autre facture</button>
        <button on:click={sauvegarderPuisÉditer}>Les sauvegarder puis modifier l'autre facture</button>
        <button on:click={nePlusÉditer}>Je ne veux plus modifier l'autre facture tout suite</button>
    </Modal>
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