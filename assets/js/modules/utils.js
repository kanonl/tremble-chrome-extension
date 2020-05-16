import { tremble } from "./config.js";

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

const parseHash = hash => {
    let params = {};
    let pair = hash.split("&");
    pair.forEach(element => {
        let kvp = element.split("=");
        params[kvp[0]] = decodeURIComponent(kvp[1]);
    });

    return params;
}

const showAlert = (message, alertType) => {
    const alert = document.querySelector(".alert");
    alert.className = `alert alert-${alertType}`;

    alert.innerHTML = message;
    alert.removeAttribute("hidden");

    setTimeout(function () {
        alert.setAttribute("hidden", null);
    }, 4000);
};

export { setAlarm, setBadge, createNotificationOptions, createNotification, parseHash, showAlert };