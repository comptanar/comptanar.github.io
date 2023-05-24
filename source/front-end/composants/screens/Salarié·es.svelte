<script>
    // @ts-check

    import Skeleton from "../Skeleton.svelte"
    import Tableau, { action } from "../Tableau.svelte"
    import SaveButton from "../SaveButton.svelte"
    import { créerSalarié·eVide } from '../../../format-données/salariees'
    import { tick } from "svelte";

    export let login
    export let logout
    /** @type {Personne[]} */
    export let personnes
    /** @type {Salarié·e[]} */
    export let salarié·es
    export let supprimerSalarié·e
    export let envoyerSalarié·e

    let table
    let tableConfig
    let formStart

    let salarié·eEnÉdition
    let editPromise

    let personne
    let suffixe

    function sauvegarderSalarié·e() {
        editPromise = envoyerSalarié·e({
            identifiant: salarié·eEnÉdition.identifiant,
            personne,
            suffixe,
        })

        editPromise.then(() => {
            editPromise = undefined
            table.edit(salarié·es.findIndex(s => s.identifiant === salarié·eEnÉdition.identifiant))
        })
    }

    async function màjFormulaire(sal) {
        salarié·eEnÉdition = sal ?? créerSalarié·eVide()
        
        personne = personnePour(salarié·eEnÉdition)
        suffixe = salarié·eEnÉdition.suffixeCompte

        await tick()
        formStart.focus()
    }

    const personnePour = (s) => personnes.find(p => p.identifiant === s.idPersonne)

    $: tableConfig = {
        globalActions: [
            action(() => table.edit(-1), 'Ajouter quelqu\'un', 'Alt+N')
        ],
        itemActions: [
            action(s => supprimerSalarié·e(s), 'Supprimer')
        ],
        columns: [ 'Personne', 'Suffixe des comptes' ],
        data: salarié·es.map(s => [
            { content: personnePour(s)?.nom || '⚠️ Données corrompues (personne introuvable)' },
            { content: s.suffixeCompte },
        ])
    }
</script>

<Skeleton {login} {logout} fullwidth>
    <Tableau {...tableConfig} bind:this={table} on:edit={(e) => màjFormulaire(salarié·es[e.detail])}>
        <h1 slot="header">Liste des salarié·es</h1>
        <svelte:fragment slot="form-header">
            {#if salarié·eEnÉdition && salarié·eEnÉdition.idPersonne !== '' }
                <h1>Modifier « { personnePour(salarié·eEnÉdition).nom } »</h1>
            {:else}
                <h1>Ajouter un·e salarié·e</h1>
            {/if}
        </svelte:fragment>
        <form on:submit|preventDefault={sauvegarderSalarié·e}>
            <fieldset disabled={editPromise && editPromise[Symbol.toStringTag] === 'Promise'}>
                <label>
                    <div>Personne</div>
                    <select bind:value={personne} bind:this={formStart}>
                        {#each personnes as p}
                            <option value={p}>{p.nom}</option>
                        {/each}
                    </select>
                </label>
                <label>
                    <div>Suffixe des comptes</div>
                    <input type="number" bind:value={suffixe}>
                </label>

                <SaveButton bind:promise={editPromise} />
                <button on:click={() => table.edit(undefined)}>Abandonner les modifications</button>
            </fieldset>
        </form>
    </Tableau>
</Skeleton>