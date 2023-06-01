import { useEffect } from "react";
import Playlist from "../Playlist/Playlist";

interface Props {
  playlists: any
  selectedPlaylists: string[];
  selectedPlaylistsNames: string[];
  setSelectedPlaylistsHandler: Function;
}

const PlaylistList = (props: Props) => {
  
  return (
    <>
    {props.playlists ?
      <div className="h-96 overflow-scroll scrollbar-thin scrollbar-track-none scrollbar-thumb-rounded-md scrollbar-thumb-white bg-[#121212] text-white rounded outline outline-[#1DB954] m-1">
        {props.playlists.map((playlist: any, index: number) => 
          <Playlist key={index} playlist={playlist} selectedPlaylists={props.selectedPlaylists} selectedPlaylistsNames={props.selectedPlaylistsNames} setSelectedPlaylistsHandler={props.setSelectedPlaylistsHandler}/>
        )}
      </div>
    : null}
    </>
  )
}

export default PlaylistList;