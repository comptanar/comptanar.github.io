<script>
    //@ts-check
    
    import Header from "./Header.svelte";
    import Footer from "./Footer.svelte";
    export let login = undefined;
    export let logout = undefined;
    export let fullwidth = false;
    export let repo = undefined
    export let org = undefined;
</script>

<Header {login} {logout} {org} {repo}/>

<main class:fullwidth={fullwidth}>
<slot></slot>
</main>

<Footer />