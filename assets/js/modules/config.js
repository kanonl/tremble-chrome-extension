const tremble = {
    "ALARMS": {
        "Name": "tremble",
        "When": Date.now() + 1000,
        "PeriodInMinutes": 5
    },
    "NOTIFICATIONS": {
        "TYPE": {
            "List": "list",
            "Basic": "basic",
            "Image": "image"
        },
        "Title": "tremble",
        "RequireInteraction": true
    }
};

export { tremble };