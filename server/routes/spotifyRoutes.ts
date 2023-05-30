import express from 'express';
import querystring from 'node:querystring';

const spotifyRoutes = express.Router();

spotifyRoutes
  .get('/get-playlists/:id', async (req: any, res: any) => {
    try {
      if(req.session.refresh_token) {
        const response = await fetch(`https://api.spotify.com/v1/users/${req.params.id}/playlists`, {
          headers: { 'Authorization': 'Bearer ' + req.session.access_token },
        });
        const data = await response.json()
        
        res.status(200);
        res.send(data);
      } else {
        res.status(200);
        res.redirect(`http://localhost:3002/${req.params.id}`)
      }
    } catch(err) {
      console.error(err)
    }
  })

  .get('/selected-playlists/:id', async (req: any, res: any) => {
    try {
      const response = await fetch(`https://api.spotify.com/v1/playlists/${req.params.id}`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + req.session.access_token, 'Content-Type':'application/json' },
      });
      const data: any = await response.json();
      const { items } = data.tracks;

      res.status(200);
      res.send(items);
    } catch(err) {
      console.log(err)
    }
  })

  .post('/create-playlist/:id', async (req: any, res: any) => {
    try {
      const scope = 'playlist-modify-public';
      const body = {
        name: req.body.name,
        description: 'Via commonify.',
        public: true,
      };
      const createPlaylistRes = await fetch(`https://api.spotify.com/v1/users/${req.params.id}/playlists`, {
        method: "POST",
        headers: { 'Authorization': 'Bearer ' + req.session.access_token ,'Content-Type':'application/json'},
        body: JSON.stringify(body)
      });
      const data = await createPlaylistRes.json();

      const addTracksRes = await fetch(`https://api.spotify.com/v1/playlists/${data.id}/tracks`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + req.session.access_token ,'Content-Type':'application/json'},
        body: JSON.stringify({uris: req.body.uris, position: 0})
      })
      res.status(200);
      res.send({message: "Successfully created the playlist."})
    } catch(err) {
      console.log(err);
    }
  })

export default spotifyRoutes;