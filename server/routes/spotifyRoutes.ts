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

  .post('/merge-playlists', async (req: any, res: any) => { 
    try {
      if(req.body.selectedPlaylists.length < 2) {
        res.status(400)
        res.send({message: "Please select at least two playlists."})
      } else {
        let mergedPlaylist: any = [];
        let playlistName = '';
        console.log(req.body.selectedPlaylists);
        for (const playlistId of req.body.selectedPlaylists){
          const playlistRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + req.session.access_token, 'Content-Type':'application/json' },
          });
          const data = await playlistRes.json();
          const { items } = data.tracks;
          const tracks = items.map((track: any) => track.track)

          mergedPlaylist = [...mergedPlaylist, ...tracks];
        }

        mergedPlaylist = mergedPlaylist.filter((track: any) => !track.is_local)
        for(const name of req.body.selectedPlaylistsNames) {
          playlistName += `${name} + `
        }
        res.status(201);
        res.send({name: playlistName.substring(0, playlistName.length - 3), playlist: mergedPlaylist})
      }
    } catch(err) {

    }
  })

  .post('/compare-playlists', async (req: any, res: any) => {
    try {
      if(req.body.selectedPlaylists.length !== 2) {
        res.status(400);
        res.send({message: "Please select two playlists."});
      } else {
        let playlistContent: any = [];
        for (const playlistId of req.body.selectedPlaylists){
          const playlistRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + req.session.access_token, 'Content-Type':'application/json' },
          });
          const data = await playlistRes.json();
          const { items } = data.tracks;
          const tracks = items.map((track: any) => track.track)

          playlistContent.push(tracks)
        }

        const longerPlaylist = playlistContent[0].length > playlistContent[1].length ? 0 : 1;
        const shorterPlaylist = playlistContent[0].length > playlistContent[1].length ? 1 : 0;
        let commonTracks: any = [];

        playlistContent[shorterPlaylist].forEach((trackShorter: any) => {
          playlistContent[longerPlaylist].forEach((trackLonger: any) => {
            if(JSON.stringify(trackLonger.artists) === JSON.stringify(trackShorter.artists) && trackLonger.name === trackShorter.name && !trackShorter.is_local && !trackLonger.is_local) {
              commonTracks.push(trackShorter);
            }
          })
        });

        res.status(201);
        res.send({name: `${req.body.selectedPlaylistsNames[0]} x ${req.body.selectedPlaylistsNames[1]}`, playlist: commonTracks, message: "Successfully compared playlists."});
      }
    } catch(err) {
      console.log(err)
    }
  })

  .post('/create-playlist/:id', async (req: any, res: any) => {
    try {
      console.log(req.body.selectedPlaylist);
      const uris: string[] = req.body.selectedPlaylist.playlist.map((track: any) => track.uri);
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
      
      for(var i = 0; i < uris.length; i += 100) {
        const urisSlice = uris.slice(i, i + 100)
        const addTracksRes = await fetch(`https://api.spotify.com/v1/playlists/${data.id}/tracks`, {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + req.session.access_token ,'Content-Type':'application/json'},
          body: JSON.stringify({uris: urisSlice, position: i})
        })
      }
      res.status(200);
      res.send({message: "Successfully created the playlist."});
    } catch(err) {
      console.log(err);
    }
  })

export default spotifyRoutes;