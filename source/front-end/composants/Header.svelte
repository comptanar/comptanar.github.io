<script>
    export let login = undefined;

    export let logout;

    const scopesList = [
        'public_repo',
        'read:org'
    ];
    const scopes = scopesList.join(',')

    const client_id = '64ecce0b01397c2499a6';
    const destination = 'http://localhost:8080/';
    const redirect_uri = `https://toctoctoc.dreads-unlock.fr/github-callback?destination=${destination}`

    const href = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=${scopes}&redirect_uri=${redirect_uri}`
</script>

<header>
    <h1>🏴‍☠️ Compt'anar 🤓 🔢</h1>

    <div>
        {#if login}
            {#await login}
                ... recherche du nom d'utilisateur.rice Github ...
            {:then l}
                connecté.e en tant que {l} <button on:click={logout}>Se déconnecter</button>
            {:catch err}
                Problème de connexion à Github ! {err}
            {/await}
        {:else}
            <p>Si tu es de l'Échappée Belle, <a {href}>connecte-toi via github</a></p> 
        {/if}
    </div>
</header>

<style lang="scss">
    header{
        display: flex;
        flex-direction: row;
        justify-content: space-around;
    }
</style>