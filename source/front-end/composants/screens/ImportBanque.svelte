<script>
    // @ts-check
    import Skeleton from "../Skeleton.svelte";
    import DateInput from "../DateInput.svelte";

    import {créerLigneBancaireVide} from '../../../format-données/opérationsHautNiveau.js'
    import { sauvegarderLignesBancaires } from '../../actions/exercices.js'
    import { displayDate, formatMontant } from '../../stringifiers'

    import '../../types.js'
    
    /** @typedef {import("../../store.js").ComptanarState} ComptanarState */

    /** @type {ComptanarState['user']} */
    export let user
    /** @type {() => void} */
    export let logout
    /** @type {ComptanarState['org']} */
    export let org
    /** @type {ComptanarState['repo']} */
    export let repo
    /** @type {ComptanarState["conflict"]} */
    export let conflict;
    export let lignesBancairesParAnnée = new Map();

    /** @type {LigneBancaire[]} */
    let lignesBancairesEnCours = []

    let compteBancaire = '512';

    function ajouterLigne(){
        const ligne = créerLigneBancaireVide()
        ligne.compteBancaire = compteBancaire
        lignesBancairesEnCours.push(ligne)

        lignesBancairesEnCours = lignesBancairesEnCours; // pour le refresh svelte
    }
    /**
     * 
     * @param {LigneBancaire} ligne
     */
    function supprimerLigne(ligne){
        const index = lignesBancairesEnCours.indexOf(ligne);

        if (index >= 0) { 
            lignesBancairesEnCours.splice(index, 1);
            lignesBancairesEnCours = lignesBancairesEnCours; // re-render component
        }
    }


    async function sauvegarder(){
        await sauvegarderLignesBancaires(lignesBancairesEnCours)
        lignesBancairesEnCours = []
    }


    /*throw `PPP
        faire une fonction de sauvegarde
        montrer les lignes bancaires
            par année
        
        Cette première PR s'arrête là, parce que c'est déjà assez
    `*/

</script>

<Skeleton {user} {logout} {org} {conflict} {repo}>
    <h1>Import bancaire</h1>
    <p>Par ici, on importe les données bancaires et on essaye de les classifier</p>
    <p>Pour le moment, y'a que un import Anytime qui fonctionne. L'idée, c'est d'ouvrir un pdf et de copier/coller le tableau en texte</p>
    <p>Ensuite, ça convertit en tableau et on valide le tableau</p>    
    
    
    <h2>Lignes de compte historiques</h2>
    {#each [...(lignesBancairesParAnnée || [])] as [année, lignesBancairesExistantes]}
        <details>
            <summary>{année} ({lignesBancairesExistantes.length})</summary>
            <table>
                <thead><th>Date</th><th>Montant</th><th>Description (relevé)</th><th>Commentaire (nous)</th></thead>
                <tbody>
                    {#each lignesBancairesExistantes as {date, montant, description, commentaire}}
                    <tr>
                        <td>{displayDate(date)}</td>
                        <td>{formatMontant(montant)}</td>
                        <td>{description}</td>
                        <td>{commentaire}</td>
                    </tr>
                    {/each}
                </tbody>

            </table>
        
        </details>
    {/each}
    

    <!--
    <h2>Lignes de compte non-assignée</h2>
    <p>un tableau que l'on peut éditer direct</p>
    -->

    <h2>Ajout de lignes de compte</h2>
    <p>Ce qui a été compris automatiquement</p>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Montant</th>
                <th>Description (sur le relevé bancaire)</th>
                <th>Commentaire (libre)</th>
                <th>Supprimer</th>
            </tr>
        </thead>
        <tbody>
            {#each lignesBancairesEnCours as ligneBancaire}
                <tr>
                    <td><DateInput bind:date={ligneBancaire.date}/></td>
                    <td><input type="number" bind:value={ligneBancaire.montant}></td>
                    <td><input type="text" bind:value={ligneBancaire.description}></td>
                    <td><input type="text" bind:value={ligneBancaire.commentaire}></td>
                    <td><button on:click={() => supprimerLigne(ligneBancaire)}>Supprimer</button></td>
                </tr>
            {/each}
        </tbody>
    </table>
    <button on:click={ajouterLigne}>Ajouter une ligne</button>
    <button on:click={sauvegarder}>Sauvegarder</button>

    <!--
    <h2>Zone d'import</h2>
    <p>Copier-coller ici :</p>
    
    <textarea></textarea>
    -->
</Skeleton>

<style>
    /*textarea{
        margin-left: 3rem;
        min-width: 50vw;
        height: 10rem;
    }*/

</style>