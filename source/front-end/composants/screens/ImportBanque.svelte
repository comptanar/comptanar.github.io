<script>
    // @ts-check
    import Skeleton from "../Skeleton.svelte";
    import DateInput from "../DateInput.svelte";
    import { displayDate, formatMontant } from '../../stringifiers'

    import {créerLigneBancaireVide} from '../../../format-données/opérationsHautNiveau.js'

    export let login;
    export let logout;
    export let org;
    export let repo;

    /** @type {LigneBancaire[]} */
    let lignesBancairesEnCours = []

    let compteBancaire = '512';

    function ajouterLigne(){
        const ligne = créerLigneBancaireVide()
        ligne.compteBancaire = compteBancaire
        lignesBancairesEnCours.push(ligne)

        lignesBancairesEnCours = lignesBancairesEnCours; // pour le refresh svelte
    }

    throw `PPP
        faire la fonction supprimer
        faire une fonction de sauvegarde
        montrer les lignes bancaires
        faire un espace pour assigner une ligne à une opération haut niveau
    `

    function supprimerLigne(ligne){

    }



</script>

<Skeleton {login} {logout} {org} {repo}>
    <h1>Import bancaire</h1>
    <p>Par ici, on importe les données bancaires et on essaye de les classifier</p>
    <p>Pour le moment, y'a que un import Anytime qui fonctionne. L'idée, c'est d'ouvrir un pdf et de copier/coller le tableau en texte</p>
    <p>Ensuite, ça convertit en tableau et on valide le tableau</p>    
    

    <h2>Pré-visualisation</h2>
    <p>Ce qui a été compris automatiquement</p>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Montant</th>
                <th>Description (sur le relevé bancaire)</th>
                <th>Supprimer</th>
            </tr>
        </thead>
        <tbody>
            {#each lignesBancairesEnCours as ligneBancaire}
                <tr>
                    <td><DateInput bind:date={ligneBancaire.date}/></td>
                    <td><input type="number" bind:value={ligneBancaire.montant}></td>
                    <td><input type="text" bind:value={ligneBancaire.description}></td>
                    <td><button on:click={() => supprimerLigne(ligneBancaire)}>Supprimer</button></td>
                </tr>
            {/each}
        </tbody>
    </table>
    <button on:click={ajouterLigne}>Ajouter une ligne</button>
    <button on:click={ajouterLigne}>Sauvegarder</button>

    <!--
    <h2>Zone d'import</h2>
    <p>Copier-coller ici :</p>
    
    <textarea></textarea>
    -->
</Skeleton>

<style>
    textarea{
        margin-left: 3rem;
        min-width: 50vw;
        height: 10rem;
    }

</style>