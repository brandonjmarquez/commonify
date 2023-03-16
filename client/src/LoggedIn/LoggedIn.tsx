import React from 'react';

interface PlaylistListProps {
  playlists: any
}

const PlaylistList = (props: PlaylistListProps) => {
  
  return <>
    <div>
      <span>{JSON.stringify(props.playlists)}</span>
    </div>
  </>
}

export default PlaylistList;