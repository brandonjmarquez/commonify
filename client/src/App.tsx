import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import PlaylistList from './components/PlaylistList/PlaylistList';
import { useParams } from "react-router-dom";
import NewPlaylists from './components/NewPlaylists/NewPlaylist';
import PlaylistLists from './components/PlaylistsLists/PlaylistLists';

const app = axios.create({
  withCredentials: true
})

const App = () => {
  const loggedIn = useState(false);
  const [playlists, setPlaylists] = useState<any>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const [selectedPlaylistsNames, setSelectedPlaylistsNames] = useState<string[]>([]);
  const [newPlaylists, setNewPlaylists] = useState<{name: string, playlist: any}[]>([]);
  const [code, setCode] = useState(0);
  const [responseMessage, setResponseMessage] = useState('');
  let { id } = useParams(); 

  useEffect(() => {
    const relogin = async (count: number) => {
      try {
        const authRes = await axios.get('http://localhost:3001/auth/relogin', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Credentials': true
          },
          'withCredentials':true
        })
        const { data } = authRes;

        if(authRes.status === 200 && count > 0) {
          setResponseMessage("No Playlists Found!")
        } else {
          getPlaylists(count++);
        }
      } catch(err) {
        console.error(err);
      }
    };

    const getPlaylists = async (count: number) => {
      try {
        const playlistsRes = await axios.get(`http://localhost:3001/api/get-playlists/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
          },
          'withCredentials':true
        })
        const { data } = playlistsRes;

        if(data.items) {
          setPlaylists(data.items)
          return data.items;
        } else {
          relogin(count);
        }
      } catch(err) {
        console.error(err);
      }
    }
    getPlaylists(0);
  }, []);

  useEffect(() => {
    if(selectedPlaylists.length > 0)
      (async () => {
        try {
          
        } catch(err) {
          console.error(err);
        }
      })()
  }, [selectedPlaylists]);

  useEffect(() => {
    if(code.toString().length === 5) {
      (async () => {
        try {

        } catch(err) {

        }
      })()
    }
  }, [code]);

  const setSelectedPlaylistsHandler = (playlistInfo: {id: string, name: string}) => {
    if(selectedPlaylists.includes(playlistInfo.id) && selectedPlaylistsNames.includes(playlistInfo.name)) {
      setSelectedPlaylists((selectedPlaylists) => {
        let state = [...selectedPlaylists];
        state.splice(selectedPlaylists.indexOf(playlistInfo.id), 1);
        return state;
      });
      setSelectedPlaylistsNames((selectedPlaylistsNames) => {
        let state = [...selectedPlaylistsNames];
        state.splice(selectedPlaylistsNames.indexOf(playlistInfo.name), 1);
        return state;
      })
    } else {
      setSelectedPlaylists((selectedPlaylists) => [...selectedPlaylists, playlistInfo.id])
      setSelectedPlaylistsNames((selectedPlaylistsNames) => [...selectedPlaylistsNames, playlistInfo.name])
    }
  }

  const mergePlaylists = async () => {
    try {
      const playlistRes = await app.post(`${process.env.REACT_APP_BACKEND}/api/merge-playlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
        },
        selectedPlaylists: selectedPlaylists,
        selectedPlaylistsNames: selectedPlaylistsNames,
        'withCredentials':true
      });
      const { data } = playlistRes;

      setResponseMessage(data.message);
      setTimeout(() => setResponseMessage(""), 4000);
      setNewPlaylists((newPlaylists: any) => [...newPlaylists, {name: data.name, playlist: data.playlist}]);
      clearSelected();
    } catch(err: any) {
      setResponseMessage(err.response.data.message);
      setTimeout(() => setResponseMessage(""), 4000);
    }
  }

  const comparePlaylists = async () => {
    try {
      const playlistRes = await app.post(`${process.env.REACT_APP_BACKEND}/api/compare-playlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
        },
        selectedPlaylists: selectedPlaylists,
        selectedPlaylistsNames: selectedPlaylistsNames,
        'withCredentials':true
      });
      const { data } = playlistRes;

      setResponseMessage(data.message);
      setTimeout(() => setResponseMessage(""), 4000);
      setNewPlaylists((newPlaylists: any) => [...newPlaylists, {name: data.name, playlist: data.playlist}])
      clearSelected();
    } catch(err: any) {
      setResponseMessage(err.response.data.message);
      setTimeout(() => setResponseMessage(""), 4000);
    }
  }

  const clearSelected = () => {
    setSelectedPlaylists([]); 
    setSelectedPlaylistsNames([])
  }

  return (
    <>
      <p>Your Code: </p>
      <label>Enter Code: </label>
      <input type="number" onChange={(e) => setCode(parseInt(e.target.value))}></input>
      <div>
        <button type="button" className="bg-white hover:bg-zinc-800 active:bg-zinc-700 hover:text-white outline rounded-md m-1" onClick={mergePlaylists}>Merge Playlists</button>
        <button type="button" className="bg-white hover:bg-zinc-800 active:bg-zinc-700 hover:text-white outline rounded-md m-1" onClick={comparePlaylists}>Compare Playlists</button>
        <button type="button" className="bg-white hover:bg-zinc-800 active:bg-zinc-700 hover:text-white outline rounded-md m-1" onClick={clearSelected}>Clear Selected</button>
      </div>
      {responseMessage.length > 0 ? <p className="text-red-500">{responseMessage}</p> : <br></br>}
      {selectedPlaylistsNames.length > 0 ? 
        selectedPlaylistsNames.map((playlistName: string, index: number) => 
          <button key={index} className="bg-white hover:bg-zinc-800 active:bg-zinc-700 hover:text-white outline rounded-md m-2 px-2"
          onClick={() => setSelectedPlaylistsHandler({id: selectedPlaylists[selectedPlaylistsNames.indexOf(playlistName)], name: playlistName})}
          >
            {playlistName}
          </button>
        ) : <br></br>
      }
      <PlaylistLists code={code} playlists={playlists} selectedPlaylists={selectedPlaylists} selectedPlaylistsNames={selectedPlaylistsNames} setSelectedPlaylistsHandler={setSelectedPlaylistsHandler}/>      
      {newPlaylists.length > 0 ? <div className="grid grid-cols-3">
        <NewPlaylists newPlaylists={newPlaylists} setResponseMessage={setResponseMessage} />
      </div> : null}
    </>
  );
}

export default App;
