import {writable} from "svelte/store";

export let count = writable(0);

export let showFilters = writable(true)

export let showFloorsButton = writable(true)

export let showMeetings = writable(true)

export let showLectures = writable(true)

export let showRooms = writable(true)

export let curr_room = writable("")

export let curr_id = writable(0)

export let curr_cap = writable(0)

export let showSubmit = writable(false)

export let timeStartFilter = writable(0)

export let timeEndFilter = writable(0)

export let DateFilter = writable( {
    month: 0,
    day: 0
})

export let timeStartField = writable({
    hour: 0,
    minute:0
})

export let timeEndField = writable({
    hour: 0,
    minute: 0
})
