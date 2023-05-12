<script>
    // @ts-check

    import Skeleton from "../Skeleton.svelte"
    import Tableau from "../Tableau.svelte"

    export let login
    export let logout
    export let org
    /** @type Personne[] */
    export let personnes
    /** @type Salarié_e[] */
    export let salarié_es
    export let créerFicheDePaieVide

    const tableConfig = {
        placeholder: 'Sélectionne une fiche de paie pour en voir le détail et la modifier',
        columns: [ 'Date d\'émission', 'Période', 'Salarié⋅e', 'Montant' ],
        globalActions: [
            { name: 'Nouvelle fiche', shortcut: 'Alt+N', run: créerFicheDePaieVide }
        ],
        itemActions: [],
        data: [
            [
                { content: 'Il y a deux jours' },
                { content: '5 mai 2023 - 16 mai 2023' },
                { content: 'Alice' },
                { content: '1€' },
            ]
        ]
    }
</script>

<Skeleton {login} {logout} fullwidth>
    <Tableau {...tableConfig}>
        <h1 slot="header">Voici les fiches de paie pour <code>{org}</code></h1>
    </Tableau>
</Skeleton>