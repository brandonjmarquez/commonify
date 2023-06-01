import { cloneElement, useEffect, useState } from "react";

interface PlaylistProps {
  playlist: any;
  selectedPlaylists: string[];
  selectedPlaylistsNames: string[];
  setSelectedPlaylistsHandler: Function;
}

const Playlist = (props: PlaylistProps) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if(props.selectedPlaylists.indexOf(props.playlist.id) !== -1) setActive(true)
    else setActive(false)
  }, [props.selectedPlaylists]);

  return (
    <button className={`block w-full${active ? ' bg-zinc-700' : ' hover:bg-zinc-800'} text-left`} onClick={() => {
      props.setSelectedPlaylistsHandler({id: props.playlist.id, name: props.playlist.name})
      setActive(!active);
    }}>
      {props.playlist.images.length > 0 ? (
      <div className="flex flex-row m-1">
        <img src={props.playlist.images[0].url} className="object-cover w-[60px] h-[60px]" width="60px" height="60px"></img>
        <div className="my-auto mx-1">
          <p>{props.playlist.name}</p>
        </div>
      </div>) : null}
    </button>
  )
}

export default Playlist;