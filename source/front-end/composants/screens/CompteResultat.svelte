<script>
  // @ts-check

  import Skeleton from "../Skeleton.svelte";
  import EtatDesComptes from "../../../format-données/produireEtatDesComptes";
  import OpHautNiveauVersOpDeCompte from "../../../format-données/traduireOpérationsHautNiveauEnOpérationsDeCompte";
  import { formatMontant } from "../../stringifiers";

  export let login;
  export let logout;
  export let ophn;

  let data;

  $: {
    if (ophn !== undefined) {
      let listeOpHautNiveau = ophn.get(2023);
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
          <td>{row[0]}</td>
          <td>{formatMontant(row[1])}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</Skeleton>
