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
  let annee;

  function chargerAnnee() {
    if (ophn !== undefined) {
      let listeOpHautNiveau = ophn.get(annee);
      if (listeOpHautNiveau == undefined) {
        console.log("Année qui n'existe pas, 2020 prise par défaut");
        listeOpHautNiveau = ophn.get(2020);
      }
      let listeOpDeCompte = OpHautNiveauVersOpDeCompte(
        listeOpHautNiveau.opérationsHautNiveau
      );
      data = EtatDesComptes(listeOpDeCompte);
    } else {
      data = [];
    }
  }

  $: {
    chargerAnnee();
  }
</script>

<Skeleton {login} {logout} fullwidth>
  <label>
    <div>Année du compte de résultat à produire</div>
    <input type="number" placeholder="202X" bind:value={annee} />
  </label>
  <button type="button" on:click={chargerAnnee}>Enregistrer</button>
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
