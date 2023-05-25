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
    /** @type {RéceptionFactureFournisseur[]} */
    export let achats
    export let org

    let formStart
    let table
    let editPromise
    /** @type {RéceptionFactureFournisseur} */
    let achatEnÉdition

    let compte
    let date
    let montant

    function sauvegarderAchat() {
        editPromise = envoyerAchat({
            identifiantOpération: achatEnÉdition.identifiantOpération,
            compte,
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

        compte = achatEnÉdition.compteFournisseur
        date = format(achatEnÉdition.date, 'yyyy-MM-dd')
        montant = achatEnÉdition.opérations.find(o => o.compte === compte)?.montant ?? 0

        await tick()
        formStart?.focus()
    }

    let tableConfig
    $: tableConfig = {
        globalActions: [ action(() => table.edit(-1), 'Nouvel achat', 'Alt+N') ],
        itemActions: [ action(i => supprimerOpérationHautNiveau(achats[i]), 'Supprimer') ],
        placeholder: 'Sélectionne un achat dans la liste pour en voir le détail ou le modifier',
        columns: ['Date', 'Montant'],
        data: achats.map(a => [
            { content: displayDate(a.date), title: format(a.date, 'd MMMM yyyy', {locale: fr}) },
            { content: afficherSommeOpérations(a.opérations) },
        ])
    }
</script>

<Skeleton {login} {logout} fullwidth>
    <Tableau bind:this={table} on:edit={e => màjFormulaire(achats[e.detail])} {...tableConfig}>
        <h1 slot="header">
            Achats réalisés par {org}
        </h1>

        <h2 slot="form-header">Achat</h2>

        <form on:submit|preventDefault={sauvegarderAchat}>
            <fieldset disabled={editPromise && editPromise[Symbol.toStringTag] === 'Promise'}>
                <label>
                    <div>Numéro de compte</div>
                    <input bind:this={formStart} bind:value={compte}>
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