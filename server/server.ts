import express from 'express';
const app = express();
import mysql from 'mysql2';
// import request from 'request';
import fetch from 'node-fetch';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import querystring from 'node:querystring';
import pool from './util/dbconfig.js';
import spotifyRoutes from './routes/spotifyRoutes.js';
const PORT = process.env.server_port || 3001;

var client_id = 'a87c75bf1e7445e4b565d6e84ff20c5b'; // Your client id
var client_secret = '0ebced300ac548b0beaa19516e25d55c'; // Your secret
var redirect_uri = 'http://localhost:3001/callback'; // Your redirect uri

app.use(cors())
   .use('/api', spotifyRoutes);

const getAll = async () => {
  const sql = 'SELECT * FROM test_table';
  const [rows] = await pool.promise().query(sql);
  console.log(rows)
}

getAll();

var generateRandomString = function(length: number) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

app.use(cors())
   .use(cookieParser());

app.get('/login', function(req: any, res: any) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  
  // your application requests authorization
  var scope = 'user-read-private user-read-email';

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

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

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
    var authOptions = {
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

    let authRes = await fetch('https://accounts.spotify.com/api/token', authOptions);
    console.log(authRes)
    const data: any = await authRes.json();
    console.log(data);
    if(authRes.status === 200) {
      var access_token = data.access_token,
          refresh_token = data.refresh_token;

      console.log(access_token)
      var options = {
        url: 'https://api.spotify.com/v1/me',
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
      };
      
      // use the access token to access the Spotify Web API
      const profileRes = await fetch('https://api.spotify.com/v1/me', options);
      const profileData: any = await profileRes.json();
      const id = profileData.id;
      // function(error: any, response: any, body: any) {
      //   console.log(body.id);
      //   var options2 = {
      //     url: `https://api.spotify.com/v1/users/${body.id}/playlists`,
      //     headers: { 'Authorization': 'Bearer ' + access_token },
      //     json: true
      //   };
      // })
      //   // var options3 = {
      //   //   url: `https://api.spotify.com/v1/playlists/0nu7ELklnGluV5PbOBl4D0/tracks`,
      //   //   headers: { 'Authorization': 'Bearer ' + access_token },
      //   //   json: true
      //   // };

      //   // request.get(options2, (error: any, res: any, body: any) => {
      //   //   console.log(body.items[0])
      //   //   console.log(body)
      //   //   res.send(body)
      //   // })
      // });

      // we can also pass the token to the browser to make requests from there
      res.redirect('http://localhost:3000/' + id);
      // res.send(body)
    } else {
      res.redirect('/#' +
        querystring.stringify({
          error: 'invalid_token'
        }));
    }
  }
});



app.get('/playlists/:id/', async (req: any, res: any) => {
  try {
    const options = {
      headers: { 'Authorization': 'Bearer ' + 'access_token' },
      json: true
    };

    // var options3 = {
    //   url: `https://api.spotify.com/v1/playlists/0nu7ELklnGluV5PbOBl4D0/tracks`,
    //   headers: { 'Authorization': 'Bearer ' + await client.get('access_token') },
    //   json: true
    // };

    const response = await fetch(`https://api.spotify.com/v1/users/${req.params.id}/playlists`, options);
    const data = await response.json()
    console.log(data)
      
    
    res.status(200);
    res.send(data);
    console.log('hello2')
  } catch(err) {
    console.error(err)
  }
  

})



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`)
})