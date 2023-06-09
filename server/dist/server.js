import express from 'express';
// import cookieSession from 'cookie-session';
const app = express();
import fetch from 'node-fetch';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import querystring from 'node:querystring';
import CryptoJS from "crypto-js";
import * as dotenv from 'dotenv';
dotenv.config();
import client from './util/redis.js';
import spotifyRoutes from './routes/spotifyRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import refreshAccessToken from './middlewares/refreshAccessToken.js';
const PORT = process.env.SERVER_PORT || 3001;
var client_id = process.env.client_id; // Your client id
var client_secret = process.env.client_secret; // Your secret
var redirect_uri = `${process.env.BACKEND_URI}/callback`; // Your redirect uri
var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};
var stateKey = 'spotify_auth_state';
app
    .use(cors({
    origin: [process.env.FRONTEND_URI],
    credentials: true, //access-control-allow-credentials:true
}))
    .use(cookieParser())
    // .use(cookieSession({
    //   name: 'Commonify',
    //   keys: [process.env.cookie_key!],
    //   maxAge: 24 * 60 * 60 * 1000,
    //   secure: false,
    // }))
    .use(express.urlencoded({ extended: true }))
    .use(express.json());
client.on('error', (err) => console.log('Redis Client Error', err));
await client.connect();
app.get('/', (req, res) => {
    res.status(200);
    res.send('Hello!');
});
app.get('/auth/login', (req, res) => {
    var state = generateRandomString(16);
    res.cookie(stateKey, state);
    // your application requests authorization
    // var scope = 'user-read-private user-read-email';
    var scope = 'user-read-private playlist-modify playlist-modify-public';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});
app.get('/callback', async (req, res) => {
    // your application requests refresh and access tokens
    // after checking the state parameter
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies[stateKey] : null;
    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    }
    else {
        res.clearCookie(stateKey);
        const params = new URLSearchParams();
        params.append('code', code);
        params.append('redirect_uri', redirect_uri);
        params.append('grant_type', 'authorization_code');
        const authOptions = {
            method: 'POST',
            url: 'https://accounts.spotify.com/api/token',
            body: params,
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };
        const authRes = await fetch('https://accounts.spotify.com/api/token', authOptions);
        const data = await authRes.json();
        if (authRes.status === 200) {
            const access_token = data.access_token, refresh_token = data.refresh_token;
            const options = {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + access_token },
            };
            // use the access token to access the Spotify Web API
            const profileRes = await fetch('https://api.spotify.com/v1/me', options);
            const profileData = await profileRes.json();
            const { id } = profileData;
            console.log(!await client.get(id + '_refresh'), !await client.get(id + '_access'), req.cookies.access_token);
            if (!await client.get(id + '_refresh') || !await client.get(id + '_access') || !req.cookies.access_token || !req.cookies.refresh_token) {
                var cipherToken = CryptoJS.AES.encrypt(refresh_token, process.env.cookie_key).toString();
                client.set(id + '_refresh', cipherToken);
                client.set(id + '_access', access_token);
                res.cookie('refresh_token', cipherToken);
                res.cookie('access_token', access_token, { maxAge: 3600000 });
            }
            console.log(`Logged in ${id}.`);
            // we can also pass the token to the browser to make requests from there
            // req.session.access_token = access_token;
            // req.session.refresh_token = refresh_token;
            res.setHeader('Access-Control-Allow-Credentials', true);
            // another common pattern
            // console.log('req.headers.origin', req.headers)
            res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URI);
            res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
            res.redirect(`${process.env.FRONTEND_URI}/${id}`);
        }
        else {
            res.redirect('/#' +
                querystring.stringify({
                    error: 'invalid_token'
                }));
        }
    }
});
app.get('/auth/relogin/:id', (req, res, next) => {
    var refresh_token;
    if (req.cookies?.refresh_token === undefined)
        refresh_token = null;
    else
        refresh_token = req.cookies.refresh_token;
    if (refresh_token) {
        console.log('Start Refresh.');
        next();
    }
    else {
        console.log('No Refresh Needed.');
        res.status(302);
        res.setHeader('Access-Control-Allow-Origin', req.header('Origin'));
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        // res.redirect(process.env.FRONTEND_URI);
        return res.status(200).json({
            success: true,
            redirectUrl: '/'
        });
    }
}, refreshAccessToken(client_id, client_secret), async (req, res, next) => {
    try {
        console.log("Relogged in.");
        res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URI);
        res.status(200);
        // res.redirect(`${process.env.FRONTEND_URI}/${req.params.id}`);
        return res.status(200).json({
            success: true,
            redirectUrl: `/${req.params.id}`
        });
    }
    catch (err) {
        console.log(err);
    }
});
app.get('/auth/is-logged-in', async (req, res, next) => {
    try {
        if (req.cookies.refresh_token) {
            const profileRes = await fetch('https://api.spotify.com/v1/me', {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + req.cookies.access_token },
            });
            const profileData = await profileRes.json();
            if (profileRes.status === 200) {
                res.send(profileData.id);
                console.log(`${profileData.id} is already logged in.\n\tLogging them back in.`);
                res.status(200);
                res.send(profileData.id);
            }
            else if (profileRes.status === 401) {
                next();
            }
        }
        else {
            res.send('');
        }
    }
    catch (err) {
        console.log(err);
    }
}, refreshAccessToken(client_id, client_secret), (req, res) => {
    res.send({
        redirectUrl: '/'
    });
});
app
    .use('/api', spotifyRoutes)
    .use('/api', friendRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
//# sourceMappingURL=server.js.map