<script>
    import Skeleton from "../Skeleton.svelte";

    export let login
    export let logout
    export let org
    /** @type Personne[] */
    export let personnes
</script>

<Skeleton {login} {logout}>
    <h1>Fiches de paie pour {org}</h1>
    <ul>
        {#each personnes as p}
            <li>{p.nom}</li>
        {/each}
    </ul>
</Skeleton>