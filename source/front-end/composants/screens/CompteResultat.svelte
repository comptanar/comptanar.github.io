<script>
  // @ts-check

  import Skeleton from "../Skeleton.svelte";
  import EtatDesComptes from "../../../format-données/produireEtatDesComptes";

  export let login;
  export let logout;

  let columns = ["Compte", "Description", "Montant"];
  /** @type {OpérationDeCompte} */
  const op = {
    compte: "2",
    montant: 40,
    sens: "Crédit",
  };
  /** @type {OpérationDeCompte} */
  const op2 = {
    compte: "3",
    montant: 400,
    sens: "Crédit",
  };
  let data = EtatDesComptes([op, op2]);
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
