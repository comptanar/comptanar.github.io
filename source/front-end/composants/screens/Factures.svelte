<script>
    //@ts-check
    
    import Skeleton from '../Skeleton.svelte'
    import {créerEnvoiFactureÀClient} from '../../actions.js'

    import '../../../format-données/types.js'

    export let login
    export let logout
    export let org
    //export let factures

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

    function créerFacture(e){
        créerEnvoiFactureÀClient({compteClient, identifiantFacture, dateFacture, montantHT, montantTVA, compteProduit})
    }

</script>

<Skeleton {login} {logout}>
    <h1>Voici les factures de l'organisation <code>{org}</code></h1>
    
    <h2>Liste des factures</h2>
    <p>à faire ...</p>

    <h2>Saisir les données d'une facture</h2>

    <form on:submit|preventDefault={créerFacture}>

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
            <div>Produit/service</div>
            <input name="produit" type="text">
        </label>

    </form>
</Skeleton>

<style>

</style>