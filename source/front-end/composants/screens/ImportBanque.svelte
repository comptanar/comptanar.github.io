<script>
    // @ts-check
    import Skeleton from "../Skeleton.svelte";

    export let login;
    export let logout;
    export let org;
    export let repo;

</script>

<Skeleton {login} {logout} {org} {repo} fullwidth>
    <textarea></textarea>
</Skeleton>
