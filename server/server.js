const express = require("express");
const SpotifyWebApi = require("spotify-web-api-node");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

//login
app.post("/login", (req, res) => {
  const code = req.body.code;

  const spotifyWebApi = new SpotifyWebApi({
    clientId: "a59189441a2b410b98f34db93192b2b5",
    clientSecret: "b50787bc81034dbaba5719493b03f648",
    redirectUri: "http://localhost:3000",
  });

  spotifyWebApi
    .authorizationCodeGrant(code)
    .then((data) => {
      res.json({
        accessToken: data.body.access_token,
        expiresIn: data.body.expires_in,
        refreshToken: data.body.refresh_token,
      });
    })
    .catch(() => {
      res.sendStatus(400);
    });
});

//refresh
app.post("/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken;
  const spotifyWebApi = new SpotifyWebApi({
    clientId: "a59189441a2b410b98f34db93192b2b5",
    clientSecret: "b50787bc81034dbaba5719493b03f648",
    refreshToken,
  });
  spotifyWebApi
    .refreshAccessToken()
    .then((data) => {
      res.json({
        accessToken: data.body.access_token,
        expiresIn: data.body.expires_in,
      });
    })
    .catch(() => {
      res.sendStatus(400);
    });
});

app.listen(3001);
