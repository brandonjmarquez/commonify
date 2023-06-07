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
          'Access-Control-Allow-Origin': `${process.env.REACT_APP_FRONTEND}`,
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
    <div className="flex flex-col md:grid md:grid-cols-3 m-10 md:m-0">
      <div className="flex flex-col justify-start items-center h-48 overflow-scroll scrollbar-thin scrollbar-track-none scrollbar-thumb-rounded-md scrollbar-thumb-white bg-[#121212] text-white rounded outline outline-[#1DB954] m-1">
        {props.newPlaylists.map((newPlaylist: any, index: number) => 
          <button 
            key={index} 
            type="button" 
            className="bg-white hover:bg-zinc-800 active:bg-zinc-700 text-black hover:text-white outline rounded-md m-1 w-5/6 h-max"
            onClick={() => setSelectedPlaylist(newPlaylist)}
          >{newPlaylist.name}</button>
        )}
      </div>
      <div className="h-96 overflow-scroll scrollbar-thin scrollbar-track-none scrollbar-thumb-rounded-md scrollbar-thumb-white bg-[#121212] text-white rounded m-1">
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
      <div className="self-center md:self-auto m-1">
        <button className="bg-white hover:bg-zinc-800 active:bg-zinc-700 hover:text-white outline rounded-md m-1" onClick={savePlaylist}>Save Playlist</button>
      </div>
    </div>
  )
}

export default NewPlaylists;