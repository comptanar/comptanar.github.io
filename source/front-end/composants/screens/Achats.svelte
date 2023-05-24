<script>
    // @ts-check

    import { tick } from 'svelte'
    import { format } from 'date-fns'
    import { fr } from 'date-fns/locale'

    import Skeleton from '../Skeleton.svelte'
    import Tableau, { action } from '../Tableau.svelte'
    import SaveButton from '../SaveButton.svelte'

    import { créerAchatVide } from '../../../format-données/opérationsHautNiveau'
    import { afficherSommeOpérations, displayDate } from '../../stringifiers'
    import { envoyerAchat, supprimerOpérationHautNiveau } from '../../actions'

    export let login
    export let logout
    /** @type {Achat[]} */
    export let achats
    export let org

    let formStart
    let table
    let editPromise
    /** @type {Achat} */
    let achatEnÉdition

    let compte
    let motif
    let date
    let montant

    function sauvegarderAchat() {
        editPromise = envoyerAchat({
            identifiantOpération: achatEnÉdition.identifiantOpération,
            compte,
            motif,
            date,
            montant,
        })

        editPromise.then(() => {
            editPromise = undefined
            table.edit(achats.findIndex(a => a.identifiantOpération === achatEnÉdition.identifiantOpération))
        })
    }

    async function màjFormulaire(achat) {
        achatEnÉdition = achat ?? créerAchatVide()

        compte = achatEnÉdition.opérations[0].compte
        motif = achatEnÉdition.motif
        date = format(achatEnÉdition.date, 'yyyy-MM-dd')
        montant = achatEnÉdition.opérations[0].montant

        await tick()
        formStart?.focus()
    }

    let tableConfig
    $: tableConfig = {
        globalActions: [ action(() => table.edit(-1), 'Nouvel achat', 'Alt+N') ],
        itemActions: [ action(i => supprimerOpérationHautNiveau(achats[i]), 'Supprimer') ],
        placeholder: 'Sélectionne un achat dans la liste pour en voir le détail ou le modifier',
        columns: ['Date', 'Motif', 'Montant'],
        data: achats.map(a => [
            { content: displayDate(a.date), title: format(a.date, 'd MMMM yyyy', {locale: fr}) },
            { content: a.motif ?? 'Inconnu' },
            { content: afficherSommeOpérations(a.opérations) },
        ])
    }
</script>

<Skeleton {login} {logout} fullwidth>
    <Tableau bind:this={table} on:edit={e => màjFormulaire(achats[e.detail])} {...tableConfig}>
        <h1 slot="header">
            Achats réalisés par {org}
        </h1>

        <svelte:fragment slot="form-header">
            {#if achatEnÉdition?.motif}
                <h2>Achat «&nbsp;{achatEnÉdition.motif}&nbsp;»</h2>
            {:else}
                <h2>Achat</h2>
            {/if}
        </svelte:fragment>

        <form on:submit|preventDefault={sauvegarderAchat}>
            <fieldset disabled={editPromise && editPromise[Symbol.toStringTag] === 'Promise'}>
                <label>
                    <div>Numéro de compte</div>
                    <input bind:this={formStart} bind:value={compte}>
                </label>

                <label>
                    <div>Motif</div>
                    <input bind:value={motif}>
                </label>

                <label>
                    <div>Date</div>
                    <input bind:value={date} type="date">
                </label>

                <label>
                    <div>Montant (€)</div>
                    <input bind:value={montant} step="0.01" type="number">
                </label>

                <SaveButton bind:promise={editPromise} />
                <button on:click={_ => table.edit(undefined)}>Abandonner les modifications</button>
            </fieldset>
        </form>
    </Tableau>
</Skeleton>