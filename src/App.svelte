<script>
    import SwitchFloors from "./lib/SwitchFloors.svelte";
    import Rooms from "./lib/Rooms.svelte";

    import Window from "./lib/Window.svelte";
    import {showSubmit,count} from "./lib/store.js";
    import {showModel} from "./lib/main.js";

</script>
<link href='https://fonts.googleapis.com/css?family=Francois One' rel='stylesheet'>

<main>

    <div class="page">
        <header class="App-header">
        </header>

        <div style="{$showSubmit ? 'filter: contrast(45%)' : ''}" class="blue-box">

            <div style="margin: 1vw">
                <div style="position: relative; color: #1F6587; font-size: 2vw; left: 2%; top: 10%; font-family: Francois One">Bookroom's
                    Project
                </div>
            </div>


            <Rooms />
        </div>
        <SwitchFloors />

        <Window />
    </div>
</main>
