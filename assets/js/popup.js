(function () {

    "use strict";

    document.querySelector("#options").addEventListener("click", event => {
        event.preventDefault();
        chrome.runtime.openOptionsPage(() => {});
    });

    chrome.storage.sync.get(["streamList", "username"], items => {

        if (!items.username) chrome.runtime.openOptionsPage(() => {});

        if (items.streamList && items.streamList.length > 0) {
            document.querySelector("#Peep").innerHTML =
                Handlebars.templates.popup(items);

            let anchors = document.querySelectorAll("a");

            anchors.forEach(anchor => {
                anchor.addEventListener("click", event => {
                    chrome.tabs.create({
                        "url": anchor.href
                    });
                });
            });
        }

    });

})();
