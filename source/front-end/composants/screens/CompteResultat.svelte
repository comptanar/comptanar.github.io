<script>
  // @ts-check

  import Skeleton from "../Skeleton.svelte";
  import EtatDesComptes from "../../../format-données/produireEtatDesComptes";
  import OpHautNiveauVersOpDeCompte from "../../../format-données/traduireOpérationsHautNiveauEnOpérationsDeCompte";
  import { formatMontant, libelleCompte } from "../../stringifiers";

  export let login;
  export let logout;
  export let ophn;

  let data;
  let annee;
  let listeAnnees = [];

  function getAnneesDispo(anneesDispo) {
    let listeAnnees = [];
    let annee = anneesDispo.next();
    while (!annee.done) {
      listeAnnees.push(annee.value);
      annee = anneesDispo.next();
    }
    return listeAnnees;
  }

  function chargerAnnee() {
    if (ophn !== undefined) {
      let listeOpHautNiveau = ophn.get(annee);
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
    if (ophn !== undefined) {
      console.log(ophn);
      console.log(ophn.keys());
      listeAnnees = getAnneesDispo(ophn.keys());
      annee = listeAnnees[listeAnnees.length - 1];
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
