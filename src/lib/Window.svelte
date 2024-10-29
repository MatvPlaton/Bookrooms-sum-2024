<script>
    import {curr_room, curr_cap, showSubmit, showFloorsButton, curr_id, DateFilter, timeStartField, timeEndField} from "./store.js";
    import {writable} from "svelte/store";
    import "../Window.css"
    function back() {
        $showSubmit = false
        $showFloorsButton = true
        data = null;
    }

    const date = writable('');
    const startTime = writable('');
    const endTime = writable('');

    async function handleSubmit() {
        // Combine date and time fields and convert to timestamp
        const startTimestamp = `${$date}T${$startTime}:00.00Z`
        const endTimestamp = `${$date}T${$endTime}:00.00Z`

        // Data to be sent in the POST request
        const data = {
            "endTime": endTimestamp,
            "roomId": $curr_id,
            "startTime": startTimestamp,
            "title": "booking",
            "userId": 1
        };

        const response = await fetch("https://bookrooms.gladov.ru/api/bookings", {
            method: 'POST',
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log(result);
    }

    let data = [];
    data.push(1)
    let timeStart = [];
    let duration = [];
    $: if ($showSubmit) {
        timeStart = [];
        duration = [];

        fetch('https://bookrooms.gladov.ru/api/bookings').then(res => res.json()).then(res => {
            data = res;
            res.forEach((book) => {
                if (book['roomId'] === $curr_id) {
                    let start = new Date(book['timeStart'])
                    let end = new Date(book['timeEnd'])

                    if (start.getDate() === $DateFilter['day'] && start.getMonth() + 1 === $DateFilter['month']) {
                        let startHours = start.getHours() + start.getMinutes() / 60
                        let endHours = end.getHours() + end.getMinutes() / 60
                        timeStart.push(startHours)
                        duration.push(endHours - startHours)
                    }
                }
            })
            // let time = new Date(data[4]['timeEnd'])
            // console.log(new Date(data[4]['timeEnd']))
            // f = time.getHours()
        })
    }

</script>

{#if data}
    <div class="overlay">
        <div style="position: absolute; left: 5%; top: 5%; font-size: 2vw"> {$curr_room}</div>
        <div style="filter: opacity(60%); position: absolute; left: 5%; top: 15%; font-size: 1vw"> Capacity: {$curr_cap}</div>

        <a class="back_btn" on:click={back}> &times; </a>
        <form on:submit|preventDefault={handleSubmit} class="submit-box">

            <label style="position:absolute;font-size: 1vw">
                Start Time:
                <input style="position:absolute; font-size: 0.6vw; top:-0.3vw;left: 7vw;" class="time-wrapper"
                       type="time"
                       bind:value={$startTime}
                />
            </label>
            <label style="position:absolute; left: 15vw;font-size: 1vw">
                End Time:
                <input style="position:absolute; font-size: 0.6vw; top:-0.3vw;left: 7vw;" class="time-wrapper"
                       type="time"
                       bind:value={$endTime}
                />
            </label>
            <label style="position:absolute;top:3vw;right:37.5vw; font-size: 1vw;">
                Date:
                <input style="position:absolute; font-size: 0.6vw; top: -0.3vw; left: 5vw;" class="time-wrapper"
                       type="date"
                       bind:value={$date}
                />
            </label>
            <button type="submit" class="submit-button">Submit</button>
        </form>
            <div class="labels">
            <div class="label">00:00</div>
            <div class="label">06:00</div>
            <div class="label">12:00</div>
            <div class="label">18:00</div>
            <div class="label">00:00</div>
            {#each timeStart as time, index}
            <div style="left: calc({time} / 30 * 100%); width: calc({duration[index]} / 30 * 100%)" class="bar custom"></div>
                {/each}
        </div>

    </div>
{/if}