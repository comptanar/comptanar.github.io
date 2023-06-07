<script>
    //@ts-check
    
    export let login = undefined;
    export let repo
    export let org

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
    {#if org && repo}
        <h1><a href={`/comptabilite?org=${org}&repo=${repo}`}>Compt'anar</a></h1>
    {:else}
        <h1>Compt'anar</h1>
    {/if}

    <div>
        {#if login}
            {#await login}
                ... recherche du nom d'utilisateur.rice Github ...
            {:then l}
                <div class="user">
                    <div>
                        <p>{l}</p>
                        <button on:click={logout}>Se déconnecter</button>
                    </div>
                    <img src="" alt="">
                </div>
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

    img {
        border: 1px solid black;
        background-color: aliceblue;
        border-radius: 50%;
        width: 3rem;
        height: 3rem;
    }

    .user {
        display: flex;
        align-items: center;
        text-align: right;
        gap: 1rem;

        p {
            margin: 0;
            font-weight: bold;
            font-size: 1.15rem;
        }

        button {
            border: none;
            padding: 0;
            text-decoration: underline;
        }
    }
</style>
