<script>
    // @ts-check

    import Skeleton from "../Skeleton.svelte"
    import Tableau, { action } from "../Tableau.svelte"
    import SaveButton from "../SaveButton.svelte"
    import DateInput from "../DateInput.svelte"
    import { créerSalariatVide } from '../../../format-données/salariats'
    import { SvelteComponent, tick } from "svelte";
    import { format } from "date-fns";
    import { displayDate } from "../../stringifiers";
    import { fr } from "date-fns/locale";
    import { envoyerSalariat, supprimerSalariat } from "../../actions/salariats";

    /** @typedef {import("../../store.js").ComptanarState} ComptanarState */

    /** @type {ComptanarState['user']} */
    export let user
    /** @type {() => void} */
    export let logout
    /** @type {ComptanarState['org']} */
    export let org
    /** @type {ComptanarState['repo']} */
    export let repo
    /** @type {ComptanarState["conflict"]} */
    export let conflict;
    /** @type {Personne[]} */
    export let personnes
    /** @type {Salariat[]} */
    export let salariats

    /** @type {Personne[]} */
    let personnesPhysiques
    $: personnesPhysiques = personnes.filter(({type}) => type === 'Physique')

    /** @type {SvelteComponent} */
    let table
    /** @type {any} */
    let tableConfig
    /** @type {any} */
    let formStart

    let salariatEnÉdition = créerSalariatVide()
    /** @type {Promise<void> | undefined} */
    let editPromise

    /** @type {Personne | undefined} */
    let personne
    $: {if(personne){ salariatEnÉdition.idPersonne = personne.identifiant}}

    function sauvegarderSalariat() {
        editPromise = envoyerSalariat(salariatEnÉdition)

        editPromise.then(() => {
            editPromise = undefined
            table.edit(salariats.findIndex(s => s.identifiant === salariatEnÉdition.identifiant))
        })
    }

    /**
     * 
     * @param {Salariat} sal
     */
    async function màjFormulaire(sal) {
        salariatEnÉdition = sal ?? créerSalariatVide()
        
        personne = personnePour(salariatEnÉdition)

        await tick()
        formStart?.focus()
    }

    function supprimer() {
        supprimerSalariat(salariatEnÉdition)
        table.edit(undefined)
    }

    /**
     * 
     * @param {Salariat} salariat
     * @return {Personne | undefined}
     */
    const personnePour = (salariat) => personnes.find(p => p.identifiant === salariat.idPersonne)

    $: tableConfig = {
        globalActions: [
            action(() => table.edit(-1), 'Ajouter un salariat', 'Alt+N')
        ],
        columns: [ 'Personne', 'Période du contrat' ],
        data: salariats.map(s => [
            { content: personnePour(s)?.nom || '⚠️ Données corrompues (personne introuvable)' },
            {
                content: `${displayDate(s.débutContrat)} - ${!s.finContrat ? 'Toujours en cours' : displayDate(s.finContrat)}`,
                title: `${format(s.débutContrat, 'd MMMM yyyy', {locale: fr})} - ${!s.finContrat ? 'Toujours en cours' : format(s.finContrat, 'd MMMM yyyy', {locale: fr})}`
            },
        ])
    }
</script>

<Skeleton {user} {logout} {org} {repo} {conflict} fullwidth>
    <Tableau {...tableConfig} bind:this={table} on:edit={(e) => màjFormulaire(salariats[e.detail])}>
        <h1 slot="header">Liste des salariats</h1>
        <svelte:fragment slot="form-header">
            {#if salariatEnÉdition && salariatEnÉdition.idPersonne !== '' }
                <h1>Modifier « { personnePour(salariatEnÉdition)?.nom } »</h1>
            {:else}
                <h1>Ajouter un salariat</h1>
            {/if}
        </svelte:fragment>
        <form on:submit|preventDefault={sauvegarderSalariat}>
            <fieldset disabled={editPromise && editPromise[Symbol.toStringTag] === 'Promise'}>
                <label>
                    <div>Personne</div>
                    <select bind:value={personne} bind:this={formStart}>
                        {#each personnesPhysiques as p}
                            <option value={p}>{p.nom}</option>
                        {/each}
                    </select>
                </label>
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>
                    <div>Début du contrat</div>
                    <DateInput bind:date={salariatEnÉdition.débutContrat} />
                </label>
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label>
                    <div>Fin du contrat</div>
                    <DateInput bind:date={salariatEnÉdition.finContrat} />
                </label>

                <SaveButton bind:promise={editPromise} />
                <button type="button" on:click={() => table.edit(undefined)}>Abandonner les modifications</button>
                <button type="button" on:click={supprimer}>Supprimer</button>
            </fieldset>
        </form>
    </Tableau>
</Skeleton>