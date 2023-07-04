<script>
  // @ts-check

  import Skeleton from "../Skeleton.svelte";
  import EtatDesComptes from "../../../format-données/produireEtatDesComptes";
  import OpHautNiveauVersOpDeCompte from "../../../format-données/traduireOpérationsHautNiveauEnOpérationsDeCompte";
  import { formatMontant, libelleCompte } from "../../stringifiers";

  export let login;
  export let logout;
  export let opHautNiveau;

  let data;
  let annee;
  let listeAnnees = [];

  function chargerAnnee() {
    if (opHautNiveau !== undefined) {
      let listeOpHautNiveau = opHautNiveau.get(annee);
      let listeOpDeCompte = OpHautNiveauVersOpDeCompte(
        listeOpHautNiveau.opérationsHautNiveau
      );
      try {
        data = EtatDesComptes(listeOpDeCompte);
      } catch (err) {
        console.error(err);
      }
    } else {
      data = [];
    }
  }

  $: {
    if (opHautNiveau !== undefined && annee === undefined) {
      listeAnnees = [...opHautNiveau.keys()];
      annee = listeAnnees.at(-1);
    }
    chargerAnnee();
  }
</script>

<Skeleton {login} {logout} fullwidth>
  <label>
    <div>Année</div>
    <select bind:value={annee}>
      {#each listeAnnees as a}
        <option value={a}>{a}</option>
      {/each}
    </select>
  </label>
  <table>
    <thead>
      <tr>
        <th>Numéro de compte</th>
        <th>Propriétaire</th>
        <th>Montant</th>
      </tr>
    </thead>
    <tbody>
      {#each [...data] as row}
        <tr>
          <td>{row[0]}</td>
          <td>{libelleCompte(row[0])}</td>
          <td>{formatMontant(row[1])}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</Skeleton>
