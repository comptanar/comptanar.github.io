<script>
  // @ts-check

  import Skeleton from "../Skeleton.svelte";
  import fabriqueÉtatDesComptes from "../../../format-données/produireEtatDesComptes";
  import OpHautNiveauVersOpDeCompte from "../../../format-données/traduireOpérationsHautNiveauEnOpérationsDeCompte";
  import { formatMontant, libelleCompte } from "../../stringifiers";

  import '../../types.js'
    
  /** @typedef {import("../../store.js").ComptanarState} ComptanarState */

  /** @type {ComptanarState['user']} */
  export let user
  /** @type {() => void} */
  export let logout
  /** @type {ComptanarState["conflict"]} */
  export let conflict;

  /** @type {ComptanarState["opérationsHautNiveauByYear"]} */
  export let opérationsHautNiveauByYear;

  /** @type {Map<Compte, Montant>} */
  let étatDesComptes;
  /** @type {number} */
  let année;
  /** @type {number[]} */
  let listeAnnees = [];

  function chargerAnnee() {
    if (opérationsHautNiveauByYear !== undefined) {
      let opérationsHautNiveau = opérationsHautNiveauByYear.get(année);
      if(!opérationsHautNiveau){
        throw new TypeError(`opérationsHautNiveauByYear n'a pas de données pour l'année ${année}`)
      }

      let listeOpDeCompte = OpHautNiveauVersOpDeCompte(
        opérationsHautNiveau
      );
      try {
        étatDesComptes = fabriqueÉtatDesComptes(listeOpDeCompte);
      } catch (err) {
        console.error(err);
      }
    } else {
      étatDesComptes = new Map();
    }
  }

  $: {
    if (opérationsHautNiveauByYear !== undefined && année === undefined) {
      listeAnnees = [...opérationsHautNiveauByYear.keys()];
      //@ts-expect-error il y a toujours au moins une année
      année = listeAnnees.at(-1);
    }
    chargerAnnee();
  }
</script>

<Skeleton {user} {logout} {conflict} fullwidth>
  <label>
    <div>Année</div>
    <select bind:value={année}>
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
      {#each [...étatDesComptes] as row}
        <tr>
          <td>{row[0]}</td>
          <td>{libelleCompte(row[0])}</td>
          <td>{formatMontant(row[1])}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</Skeleton>
