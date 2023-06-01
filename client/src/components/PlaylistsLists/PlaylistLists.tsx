import { useEffect, useState } from "react";
import PlaylistList from "../PlaylistList/PlaylistList";
import axios from "axios";

interface Props {
  code: string;
  playlists: any;
  friendPlaylists: any;
  selectedPlaylists: string[];
  selectedPlaylistsNames: string[];
  setSelectedPlaylistsHandler: Function;
}

const PlaylistLists = (props: Props) => {

  return (
    <div className="grid grid-rows-2 md:grid-cols-2 m-10 md:m-0">
      <PlaylistList playlists={props.playlists} selectedPlaylists={props.selectedPlaylists} selectedPlaylistsNames={props.selectedPlaylistsNames} setSelectedPlaylistsHandler={props.setSelectedPlaylistsHandler}/>
      <PlaylistList playlists={props.friendPlaylists} selectedPlaylists={props.selectedPlaylists} selectedPlaylistsNames={props.selectedPlaylistsNames} setSelectedPlaylistsHandler={props.setSelectedPlaylistsHandler}/>
    </div>
  )
}

export default PlaylistLists;