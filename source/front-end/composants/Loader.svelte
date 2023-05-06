<div class="lds-dual-ring" />

<style lang="scss">
// totally copied from https://loading.io/css

$diameter: 2rem;
$sqrt_2: 1.43;

.lds-dual-ring {
    display: inline-block;
    width: $sqrt_2 * $diameter;
    height: $sqrt_2 * $diameter;
}
.lds-dual-ring:after {
    content: " ";
    display: block;
    width: $diameter;
    height: $diameter;
    margin: 0.5rem;
    border-radius: 50%;
    border: 4px solid black;
    border-color: black transparent black transparent;
    animation: lds-dual-ring 3s linear infinite;
}
@keyframes lds-dual-ring {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
