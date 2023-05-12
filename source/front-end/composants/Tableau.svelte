<script>
    // @ts-check

    import Keybinding from 'keybinding'
    import { createEventDispatcher, tick } from 'svelte';
    import Loader from './Loader.svelte';

    /**
     * Une action correspondra à un bouton (et un éventuel raccourci clavier) dans l'interface
     * 
     * @template P
     * @typedef {{ run: (data: P?) => void, shortcut?: string, name: string }} Action
    */

    /**
     * Les actions disponibles de manière générale sur les données (exemple : création d'un nouvel item)
     * @type Action<undefined>[]
     */
   export let globalActions

    /**
     * Les intitulés des colonnes du tableau
     *
     *  @type string[]
     */
    export let columns

    /**
     * Les actions disponibles sur un item en particulier.
     * 
     * L'indice de l'item est passé en paramètre du callback.
     * 
     * @type Action<number>[]
     */
    export let itemActions

    /**
     * Les données dans le tableau
     * 
     * @type any[][]
     */
    export let data

    /**
     * Un message à afficher à la place du formulaire quand aucun item n'est sélectionné
     * 
     * @type string
     */
    export let placeholder = 'Sélectionne un élément'

    /**
     * L'indice de l'item qu'on est en train de modifier
     * 
     * @type number
     */
    let editing

    /** @type {(key: string, item: number) => boolean} */
    const dispatch = createEventDispatcher()

    /**
     * Change l'item en cours d'édition
     * 
     * @param {number} item
     */
    export async function edit(item) {
        editing = item
        dispatch('edit', item)

        await tick()
        // on s'assure aussi que la facture qu'on est en train d'éditer est bien visible
        // dans la liste
        const row = document.querySelector('.edition')
        if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }
    }

    // Gestion des raccourcis clavier

    const keybinder = new Keybinding({ filterEditable: false })
    for (const action of globalActions) {
        if (action.shortcut) {
            keybinder.on(action.shortcut, action.run)
        }
    }


    for (const action of itemActions) {
        if (action.shortcut) {
            keybinder.on(action.shortcut, () => action.run(editing))
        }
    }

    keybinder.on('down', () => {
        let item = (editing ?? -1) + 1
        console.log(item, data.length)
        if (item >= data.length) {
            item = data.length - 1
        }

        edit(item)
    })

    keybinder.on('up', () => {
        let item = (editing ?? data.length) - 1
        if (item < 0) {
            item = 0
        }

        edit(item)
    })
</script>

<div class="tableau-editable">
    <header class="table-header">
        <slot name="header"></slot>
        <div class="action-group">
            {#each globalActions as action}
                <button on:click={action.run} title={action.shortcut}>{action.name}</button>
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
                        {#each itemActions as _}
                            <th></th>
                        {/each}
                    </tr>
                </thead>
                <tbody>
                    {#each data as row, i}
                        <tr class:edition={editing === i} on:click={_ => edit(i)}>
                            {#each row as content}
                                <td title={content.title}>{content.content}</td>
                            {/each}
                            {#each itemActions as action}
                                <td>
                                    <button disabled={editing !== undefined} on:click={() => action.run(i)} title={action.shortcut}>{action.name}</button>
                                </td>
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
            <slot name="form-header"></slot>
        </header>
        <div class="form-body">
            <slot></slot>
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
        grid-template: "table-title form-title" auto
                       "table-body  form-body " auto
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
            }

            thead {
                position: sticky;
                top: 0;
                background-color: #e9e9e9;
            }

            td, th {
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
            padding-left: 0;
        }

        .form-header {
            background-color: white;
            grid-area: form-title;
        }
    }

    .form-body {
        background-color: white;
        grid-area: form-body;
        padding: 2rem;
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
            grid-template: "table-title" auto
                           "table-body" auto
                           "form-title" auto
                           "form-body" auto
                           / 1fr;
        }
    }
</style>