(function () {

    chrome.storage.sync.get("username", items => {
        if (items.username) document.querySelector("#user").value = items.username;
    });

    document.querySelector("#formOptions").addEventListener("submit", event => {
        event.preventDefault();

        const username = document.querySelector("#user").value.trim();

        if (username.length > 0) {
            chrome.storage.sync.clear(() => {
                chrome.storage.sync.set({
                    "username": username
                }, () => {
                    const b = chrome.extension.getBackgroundPage();
                    b.setAlarm(b.Peep.ALARMS.Name, b.Peep.ALARMS.When, b.Peep.ALARMS.PeriodInMinutes);
                    chrome.browserAction.setTitle({
                        "title": username
                    });
                });
            });
        }
    });
})();
