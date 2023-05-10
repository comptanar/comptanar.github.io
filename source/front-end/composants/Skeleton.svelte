<script>
    import Header from "./Header.svelte";
    import Footer from "./Footer.svelte";
    export let login = undefined;
    export let logout = undefined;
    export let fullwidth = false;
</script>

<Header {login} {logout}/>

<main class:fullwidth={fullwidth}>
<slot></slot>
</main>

<Footer />