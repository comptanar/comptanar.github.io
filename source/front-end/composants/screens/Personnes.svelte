<script>
    // @ts-check

    import { tick } from "svelte";

    import Skeleton from "../Skeleton.svelte";
    import Tableau, { action } from "../Tableau.svelte";
    import SaveButton from "../SaveButton.svelte";
    import { créerPersonneVide } from "../../../format-données/personnes";
    import { envoyerPersonne, supprimerPersonne } from "../../actions";

    export let login;
    export let logout;
    export let org;
    export let repo;
    /** @type {Personne[]} */
    export let personnes;

    let editPromise;
    let personneEnModification;
    let nom;

    let formStart;
    let table;
    let tableConfig;
    let type;

    function sauvegarderFormulaire() {
        editPromise = envoyerPersonne({
            identifiant: personneEnModification.identifiant,
            type,
            nom,
        });

        editPromise.then(() => {
            editPromise = undefined;
            table.edit(
                personnes.findIndex(
                    (p) => p.identifiant === personneEnModification.identifiant
                )
            );
        });
    }

    async function màjFormulaire(personne) {
        personneEnModification = personne ?? créerPersonneVide();

        nom = personneEnModification.nom;

        await tick();
        formStart?.focus();
    }

    function supprimer() {
        supprimerPersonne(personneEnModification);
        table.edit(undefined);
    }

    $: tableConfig = {
        globalActions: [
            action(() => table.edit(-1), "Nouvelle personne", "Alt+N"),
        ],
        columns: ["Nom"],
        data: personnes.map((p) => [{ content: p.nom }]),
    };
    $: console.log(personnes);
</script>

<Skeleton {login} {logout} {org} {repo} fullwidth>
    <Tableau
        {...tableConfig}
        bind:this={table}
        on:edit={(e) => màjFormulaire(personnes[e.detail])}
    >
        <h1 slot="header">Liste des personnes connues</h1>
        <h1 slot="form-header">Modifier une personne</h1>

        {#if personneEnModification}
            <form on:submit|preventDefault={sauvegarderFormulaire}>
                <fieldset
                    disabled={editPromise &&
                        editPromise[Symbol.toStringTag] === "Promise"}
                >
                    <label>
                        <div>Nom</div>
                        <input
                            bind:this={formStart}
                            bind:value={nom}
                            type="text"
                        />
                    </label>
                    <label>
                        <div>Type</div>
                        <select bind:value={type}>
                            <option value="Morale">Morale</option>
                            <option value="Physique">Physique</option>
                        </select>
                    </label>

                    <SaveButton bind:promise={editPromise} />
                    <button type="button" on:click={() => table.edit(undefined)}
                        >Abandonner les modifications</button
                    >
                    <button type="button" on:click={supprimer}>Supprimer</button
                    >
                </fieldset>
            </form>
        {/if}
    </Tableau>
</Skeleton>
