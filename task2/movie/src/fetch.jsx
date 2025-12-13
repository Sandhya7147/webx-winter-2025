import { useState, useEffect } from 'react';
import MovieCard from './MovieCard.jsx';

export async function fetchAPI(query,type){
  try{
    console.log("before api key");
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    console.log("fetch.jsx");
    const BASE_URL="https://api.themoviedb.org/3/";
    let URL;
      
    if (type==='popular'){
      URL=`${BASE_URL}movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
    }
    else if(type==='search'){
      URL=`${BASE_URL}search/movie?api_key=${API_KEY}&query=${query}`;
    }
    else if(type==='idsearch'){
      URL=`${BASE_URL}movie/${query}?api_key=${API_KEY}`;
    }
              
    const response= await fetch(URL);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json();
    console.log(result);

    if(type==='idsearch'){
      return result;
    }
    else{
      return result.results;  
    }
    
  }catch(error){
    console.error(error);
    console.log(`${error.message}`);
  }
  
}

function FetchMovies(props){
  const [movies, setMovies] = useState([]);
  console.log("Inside FetchMovies func definition")

  async function inter(){
    try{
      let r= await fetchAPI(props.query,props.type);
      setMovies(r);
    }catch(error){
      console.error(error);
      console.log(`${error.message}`);
    }
  }
  useEffect(()=>{inter();}, [props.query,props.type]);
  
  const n=props.n;
  return(
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
    {movies.slice(0,n).map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
    </div>
    
  )

}
export default FetchMovies;