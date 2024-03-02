<script>
    //@ts-check

    export let user = undefined;
    export let repo = undefined;
    export let org = undefined;

    export let logout;

    const scopesList = ["public_repo", "read:org", "user:email"];
    const scopes = scopesList.join(",");

    const toctoctoc_origin = "https://toctoctoc.lechappeebelle.team";
    const client_id = "64ecce0b01397c2499a6";
    const destination = `${location.origin}/after-oauth-login`;
    const redirect_uri = `${toctoctoc_origin}/github-callback?destination=${destination}`;

    const href = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=${scopes}&redirect_uri=${redirect_uri}`;

    // PPP : rajouter l'org actuelle dans le header + bouton pour changer d'org facilement
</script>

<header>
    {#if org && repo}
        <h1>
            <a href={`/comptabilite?org=${org}&repo=${repo}`}>Compt'anar</a>
        </h1>
    {:else}
        <h1>Compt'anar</h1>
    {/if}

    <div>
        {#if user}
            {#await user}
                ... recherche du nom d'utilisateur.rice Github ...
            {:then user}
                <div class="user">
                    <div>
                        <p>{user.login}</p>
                        <button on:click={logout}>Se déconnecter</button>
                    </div>
                    <img
                        class="avatar small"
                        src={user.avatarUrl}
                        alt=""
                    />
                </div>
            {:catch err}
                Problème de connexion à Github ! {err}
            {/await}
        {:else}
            <p>
                Si tu es de l'Échappée Belle, <a {href}
                    >connecte-toi via github</a
                >
            </p>
        {/if}
    </div>
</header>

<style lang="scss">
    header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
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
