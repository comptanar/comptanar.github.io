<script>
    import Skeleton from "../Skeleton.svelte";
    
    export let login;
    export let logout;
    export let possibleOrganisations = [];

</script>

<Skeleton {login} {logout}>
    <h1>Yello {login}, tu veux faire de la comptabilité sur quelle organisation ?</h1>

    {#await possibleOrganisations}
        (chargement des orgs possibles)
    {:then orgs}
        <p>Voici les organisations possibles&nbsp;:</p>
        <ul>
        {#each orgs as org}
            <li>{org.login}</li>
        {/each}
        </ul>
    {:catch err}
        <div>Erreur dans le chargement de le liste d'organisation.</div>
        <div> {err} </div>
    {/await}


</Skeleton>

<style>
    
</style>
