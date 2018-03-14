(function () {

    "use strict";

    chrome.storage.sync.get("user", items => {
        if (items.user.login) document.querySelector("#user").value = items.user.login;
    });

    document.querySelector("#formOptions").addEventListener("submit", event => {
        event.preventDefault();

        const username = document.querySelector("#user").value.trim();

        if (username.length > 0) {
            GetUserID(username);
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

    const GetUserID = async (login) => {
        let response = await fetch(`https://api.twitch.tv/helix/users?login=${login}`, {
            headers: {
                "Client-ID": "haeyonp05j4wiphav3eppivtdsvlyoq"
            }
        });
        let json = await response.json();

        chrome.storage.sync.clear(() => {
            chrome.storage.sync.set({
                "user":{
                    "id": json.data[0].id,
                    "login":json.data[0].login
                }
            }, () => {
                chrome.runtime.sendMessage({
                    "action": "resetAlarm"
                });

                chrome.browserAction.setTitle({
                    "title": json.data[0].login
                });
                showAlert("Username Saved");
            });
        });
    };

    const showAlert = message => {
        const alert = document.querySelector(".alert");

        alert.innerHTML = message;
        alert.removeAttribute("hidden");

        setTimeout(function () {
            alert.setAttribute("hidden", null);
        }, 2000);
    };

})();
