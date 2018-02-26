// popup.js

const background = chrome.extension.getBackgroundPage();

background.fetchChannels().then(response => {
    if (response.ok) {
        return response.json();
    }
    throw new Error(response.statusText);
}).then(json => {
    console.log(json);
}).catch(error => background.showNotification(error.toString()));
