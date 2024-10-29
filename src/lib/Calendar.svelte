<script>
    import {onDestroy, onMount} from 'svelte';
    import DayPilotCalendar, {DayPilot} from 'daypilot-pro-javascript';

    let calendar;

    onMount(() => {
        calendar = new DayPilot.Calendar("dp", {
            viewType: "Week",
            theme: "scheduler_8",

        });
        calendar.init();
        let newEvent = {
                id: 1,
                text: "Event 1",
                start: "2024-07-02T10:30:00",
                end: "2024-07-02T13:00:00",
                participants: 2,
                backColor: "lime",
                color: "white"
            };

// Добавляем событие в календарь
        calendar.events.add(newEvent);

// Обновляем календарь, чтобы отобразить новое событие
        calendar.update();
    });

    // Обязательно очистите ресурсы при уничтожении компонента
    onDestroy(() => {
        calendar && calendar.dispose();
    });
</script>
<head>
    <link type="text/css" rel="stylesheet" href="themes/scheduler_8.css"/>
    <title></title>
</head>
<div style="position: absolute; left: 500px" id="dp"></div>
