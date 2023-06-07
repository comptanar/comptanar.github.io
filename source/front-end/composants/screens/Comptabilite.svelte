<script>
//@ts-check
import Skeleton from '../Skeleton.svelte'
export let login
export let logout
export let org
export let repo
</script>

<Skeleton {login} {logout} {org} {repo}>
  <h1>Voici la comptabilité de l'organisation <code>{org}</code></h1>
  <section>
    <a href="/comptabilite/personnes?org={org}&repo={repo}">
      <h2>Personnes</h2>
    </a>

    <a href="/comptabilite/salarié·es?org={org}&repo={repo}">
      <h2>Salarié·es</h2>
    </a>

    <a href="/comptabilite/factures?org={org}&repo={repo}">
      <h2>Factures</h2>
    </a>

    <a href="/comptabilite/fiches-de-paie?org={org}&repo={repo}">
      <h2>Fiches de paie</h2>
    </a>

    <a href="/comptabilite/achats?org={org}&repo={repo}">
      <h2>Achats</h2>
    </a>

    <h2>Compte de résultat et bilan comptable</h2>

  </section>
</Skeleton>

<style>

</style>
