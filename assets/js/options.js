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
                    chrome.runtime.sendMessage({
                        "action": "resetAlarm"
                    });

                    chrome.browserAction.setTitle({
                        "title": username
                    });
                    showAlert("Username Saved");
                });
            });
        }
    });

    document.querySelector(".btn-reset").addEventListener("click", event => {
        chrome.storage.sync.clear(() => {
            chrome.browserAction.disable();
            chrome.browserAction.setTitle({
                "title": ""
            });
            chrome.browserAction.setBadgeText({
                "text": ""
            });
            showAlert("Data Reset");
        });
    });

    const showAlert = message => {
        const alert = document.querySelector(".alert");

        alert.innerHTML = message;
        alert.removeAttribute("hidden");

        setTimeout(function () {
            alert.setAttribute("hidden", null);
        }, 2000);
    };

})();
