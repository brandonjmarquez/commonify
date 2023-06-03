import { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import axios from 'axios';
import querystring from 'query-string';
import { AiFillCopy } from 'react-icons/ai';
import NewPlaylists from './components/NewPlaylists/NewPlaylists';
import PlaylistLists from './components/PlaylistsLists/PlaylistLists';
import './App.css';

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
  const { id } = useParams(); 

  useEffect(() => {
    if (new Date().valueOf() - lastToken.valueOf() > 3600000) {
      relogin();
    }
  });

  useEffect(() => {
    const getPlaylists = async () => {
      try {
        const playlistsRes = await app.get(`${process.env.REACT_APP_BACKEND}/api/get-playlists/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': `${process.env.REACT_APP_FRONTEND}`,
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
            // 'Location': id
          },
          'withCredentials':true
        });
        const { data } = playlistsRes;

        if(data.playlists) {
          setPlaylists(data.playlists);
          
          return data.items;
        } else {
          setResponseMessage(data.message);
        }
      } catch(err) {
        relogin();
        console.error(err);
      }
    }
    const code = querystring.parse(window.location.search).code ? querystring.parse(window.location.search).code?.toString() : '';
    getPlaylists();
    setCode(code!);
  }, []);

  useEffect(() => {
    const getFriendPlaylists = async () => {
      try {
        const codeRes = await app.get(`${process.env.REACT_APP_BACKEND}/api/get-friend-playlists/${code}`);
        const { data } = codeRes;

        setFriendPlaylists(data.playlists);
      } catch(err) {
        console.error(err);
      }
    }
    if(code.length > 0) {
      getFriendPlaylists();
    }
  }, [code]);

  const relogin = async () => {
    try {
      const authRes = await app.get(`${process.env.REACT_APP_BACKEND}/auth/relogin`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': `${process.env.REACT_APP_FRONTEND}`,
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
      setSelectedPlaylists((selectedPlaylists) => [...selectedPlaylists, playlistInfo.id]);
      setSelectedPlaylistsNames((selectedPlaylistsNames) => [...selectedPlaylistsNames, playlistInfo.name]);
    }
  }

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    // e.preventDefault();

    const formData = [...new FormData(e.target as HTMLFormElement)]
      .reduce((a: any, [key, value]: any) => {
        a[key] = value;
        return a;
      }, {});
    setCode(formData.code);
  }

  const mergePlaylists = async () => {
    try {
      const playlistRes = await app.post(`${process.env.REACT_APP_BACKEND}/api/merge-playlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': `${process.env.REACT_APP_FRONTEND}`,
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
          'Access-Control-Allow-Origin': `${process.env.REACT_APP_FRONTEND}`,
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
      <div className="sticky top-0 bg-[#535353]">
        <label htmlFor="my-code" className="text-white">Your Code: </label>
        <input id="my-code" className="bg-[#535353] text-white" value={window.location.pathname.substring(1)} readOnly></input>
          <button className="bg-white text-black hover:bg-zinc-800 active:bg-zinc-700 hover:text-white outline rounded-sm m-1"
            onClick={async () => {
              var copyText: HTMLInputElement = document.querySelector("#my-code")!;

              // Select the text field
              copyText!.select();
              copyText!.setSelectionRange(0, 99999); // For mobile devices

              // Copy the text inside the text field
              await navigator.clipboard.writeText('11111');
            }
          }><AiFillCopy /></button>
        <form className="" onSubmit={submitHandler}>
          <label className="text-white">Enter Code: </label>
          <input type="text" name="code" defaultValue={code}></input>
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
      </div>
      <PlaylistLists code={code} playlists={playlists} friendPlaylists={friendPlaylists} selectedPlaylists={selectedPlaylists} selectedPlaylistsNames={selectedPlaylistsNames} setSelectedPlaylistsHandler={setSelectedPlaylistsHandler}/>
      {newPlaylists.length > 0 ? <NewPlaylists newPlaylists={newPlaylists} setResponseMessage={setResponseMessage} /> : null}
    </>
  );
}

export default App;
