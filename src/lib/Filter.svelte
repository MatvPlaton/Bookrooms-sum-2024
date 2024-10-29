<script>
    import '../Filter.css'
    import filter_ico from '../assets/filter.png'
    import {showLectures} from "./store.js";
    import {showMeetings} from "./store.js";
    import DatePicker from "./DatePicker.svelte";
    import TimePicker1 from "./TimePicker1.svelte";
    import TimePicker2 from "./TimePicker2.svelte";
    function showChange(event) {
        switch (event.target.value) {
            case 'A':
                $showLectures = true;
                $showMeetings = true;
                break
            case 'L':
                $showLectures = true;
                $showMeetings = false;
                break
            case 'M':
                $showLectures = false;
                $showMeetings = true;
                break
            case 'S':
                $showLectures = false;
                $showMeetings = false;
                break
        }
    }
</script>
<div class="filter filter-cont inter-extra">
    <div class="timepicker">
        <TimePicker1 />
    </div>

    <div class="until">
        <span>Time until:</span>
        <div style="position: relative; left: 10%"> <TimePicker2 /> </div>

    </div>
    <div class="datepicker">
        <DatePicker />
    </div>
        <div class="filter-row">
            <span class="inter-medium">Type:</span>
            <select on:change={showChange} class="inter-medium">
                <option value="A">Any</option>
                <option value="L">Lecture Room</option>
                <option value="S">Study Room</option>
                <option value="M">Meeting Room</option>
                <!-- Add more options as needed -->
            </select>
        </div>
    <div class="filter-icon-wrapper">
        <img src="{filter_ico}" alt="fsdf">
    </div>
</div>