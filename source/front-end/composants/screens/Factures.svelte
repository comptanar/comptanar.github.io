<script>
    //@ts-check
    
    import Skeleton from '../Skeleton.svelte'
    import Loader from '../Loader.svelte'

    import '../../../format-données/types.js'

    export let login
    export let logout
    export let org
    export let créerEnvoiFactureÀClient

    /**
    * @typedef {Object} BaseOpérationHautNiveau
    * @property {string} identifiantOpération
    * @property {string} type
    * @property {Date} date
    * @property {OpérationDeCompte[]} opérations
    */

    /**
    * @typedef {Object} SpécifiqueEnvoiFactureClient
    * @property {'Envoi facture client'} type
    * @property {string} numéroFacture
    * @property {string} compteClient
    * 
    * @typedef {BaseOpérationHautNiveau & SpécifiqueEnvoiFactureClient} EnvoiFactureClient
    */
    

    let compteClient
    let identifiantFacture
    let dateFacture
    //let lignes

    let montantHT
    let montantTVA
    let compteProduit

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

</script>

<Skeleton {login} {logout}>
    <h1>Voici les factures de l'organisation <code>{org}</code></h1>

    <h2>Liste des factures</h2>
    <p>à faire ...</p>

    <h2>Saisir les données d'une facture</h2>

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
                <button type="submit">Créer la facture</button>
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
</style>