<script>
    export let login = undefined;
</script>

<header>
    <h1>🏴‍☠️ Compt'anar 🤓 🔢</h1>

    <div>
        {#if login}
            connecté.e en tant que {login}
        {:else}
            <p>Si tu es de l'Échappée Belle, <a href="https://github.com/login/oauth/authorize?client_id=64ecce0b01397c2499a6&scope=public_repo&redirect_uri=https://toctoctoc.dreads-unlock.fr/github-callback?destination=http://localhost:8080/">connecte-toi via github</a></p> 
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