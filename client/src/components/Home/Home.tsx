import axios from "axios";
import { useEffect } from "react";

const Home = () => {

  useEffect(() => {
    (async () => {
      try {
        var uri = `http://localhost:3001/auth/is-logged-in`
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
        
        const playlists = await axios.get(uri, options)
        .then((res) => {if(res.data.length > 0) window.location.replace(`${window.location.href}${res.data}`)});
      } catch(err) {
        console.error(err);
      }
    })()
  }, []);

  return (
    <>
      <button onClick={ () => window.open('http://localhost:3001/auth/login', '_self') }>Log In</button>
    </>
  );
}

export default Home;