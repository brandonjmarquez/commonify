import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './App.css';
import PlaylistList from './PlaylistList/PlaylistList';
const logo = require('./logo.svg');

const App = () => {
  const loggedIn = useState<boolean>(false);
  const id = useRef<string>('');
  const [playlists, setPlaylists] = useState<any>([]);

  useEffect(() => {
    console.log(playlists)
  }, [playlists]);

  useEffect(() => {
    (() => {
      var hashParams: any = {};
      var e: any, r = /([^&;=]+)=?([^&;]*)/g,
          q = window.location.hash.substring(1);
      while (e = r.exec(q)) {
         hashParams[e[1]] = decodeURIComponent(e[2]);
      }
      // localStorage.setItem('access_token', hashParams.access_token);
      // localStorage.setItem('refresh_token', hashParams.refresh_token);
      return hashParams;
    })()
    id.current = window.location.pathname.substring(1);
    // console.log(localStorage.getItem('access_token'));
    // console.log(localStorage.getItem('refresh_token'));
    console.log(id.current);
  }, []);

  return (
    <div>
      <div>
        <img src={logo} alt="logo"></img>
        <button onClick={ () => window.open('http://localhost:3001/login', '_self') }>Log In</button>
        <span> </span>
        <button
          onClick={async () => {
            var uri = `http://localhost:3001/playlists/${id.current}/`
            var options = {
              method: 'GET',
              mode: 'cors',
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
              }
            }
            
            const playlists = await axios.get(uri, options)
            .then((res) => setPlaylists(res.data.items))
          }}
        >
          Get Playlists
        </button>
        <PlaylistList playlists={playlists} />
      </div>
    </div>
  );
}

export default App;
