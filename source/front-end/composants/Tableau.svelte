<script context="module">
    export function action(f, name, shortcut) {
        Object.defineProperty(f, "name", { value: name });
        f.shortcut = shortcut;
        return f;
    }
</script>

<script>
    // @ts-check

    //import Keybinding from "keybinding";
    import { createEventDispatcher, tick } from "svelte";
    import Loader from "./Loader.svelte";

    /**
     * Une action correspondra à un bouton (et un éventuel raccourci clavier) dans l'interface
     *
     * @template P
     * @typedef {((data: P?) => void) & { shortcut?: string }} Action
     */

    /**
     * Les actions disponibles de manière générale sur les données (exemple : création d'un nouvel item)
     * @type Action<undefined>[]
     */
    export let globalActions;

    /**
     * Les intitulés des colonnes du tableau
     *
     *  @type string[]
     */
    export let columns;

    /**
     * Les données dans le tableau
     *
     * @type any[][]
     */
    export let data;

    /**
     * Un message à afficher à la place du formulaire quand aucun item n'est sélectionné
     *
     * @type string
     */
    export let placeholder = "Sélectionne un élément";

    /**
     * L'indice de l'item qu'on est en train de modifier
     *
     * @type number
     */
    let editing;

    /** @type {(key: string, item: number) => boolean} */
    const dispatch = createEventDispatcher();

    /**
     * Change l'item en cours d'édition
     *
     * @param {number} item
     */
    export async function edit(item) {
        editing = item;
        dispatch("edit", item);

        await tick();
        // on s'assure aussi que la facture qu'on est en train d'éditer est bien visible
        // dans la liste
        const row = document.querySelector(".edition");
        if (row) {
            row.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }

    // Gestion des raccourcis clavier

    // PPP pour le moment, cette question clavier dérange l'édition, donc elle est désactivée pour le moment


    /*const keybinder = new Keybinding({ filterEditable: false });
    for (const action of globalActions) {
        if (action.shortcut) {
            keybinder.on(action.shortcut, action);
        }
    }

    keybinder.on("down", () => {
        let item = (editing ?? -1) + 1;
        if (item >= data.length) {
            item = data.length - 1;
        }

        edit(item);
    });

    keybinder.on("up", () => {
        let item = (editing ?? data.length) - 1;
        if (item < 0) {
            item = 0;
        }

        edit(item);
    });*/
</script>

<div class="tableau-editable">
    <header class="table-header">
        <slot name="header" />
        <div class="action-group">
            {#each globalActions as action}
                <button on:click={action} title={action.shortcut}
                    >{action.name}</button
                >
            {/each}
        </div>
    </header>
    <main>
        {#if data}
            <table>
                <thead>
                    <tr>
                        {#each columns as col}
                            <th>{col}</th>
                        {/each}
                    </tr>
                </thead>
                <tbody>
                    {#each data as row, i}
                        <tr
                            class:edition={editing === i}
                            on:click={(_) => edit(i)}
                        >
                            {#each row as content}
                                <td title={content.title}>{content.content}</td>
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
        {:else}
            <div class="center">
                <Loader />
            </div>
        {/if}
    </main>

    {#if editing !== undefined}
        <header class="form-header">
            <slot name="form-header" />
        </header>
        <div class="form-body">
            <slot />
        </div>
    {:else}
        <p class="etat-vide">
            {placeholder}
        </p>
    {/if}
</div>

<style lang="scss">
    .edition {
        background-color: white;
    }

    .center {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .tableau-editable {
        display: grid;
        grid-template:
            "table-title form-title" auto
            "table-body  form-body " 1fr
            / 2fr 1fr;
        height: 100%;

        & > main {
            grid-area: table-body;
            overflow: auto;
            margin-bottom: 0;

            table {
                width: 100%;
            }

            tbody tr {
                cursor: pointer;

                &:hover:not(.edition) {
                    background-color: #f1f1f1;
                }

                &:nth-child(2n) {
                    background-color: #f6f6f6;
                }
            }

            thead {
                position: sticky;
                top: 0;
                background-color: #e9e9e9;
                text-align: left;
            }

            td,
            th {
                padding: 1rem;
            }
        }

        & > header {
            padding: 2rem;
            background: transparent;
            color: black;

            & > *:first-child {
                margin: 0;
            }
        }

        .table-header {
            grid-area: table-title;
            display: flex;
            justify-content: space-between;
            padding: 2rem 0;
            gap: 2rem;

            & > div {
                flex-shrink: 0;
            }
        }

        .form-header {
            background-color: white;
            grid-area: form-title;
        }
    }

    .form-body {
        background-color: white;
        grid-area: form-body;
        padding: 0 2rem 2rem;
    }

    .etat-vide {
        grid-row-start: form-title;
        grid-row-end: form-body;
        display: flex;
        height: 100%;
        padding: 2rem;
        justify-content: center;
        align-items: center;
        text-align: center;
        font-size: 1.3rem;
        font-weight: bold;
        color: gray;
        background-color: white;
    }

    // sur les petits écrans, on affiche le formulaire en dessous de la liste
    @media (max-width: 1200px) {
        .tableau-editable {
            grid-template:
                "table-title" auto
                "table-body" auto
                "form-title" auto
                "form-body" auto
                / 1fr;
        }
    }
</style>
