<script>
    // @ts-check

    import { format } from "date-fns";
    import { fr } from "date-fns/locale";
    import { tick } from "svelte";

    import Skeleton from "../Skeleton.svelte";
    import Tableau, { action } from "../Tableau.svelte";
    import SaveButton from "../SaveButton.svelte";
    import {
        displayDate,
        afficherSommeOpérations,
        formatCompte,
    } from "../../stringifiers";
    import { supprimerOpérationHautNiveau } from "../../actions";

    export let login;
    export let logout;
    export let org;
    export let repo;
    /** @type Personne[] */
    export let personnes;
    /** @type Salarié·e[] */
    export let salarié·es;
    export let créerFicheDePaieVide;
    /** @type ÉmissionFicheDePaie[] */
    export let fichesDePaie;
    export let envoyerFicheDePaie;

    /** @type ÉmissionFicheDePaie */
    let ficheEnModification;
    let editPromise;
    let table;
    let formStart;

    // Données du formulaire
    let salarié·e;
    let rémunération;
    let sécu;
    let prélèvement;
    let dateÉmission;
    let débutPériode;
    let finPériode;

    /**
     * @param {ÉmissionFicheDePaie} fiche
     * @returns {string}
     */
    function salarié·eForFiche(fiche) {
        const compteRémunéré = fiche.opérations.find((f) =>
            f.compte.startsWith("641")
        );
        if (compteRémunéré === undefined) {
            return "";
        }
        const suffixe = Number.parseInt(compteRémunéré.compte.slice(3));
        const salarié·e = salarié·es.find((s) => s.suffixeCompte === suffixe);
        const personne = personnes.find(
            (p) => p.identifiant === salarié·e.idPersonne
        );
        return personne.nom;
    }

    function sauvegarderFiche() {
        const personne = personnes.find((p) => p.nom === salarié·e);
        const compte = salarié·es.find(
            (s) => s.idPersonne === personne.identifiant
        ).suffixeCompte;
        editPromise = envoyerFicheDePaie({
            identifiantOpération: ficheEnModification.identifiantOpération,
            compteSalarié·e: compte,
            nomSalarié·e: salarié·e,
            rémunération,
            sécu,
            prélèvement,
            dateÉmission,
            débutPériodeStr: débutPériode,
            finPériodeStr: finPériode,
        });

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
        if (fiche) {
            ficheEnModification = fiche;
            const extraireSuffixe = (compte) =>
                Number.parseInt(compte.slice(3));
            const suffixe = extraireSuffixe(
                ficheEnModification.opérations[0]?.compte
            );
            const montantPour = (préfixe) =>
                ficheEnModification.opérations.find(
                    (x) => x.compte === formatCompte(préfixe, suffixe)
                ).montant;

            salarié·e = salarié·eForFiche(ficheEnModification);
            rémunération = montantPour(641);
            sécu = montantPour(645);
            prélèvement = montantPour(4421);
            débutPériode = format(
                ficheEnModification.débutPériode,
                "yyyy-MM-dd"
            );
            finPériode = format(ficheEnModification.finPériode, "yyyy-MM-dd");
            dateÉmission = format(ficheEnModification.date, "yyyy-MM-dd");
        } else {
            ficheEnModification = créerFicheDePaieVide();
        }

        await tick();
        formStart?.focus();
    }

    function supprimer() {
        supprimerOpérationHautNiveau(ficheEnModification);
        table.edit(undefined);
    }

    let tableConfig;
    $: tableConfig = {
        placeholder:
            "Sélectionne une fiche de paie pour en voir le détail et la modifier",
        columns: ["Date d'émission", "Période", "Salarié⋅e", "Montant"],
        globalActions: [
            action(() => table.edit(-1), "Nouvelle fiche", "Alt+N"),
        ],
        data: fichesDePaie?.map((fiche) => [
            {
                content: displayDate(fiche.date),
                title: format(fiche.date, "d MMMM yyyy", { locale: fr }),
            },
            {
                content: `${displayDate(fiche.débutPériode)} 🠒 ${displayDate(
                    fiche.finPériode
                )}`,
                title: `${format(fiche.débutPériode, "d MMMM yyyy", {
                    locale: fr,
                })} 🠒 ${format(fiche.finPériode, "d MMMM yyyy", {
                    locale: fr,
                })}`,
            },
            { content: salarié·eForFiche(fiche) },
            { content: afficherSommeOpérations(fiche.opérations) },
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
                        <div>Salarié⋅e</div>
                        <input
                            bind:this={formStart}
                            bind:value={salarié·e}
                            type="text"
                        />
                    </label>
                    <label>
                        <div>Net payé (€)</div>
                        <input
                            bind:value={rémunération}
                            step="0.01"
                            type="number"
                        />
                    </label>
                    <label>
                        <div>
                            Total des cotisations et contributions (À déduire)
                            (€)
                        </div>
                        <input bind:value={sécu} step="0.01" type="number" />
                    </label>
                    <label>
                        <div>Impôt sur le revenu prélevé à la source (€)</div>
                        <input
                            bind:value={prélèvement}
                            step="0.01"
                            type="number"
                        />
                    </label>
                    <label>
                        <div>Date d'émission de la fiche de paie</div>
                        <input bind:value={dateÉmission} type="date" />
                    </label>
                    <div class="input-group">
                        <label>
                            <div>Début de la période</div>
                            <input bind:value={débutPériode} type="date" />
                        </label>
                        <label>
                            <div>Fin de la période</div>
                            <input bind:value={finPériode} type="date" />
                        </label>
                    </div>

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
