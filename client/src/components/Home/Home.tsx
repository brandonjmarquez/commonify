import axios from "axios";
import { useEffect } from "react";

const Home = () => {

  useEffect(() => {
    (async () => {
      try {
        var uri = `${process.env.REACT_APP_BACKEND}/auth/is-logged-in`
        var options = {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'http://localhost:3002',
            'Access-Control-Allow-Credentials': true
          },
          'withCredentials': true
        }
        
        const playlists = await axios.get(uri, options);
        const { data } = playlists
        if(data.length > 0) 
          window.location.replace(`${window.location.href}${data}`);
      } catch(err) {
        console.error(err);
      }
    })()
  }, []);

  return (
    <>
      <button onClick={ () => window.open(`${process.env.REACT_APP_BACKEND}/auth/login`, '_self') }>Log In</button>
    </>
  );
}

export default Home;