<script>
  // @ts-check

  import Skeleton from "../Skeleton.svelte";
  import EtatDesComptes from "../../../format-données/produireEtatDesComptes";
  import OpHautNiveauVersOpDeCompte from "../../../format-données/traduireOpérationsHautNiveauEnOpérationsDeCompte";

  export let login;
  export let logout;
  export let ophn;

  let data;

  $: {
    if (ophn !== undefined) {
      let listeOpHautNiveau = ophn.get(2020);
      let listeOpDeCompte = OpHautNiveauVersOpDeCompte(
        listeOpHautNiveau.opérationsHautNiveau
      );
      data = EtatDesComptes(listeOpDeCompte);
    } else {
      data = [];
    }
  }
</script>

<Skeleton {login} {logout} fullwidth>
  <table>
    <thead>
      <tr>
        <th>Compte</th>
        <th>Montant</th>
      </tr>
    </thead>
    <tbody>
      {#each [...data] as row}
        <tr>
          {#each row as content}
            <td>{content}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</Skeleton>
