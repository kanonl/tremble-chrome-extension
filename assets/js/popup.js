(function () {

    "use strict";

    document.querySelector("#options").addEventListener("click", event => {
        event.preventDefault();
        chrome.runtime.openOptionsPage(() => { });
    });

    chrome.storage.sync.get(["streamList", "user"], items => {

        if (!items.user) chrome.runtime.openOptionsPage(() => { });

        if (items.streamList && items.streamList.length > 0) {
            document.querySelector("#tremble").innerHTML =
                Handlebars.templates.popup(items);

            let anchors = document.querySelectorAll("a");

            anchors.forEach(anchor => {
                anchor.addEventListener("click", event => {
                    chrome.tabs.create({
                        "url": anchor.href
                    });
                });
            });

            let games = document.querySelectorAll(".game");

            games.forEach(game => {
                game.addEventListener("click", event => {
                    chrome.tabs.create({
                        "url": `https://www.twitch.tv/directory/game/${encodeURIComponent(event.target.innerHTML)}`
                    });
                });
            });

            let display_names = document.querySelectorAll(".display_name");

            display_names.forEach(display_name => {
                display_name.addEventListener("click", event => {
                    chrome.tabs.create({
                        "url": `https://www.twitch.tv/${encodeURIComponent(event.target.innerHTML)}`
                    });
                });
            });
        }

    });

})();
