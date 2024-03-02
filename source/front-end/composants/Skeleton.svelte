<script>
    //@ts-check
    
    import Header from "./Header.svelte";
    import Footer from "./Footer.svelte";
    export let user = undefined;
    export let logout = undefined;
    export let fullwidth = false;
    export let repo = undefined
    export let org = undefined;
</script>

<Header {user} {logout} {org} {repo}/>

<main class:fullwidth={fullwidth}>
<slot></slot>
</main>

<Footer />