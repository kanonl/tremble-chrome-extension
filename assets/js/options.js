import { tremble } from "./modules/config.js";
import { setAlarm, parseHash } from "./modules/utils.js";

(function () {

    "use strict";

    chrome.storage.sync.get("user", items => {
        if (items.user) {
            document.querySelector("#user").innerHTML = Handlebars.templates.options(items.user);
            BindEventListener();
            document.querySelector("button.login").classList.toggle("d-none");
        } else {
            document.querySelector("#user").classList.toggle("d-none");
        }
    });

    document.querySelector("button.login").addEventListener("click", event => authorization());

    const BindEventListener = () => {
        document.querySelector("button.logout").addEventListener("click", event => {
            chrome.storage.sync.clear(() => {
                document.querySelector("button.login").classList.toggle("d-none");
                document.querySelector("#user").classList.toggle("d-none");
            });
        });
    }

    const authorization = () => {
        let url = new URL("https://id.twitch.tv");
        url.pathname = "/oauth2/authorize"
        url.search = new URLSearchParams({
            client_id: "qkawy9529hy6n14pad3tvve4i8q8y4",
            redirect_uri: chrome.identity.getRedirectURL(),
            response_type: "token",
            scope: "user:read:email"
        });

        chrome.identity.launchWebAuthFlow({
            url: url.toString(),
            interactive: true
        }, responseUrl => {
            if (chrome.runtime.lastError) return;

            let url = new URL(responseUrl);
            let hash = url.hash.substring(1);
            let data = parseHash(hash);

            chrome.storage.sync.set({ authorization: data }, async () => {
                let fetchOptions = {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${data.access_token}`,
                        "Client-ID": "qkawy9529hy6n14pad3tvve4i8q8y4"
                    }
                };

                let responseUsers = await fetch("https://api.twitch.tv/helix/users", fetchOptions).then(response => response.json());
                let user = responseUsers.data[0];
                
                chrome.storage.sync.set({ user: user }, () => {
                    document.querySelector("#user").innerHTML = Handlebars.templates.options(user);
                    BindEventListener();
                    document.querySelector("#user").classList.toggle("d-none");
                    document.querySelector("button.login").classList.toggle("d-none");
                    setAlarm(tremble.ALARMS.Name, tremble.ALARMS.When, tremble.ALARMS.PeriodInMinutes)
                });
            });
        });
    }

})();
