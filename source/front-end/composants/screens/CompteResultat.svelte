<script>
  // @ts-check

  import Skeleton from "../Skeleton.svelte";
  import EtatDesComptes from "../../../format-données/produireEtatDesComptes";
  import OphnEnOdc from "../../../format-données/traduireOpérationsHautNiveauEnOpérationsDeCompte";

  export let login;
  export let logout;
  export let ophn;

  console.log("ophn", ophn);

  let columns = ["Compte", "Description", "Montant"];

  /** @type {OpérationDeCompte} */
  const op2 = {
    compte: "3",
    montant: 400,
    sens: "Crédit",
  };

  /** @type {EnvoiFactureClient} */
  const testOphn = {
    identifiantOpération: "2",
    type: "Envoi facture client",
    date: new Date(),
    opérations: [op2],
    numéroFacture: "1",
    compteClient: "2",
  };

  let temp = OphnEnOdc([testOphn]);
  let data = EtatDesComptes(temp);
</script>

<Skeleton {login} {logout} fullwidth>
  <table>
    <thead>
      <tr>
        {#each columns as col}
          <th>{col}</th>
        {/each}
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
