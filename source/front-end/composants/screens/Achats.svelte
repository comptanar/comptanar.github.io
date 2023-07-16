<script>
    // @ts-check

    import { tick } from 'svelte'

    import Skeleton from '../Skeleton.svelte'
    import Tableau, { action } from '../Tableau.svelte'
    import SaveButton from '../SaveButton.svelte'
    import DateInput from "../DateInput.svelte";

    import { déduireTauxTVA, calculTVALigne, calculTTCFacture, calculTVAFacture, tauxTVAPossibles } from '../../../format-données/comptabilité/main.js'
    import { planDeCompte, isAchat } from '../../../format-données/comptabilité/planDeCompte.js'
    import { créerAchatVide } from '../../../format-données/opérationsHautNiveau'
    import { displayDate, formatDate, formatMontant } from '../../stringifiers'
    import { envoyerAchat, supprimerOpérationHautNiveau } from '../../actions'

    export let login
    export let logout
    /** @type {RéceptionFactureFournisseur[]} */
    export let achats
    export let org
    export let repo
    /** @type {Personne[] | undefined} */
    export let personnes

    let formStart
    let table
    let editPromise
    /** @type {RéceptionFactureFournisseur} */
    let achatEnÉdition = créerAchatVide()

    const comptesAchatsPossibles = new Map(
        [...planDeCompte.entries()].filter(([compte]) => isAchat(compte))
    )

    /** @type {Personne[] | undefined} */
    let fournisseurs
    $: fournisseurs = personnes?.filter(({compteFournisseur}) => !!compteFournisseur)

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
        const montantTVA = calculTVALigne({montantHT, tauxTVA, compteProduit})
        return {compteProduit, montantTVA, montantTTC : montantHT + montantTVA}
    }

    /**
     * @param {LigneAchat} _
     * @returns {LigneFacture}
     */
    function ligneAchatToLigneFacture({compteProduit, montantTVA, montantTTC}){
        const montantHT = montantTTC - montantTVA;
        const tauxTVA = déduireTauxTVA(montantHT, montantTVA)
        // @ts-ignore // Ptèt c'est un taux de TVA, ptèt pas et c'est ok
        return {montantHT, tauxTVA, compteProduit}
    }

    /** @type { LigneAchat[] } */
    let lignesAchats;
    /**
     * @param {RéceptionFactureFournisseur} achatEnÉdition
    */
    function réceptionFactureFournisseurToLignesAchats(achatEnÉdition){
        if(!achatEnÉdition){
            lignesAchats = undefined
            return
        }

        lignesAchats = achatEnÉdition.lignes.map(ligneFactureToLigneAchat)
    }
    $: réceptionFactureFournisseurToLignesAchats(achatEnÉdition)

    function lignesAchatsToLignesFactures(lignesAchats){
        if(!lignesAchats || !achatEnÉdition){
            return
        }

        achatEnÉdition.lignes = lignesAchats.map(ligneAchatToLigneFacture)
    }
    $: lignesAchatsToLignesFactures(lignesAchats)

    /** @type {Personne} */
    let fournisseur
    $: achatEnÉdition.compteFournisseur = fournisseur?.compteFournisseur

    /**
     * @param {LigneAchat} ligneAchat
     * @returns {boolean}
    */
    function tauxDeTVAEstChelou({montantTVA, montantTTC}){
        const montantHT = montantTTC - montantTVA;
        const tauxTVA = déduireTauxTVA(montantHT, montantTVA)

        /** @type {number[]} */
        // @ts-ignore
        const tauxTVANombres = [...tauxTVAPossibles].filter(t => typeof t === 'number')

        if(tauxTVANombres.every(t => (Math.abs(tauxTVA - t) >= 0.2)))
            return true

        return false
    }

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
            { content: displayDate(a.date), title: formatDate(a.date) },
            { content: fournisseurs.find(f => f.compteFournisseur === a.compteFournisseur)?.nom || `client non trouvé (${a.compteFournisseur})` },
            { content: formatMontant(calculTTCFacture(a)) },
            { content: formatMontant(calculTVAFacture(a)) },
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
                    {#if !fournisseurs || fournisseurs.length === 0}
                        <select disabled></select>
                    {:else}
                        <select bind:value={fournisseur}>
                            <option> - </option>
                            {#each fournisseurs as fournisseur}
                                <option value={fournisseur} selected={achatEnÉdition.compteFournisseur === fournisseur.compteFournisseur}>{fournisseur.nom}</option>
                            {/each}
                        </select>
                    {/if}
                    <a href="/comptabilite/personnes?org={org}&repo={repo}">Rajouter un fournisseur</a>
                </label>

                {#each lignesAchats || [] as ligne}
                    <fieldset class="ligne-achat">
                        
                        <label>
                            <div>Catégorie</div>
                            <select bind:value={ligne.compteProduit}>
                                {#each [...comptesAchatsPossibles.entries()] as [compte, nom]}
                                    <option value={compte}>{nom}</option>
                                {/each}
                            </select>
                        </label>
        
                        <label>
                            <div>Montant TTC (€)</div>
                            <input bind:value={ligne.montantTTC} step="0.01" min="0" type="number">
                        </label>
        
                        <label>
                            <div>Montant TVA (€) (à récupérer)</div>
                            <input bind:value={ligne.montantTVA} step="0.01" min="0" type="number">
                        </label>
                        {#if tauxDeTVAEstChelou(ligne)}
                            ⚠️ attontion, ça fait un taux de TVA chelou ({ligneAchatToLigneFacture(ligne).tauxTVA}%)
                        {/if}

                        {#if lignesAchats.length >= 2}
                            <button type="button" on:click={e => supprimerLigneAchat(ligne)}>Supprimer ligne</button>    
                        {/if}
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
    }

    h1 {
        margin: 0;
    }
</style>