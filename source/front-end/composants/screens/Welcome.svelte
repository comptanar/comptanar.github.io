<script>
    import Skeleton from "../Skeleton.svelte";
    //export let href;
    export let login;
</script>

<Skeleton {login}>
    <p>Bienvenue ! Comptanar, c'est pour faire sa comptabilité en toute autonomie !</p>
        <p>
            Pour le moment comptanar est en alpha ultra-privée, ultra-select, 
            pour [l'Échappée Belle](https://lechappeebelle.team/) seulement
            <small>on créé un outil pour nous, mais on fait tout pour que ça soit utile pour d'autres un jour :-) </small>
        </p>
        
        <p>Si tu es de l'Échappée Belle, <a href="https://github.com/login/oauth/authorize?client_id=64ecce0b01397c2499a6&scope=public_repo&redirect_uri=https://toctoctoc.dreads-unlock.fr/github-callback?destination=http://localhost:8080/">connecte-toi via github</a></p> 
        

        <!-- login with github qui permet de créer une comptabilité en choisissant l'org ou le compte github pertinent
            et fork un repo template avec les bons fichiers/dossiers/worflow de base -->

</Skeleton>

<style>
    
</style>
