<script>
    import Skeleton from '../Skeleton.svelte'
    export let login
    export let logout
    export let org
</script>

<Skeleton {login} {logout}>
    <h1>Voici les factures de l'organisation <code>{org}</code></h1>
    <h2>Factures</h2>
</Skeleton>

<style>

</style>
