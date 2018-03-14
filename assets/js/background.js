(function () {

    "use strict";

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

    const twitch = {
        Config: {
            URL: "https://api.twitch.tv",
            Endpoints: {
                GetUsers: "/helix/users",
                GetUsersFollows: "/helix/users/follows",
                GetStreams: "/helix/streams",
                GetGames: "/helix/games"
            },
            ClientID: "qkawy9529hy6n14pad3tvve4i8q8y4"
        },
        Get: async (url) => {
            let response = await fetch(url, twitch.fetchInit());
            let json = await response.json();

            return json;
        },
        GetUsers: (user_ids) => {
            let searchParams = new URLSearchParams();

            user_ids.forEach(id => {
                searchParams.append("id", id);
            });

            let url = new URL(twitch.Config.URL);
            url.pathname = twitch.Config.Endpoints.GetUsers;
            url.search = searchParams;

            return twitch.Get(url.toString());
        },
        GetUsersFollows: (user_id) => {
            let url = new URL(twitch.Config.URL);
            url.pathname = twitch.Config.Endpoints.GetUsersFollows;
            url.search = new URLSearchParams({
                "from_id": user_id
            });

            return twitch.Get(url.toString());
        },
        GetStreams: (user_ids) => {
            let searchParams = new URLSearchParams({
                "type": "live"
            });

            user_ids.forEach(id => {
                searchParams.append("user_id", id);
            });

            let url = new URL(twitch.Config.URL);
            url.pathname = twitch.Config.Endpoints.GetStreams;
            url.search = searchParams;

            return twitch.Get(url.toString());
        },
        GetGames: (game_id) => {
            let searchParams = new URLSearchParams();

            game_id.forEach(id => {
                searchParams.append("id", id);
            });

            let url = new URL(twitch.Config.URL);
            url.pathname = twitch.Config.Endpoints.GetGames;
            url.search = searchParams;

            return twitch.Get(url.toString());
        },
        fetchInit: () => {
            return {
                "headers": new Headers({
                    "Client-ID": twitch.Config.ClientID
                })
            };
        }
    };

    chrome.browserAction.setIcon({
        path: chrome.runtime.getURL("assets/images/Glitch_Purple_RGB.svg")
    });

    chrome.runtime.onInstalled.addListener(event => setAlarm(tremble.ALARMS.Name, tremble.ALARMS.When, tremble.ALARMS.PeriodInMinutes));

    chrome.runtime.onStartup.addListener(event => setAlarm(tremble.ALARMS.Name, tremble.ALARMS.When, tremble.ALARMS.PeriodInMinutes));

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "resetAlarm") {
            console.log("Resetting alarm");
            setAlarm(tremble.ALARMS.Name, tremble.ALARMS.When, tremble.ALARMS.PeriodInMinutes);
        }
    });

    chrome.alarms.onAlarm.addListener(alarm => {
        if (alarm.name === tremble.ALARMS.Name) {
            chrome.storage.sync.get("user", items => {
                if (items.user.id) {

                    chrome.browserAction.setTitle({
                        "title": items.user.login
                    });

                    twitch.GetUsersFollows(items.user.id).then(follows => {
                        let stream_id = [];

                        follows.data.forEach(follow => {
                            stream_id.push(follow.to_id);
                        });

                        twitch.GetStreams(stream_id).then(streams => {

                            setBadge(streams.data.length);

                            if (streams.data.length > 0) {
                                let game_id = [],
                                    user_id = [];

                                streams.data.forEach(stream => {
                                    game_id.push(stream.game_id);
                                    user_id.push(stream.user_id);
                                });

                                Promise.all([
                                    twitch.GetUsers(user_id),
                                    twitch.GetGames(game_id)
                                ]).then(done => {

                                    let user, game;

                                    if (done[0].data[0].broadcaster_type) {
                                        user = done[0].data;
                                        game = done[1].data;
                                    } else {
                                        user = done[1].data;
                                        game = done[0].data;
                                    }

                                    compile(streams.data, user, game);
                                });
                            }

                        });
                    });

                } else {
                    chrome.runtime.openOptionsPage(() => { });
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
                chrome.tabs.create(createProperties, tab => { });
            });
        }
    });

    const compile = (streams, users, games) => {

        let streamList = [];

        streams.forEach(stream => {

            let user = users.filter(element => element.id == stream.user_id)[0];
            let game = games.filter(element => element.id == stream.game_id)[0];

            let d = new Date(stream.started_at);

            let streamData = {
                "thumbnail_url": stream.thumbnail_url.replace("{width}", "640").replace("{height}", "360"),
                "started_at": d.toLocaleTimeString(),
                "title": stream.title,
                "viewer_count": stream.viewer_count,
                "user": {
                    "id": stream.user_id,
                    "display_name": user.display_name,
                    "login": user.login,
                    "profile_image_url": user.profile_image_url
                },
                "game": {
                    "id": stream.game_id,
                    "box_art_url": game.box_art_url,
                    "name": game.name
                }
            };

            streamList.push(streamData);

        });

        chrome.storage.sync.get({ "streamList": [] }, items => {
            streamList.forEach(newstream => {
                let notify = true;
                items.streamList.forEach(stream => {
                    if (stream.user.id === newstream.user.id) {
                        notify = false;
                    }
                });
                if (notify) {
                    createNotificationOptions(newstream);
                }
            });

            chrome.storage.sync.set({ "streamList": streamList });
        });

    };

    const setAlarm = (name, when, periodInMinutes) => {
        chrome.alarms.clear(name, wasCleared => {
            chrome.alarms.create(name, {
                when: when,
                periodInMinutes: periodInMinutes
            });
        });
    };

    const setBadge = streamCount => {
        if (streamCount > 0) {
            chrome.browserAction.enable();
        } else {
            chrome.browserAction.disable();
            chrome.browserAction.setTitle({
                "title": `${tremble.NOTIFICATIONS.Title} - No active stream`
            });
        }

        chrome.browserAction.setBadgeText({
            "text": (streamCount > 0) ? streamCount.toString() : ""
        });
        chrome.browserAction.setBadgeBackgroundColor({
            "color": "#9B66FF"
        });
    };

    const createNotificationOptions = stream => {
        let d = new Date();

        let notificationOptions = {
            type: tremble.NOTIFICATIONS.TYPE.Image,
            iconUrl: stream.user.profile_image_url,
            title: stream.user.display_name,
            message: stream.title,
            contextMessage: stream.game.name,
            eventTime: d.getTime(),
            buttons: [
                {
                    "title": `${stream.viewer_count} viewers`,
                    "iconUrl": chrome.extension.getURL("/assets/images/Glitch_Purple_RGB.svg")
                }
            ],
            imageUrl: stream.thumbnail_url,
            requireInteraction: tremble.NOTIFICATIONS.RequireInteraction
        };

        createNotification(notificationOptions, `https://www.twitch.tv/${stream.user.display_name}`);

        return;
    };

    const createNotification = (notificationOptions, url) => {
        if (!url) url = null;
        chrome.notifications.create(url, notificationOptions, notificationId => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
            }
        });
    };

})();
