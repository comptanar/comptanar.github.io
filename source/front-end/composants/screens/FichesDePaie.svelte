<script>
    import Skeleton from "../Skeleton.svelte";

    export let login
    export let logout
    export let org
    /** @type Personne[] */
    export let personnes
    /** @type Salarié_es[] */
    export let salarié_es
</script>

<Skeleton {login} {logout}>
    <h1>Fiches de paie pour {org}</h1>
    <ul>
        {#each personnes as p}
            <li>{p.nom} @ {p.identifiant}</li>
        {/each}
    </ul>
    <ul>
        {#each salarié_es as s}
            <li>{s.personnes}</li>
        {/each}
    </ul>
</Skeleton>