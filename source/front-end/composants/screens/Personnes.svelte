<script>
    // @ts-check

    import { tick } from 'svelte'

    import Skeleton from '../Skeleton.svelte'
    import Tableau, { action } from '../Tableau.svelte'
    import Loader from '../Loader.svelte'
    import { créerPersonneVide } from '../../../format-données/personnes'

    export let login
    export let logout
    /** @type {Personne[]} */
    export let personnes
    export let supprimerPersonne
    export let envoyerPersonne

    let editPromise
    let personneEnModification
    let nom

    let formStart
    let table
    let tableConfig

    function sauvegarderFormulaire() {
        editPromise = envoyerPersonne({
            identifiant: personneEnModification.identifiant,
            nom,
        })

        editPromise.then(() => {
            editPromise = undefined
            table.edit(personnes.findIndex(p => p.identifiant === personneEnModification.identifiant))
        })
    }

    async function màjFormulaire(personne) {
        personneEnModification = personne ?? créerPersonneVide()

        nom = personneEnModification.nom

        await tick()
        formStart?.focus()
    }

    $: tableConfig = {
        globalActions: [
            action(() => table.edit(-1), "Nouvelle personne", "Alt+N"),
        ],
        itemActions: [
            action(p => supprimerPersonne(p), "Supprimer"),
        ],
        columns: [ 'Nom' ],
        data: personnes.map(p => [
            { content: p.nom }
        ])
    }
    $: console.log(personnes)
</script>

<Skeleton {login} {logout} fullwidth>
    <Tableau {...tableConfig} bind:this={table} on:edit={(e) => màjFormulaire(personnes[e.detail])}>
        <h1 slot="header">Liste des personnes connues</h1>
        <h1 slot="form-header">Modifier une personne</h1>

        {#if personneEnModification}
            <form on:submit|preventDefault={sauvegarderFormulaire}>
                <fieldset disabled={editPromise && editPromise[Symbol.toStringTag] === 'Promise'}>
                    <label>
                        <div>Nom</div>
                        <input bind:this={formStart} bind:value={nom} type="text">
                    </label>

                    <div class="button-with-loader">
                        <button type="submit">Enregistrer</button>
                        {#await editPromise}
                            <Loader></Loader>
                        {:catch err}
                            Problème avec la sauvegarde de la personne {err}
                        {/await}
                    </div>
                    <button on:click={() => table.edit(undefined)}>Abandonner les modifications</button>
                </fieldset>
            </form>
        {/if}
    </Tableau>
</Skeleton>
