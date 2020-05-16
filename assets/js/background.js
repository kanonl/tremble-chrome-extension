import { tremble } from "./modules/config.js";
import { setAlarm, setBadge, createNotificationOptions } from "./modules/utils.js";
import twitch from "./modules/twitch.js";

(function () {

    "use strict";

    chrome.browserAction.setIcon({
        path: chrome.runtime.getURL("assets/images/Glitch_Purple_RGB.svg")
    });

    chrome.runtime.onInstalled.addListener(event => setAlarm(tremble.ALARMS.Name, tremble.ALARMS.When, tremble.ALARMS.PeriodInMinutes));

    chrome.runtime.onStartup.addListener(event => setAlarm(tremble.ALARMS.Name, tremble.ALARMS.When, tremble.ALARMS.PeriodInMinutes));

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "resetAlarm") {
            setAlarm(tremble.ALARMS.Name, tremble.ALARMS.When, tremble.ALARMS.PeriodInMinutes);
        }
    });

    chrome.alarms.onAlarm.addListener(alarm => {
        if (alarm.name === tremble.ALARMS.Name) {
            chrome.storage.sync.get(["authorization", "user"], items => {
                if (items.user?.id) {

                    chrome.browserAction.setTitle({
                        "title": items.user.login
                    });

                    twitch.Config.access_token = items.authorization.access_token;

                    twitch.GetUsersFollows(items.user.id).then(follows => {
                        let stream_id = follows.data.map(x => x.to_id);

                        twitch.GetStreams(stream_id).then(streams => {

                            setBadge(streams.data.length);

                            if (streams.data.length > 0) {
                                let game_id = streams.data.map(x => x.game_id),
                                    user_id = streams.data.map(x => x.user_id);

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

            let user = users.find(element => element.id == stream.user_id);
            let game = games.find(element => element.id == stream.game_id);

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
                "game": game
            };

            streamList.push(streamData);

        });

        chrome.storage.sync.get({ "streamList": [] }, items => {
            streamList.forEach(newstream => {
                let notify = !items.streamList.some(x => x.user.id === newstream.user.id);

                if (notify) {
                    createNotificationOptions(newstream);
                }
            });

            chrome.storage.sync.set({ "streamList": streamList });
        });

    };

})();
