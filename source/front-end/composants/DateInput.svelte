<script>
    //@ts-check
    import { format } from 'date-fns'
    export let date = new Date()
      
    let internal
  
    // ces fonctions sont là pour éviter une boucle dans les expressions réactives ($:) en-dessous
    const input = (x) => { internal = format(x, 'yyyy-MM-dd') }
    const output = (x) => { if(x){ date = new Date(x) } }
  
    $: input(date)
    $: output(internal)
</script>
  
<input type="date" bind:value={internal} />
  