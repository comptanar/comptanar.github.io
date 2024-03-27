<script>
    //@ts-check
    import { format } from 'date-fns'

    /** @type {Date | null | undefined} */
    export let date = new Date()
    /** @type {string | null | undefined} */
    let internal
  
    // ces fonctions sont là pour éviter une boucle dans les expressions réactives ($:) en-dessous
    const input = (/** @type {Date | null | undefined} */ x) => { internal = x && format(x, 'yyyy-MM-dd') }
    const output = (/** @type {string | null | undefined} */ x) => { if(x){ date = new Date(x) } }
  
    $: input(date)
    $: output(internal)
</script>
  
<input type="date" bind:value={internal} />
  