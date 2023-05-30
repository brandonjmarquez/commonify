import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import PlaylistList from './components/PlaylistList/PlaylistList';
import { useParams } from "react-router-dom";
import NewPlaylists from './components/NewPlaylists/NewPlaylist';


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
          // const selected = await axios.get(`http://localhost:3001/api/selected-playlists/${selectedPlaylists}`, {
          //   method: 'GET',
          //   headers: {
          //     'Content-Type': 'application/json',
          //     'cess-Control-Allow-Origin': 'http://localhost:3002',
          //     'Access-Control-Allow-Credentials': true
          //   },
          //   'withCredentials':true
          // });
          // console.log(selected.data)
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
    
  }

  const comparePlaylists = async () => {
    try {
      if(selectedPlaylists.length !== 2) {
        setResponseMessage("Please select two playlists.")
        setTimeout(() => setResponseMessage(""), 4000)
      } else {
        let playlistContent: any = [];
        for (const playlist of selectedPlaylists){
          const playlistRes = await axios.get(`${process.env.REACT_APP_BACKEND}/api/selected-playlists/${playlist}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': 'http://localhost:3000',
              'Access-Control-Allow-Credentials': true,
              'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
            },
            'withCredentials':true
          });
          const { data } = playlistRes;
          const tracks = data.map((track: any) => track.track)

          playlistContent.push(tracks)
        }
        const longerPlaylist = playlistContent[0].length > playlistContent[1].length ? 0 : 1;
        const shorterPlaylist = playlistContent[0].length > playlistContent[1].length ? 1 : 0;
        let commonTracks: any = [];

        playlistContent[shorterPlaylist].forEach((trackShorter: any) => {
          playlistContent[longerPlaylist].forEach((trackLonger: any) => {
            if(JSON.stringify(trackLonger.artists) === JSON.stringify(trackShorter.artists) && trackLonger.name === trackShorter.name) {
              commonTracks.push(trackShorter);
            }
          })
        });

        if(commonTracks.length > 0) {
          setNewPlaylists((newPlaylists: any) => [...newPlaylists, {name: `${selectedPlaylistsNames[0]} x ${selectedPlaylistsNames[1]}`, playlist: commonTracks}])
        }
      }
      clearSelected();
    } catch(err) {
      console.error(err);
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
      {selectedPlaylistsNames.length > 0 ? <p className="text-red-500">{[selectedPlaylistsNames ,selectedPlaylists]}</p> : <br></br>}
      <div className="grid grid-cols-2">
        <PlaylistList playlists={playlists} selectedPlaylistNames={selectedPlaylistsNames} setSelectedPlaylistsHandler={setSelectedPlaylistsHandler}/>
        <PlaylistList playlists={playlists} selectedPlaylistNames={selectedPlaylistsNames} setSelectedPlaylistsHandler={setSelectedPlaylistsHandler}/>
      </div>
      {newPlaylists.length > 0 ? <div className="grid grid-cols-3">
        <NewPlaylists newPlaylists={newPlaylists} setResponseMessage={setResponseMessage} />
      </div> : null}
    </>
  );
}

export default App;
