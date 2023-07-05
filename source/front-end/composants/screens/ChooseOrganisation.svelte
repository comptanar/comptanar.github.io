<script>
    //@ts-check
    import { fade } from "svelte/transition";
    import page from "page";

    import Skeleton from "../Skeleton.svelte";

    import githubAsDatabase from "../../githubAsDatabase.js";

    export let login;
    export let logout;
    export let possibleOrganisations = [];

    const DEFAULT_REPO_NAME = "comptabilite";

    let chosenOrg = undefined;
    let chosenRepo = DEFAULT_REPO_NAME; // PPP hardcoded. Write selection
    let orgComptabiliteRepo;

    function selectOrg(org) {
        chosenOrg = org;

        const repoP = githubAsDatabase.getRepo(chosenOrg.login, chosenRepo);

        orgComptabiliteRepo = repoP
            .then((_) => {
                page(
                    `/comptabilite/?org=${chosenOrg.login}&repo=${chosenRepo}`
                );
            })
            .catch((err) => {
                if (err.status === 404) {
                    // repo does not exist
                    console.info(
                        "Expected error trying to find a repo that may not exist"
                    );
                    return undefined;
                } else throw err;
            });
    }

    let creatingOrgComptabilite;

    function createComptabiliteRepo() {
        creatingOrgComptabilite = githubAsDatabase.createComptabilityRepo(
            chosenOrg.login,
            DEFAULT_REPO_NAME
        );
    }
</script>

<Skeleton {login} {logout}>
    {#if !chosenOrg}
        <h1 transition:fade>
            Yello {login}, tu veux faire de la comptabilité sur quelle
            organisation ?
        </h1>

        {#await possibleOrganisations}
            <section transition:fade>(chargement des orgs possibles)</section>
        {:then orgs}
            <section transition:fade>
                <p>Voici les organisations possibles&nbsp;:</p>
                <div class="choices">
                    {#each orgs as org}
                        <a href="#" on:click={() => selectOrg(org)}>
                            <img
                                class="avatar big"
                                src={`https://github.com/${org.login}.png`}
                                alt=""
                            />
                            <span>{org.login}</span>
                        </a>
                    {/each}
                </div>
            </section>
        {:catch err}
            <section transition:fade>
                <div>Erreur dans le chargement de le liste d'organisation.</div>
                <div>{err}</div>
            </section>
        {/await}
    {:else}
        <h1 transition:fade>Concernant l'organisation {chosenOrg.login}</h1>
        {#await orgComptabiliteRepo}
            <section transition:fade>
                (Vérification de s'il existe déjà un repo de comptabilité)
            </section>
        {:then repo}
            {#if repo}
                <section transition:fade>
                    La compta est là ! <a
                        href="/comptabilite/?org={chosenOrg.login}&repo={chosenRepo}"
                        >Y aller =></a
                    >
                </section>
            {:else if !creatingOrgComptabilite}
                <section transition:fade>
                    <p>
                        Il n'existe pas de repo de comptabilité dans cette
                        organisation.
                    </p>
                    <small
                        >(Cliquer sur le bouton va créer le repo Github <code
                            >{chosenOrg.login}/{DEFAULT_REPO_NAME}</code
                        >)</small
                    >

                    <p>
                        <button on:click={() => createComptabiliteRepo()}
                            >Créer un repo de comptabilité</button
                        >
                    </p>
                </section>
            {:else}
                {#await creatingOrgComptabilite}
                    <section transition:fade>
                        (Création de repo <code
                            >{chosenOrg.login}/{DEFAULT_REPO_NAME}</code
                        >...)
                    </section>
                {:then orgs}
                    <section transition:fade>
                        <p>Repo créé !</p>
                        <a
                            href="/comptabilite?org={chosenOrg.login}&repo={chosenRepo}"
                            >Allé, on va faire de la compta !</a
                        >
                    </section>
                {:catch err}
                    <section transition:fade>
                        <div>
                            Erreur dans la création du repo de comptabilité <code
                                >{chosenOrg.login}/{DEFAULT_REPO_NAME}</code
                            >.
                        </div>
                        <div>{err}</div>
                    </section>
                {/await}
            {/if}
        {:catch err}
            <div>Erreur dans le chargement du repo de comptabilité.</div>
            <div>{err}</div>
        {/await}
    {/if}
</Skeleton>

<style lang="scss">
    :global(main) > section {
        position: absolute;
    }

    .choices {
        display: flex;
        gap: 3em;

        a {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
    }
</style>
