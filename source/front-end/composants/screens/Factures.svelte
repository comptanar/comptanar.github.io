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
    export let supprimerEnvoiFactureÀClient
    export let sauvegarderEnvoiFactureÀClient
    export let créerEnvoiFactureÀClientVide

    // infos du formulaire
    let compteClient
    let identifiantFacture
    let dateFacture

    let montantHT
    let montantTVA
    let compteProduit

    let factureEnModification = undefined

    let factureSent = undefined;

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
            factureEnModification = undefined
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

    function supprimerFacture(facture) {
        supprimerEnvoiFactureÀClient(facture)
    }

    /**
     * @param {EnvoiFactureClient} facture
     */
    function commencerModification(facture) {
        factureEnModification = facture
        màjFormulaire()
    }

    /**
     * Les données de la facture et le formulaire n'étant pas construits exactement de la même façon
     * on ne peut pas facilement utiliser le data binding de Svelte, donc on fait la mise à jour à
     * la main quand on en a besoin avec cette fonction.
     */
    function màjFormulaire() {
        compteClient = factureEnModification.compteClient
        identifiantFacture = factureEnModification.numéroFacture
        dateFacture = format(factureEnModification.date, 'yyyy-MM-dd')

        const sommeMontants = (total, op) => total + op.montant
        montantHT = factureEnModification.opérations.filter(o => o.compte !== '44566').reduce(sommeMontants, 0)
        montantTVA = factureEnModification.opérations.filter(o => o.compte === '44566').reduce(sommeMontants, 0)
        compteProduit = factureEnModification.opérations.find(o => o.compte !== '44566').compte
    }

    function annulerÉdition() {
        factureEnModification = undefined
    }

    function nouvelleFacture() {
        const f = créerEnvoiFactureÀClientVide()
        commencerModification(f)
    }

    function tri(factures) {
        return factures.sort((a, b) => b.date - a.date)
    }
</script>

<Skeleton {login} {logout} fullwidth>
    <div class="tableau-editable">
        <header class="table-header">
            <h1>
                Voici la liste des factures pour 
                <code>{org}</code>
            </h1>
            <button on:click={nouvelleFacture}>Nouvelle facture</button>
        </header>
        {#if envoiFactureàClients}
        <main>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Client</th>
                        <th>Montant total</th>
                        <th>(dont montant HT)</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {#each tri(envoiFactureàClients) as facture}
                        <tr class:edition={factureEnModification === facture} on:click={_ => commencerModification(facture)}>
                            <td title="{format(facture.date, 'd MMMM yyyy', {locale: fr})}">{displayDate(facture.date)}</td>
                            <td>{facture.compteClient}</td>
                            <td>{sum(facture.opérations.map(({montant}) => montant))}&nbsp;€</td>
                            <td>{sum(facture.opérations.filter(({compte}) => compte !== '44566').map(({montant}) => montant))}&nbsp;€</td>
                            <td>
                                <button
                                    disabled={factureEnModification !== undefined}
                                    title={factureEnModification !== undefined ? 'Il faut enregistrer ou abandonner les modifications avant de pouvoir supprimer cette facture' : ''}
                                    on:click={_ => supprimerFacture(facture)}
                                >
                                    Supprimer
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </main>
        {/if}

        
        {#if factureEnModification}
        <header class="form-header">
            {#if identifiantFacture}
                <h2>Facture «&nbsp;{identifiantFacture}&nbsp;»</h2>
            {:else}
                <h2>Facture (sans identifiant)</h2>
            {/if}
        </header>
        <form on:submit|preventDefault={sauvegarderFacture}>
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
        {:else}
            <p class="etat-vide">
                Sélectionne une facture dans la liste pour voir toutes ses informations ou les modifier.
            </p>
        {/if}
    </div>   
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
        background: white;
    }

    .tableau-editable {
        display: grid;
        grid-template: "table-title form-title" auto
                       "table-body  form-body " auto
                        / 2fr 1fr;

        & > form {
            background: white;
            grid-area: form-body;
            padding: 2rem;
        }

        & > main {
            grid-area: table-body;
            overflow: auto;
            height: 0; // je ne sais pas trop pourquoi mais ça fait ce que je veux avec ça??
            // sans cette ligne, la taille n'est pas contrainte et le tableau dépasse juste
            // complètement de la page.
            margin-bottom: 0;

            table {
                width: 100%;
            }

            tbody tr {
                cursor: pointer;

                &:hover:not(.edition) {
                    background: #f1f1f1;
                }
            }

            thead {
                position: sticky;
                top: 0;
                background: #e9e9e9;
            }

            td, th {
                padding: 1rem;
            }
        }

        & > header {
            padding: 2rem;
            background: transparent;
            color: black;

            h1 {
                margin: 0;
            }
        }

        .table-header {
            grid-area: table-title;
            display: flex;
            justify-content: space-between;
            padding-left: 0;
        }

        .form-header {
            background: white;
            grid-area: form-title;
        }
    }

    .etat-vide {
        grid-row-start: form-title;
        grid-row-end: form-body;
        display: flex;
        height: 100%;
        padding: 2rem;
        justify-content: center;
        align-items: center;
        text-align: center;
        font-size: 1.3rem;
        font-weight: bold;
        color: gray;
        background: white;
    }
</style>