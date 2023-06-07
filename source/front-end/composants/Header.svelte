<script>
    //@ts-check
    
    export let login = undefined;

    export let logout;

    const scopesList = [
        'public_repo',
        'read:org'
    ];
    const scopes = scopesList.join(',')

    const toctoctoc_origin = 'https://ttt.olibri.us';
    const client_id = 'fe09b09c65edef4ec9cc';
    const destination = `${location.origin}/`;
    const redirect_uri = `${toctoctoc_origin}/github-callback?destination=${destination}`

    const href = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=${scopes}&redirect_uri=${redirect_uri}`

    // PPP : rajouter l'org actuelle dans le header + bouton pour changer d'org facilement
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
        justify-content: space-between;
    }
</style>
