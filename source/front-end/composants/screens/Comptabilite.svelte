<script>
  //@ts-check
  import Skeleton from "../Skeleton.svelte";
  import '../../types.js'
    
    /** @typedef {import("../../store.js").ComptanarState} ComptanarState */

    /** @type {ComptanarState['user']} */
    export let user
    /** @type {() => void} */
    export let logout
    /** @type {ComptanarState['org']} */
    export let org
    /** @type {ComptanarState['repo']} */
    export let repo
    /** @type {ComptanarState["conflict"]} */
    export let conflict;
</script>

<Skeleton {user} {logout} {org} {repo} {conflict}>
  <h1>Voici la comptabilité de l'organisation <code>{org}</code></h1>
  <section>
    <a href="/comptabilite/personnes?org={org}&repo={repo}">
      <h2>Personnes</h2>
    </a>

    <a href="/comptabilite/salariats?org={org}&repo={repo}">
      <h2>Salariats</h2>
    </a>

    <a href="/comptabilite/ventes?org={org}&repo={repo}">
      <h2>Factures (ventes)</h2>
    </a>

    <a href="/comptabilite/fiches-de-paie?org={org}&repo={repo}">
      <h2>Fiches de paie</h2>
    </a>

    <a href="/comptabilite/achats?org={org}&repo={repo}">
      <h2>Achats</h2>
    </a>

    <a href="/comptabilite/import-banque?org={org}&repo={repo}">
      <h2>Import bancaire</h2>
    </a>

    <a href="/comptabilite/compte-resultat?org={org}&repo={repo}">
      <h2>Compte de résultat et bilan comptable</h2>
    </a>
  </section>
</Skeleton>

<style>
</style>
