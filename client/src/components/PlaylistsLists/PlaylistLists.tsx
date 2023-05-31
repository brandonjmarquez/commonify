import { useEffect, useState } from "react";
import PlaylistList from "../PlaylistList/PlaylistList";

interface Props {
  code: number;
  playlists: any
  selectedPlaylists: string[];
  selectedPlaylistsNames: string[];
  setSelectedPlaylistsHandler: Function;
}

const PlaylistLists = (props: Props) => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    
  }, [props.code]);

  return (
    <div className="grid grid-cols-2">
      <PlaylistList playlists={props.playlists} selectedPlaylists={props.selectedPlaylists} selectedPlaylistsNames={props.selectedPlaylistsNames} setSelectedPlaylistsHandler={props.setSelectedPlaylistsHandler}/>
      <PlaylistList playlists={props.playlists} selectedPlaylists={props.selectedPlaylists} selectedPlaylistsNames={props.selectedPlaylistsNames} setSelectedPlaylistsHandler={props.setSelectedPlaylistsHandler}/>
    </div>
  )
}

export default PlaylistLists;