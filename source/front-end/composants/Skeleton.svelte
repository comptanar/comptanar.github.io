<script>
    //@ts-check
    
    import Header from "./Header.svelte";
    import Footer from "./Footer.svelte";

    /** @typedef {import("../store.js").ComptanarState} ComptanarState */

    /** @type {ComptanarState['user']} */
    export let user = undefined
    /** @type {(() => void) | undefined} */
    export let logout = undefined
    /** @type {ComptanarState['org']} */
    export let org = undefined
    /** @type {ComptanarState['repo']} */
    export let repo = undefined
    /** @type {ComptanarState["conflict"]} */
    export let conflict = undefined;
    
    export let fullwidth = false;
</script>

<Header {user} {logout} {org} {repo} {conflict}/>

<main class:fullwidth={fullwidth}>
<slot></slot>
</main>

<Footer />