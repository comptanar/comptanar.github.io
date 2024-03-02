<script>
    //@ts-check
    
    import Skeleton from "../Skeleton.svelte";
    
    export let user;
    export let logout;
</script>

<Skeleton {user} {logout}>
    <p>Bienvenue ! Comptanar, c'est pour faire sa comptabilité en toute autonomie !</p>
        <p>
            Pour le moment comptanar est en alpha ultra-privée, ultra-select, 
            pour [l'Échappée Belle](https://lechappeebelle.team/) seulement
            <small>on créé un outil pour nous, mais on fait tout pour que ça soit utile pour d'autres un jour :-) </small>
        </p>
        
</Skeleton>

<style>
    
</style>
