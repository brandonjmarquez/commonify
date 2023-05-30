import { cloneElement, useEffect, useState } from "react";

interface PlaylistProps {
  playlist: any;
  selectedPlaylistNames: string[];
  setSelectedPlaylistsHandler: Function;
}

const Playlist = (props: PlaylistProps) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const checkSelected = () => {
      props.selectedPlaylistNames.forEach((playlistName: string) => {
        // console.log(playlistName , props.playlist.name);
        if(playlistName === props.playlist.name) {
          setActive(true);
          return true;
        }
      })
      setActive(false);
      return false;
    }
    if(props.selectedPlaylistNames.length === 0) setActive(false);
    // console.log(checkSelected());
    // if(!checkSelected()) {
    //   setActive(false);
    // }
  }, [props.selectedPlaylistNames]);

  return (
    <button className={`block w-full${active ? ' bg-zinc-700' : ' hover:bg-zinc-800'}`} onClick={() => {
      props.setSelectedPlaylistsHandler({id: props.playlist.id, name: props.playlist.name})
      setActive(!active);
    }}>
      <div className="flex flex-row m-1">
        <img src={props.playlist.images[0].url} width="60px"></img>
        <div className="my-auto mx-1">
          <p>{props.playlist.name}</p>
        </div>
      </div>
    </button>
  )
}

export default Playlist;