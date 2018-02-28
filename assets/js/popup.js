(function () {
    document.querySelector("#Peep").innerHTML = Handlebars.templates.popup({
        "title": "Hello, World!"
    });
    chrome.storage.sync.clear();
})();
