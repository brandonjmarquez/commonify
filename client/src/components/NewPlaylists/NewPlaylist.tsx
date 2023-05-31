import axios from "axios";
import { useEffect, useState } from "react";

interface Props {
  newPlaylists: {name: string, playlist: any}[];
  setResponseMessage: Function;
}

const app = axios.create({
  withCredentials: true
})

const NewPlaylists = (props: Props) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<{name: string, playlist: any}>(props.newPlaylists[0]);

  const savePlaylist = async () => {
    try {
      const createPlaylistRes = await app.post(`${process.env.REACT_APP_BACKEND}/api/create-playlist/${window.location.pathname.substring(1)}`, {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
        },
        name: selectedPlaylist.name,
        selectedPlaylist: selectedPlaylist,
        'withCredentials': true,
      });
      const { data } = await createPlaylistRes;

      props.setResponseMessage(data.message);
      setTimeout(() => props.setResponseMessage(""), 4000);

    } catch(err) {
      console.error(err)
    }
  }

  return (
    <>
      <div>
        {props.newPlaylists.map((newPlaylist: any, index: number) => 
          <button 
            key={index} 
            type="button" 
            className="bg-white hover:bg-zinc-800 active:bg-zinc-700 hover:text-white outline rounded-md m-1 w-full"
            onClick={() => setSelectedPlaylist(newPlaylist)}
          >{newPlaylist.name}</button>
        )}
      </div>
      <div className="h-96 overflow-scroll scrollbar-thin scrollbar-track-none scrollbar-thumb-rounded-md scrollbar-thumb-white bg-[#121212] text-white rounded">
        {selectedPlaylist.playlist.map((track: any, index: number) => {
          if(!track.is_local) {
            return (
              <div key={index} className="flex flex-row m-1">
                <img src={track.album.images[0].url} width="60px"></img>
                <div className="my-auto mx-1">
                  <p>{track.name}</p>
                </div>
              </div>
            )
          }
        })}
      </div>
      <div>
        <button className="bg-white hover:bg-zinc-800 active:bg-zinc-700 hover:text-white outline rounded-md m-1" onClick={savePlaylist}>Save Playlist</button>
      </div>
    </>
  )
}

export default NewPlaylists;