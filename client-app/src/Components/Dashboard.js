import { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../Hooks/useAuth";
import { Container, Form } from "react-bootstrap";
import TrackSearchResult from './TrackSearchResult';
import Player from "./Player";


const SpotifyWebApi = require("spotify-web-api-node");
const spotifyApi = new SpotifyWebApi({
  clientId: "a59189441a2b410b98f34db93192b2b5",
});

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();
  const [lyrics, setLyrics] = useState("");

  function chooseTrack(track){
    setPlayingTrack(track)
    setSearch('')
    setLyrics("")
  }

  //ACCESS TOKEN useEffect
  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

  //SEARCH useEffect
  useEffect(() => {
    if (!search) return setSearchResults([]);
    if (!accessToken) return;
    let cancel = false;

    spotifyApi.searchTracks(search).then((res) => {
      if (cancel) return;
      setSearchResults(
        res.body.tracks.items.map((track) => {
          const smallestAlbumImage = track.album.images.reduce(
            (smallest, image) => {
              if (image.height < smallest.height) return image;
              return smallest;
            },
            track.album.images[0]
          ); //get smallest image
          return {
            artist: track.artists[0].name,
            uri: track.uri,
            title: track.name,
            albumImageUrl: smallestAlbumImage.url,
          };
        })
      );
    });
    return () => (cancel = true);//CANCEL PREVIOUS REQUEST WHEN USER KEEP TYPING (~SEND ANOTHER REQUEST)
  }, [search, accessToken]);

  //LYRICS useEffect
  useEffect(() => {
    if(!playingTrack) return
      axios.get('http://localhost:3001/lyrics',{
        params:{
          track:playingTrack.title,
          artist: playingTrack.artist
        }
      }).then(res => {
        setLyrics(res.data.lyrics)
      })

  },[playingTrack])

  return (
    <Container className="d-flex flex-column py-2" style={{ height: "100vh",}}>
      {/*SEARCH BOX*/}
      <Form.Control
        type="search"
        placeholder="Search Songs/Artists"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/*SEARCH RESULT*/}
      <div className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
        {searchResults.map(track => (
          <TrackSearchResult track={track} key={track.uri} chooseTrack={chooseTrack}/>
        ))}
        {playingTrack!= null && playingTrack!= '' && (
          <div className="text-center" style={{whiteSpace: "pre"}}>
            {lyrics}
          </div>
        )}
      </div>
      <div><Player accessToken={accessToken} trackUri={playingTrack?.uri}/></div>
    </Container>
  );
}
