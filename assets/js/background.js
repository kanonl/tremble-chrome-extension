(function () {

    const Peep = {
        "ALARMS": {
            "Name": "peep",
            "When": Date.now() + 2500,
            "PeriodInMinutes": 10
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
            "ClientId": "haeyonp05j4wiphav3eppivtdsvlyoq"
        }
    };

    chrome.runtime.onInstalled.addListener(event => setAlarm(Peep.ALARMS.Name, Peep.ALARMS.When, Peep.ALARMS.PeriodInMinutes));

    chrome.runtime.onStartup.addListener(event => setAlarm(Peep.ALARMS.Name, Peep.ALARMS.When, Peep.ALARMS.PeriodInMinutes));

    chrome.alarms.onAlarm.addListener(alarm => {
        if (alarm.name === Peep.ALARMS.Name) {
            chrome.storage.sync.get("username", items => {
                if (items.username) {
                    fetchChannels(items.username);
                } else {
                    chrome.runtime.openOptionsPage(() => {});
                }
            });
        }
    });

    chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
        if (buttonIndex === 0) {
            chrome.notifications.clear(notificationId, wasCleared => {
                let createProperties = {
                    "url": notificationId
                };
                chrome.tabs.create(createProperties, tab => {
                    console.log(tab);
                });
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

    const fetchChannels = username => {

        chrome.browserAction.setTitle({
            "title": username
        });

        const url = new URL(Peep.TWITCH.Url);
        url.pathname = `/kraken/users/${username}/follows/channels`;
        url.search = new URLSearchParams({
            "client_id": Peep.TWITCH.ClientId,
            "limit": 50
        });

        let streamList = [];

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
                    "client_id": Peep.TWITCH.ClientId
                });

                fetch(url.toString()).then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error(response.statusText);
                }).then(json => {
                    if (json.streams.length > 0) {
                        let stream = json.streams[0];
                        let stream_type = stream.stream_type;
                        if (stream_type === "live") {
                            streamList.push({
                                "name": stream.channel.name,
                                "logo": stream.channel.logo,
                                "display_name": stream.channel.display_name,
                                "status": stream.channel.status,
                                "game": stream.channel.game,
                                "viewers": stream.viewers,
                                "preview": stream.preview.large,
                                "url": stream.channel.url
                            });
                        }
                    }
                }).catch(error => createNotification(error.toString()));
            });

        }).catch(error => createNotification(error.toString()));

        setTimeout(function () {

            setBadge(streamList.length);

            chrome.storage.sync.get({
                "streamList": []
            }, items => {

                streamList.forEach(newstream => {
                    let notify = true;
                    items.streamList.forEach(stream => {
                        if (stream.name === newstream.name) {
                            notify = false;
                        }
                    });
                    if (notify) {
                        createStreamNotification(newstream);
                    }
                });

                chrome.storage.sync.set({
                    "streamList": streamList
                });

            });
        }, 2000);

    };

    const setBadge = streamCount => {
        if (streamCount > 0) {
            chrome.browserAction.enable();
        } else {
            chrome.browserAction.disable();
            chrome.browserAction.setTitle({
                "title": `${Peep.NOTIFICATIONS.Title} - No active stream`
            });
        }

        chrome.browserAction.setBadgeText({
            "text": (streamCount > 0) ? streamCount.toString() : ""
        });
        chrome.browserAction.setBadgeBackgroundColor({
            "color": "#9B66FF"
        });
    };

    const createStreamNotification = stream => {
        let d = new Date();

        let notificationOptions = {
            type: Peep.NOTIFICATIONS.TYPE.Image,
            iconUrl: stream.logo,
            title: stream.display_name,
            message: stream.status,
            contextMessage: stream.game,
            eventTime: d.getTime(),
            buttons: [
                {
                    "title": `${stream.viewers} viewers`,
                    "iconUrl": chrome.extension.getURL("/assets/images/Glitch_Purple_RGB.svg")
                }
            ],
            imageUrl: stream.preview,
            requireInteraction: Peep.NOTIFICATIONS.RequireInteraction
        };

        showNotification(notificationOptions, stream.url);

        return;
    };

    const createNotification = message => {
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

        showNotification(notificationOptions);

        return;
    };

    const showNotification = (notificationOptions, url) => {
        if (!url) url = null;
        chrome.notifications.create(url, notificationOptions, notificationId => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
            }
            console.log(`[notificationId] ${notificationId}`);
        });
    };

    window.Peep = Peep;
    window.setAlarm = setAlarm;

})();
