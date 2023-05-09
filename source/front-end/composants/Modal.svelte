<script>
export let dialog
</script>

<dialog bind:this={dialog}>
    <slot></slot>
</dialog>

<style lang="scss">
    dialog {
        position: fixed;
        left: 30%;
        right: 30%;
        width: auto;
        border: 3px solid #141;
    }

    dialog::backdrop {
        backdrop-filter: blur(2px);
    }
</style>