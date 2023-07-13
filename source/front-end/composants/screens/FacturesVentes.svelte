<script>
    //@ts-check
    
    import { sum } from 'd3-array'
    import { format } from 'date-fns';
    import { fr } from 'date-fns/locale'
    import { tick } from 'svelte';

    import Skeleton from '../Skeleton.svelte'
    import SaveButton from '../SaveButton.svelte'

    import Tableau, { action } from '../Tableau.svelte';
    import { displayDate, formatMontant } from '../../stringifiers'
    import { supprimerOpérationHautNiveau, sauvegarderEnvoiFactureÀClient } from '../../actions'
    import { créerEnvoiFactureÀClientVide } from '../../../format-données/opérationsHautNiveau';

    import '../../../format-données/types/main.js'
    
    export let login
    export let logout
    export let org
    export let repo
    /** @type {EnvoiFactureÀClient[]} */
    export let envoiFactureàClients
    /** @type {Personne[] | undefined} */
    export let personnes 

    console.log('personnes', personnes)

    /** @type {Personne[] | undefined} */
    let clients

    $: clients = personnes?.filter(({compteClient}) => !!compteClient)

    // https://www.economie.gouv.fr/cedef/taux-tva-france-et-union-europeenne
    const tauxTVAPossibles = [
        {value: 20, text: "20%", selected: true},
        {value: 10, text: "10%"},
        {value: 5.5, text: "5,5%"},
    ]

    function calculTVA({montantHT, tauxTVA}){
        return montantHT*tauxTVA/100
    }
    function calculTTC(ligneFacture){
        return ligneFacture.montantHT + calculTVA(ligneFacture)
    }

    /**
     * @param {EnvoiFactureÀClient} _
     * @returns {number}
     */
    function calculMontantTTCFacture({lignes}){
        return sum(lignes.map(calculTTC))
    }    
    
    /**
     * @param {EnvoiFactureÀClient} _
     * @returns {number}
     */
    function calculMontantHTFacture({lignes}){
        return sum(lignes.map(({montantHT}) => montantHT))
    }

    /** @type {EnvoiFactureÀClient} */
    let factureEnModification = créerEnvoiFactureÀClientVide()

    // svelte gère mal le bind sur un input@type=date, donc gestion manuelle
    let dateFacture = format(factureEnModification.date, 'yyyy-MM-dd')
    $: factureEnModification.date = new Date(dateFacture)

    /** @type {Personne} */
    let client
    $: factureEnModification.compteClient = client?.compteClient

    /**
     * 
     * @param {LigneFacture} ligne
     */
    function supprimerLigneFacture(ligne){
        const index = factureEnModification.lignes.indexOf(ligne);

        if (index >= 0) { 
            factureEnModification.lignes.splice(index, 1);
            factureEnModification = factureEnModification; // re-render component
        }
    }
    function ajouterLigneFacture(){
        factureEnModification.lignes.push({montantHT: undefined, tauxTVA: undefined, compteProduit: undefined})
        factureEnModification = factureEnModification; // re-render component
    }

    let factureSent = undefined;

    /** @type Tableau */
    let table
    let tableConfig

    $: tableConfig = {
        placeholder: 'Sélectionne une facture dans la liste pour voir toutes ses informations ou les modifier.',
        globalActions: [
            action(() => table.edit(-1), 'Nouvelle facture', 'Alt+N')
        ],
        columns: [ 'Date', 'Client', 'Montant total', '(dont montant HT)' ],
        data: envoiFactureàClients === undefined
            ? []
            : envoiFactureàClients.sort((a, b) => b.date.getTime() - a.date.getTime()).map(facture => [
                { content: displayDate(facture.date), title: format(facture.date, 'd MMMM yyyy', {locale: fr}) },
                { content: clients.find(c => c.compteClient === facture.compteClient)?.nom || `client non trouvé (${facture.compteClient})` },
                { content: formatMontant(calculMontantTTCFacture(facture)) },
                { content: formatMontant(calculMontantHTFacture(facture)) },
            ])
    }

    /**
     * Cette fonction enregistre (ou enregistre les modifications apportées à) une facture
     * dans le dépôt. Elle passe ensuite à la facture à éditer ensuite si elle existe, sinon
     * elle vide juste le formulaire.
     */
    function sauvegarderFacture(){
        factureSent = sauvegarderEnvoiFactureÀClient(factureEnModification)

        factureSent.then(() => {
            factureSent = undefined
            // Nécessaire pour que la facture soit bien marquée comme sélectionnée dans le tableau
            table.edit(envoiFactureàClients.findIndex(f => f.identifiantOpération === factureEnModification.identifiantOpération))
        })
    }

    /**
     * Les données de la facture et le formulaire n'étant pas construits exactement de la même façon
     * on ne peut pas facilement utiliser le data binding de Svelte, donc on fait la mise à jour à
     * la main quand on en a besoin avec cette fonction.
     * 
     * @param {EnvoiFactureÀClient} f
     */
    async function màjFormulaire(f) {
        factureEnModification = f === undefined ? créerEnvoiFactureÀClientVide() : f
        dateFacture = format(factureEnModification.date, 'yyyy-MM-dd')
        
        // On attend que Svelte ai redessiné la vue
        await tick()
    }

    function annulerÉdition() {
        table.edit(undefined)
    }

    function supprimer() {
        supprimerOpérationHautNiveau(factureEnModification)
        table.edit(undefined)
    }
</script>

<Skeleton {login} {logout} {org} {repo} fullwidth>
    <Tableau bind:this={table} on:edit={(e) => { màjFormulaire(envoiFactureàClients[e.detail]) }} {...tableConfig}>
        <h1 slot="header">
            Voici la liste des factures (ventes) pour 
            <code>{org}</code>
        </h1>

        <svelte:fragment slot="form-header">
            {#if factureEnModification && factureEnModification.numéroFacture}
                <h2>Facture «&nbsp;{factureEnModification.numéroFacture}&nbsp;»</h2>
            {:else}
                <h2>Facture (sans identifiant)</h2>
            {/if}
        </svelte:fragment>

        {#if factureEnModification}
            <form on:submit|preventDefault={sauvegarderFacture}>
                <fieldset disabled={factureSent && factureSent[Symbol.toStringTag] === 'Promise'}>
                    <label>
                        <div>Client</div>
                        {#if !clients || clients.length === 0}
                            <select disabled></select>
                        {:else}
                            <select bind:value={client}>
                                <option> - </option>
                                {#each clients as client}
                                    <option value={client} selected={factureEnModification.compteClient === client.compteClient}>{client.nom}</option>
                                {/each}
                            </select>
                        {/if}
                        <a href="/comptabilite/personnes?org={org}&repo={repo}">Rajouter un client</a>
                    </label>
                    <label>
                        <div>Numéro de facture</div>
                        <input bind:value={factureEnModification.numéroFacture} type="text">
                    </label>
                    <label>
                        <div>Date</div>
                        <input bind:value={dateFacture} type="date">
                    </label>

                    {#each factureEnModification.lignes as ligne, i}
                        <fieldset class="ligne-facture">
                            <label>
                                <div>Compte Produit</div>
                                <input bind:value={ligne.compteProduit} placeholder="706xxx">
                            </label>
                            <label>
                                <div>Montant HT (€)</div>
                                <input bind:value={ligne.montantHT} step="0.01" type="number">
                            </label>
                            <label>
                                <div>Taux TVA</div>
                                <select bind:value={ligne.tauxTVA}>
                                    {#each tauxTVAPossibles as {value, text, selected}}
                                        <option value={value} selected={selected}>{text}</option>
                                    {/each}
                                </select>
                            </label>
                            <label>
                                <div>Montant TVA</div>
                                <output>{formatMontant(calculTVA(ligne))}</output>
                            </label>
                            <label>
                                <div>Montant TTC</div>
                                <output>{formatMontant(calculTTC(ligne))}</output>
                            </label>
                            <button type="button" on:click={e => supprimerLigneFacture(ligne)}>Supprimer ligne</button>
                        </fieldset>
                    {/each}
                    <button type="button" on:click={e => ajouterLigneFacture()}>Ajouter ligne</button>
                    
                    <SaveButton bind:promise={factureSent} />
                    
                    <button type="button" on:click={annulerÉdition}>Abandonner les modifications</button>
                    <button type="button" on:click={supprimer}>Supprimer cette facture</button>
                </fieldset>
            </form>
        {/if}
    </Tableau>
</Skeleton>

<style lang="scss">
    form {
        fieldset.ligne-facture{
            border: 1px solid #333;
            padding: 1rem;
            margin: 2rem 0;
        }
    }

    h1 {
        margin: 0;
    }
</style>