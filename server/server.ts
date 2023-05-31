import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cookieSession from 'cookie-session';
const app = express();
import mysql from 'mysql2';
import fetch from 'node-fetch';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import querystring from 'node:querystring';
import * as dotenv from 'dotenv';
dotenv.config();
import pool from './util/dbconfig.js';
import spotifyRoutes from './routes/spotifyRoutes.js';
import refreshAccessToken from './middlewares/refreshAccessToken.js'

const PORT = process.env.SERVER_PORT || 3001;
var client_id = process.env.client_id!; // Your client id
var client_secret = process.env.client_secret!; // Your secret
var redirect_uri = `${process.env.BACKEND_URI}/callback`; // Your redirect uri

const getAll = async () => {
  const sql = 'SELECT * FROM test_table';
  const [rows] = await pool.promise().query(sql);
  console.log(rows)
}
app.get("/", (req, res) => {
  // getAll();
  // req.session!.views = (req.session!.views || 0) + 1

  // console.log(req.session!.access_token, "hello")
  // res.end(req.session!.views + ' views');
  // return res.send("Session set")
});

var generateRandomString = function(length: number) {
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
    origin: process.env.FRONTEND_URI, 
    credentials: true,            //access-control-allow-credentials:true
  }))
  .use(cookieParser())
  .use(cookieSession({
    name: 'Brandon',
    keys: ['change_this'],
    maxAge: 24 * 60 * 60 * 1000,
    secure: false
  }))
  .use(express.urlencoded({ extended: true }))
  .use(express.json());

app.get('/auth/login', function(req: any, res: any) {
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

app.get('/callback', async (req: any, res: any) => {
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
  } else {
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
        'Authorization': 'Basic ' + (new (Buffer as any).from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    const authRes = await fetch('https://accounts.spotify.com/api/token', authOptions);
    // console.log(authRes)
    const data: any = await authRes.json();
    // console.log(data);
    if(authRes.status === 200) {
      const access_token = data.access_token,
          refresh_token = data.refresh_token;

      const options = {
        url: 'https://api.spotify.com/v1/me',
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + access_token },
      };
      
      // use the access token to access the Spotify Web API
      const profileRes = await fetch('https://api.spotify.com/v1/me', options);
      const profileData: any = await profileRes.json();
      const { id } = profileData;

      // we can also pass the token to the browser to make requests from there
      req.session.access_token = access_token;
      req.session.refresh_token = refresh_token;
      res.redirect(process.env.FRONTEND_URI + '/' + id);
    } else {
      res.redirect('/#' +
        querystring.stringify({
          error: 'invalid_token'
        }));
    }
  }
});

app.get('/auth/relogin', refreshAccessToken(client_id, client_secret), async (req: any, res: any, next) => {
  try {
    res.status(200);
    res.send();
  } catch(err) {
    console.log(err);
  }
})

app.get('/auth/is-logged-in', async (req: any, res: any, next) => {
  try {
    if(req.session.refresh_token) {
      const profileRes = await fetch('https://api.spotify.com/v1/me', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + req.session.access_token },
      });
      const profileData: any = await profileRes.json();

      if(profileRes.status === 200) {
        res.send(profileData.id)
      } else if(profileRes.status === 401) {
        next();
        const profileRes = await fetch('https://api.spotify.com/v1/me', {
          method: 'GET',
          headers: { 'Authorization': 'Bearer ' + req.session.access_token },
        });
        const profileData: any = await profileRes.json();

        res.send(profileData.id)
      }
    } else {
      res.send('')
    }
  } catch(err) {
    console.log(err);
  }
}, refreshAccessToken(client_id, client_secret));

app.use('/api', spotifyRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`)
})