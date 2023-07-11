<script>
    // @ts-check

    import { startOfMonth, endOfMonth } from "date-fns";
    import { tick } from "svelte";

    import DateInput from "../DateInput.svelte";
    import Skeleton from "../Skeleton.svelte";
    import Tableau, { action } from "../Tableau.svelte";
    import SaveButton from "../SaveButton.svelte";
    import {
        displayDate,
        formatDate,
        formatMontant
    } from "../../stringifiers";
    import {
        envoyerFicheDePaie,
        supprimerOpérationHautNiveau
    } from "../../actions";
    import { créerFicheDePaieVide } from "../../../format-données/opérationsHautNiveau";

    export let login;
    export let logout;
    export let org;
    export let repo;
    /** @type {Personne[]} */
    export let personnes = [];
    /** @type {Salariat[]} */
    export let salariats = [];
    /** @type {ÉmissionFicheDePaie[]} */
    export let fichesDePaie;

    let editPromise;
    let table;

    let salariatsIds
    let salarié·es

    $: salariatsIds = new Set(salariats.map(({idPersonne}) => idPersonne))
    $: salarié·es = personnes.filter(({identifiant}) => salariatsIds.has(identifiant))

    /** @type {ÉmissionFicheDePaie} */
    let ficheEnModification = créerFicheDePaieVide();

    /** @type {Personne} */
    let salarié·e
    $: ficheEnModification.salarié·e = salarié·e?.identifiant
    
    let année = (new Date()).getFullYear()
    let mois = (new Date()).getMonth()

    $: ficheEnModification.débutPériode = startOfMonth(new Date(année, mois));
    $: ficheEnModification.finPériode = endOfMonth(new Date(année, mois));

    /**
     * @param {ÉmissionFicheDePaie} fiche
     * @returns {string}
     */
    function nomSalarié·eForFiche(fiche) {
        const personne = personnes.find(({identifiant}) => fiche.salarié·e === identifiant);
        return personne?.nom;
    }

    function sauvegarderFiche() {
        editPromise = envoyerFicheDePaie(
            ficheEnModification, 
            personnes.find(({identifiant}) => ficheEnModification.salarié·e === identifiant)
        )

        editPromise.then(() => {
            editPromise = undefined;
            table.edit(
                fichesDePaie.findIndex(
                    (f) =>
                        f.identifiantOpération ===
                        ficheEnModification.identifiantOpération
                )
            );
        });
    }

    /**
     * @param {ÉmissionFicheDePaie} fiche
     */
    async function màjFormulaire(fiche) {
        ficheEnModification = fiche || créerFicheDePaieVide();

        await tick();
    }

    function supprimer() {
        supprimerOpérationHautNiveau(ficheEnModification);
        table.edit(undefined);
    }

    let tableConfig;
    $: tableConfig = {
        placeholder:
            "Sélectionne une fiche de paie pour en voir le détail et la modifier",
        columns: ["Date d'émission", "Période", "Salarié⋅e", "Net après prélèvement à la source", "Coût pour l'entreprise"],
        globalActions: [
            action(() => table.edit(-1), "Nouvelle fiche", "Alt+N"),
        ],
        data: fichesDePaie?.map((fiche) => [
            {
                content: displayDate(fiche.date),
                title: formatDate(fiche.date),
            },
            {
                content: `${displayDate(fiche.débutPériode)} → ${displayDate(fiche.finPériode)}`,
                title: `${formatDate(fiche.débutPériode)} → ${formatDate(fiche.finPériode)}`,
            },
            { content: nomSalarié·eForFiche(fiche) },
            { content: formatMontant(fiche.rémunération) },
            { content: formatMontant(fiche.rémunération + fiche.cotisations + fiche.prélèvementÀLaSource) },
        ]),
    };
</script>

<Skeleton {login} {logout} {org} {repo} fullwidth>
    <Tableau
        {...tableConfig}
        bind:this={table}
        on:edit={(e) => màjFormulaire(fichesDePaie[e.detail])}
    >
        <h1 slot="header">Voici les fiches de paie pour <code>{org}</code></h1>
        <h1 slot="form-header">Détails de la fiche</h1>

        {#if ficheEnModification}
            <form on:submit|preventDefault={sauvegarderFiche}>
                <fieldset
                    disabled={editPromise &&
                        editPromise[Symbol.toStringTag] === "Promise"}
                >
                    <label>
                        <div>Date d'émission de la fiche de paie</div>
                        <DateInput bind:date={ficheEnModification.date}/>
                    </label>

                    <div class="input-group">
                        <label>
                            <div>Mois</div>
                            <select bind:value={mois}>
                                <option value={0}>Janvier</option>
                                <option value={1}>Février</option>
                                <option value={2}>Mars</option>
                                <option value={3}>Avril</option>
                                <option value={4}>Mai</option>
                                <option value={5}>Juin</option>
                                <option value={6}>Juillet</option>
                                <option value={7}>Août</option>
                                <option value={8}>Septembre</option>
                                <option value={9}>Octobre</option>
                                <option value={10}>Novembre</option>
                                <option value={11}>Décembre</option>
                            </select>
                        </label>
                        <label>
                            <div>Année</div>
                            <input bind:value={année} type="number" step="1"/>
                        </label>
                    </div>

                    <div class="input-group">
                        <label>
                            <div>Début de la période</div>
                            <DateInput bind:date={ficheEnModification.débutPériode}/>
                        </label>
                        <label>
                            <div>Fin de la période</div>
                            <DateInput bind:date={ficheEnModification.finPériode}/>
                        </label>
                    </div>

                    <label>
                        <div>Salarié⋅e</div>
                        <select bind:value={salarié·e}>
                            <option> - </option>
                            {#each salarié·es as salarié·e}
                                <option value={salarié·e} selected={ficheEnModification.salarié·e === salarié·e.identifiant}>{salarié·e.nom}</option>
                            {/each}
                        </select>
                    </label>
                    <label>
                        <div>Net payé (€)</div>
                        <input
                            bind:value={ficheEnModification.rémunération}
                            step="0.01"
                            type="number"
                        />
                    </label>
                    <label>
                        <div>
                            Total des cotisations et contributions (à calculer dans la fiche de paie) (€)
                        </div>
                        <input bind:value={ficheEnModification.cotisations} step="0.01" type="number" />
                    </label>
                    <label>
                        <div>Impôt sur le revenu prélevé à la source (€)</div>
                        <input
                            bind:value={ficheEnModification.prélèvementÀLaSource}
                            step="0.01"
                            type="number"
                        />
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
