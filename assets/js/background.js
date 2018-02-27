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
                "Basic": "basic",
                "Image": "image"
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

    chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
        if (buttonIndex === 0) {
            chrome.notifications.clear(notificationId, wasCleared => {
                // TODO
            });
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
                        console.log(json);

                        let stream_type = json.streams[0].stream_type;
                        let title = `${json.streams[0].channel.display_name}`;
                        let message = json.streams[0].channel.status;
                        let iconUrl = json.streams[0].channel.logo;
                        let imageUrl = json.streams[0].preview.large;
                        let game = json.streams[0].channel.game;

                        if (stream_type === "live") {
                            showNotification(message, title, iconUrl, imageUrl, game);
                        }
                    }
                }).catch(error => showNotification(error.toString()));
            });

        }).catch(error => console.error(error.toString()));

    };

    const showNotification = (message, title, iconUrl, imageUrl, game) => {
        let d = new Date();

        let notificationOptions = {
            type: (imageUrl === null) ? Peep.NOTIFICATIONS.TYPE.Basic : Peep.NOTIFICATIONS.TYPE.Image,
            iconUrl: iconUrl || chrome.extension.getURL("/assets/images/Glitch_Purple_RGB.svg"),
            title: title || Peep.NOTIFICATIONS.Title,
            message: message,
            contextMessage: game || d.toLocaleString(),
            eventTime: d.getTime(),
            buttons: [
                {
                    "title": "Watch",
                    "iconUrl": chrome.extension.getURL("/assets/images/Glitch_Purple_RGB.svg")
                }
            ],
            imageUrl: imageUrl,
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
