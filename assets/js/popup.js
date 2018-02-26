const b = chrome.extension.getBackgroundPage();

let things = b.fetchChannels();

things.then(kanon => {
    Promise.all(kanon).then(values => {
        values.forEach(response => {
            if (response.ok) {
                response.json().then(json => {
                    if (json.streams.length > 0) {
                        console.log(json.streams[0].channel.name);
                        document.querySelector(".peep").innerHTML += json.streams[0].channel.name + "<br>";
                    }
                });
            }
        });
    });
});
