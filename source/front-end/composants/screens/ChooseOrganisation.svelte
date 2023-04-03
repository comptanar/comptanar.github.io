<script>
    //@ts-check
    import { fade } from 'svelte/transition';

    import Skeleton from "../Skeleton.svelte";
    import githubAsDatabase from "../../githubAsDatabase.js";
    
    export let login;
    export let logout;
    export let possibleOrganisations = [];

    let orgChoice = undefined

    /*
    throw `PPP : C'est dur de trouver "la" bonne solution. 
        Alors pour le moment, quand on clique, 
            ça va chercher le repo avec le bon nom 
                et si on ne le trouve pas, on propose de le créer 
                et s'il existe, on avance à l'écran suivant`
    */

    const DEFAULT_REPO_NAME = 'comptabilite'

    let orgComptabiliteRepo;

    function getOrgRepo(org){
        orgComptabiliteRepo = githubAsDatabase
            .getRepo(org, DEFAULT_REPO_NAME)
            .catch(err => {
                if(err.status === 404){
                    // repo does not exist
                    console.info('Expected error trying to find a repo that may not exist')
                    return undefined
                }
                else
                    throw err;
            })

        return orgComptabiliteRepo
    }


    function selectOrg(org){
        orgChoice = org
        getOrgRepo(orgChoice.login)
    }

</script>

<Skeleton {login} {logout}>

    {#if !orgChoice}
        <h1 transition:fade>Yello {login}, tu veux faire de la comptabilité sur quelle organisation ?</h1>

        {#await possibleOrganisations}
            <section transition:fade>(chargement des orgs possibles)</section>
        {:then orgs}
            <section transition:fade>
                <p>Voici les organisations possibles&nbsp;:</p>
                <ul>
                {#each orgs as org}
                    <li><button on:click={() => selectOrg(org)}>{org.login}</button></li>
                {/each}
                </ul>
            </section>
        {:catch err}
            <section transition:fade>
                <div>Erreur dans le chargement de le liste d'organisation.</div>
                <div> {err} </div>
            </section>
        {/await}
    {:else}
        <h1 transition:fade>Concernant l'organisation {orgChoice.login}</h1>
        {#await orgComptabiliteRepo}
            <section transition:fade>(Vérification de s'il existe déjà un repo de comptabilité)</section>
        {:then repo}

            {#if repo}
                <section transition:fade>
                    La compta est là ! <a href="TODO">Y aller =></a>
                </section>

            {:else}
                <section transition:fade>
                    Il n'existe pas de repo. <button disabled>En créer un</button>
                </section>
            {/if}
            
        {:catch err}
            <div>Erreur dans le chargement de le liste d'organisation.</div>
            <div> {err} </div>
        {/await}

    {/if}

    


</Skeleton>

<style>
    :global(main) > section{
        position: absolute;
    }
</style>
