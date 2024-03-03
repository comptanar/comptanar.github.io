<script>
    import Loader from "./Loader.svelte";

    export let promise;

    function displayErr(e) {
        return e.toString();
    }
</script>

<div class="button-with-loader">
    <button type="submit" class="primary">Enregistrer</button>
    {#await promise}
        <Loader />
    {:catch err}
        <p class="error">
            Problème avec la sauvegarde : {displayErr(err)}
        </p>
    {/await}
</div>

<style lang="scss">
    .error {
        color: red;
        font-weight: bold;
    }

    .button-with-loader {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        position: relative;

        :global(div) {
            position: absolute;
            right: 1rem;
            &::after {
                width: 1rem;
                height: 1rem;
            }
        }
    }
</style>
