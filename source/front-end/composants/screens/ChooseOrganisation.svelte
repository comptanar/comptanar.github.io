<script>
    //@ts-check
    import { fade } from "svelte/transition";
    import page from "page";

    import Skeleton from "../Skeleton.svelte";

    import githubAsDatabase from "../../githubAsDatabase.js";

    import '../../types.js'
    
    /** @typedef {import("../../store.js").ComptanarState} ComptanarState */

    /** @type {NonNullable<ComptanarState['user']>} */
    export let user
    /** @type {() => void} */
    export let logout
    /** @type {NonNullable<ComptanarState['userOrgs']>} */
    export let possibleOrganisations;

    const DEFAULT_REPO_NAME = "comptabilite";

    /** @type {GithubUserOrgForComptanar | undefined} */
    let chosenOrg = undefined;
    let chosenRepo = DEFAULT_REPO_NAME; // PPP hardcoded. Write selection
    /** @type {Promise<any>} */
    let orgComptabiliteRepo;

    /**
     * 
     * @param {GithubUserOrgForComptanar} org
     */
    function selectOrg(org) {
        chosenOrg = org;

        orgComptabiliteRepo = githubAsDatabase.getRepo(chosenOrg.login, chosenRepo)
        .then((_) => {
            page(
                `/comptabilite/?org=${org.login}&repo=${chosenRepo}`
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

    /** @type {Promise<any> | undefined} */
    let creatingOrgComptabilite;

    function createComptabiliteRepo() {
        if(!chosenOrg)
            throw new TypeError('Missing chosenOrg')

        creatingOrgComptabilite = githubAsDatabase.createComptabilityRepo(
            chosenOrg.login,
            DEFAULT_REPO_NAME
        );
    }
</script>

<Skeleton {user} {logout}>
    {#if !chosenOrg}
        <h1 transition:fade>
            Yello {user.login}, tu veux faire de la comptabilité sur quelle
            organisation ?
        </h1>

        {#await possibleOrganisations}
            <section transition:fade>(chargement des orgs possibles)</section>
        {:then orgs}
            <section transition:fade>
                <p>Voici les organisations possibles&nbsp;:</p>
                <div class="choices">
                    {#each orgs || [] as org}
                        <a href="#" on:click|preventDefault={() => selectOrg(org)}>
                            <img
                                class="avatar big"
                                src={org.avatar_url}
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
                {:then}
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
