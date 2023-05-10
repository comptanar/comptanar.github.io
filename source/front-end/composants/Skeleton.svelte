<script>
    //@ts-check
    
    import Header from "./Header.svelte";
    import Footer from "./Footer.svelte";
    export let login = undefined;
    export let logout = undefined;
</script>

<Header {login} {logout}/>

<main>
<slot></slot>
</main>

<Footer />