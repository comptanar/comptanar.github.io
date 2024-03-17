<script>
    // @ts-check

    import { tick } from "svelte";

    import Skeleton from "../Skeleton.svelte";
    import Tableau, { action } from "../Tableau.svelte";
    import SaveButton from "../SaveButton.svelte";
    import { créerPersonneVide } from "../../../format-données/personnes.js";
    import { envoyerPersonne, supprimerPersonne } from "../../actions/personnes.js";
    import { créerProchainCompteClient, créerProchainCompteFournisseur } from '../../../format-données/comptabilité/main.js'

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
    export let personnes;

    /** @type {Promise<void> | undefined} */
    let editPromise;
    /** @type {Personne} */
    let personneEnModification = créerPersonneVide();

    /** @type {HTMLElement} */
    let formStart;
    /** @type {any} */
    let table;
    /** @type {any} */
    let tableConfig;

    function enFaireUnClient(){
        //@ts-expect-error TypeScript doesn't understand that after .filter(x => !!x), all values are strings
        const prochainCompteClient = créerProchainCompteClient(personnes.map(({compteClient}) => compteClient).filter(x => !!x))
        personneEnModification.compteClient = prochainCompteClient
    }

    function enFaireUnFournisseur(){
        //@ts-expect-error TypeScript doesn't understand that after .filter(x => !!x), all values are strings
        const prochainCompteFournisseur = créerProchainCompteFournisseur(personnes.map(({compteFournisseur}) => compteFournisseur).filter(x => !!x))
        personneEnModification.compteFournisseur = prochainCompteFournisseur
    }

    function sauvegarderFormulaire() {
        editPromise = envoyerPersonne(personneEnModification);

        editPromise.then(() => {
            editPromise = undefined;
            table.edit(
                personnes.findIndex(
                    (p) => p.identifiant === personneEnModification.identifiant
                )
            );
        });
    }

    /**
     * 
     * @param {Personne} personne
     */
    async function màjFormulaire(personne) {
        personneEnModification = personne ?? créerPersonneVide();

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

<Skeleton {user} {logout} {org} {repo} {conflict} fullwidth>
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
                            bind:value={personneEnModification.nom}
                            type="text"
                        />
                    </label>
                    <label>
                        <div>Type</div>
                        <select bind:value={personneEnModification.type}>
                            <option value="Morale">Morale</option>
                            <option value="Physique">Physique</option>
                        </select>
                    </label>
                    <section>
                        {#if personneEnModification.compteClient}
                            <div>Cette personne est un.e client.e</div>
                            <p>Compte client: <code>{personneEnModification.compteClient}</p>
                        {:else}
                            <div>Cette personne n'est pas un.e client.e</div>
                            <button type="button" on:click={enFaireUnClient}>En faire un.e client.e</button>
                        {/if}
                    </section>
                    <section>
                        {#if personneEnModification.compteFournisseur}
                            <div>Cette personne est un fournisseur</div>
                            <p>Compte fournisseur: <code>{personneEnModification.compteFournisseur}</p>
                        {:else}
                            <div>Cette personne n'est pas un fournisseur</div>
                            <button type="button" on:click={enFaireUnFournisseur}>En faire un fournisseur</button>
                        {/if}
                    </section>

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
