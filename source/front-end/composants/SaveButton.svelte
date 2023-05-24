<script>
    import Loader from './Loader.svelte'
    import { ConflictError } from '../actions'

    export let promise

    function displayErr(e) {
        if (e instanceof ConflictError) {
            return 'Une autre personne a modifié ces données entre temps. Recharge la page pour voir la nouvelle version.'
        }

        return e.toString()
    }
</script>

<div class="button-with-loader">
    <button type="submit">Enregistrer</button>
    {#await promise}
        <Loader></Loader>
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

    .button-with-loader{
        display: flex;
        flex-direction: row;
        align-items: flex-start;
    }
</style>