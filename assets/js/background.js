(function () {

    const Peep = {
        "ALARMS": {
            "Name": "peep",
            "When": Date.now() + 5000,
            "PeriodInMinutes": 15
        },
        "NOTIFICATIONS": {
            "TYPE": {
                "List": "list",
                "Basic": "basic"
            },
            "Title": "Peep",
            "RequireInteraction": true
        },
        "TWITCH": {
            "Url": "https://api.twitch.tv",
            "Method": "/kraken/users/rukipooki/follows/channels",
            "CliendId": "haeyonp05j4wiphav3eppivtdsvlyoq"
        }
    };

    chrome.runtime.onInstalled.addListener(event => setAlarm(Peep.ALARMS.Name, Peep.ALARMS.When, Peep.ALARMS.PeriodInMinutes));

    chrome.runtime.onStartup.addListener(event => setAlarm(Peep.ALARMS.Name, Peep.ALARMS.When, Peep.ALARMS.PeriodInMinutes));

    chrome.alarms.onAlarm.addListener(alarm => {
        if (alarm.name === Peep.ALARMS.Name) {
            fetchChannels();
        }
    });

    const setAlarm = (name, when, periodInMinutes) => {
        chrome.alarms.clear(name, wasCleared => {
            chrome.alarms.create(name, {
                when: when,
                periodInMinutes: periodInMinutes
            });
        });
    };

    const fetchChannels = () => {

        const url = new URL(Peep.TWITCH.Url);
        url.pathname = Peep.TWITCH.Method;
        url.search = new URLSearchParams({
            "client_id": Peep.TWITCH.CliendId
        });

        fetch(url.toString()).then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        }).then(json => {

            json.follows.forEach(follow => {
                url.pathname = "/kraken/streams";
                url.search = new URLSearchParams({
                    "channel": follow.channel.name,
                    "client_id": Peep.TWITCH.CliendId
                });

                fetch(url.toString()).then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error(response.statusText);
                }).then(json => {
                    if (json.streams.length > 0) {
                        showNotification(json.streams[0].name);
                    }
                }).catch(error => showNotification(error.toString()));
            });

        }).catch(error => console.error(error.toString()));

    };

    const showNotification = message => {
        let d = new Date();

        let notificationOptions = {
            type: Peep.NOTIFICATIONS.TYPE.Basic,
            iconUrl: chrome.extension.getURL("/assets/images/Glitch_Purple_RGB.svg"),
            title: Peep.NOTIFICATIONS.Title,
            message: message,
            contextMessage: d.toLocaleString(),
            eventTime: d.getTime(),
            requireInteraction: Peep.NOTIFICATIONS.RequireInteraction
        };

        chrome.notifications.create(notificationOptions, notificationId => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
            }
            console.log(`[notificationId] ${notificationId}`);
        });

        return;
    };

})();
