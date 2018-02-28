(function () {

    chrome.storage.sync.get("streamList", items => {

        if (items.streamList.length > 0) {
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
