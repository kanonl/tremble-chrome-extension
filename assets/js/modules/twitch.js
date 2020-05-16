const twitch = {
    Config: {
        URL: "https://api.twitch.tv",
        Endpoints: {
            GetUsers: "/helix/users",
            GetUsersFollows: "/helix/users/follows",
            GetStreams: "/helix/streams",
            GetGames: "/helix/games"
        },
        ClientID: "qkawy9529hy6n14pad3tvve4i8q8y4"
    },
    Get: async (url) => {
        let response = await fetch(url, twitch.fetchInit());
        let json = await response.json();

        return json;
    },
    GetUsers: (user_ids) => {
        let searchParams = new URLSearchParams();

        user_ids.forEach(id => {
            searchParams.append("id", id);
        });

        let url = new URL(twitch.Config.URL);
        url.pathname = twitch.Config.Endpoints.GetUsers;
        url.search = searchParams;

        return twitch.Get(url.toString());
    },
    GetUsersFollows: (user_id) => {
        let url = new URL(twitch.Config.URL);
        url.pathname = twitch.Config.Endpoints.GetUsersFollows;
        url.search = new URLSearchParams({
            "from_id": user_id
        });

        return twitch.Get(url.toString());
    },
    GetStreams: (user_ids) => {
        let searchParams = new URLSearchParams({
            "type": "live"
        });

        user_ids.forEach(id => {
            searchParams.append("user_id", id);
        });

        let url = new URL(twitch.Config.URL);
        url.pathname = twitch.Config.Endpoints.GetStreams;
        url.search = searchParams;

        return twitch.Get(url.toString());
    },
    GetGames: (game_id) => {
        let searchParams = new URLSearchParams();

        game_id.forEach(id => {
            searchParams.append("id", id);
        });

        let url = new URL(twitch.Config.URL);
        url.pathname = twitch.Config.Endpoints.GetGames;
        url.search = searchParams;

        return twitch.Get(url.toString());
    },
    fetchInit: () => {
        return {
            "headers": new Headers({
                "Client-ID": twitch.Config.ClientID,
                "Authorization": `Bearer ${twitch.Config.access_token}`,
            })
        };
    }
};

export default twitch;