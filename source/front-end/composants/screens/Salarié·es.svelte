<script>
    // @ts-check

    import Skeleton from "../Skeleton.svelte"
    import Tableau, { action } from "../Tableau.svelte"
    import SaveButton from "../SaveButton.svelte"
    import { créerSalarié·eVide } from '../../../format-données/salarié·es'
    import { tick } from "svelte";
    import { format } from "date-fns";
    import { displayDate } from "../../stringifiers";
    import { fr } from "date-fns/locale";
    import { envoyerSalarié·e, supprimerSalarié·e } from "../../actions";

    export let login
    export let logout
    export let org
    export let repo
    /** @type {Personne[]} */
    export let personnes
    /** @type {Salarié·e[]} */
    export let salarié·es

    let table
    let tableConfig
    let formStart

    let salarié·eEnÉdition
    let editPromise

    let personne
    let débutContrat
    let finContrat

    function sauvegarderSalarié·e() {
        editPromise = envoyerSalarié·e({
            identifiant: salarié·eEnÉdition.identifiant,
            idPersonne: personne.identifiant,
            débutContrat: new Date(débutContrat),
            finContrat: new Date(finContrat)
        })

        editPromise.then(() => {
            editPromise = undefined
            table.edit(salarié·es.findIndex(s => s.identifiant === salarié·eEnÉdition.identifiant))
        })
    }

    async function màjFormulaire(sal) {
        salarié·eEnÉdition = sal ?? créerSalarié·eVide()
        
        personne = personnePour(salarié·eEnÉdition)
        débutContrat = format(sal.débutContrat, 'yyyy-MM-dd')
        finContrat = sal.finContrat === null ? null : format(sal.finContrat, 'yyyy-MM-dd')

        await tick()
        formStart?.focus()
    }

    function supprimer() {
        supprimerSalarié·e(salarié·eEnÉdition)
        table.edit(undefined)
    }

    const personnePour = (s) => personnes.find(p => p.identifiant === s.idPersonne)

    $: tableConfig = {
        globalActions: [
            action(() => table.edit(-1), 'Ajouter un contrat', 'Alt+N')
        ],
        columns: [ 'Personne', 'Période du contrat' ],
        data: salarié·es.map(s => [
            { content: personnePour(s)?.nom || '⚠️ Données corrompues (personne introuvable)' },
            {
                content: `${displayDate(s.débutContrat)} 🠒 ${s.finContrat === null ? 'Toujours en cours' : displayDate(s.finContrat)}`,
                title: `${format(s.débutContrat, 'd MMMM yyyy', {locale: fr})} 🠒 ${s.finContrat === null ? 'Toujours en cours' : format(s.finContrat, 'd MMMM yyyy', {locale: fr})}`
            },
        ])
    }
</script>

<Skeleton {login} {logout} {org} {repo} fullwidth>
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
                    <div>Début du contrat</div>
                    <input bind:value={débutContrat} type="date">
                </label>
                <label>
                    <div>Fin du contrat</div>
                    <input bind:value={finContrat} type="date">
                </label>

                <SaveButton bind:promise={editPromise} />
                <button type="button" on:click={() => table.edit(undefined)}>Abandonner les modifications</button>
                <button type="button" on:click={supprimer}>Supprimer</button>
            </fieldset>
        </form>
    </Tableau>
</Skeleton>