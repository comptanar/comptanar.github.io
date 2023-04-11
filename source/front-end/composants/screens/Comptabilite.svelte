<script>
import Skeleton from '../Skeleton.svelte'
export let login
export let logout
export let org
</script>

<Skeleton {login} {logout}>
  <h1>Voici la comptabilité de l'organisation <code>{org}</code></h1>
  <section>
    <!--<details open>
      &lt;!&ndash;<summary>
        <h2>Comptabilité individuelle</h2>
      </summary>&ndash;&gt;

      <details open>
        <summary>
          <h3>Répartition des opérations bancaires</h3>
        </summary>

        <label>
          Import du fichier de relevé bancaire en csv
          <input type="file">

        </label>

        <details>
          <summary>
            ✅ / ❌
          </summary>
          Dans ce fichier, il y a <strong>57</strong> opérations
          du <strong>1er juillet 2022</strong> au
          <strong>25 septembre 2022</strong>
        </details>

        <div>
          <ul>
            <li>Pour le tableau et l'historique, on créé des sections
              par années puis par mois</li>
          </ul>
        </div>

        <table>
          <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Montant TTC</th>
            <th>TVA</th>
            <th>Montant HT</th>
            <th>Qui</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>2020-11-03 16:01:14</td>
            <td>SCOPYLEFT - fact 2 ecosanté</td>
            <td>15720,00 €</td>
            <td>
              <select>
                <option>0%</option>
                <option>5,5%</option>
                <option>10%</option>
                <option selected>20%</option>
                <option>manuel</option>
              </select>
            </td>
            <td>13100,00 €</td>
            <td>
              <select>
                <option selected>David</option>
                <option>Sabine</option>
                <option>Maïtané</option>
                <option>Erick</option>
                <option>Commun</option>
                <option>TVA</option>
                <option>à répartir</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>2020-11-05 10:06:15</td>
            <td>CONDILLAC EXPERTISE - bilan</td>
            <td style="color: brown;">
              -594,00 €
            </td>
            <td>
              <select>
                <option>0%</option>
                <option>5,5%</option>
                <option>10%</option>
                <option selected>20%</option>
                <option>manuel</option>
              </select>
            </td>
            <td style="color: brown;">
              -495,00 €
            </td>
            <td>
              <select>
                <option>David</option>
                <option>Sabine</option>
                <option>Maïtané</option>
                <option>Erick</option>
                <option selected>Commun</option>
                <option>TVA</option>
                <option>à répartir</option>
              </select>
            </td>
          </tr>
          </tbody>
        </table>


      </details>


      <details>
        <summary>
          <h3>Pour Maïtané</h3>
        </summary>

        <label>
          Coût total du salaire mensuel pour l'Échappée Belle
          <input type="number" min="0">

        </label>

        <label>
          Total de mes dépenses et recettes
          <input type="number">

        </label>

        Et donc, on pourrait se dire qu'il me reste <strong>XX</strong>
        mois de salaires payables par mes recettes dans l'Échappée Belle

      </details>

      <details>
        <summary>
          <h3>Pour David</h3>
        </summary>

        <label>
          Coût total du salaire mensuel pour l'Échappée Belle
          <input type="number" min="0">

        </label>

        <label>
          Total de mes dépenses et recettes
          <input type="number">

        </label>

        Et donc, on pourrait se dire qu'il me reste <strong>XX</strong>
        mois de salaires payables par mes recettes dans l'Échappée Belle

      </details>

      <details>
        <summary>
          <h3>Pour Sabine</h3>
        </summary>

        <label>
          Coût total du salaire mensuel pour l'Échappée Belle
          <input type="number" min="0">

        </label>

        <label>
          Total de mes dépenses et recettes
          <input type="number">

        </label>

        Et donc, on pourrait se dire qu'il me reste <strong>XX</strong>
        mois de salaires payables par mes recettes dans l'Échappée Belle

      </details>

      <details>
        <summary>
          <h3>Pour Erick</h3>
        </summary>

        <label>
          Coût total du salaire mensuel pour l'Échappée Belle
          <input type="number" min="0">

        </label>

        <label>
          Total de mes dépenses et recettes
          <input type="number">

        </label>

        Et donc, on pourrait se dire qu'il me reste <strong>XX</strong>
        mois de salaires payables par mes recettes dans l'Échappée Belle

      </details>

    </details>-->

    <!--<details>
      <summary>
        <h2>Notes de frais</h2>
      </summary>
    </details>-->

    <details>
      <summary>
        <h2>Factures</h2>
      </summary>
    </details>

    <details>
      <summary>
        <h2>Compte de résultat et bilan comptable</h2>
      </summary>
    </details>

    <!--<details>
      <summary>
        <h2>Fiches de paie et paiement des salaires</h2>
      </summary>

      <details>
        <summary>
          <h3>Pour Maïtané</h3>
        </summary>

        <label>
          Coût total du salaire mensuel pour l'Échappée Belle
          <input type="number" value="2100">

        </label>

        <label>
          Salaire net
          <input type="number" value="1600">

        </label>

        <label>
          Cotisations
          <input type="number" value="300">

        </label>

        <label>
          Frais de télétravail
          <input type="number" value="50">

        </label>

      </details>
    </details>-->
  </section>
</Skeleton>

<style>

</style>
