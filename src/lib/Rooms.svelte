<script src='https://kit.fontawesome.com/a076d05399.js'>
    import {count, DateFilter} from "./store.js";
    import {showLectures} from "./store.js";
    import {showMeetings} from "./store.js";
    import {curr_room} from "./store.js";
    import {curr_id} from "./store.js";
    import {showSubmit} from "./store.js";
    import {showFloorsButton} from "./store.js";
    import {showRooms} from "./store.js";
    import {curr_cap} from "./store.js";
    import { timeStartFilter } from "./store.js";
    import {highlightQuadByName} from "./main.js";

    import "../Rooms.css"
    import Filter from "./Filter.svelte";
    let data = [];
    function handleSubmit(name,id,cap) {
        $curr_room = name
        $curr_id = id
        $curr_cap = cap
        $showSubmit = true
        $showFloorsButton = false
    }

    function parseName(name,index) {
        let buf = name.split(' ')
        return buf[index]
    }

    $: if (count) {

        function filt(room) {
            let floor = $count === 0 ? true : room['floor'] === $count
            if (!floor) {
                return false
            }
            if (!$showLectures && room['type']['id'] === 1) {
                return false
            }

            if (!$showMeetings && room['type']['id'] === 2) {
                return false
            }
            console.log($timeStartFilter)
            fetch('https://bookrooms.gladov.ru/api/bookings').then(res => res.json()).then(res => {
                res.forEach((book) => {
                    let start = new Date(book['timeStart'])
                    if ( (start.getHours() + start.getMinutes() / 60) === $timeStartFilter && book['roomId'] === room['id']) {
                        return false
                    }
                })
            })
            return true
        }

        fetch("https://bookrooms.gladov.ru/api/bookings/api/rooms?userId=1")
            .then((res) => res.json())
            .then((res) => {
                console.log(res)
                data = res.filter(filt)

            })
        }
        function highlightRoom(name) {
            name = name.split(' ')[2].substring(1)
            console.log('Room ' + name)
            highlightQuadByName('Room ' + name)
        }

</script>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

{#if $showRooms}
{#if data}
    <div class="{$showSubmit ? 'parent child' : ' container parent child'}">
        <Filter />
    {#each data as element}
        <div style="display: flex; flex-direction: row">
            <button class="room" disabled={$showSubmit} on:click={() => {handleSubmit(element['name'],element['id'],element['capacity'])}}>

                <div style="position: relative;   text-align: left; right: 2.5vw">
                    {parseName(element["name"],0)} {parseName(element["name"],1)} <br />
                    {parseName(element["name"],2)}
                </div>
                <div style="position: relative; right: -2vw; top: 1vw">
                    <i class="fa-solid fa-user"></i> {element["capacity"]} </div>

            </button>
            <a class="show" on:click={() => highlightRoom(element["name"])}>
                <div style="position: relative; top: 35%; left: 35%"> ⟩ </div>
            </a>
         </div>
        {/each}

        <div style="display: flex; flex-direction: row">
            <button class="room" disabled={$showSubmit} on:click={() => {handleSubmit('Lecture room #108',1,30)}}>

                <div style="position: relative;   text-align: left; right: 2.5vw">
                    {parseName('Lecture room #108',0)} {parseName('Lecture room #108',1)} <br />
                    {parseName('Lecture room #108',2)}
                </div>
                <div style="position: relative; right: -2vw; top: 1vw">
                    <i class="fa-solid fa-user"></i> {30} </div>

            </button>
            <a class="show" on:click={() => highlightRoom('room #108')}>
                <div style="position: relative; top: 35%; left: 35%"> ⟩ </div>
            </a>
        </div>
    </div>
{/if}
    {/if}
