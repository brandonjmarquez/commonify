import { useEffect } from "react";
import Playlist from "../Playlist/Playlist";

interface PlaylistListProps {
  playlists: any
  selectedPlaylistNames: string[];
  setSelectedPlaylistsHandler: Function;
}

const PlaylistList = (props: PlaylistListProps) => {
  
  return (
    <div className="h-96 overflow-scroll scrollbar-thin scrollbar-track-none scrollbar-thumb-rounded-md scrollbar-thumb-white bg-[#121212] text-white rounded">
      {props.playlists.map((playlist: any, index: number) => {
        if(index > 0)
          return <Playlist key={index} playlist={playlist} selectedPlaylistNames={props.selectedPlaylistNames} setSelectedPlaylistsHandler={props.setSelectedPlaylistsHandler}/>
      })}
    </div>
  )
}

export default PlaylistList;