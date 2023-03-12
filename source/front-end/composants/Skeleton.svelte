<script>
    import Header from "./Header.svelte";
    import Footer from "./Footer.svelte";
    export let login = undefined;
</script>

<Header {login}/>

<main>
<slot></slot>
</main>

<Footer />