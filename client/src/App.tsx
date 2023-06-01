import { useEffect, useState } from 'react';
import axios from 'axios';
import { AiFillCopy } from 'react-icons/ai';
import './App.css';
import PlaylistList from './components/PlaylistList/PlaylistList';
import { useParams } from "react-router-dom";
import NewPlaylists from './components/NewPlaylists/NewPlaylist';
import PlaylistLists from './components/PlaylistsLists/PlaylistLists';

const app = axios.create({
  withCredentials: true
})

const App = () => {
  const [playlists, setPlaylists] = useState<any>([]);
  const [friendPlaylists, setFriendPlaylists] = useState<any>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const [selectedPlaylistsNames, setSelectedPlaylistsNames] = useState<string[]>([]);
  const [newPlaylists, setNewPlaylists] = useState<{name: string, playlist: any}[]>([]);
  const [code, setCode] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [lastToken, setLastToken] = useState(new Date());
  let { id } = useParams(); 

  useEffect(() => {
    console.log(new Date().valueOf() - lastToken.valueOf());
    if (new Date().valueOf() - lastToken.valueOf() > 3600000) {
      relogin();
    }
  });

  useEffect(() => {
    const getPlaylists = async () => {
      try {
        const playlistsRes = await axios.get(`${process.env.REACT_APP_BACKEND}/api/get-playlists/${id}`, {
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
        console.log(data);
        if(data.playlists) {
          setPlaylists(data.playlists)
          
          return data.items;
        } else {
          setResponseMessage(data.message)
        }
      } catch(err) {
        relogin();
        console.log(2);
        console.error(err);
      }
    }
    getPlaylists();
    setCode(window.location.hash.substring(1));
  }, []);

  useEffect(() => {
    const getFriendPlaylists = async () => {
      try {
        const codeRes = await axios.get(`${process.env.REACT_APP_BACKEND}/api/get-friend-playlists/${code}`);
        const { data } = codeRes;
        console.log(code);
        setFriendPlaylists(data.playlists);
      } catch(err) {
        console.error(err);
      }
    }
    if(code.length > 0) {
      getFriendPlaylists()
    }
  }, [code]);

  const relogin = async () => {
    try {
      const authRes = await axios.get(`${process.env.REACT_APP_BACKEND}/auth/relogin`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': true
        },
        'withCredentials':true
      });
      setLastToken(new Date());
      window.location.reload();
    } catch(err) {
      console.error(err);
    }
  };

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

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = [...new FormData(e.target as HTMLFormElement)]
      .reduce((a: any, [key, value]: any) => {
        a[key] = value;
        return a;
      }, {});
    window.location.hash = formData.code;
    setCode(formData.code);
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
      setNewPlaylists((newPlaylists: any) => [...newPlaylists, {name: data.name, playlist: data.playlist}]);
      clearSelected();
    } catch(err: any) {
      setResponseMessage(err.response.data.message);
      setTimeout(() => setResponseMessage(""), 4000);
    }
  }

  const clearSelected = () => {
    setSelectedPlaylists([]);
    setSelectedPlaylistsNames([]);
  }

  return (
    <>
      <p>Your Code: <span id="my-code">{window.location.pathname.substring(1)}</span>
        <button onClick={() => {
          // Get the text field
          var copyText = document.getElementById("my-code");

          // Copy the text inside the text field
          navigator.clipboard.writeText(copyText!.innerHTML);

        }}><AiFillCopy /></button>
      </p>
      <form onSubmit={submitHandler}>
        <label>Enter Code: </label>
        <input type="text" name="code"></input>
        <button type="submit" className="bg-white hover:bg-zinc-800 active:bg-zinc-700 hover:text-white outline rounded-md m-1">Connect</button>
      </form>
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
      <PlaylistLists code={code} playlists={playlists} friendPlaylists={friendPlaylists} selectedPlaylists={selectedPlaylists} selectedPlaylistsNames={selectedPlaylistsNames} setSelectedPlaylistsHandler={setSelectedPlaylistsHandler}/>
      {newPlaylists.length > 0 ? <div className="grid grid-cols-3">
        <NewPlaylists newPlaylists={newPlaylists} setResponseMessage={setResponseMessage} />
      </div> : null}
    </>
  );
}

export default App;
