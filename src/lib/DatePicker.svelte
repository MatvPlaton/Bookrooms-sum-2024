<script>
    import { DateTime } from 'luxon';
    import { onMount } from 'svelte';
    import {DateFilter, showSubmit} from './store';

    // const today = DateTime.fromObject({ month: 9, day: 29});
    const today = DateTime.now();

    export let style = "filter-medium";
    export let date = today;

    export let date_limits = [today, today.plus({ month: 1 })]

    function get_style(level) {
        return style.split('-')[level]
    }

    let date_fmt;

        $: if (showSubmit) {
            date = update_date(date_fmt,date)
        }
        date_fmt = date_to_fmt(date);

        $: date = update_date(date_fmt, date)


        function update_date(str, d) {
            let ret = DateTime.fromISO(str)
            if (!ret.isValid) {
                console.error("update_date error!")
                return today
            }
            $DateFilter['month'] = date.month
            $DateFilter['day'] = date.day
            return ret
        }

        function date_to_fmt(d) {
            let ret = d.toISODate()
            if (typeof (ret) != 'string') {
                console.error("date_to_fmt error!")
                return ""
            }
            return ret
        }
    function date_to_label(d) {
        return `${d.setLocale('en').toLocaleString({ month: 'long' })} ${d.day}`
    }
</script>

<div class="cont">
    <!-- onfocus="this.showPicker()" -->
    <input style="font-size: 1vw" bind:value={date_fmt} id="date" type="date" min="{date_to_fmt(date_limits[0])}" max="{date_to_fmt(date_limits[1])}">
    <label style="font-size: 1vw" class="style-{get_style(0)} inter-{get_style(1)}" for="date">{date_to_label(date)}</label>
</div>

<style>
label.style-filter {
    border-radius: 5px;
    padding: 4px;
    color: var(--ter-on);
    font-size: 20px;
}

input:focus ~ label.style-filter {
    color: var(--ter-fixed);
    outline: var(--ter-fixed) solid 1px;
}
.cont {
    display: inline;
    position: relative;
}

label {
    text-wrap: nowrap;
}

input:focus {
    outline: 0;
}

input::-webkit-datetime-edit-month-field,
input::-webkit-datetime-edit-day-field,
input::-webkit-datetime-edit-year-field,
input::-webkit-datetime-edit-month-field:focus,
input::-webkit-datetime-edit-day-field:focus,
input::-webkit-datetime-edit-year-field:focus {
    background: transparent;
    color: transparent;
    outline: 0;
}

input {
    position: absolute;
    top: 0.5em;
    left: 0;
    background: transparent;
    color: transparent;
    border: 0;
}


input::-webkit-calendar-picker-indicator {
    display: block;
    top: 0;
    right: 0;
    height: 100%;
    width: 100%;
    position: absolute;
    background: none;
}

</style>
  