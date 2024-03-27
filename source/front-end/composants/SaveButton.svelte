<script>
    import Loader from "./Loader.svelte";

    /** @type {Promise<void> | undefined} */
    export let promise;

</script>

<div class="button-with-loader">
    <button type="submit" class="primary">Enregistrer</button>
    {#await promise}
        <Loader />
    {:catch err}
        <p class="error">
            Problème avec la sauvegarde : {err.toString()}
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
