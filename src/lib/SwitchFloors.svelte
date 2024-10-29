<script>
    import {count} from './store.js'
    import {showFloorsButton} from "./store.js";
    import '../SwitchFloors.css';
    import {showModel, camera, highlightQuadByName} from "./main.js";
    import {onMount} from "svelte";

    let nextRoom = () => $count = ($count += 1) % 5;

    let previousRoom = () => $count === 0 ? $count += 4 : $count -= 1;

    let button;

    function show(num) {
        showModel('Floor ' + num)

        switch (num) {
            case 1:
                camera.position.set(2.0066421131554453, 2.066118908736133, 4.416176082566819)
                break
            case 3:
                camera.position.set(-4.661618775199409, 2.494577540742692, 2.819960038265095)
                break
            case 4:
                camera.position.set(-5.765540196407432, 3.438185447925222, 6.858244247619766)
                break
        }
    }

</script>

{#if $showFloorsButton}
    <div class="floors-wrapper">
    <div class="button-floor">

        <div style="display: flex; flex-direction:row; position: absolute; top: 12%; left: 13%">
            <div> Floor</div>
            <a class="previous" on:click={() => {previousRoom(); show($count) }}> ⟨ </a>

            <div style="position: absolute; text-align: center;
            left: {$count === 0 ? '150%' : '175%'}; top: 6%"> {$count === 0 ? "Any" : $count} </div>
            <a bind:this={button} class="next"  on:click={() => {nextRoom(); show($count); }}> ⟩ </a>
        </div>
    </div>
        <div class="button-building">
            <div style="position: relative; top: 12%; left: 22.5%"> Building  </div></div>
    </div>

    {/if}
