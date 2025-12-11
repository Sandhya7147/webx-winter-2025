import React,{ useState, useEffect } from 'react';
import MovieCard from './MovieCard.jsx';

function App() {

  const [movies, setMovies] = useState([]);
  async function fetchMovies(){
    try{
      const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
      console.log("helloooo")
      //console.log(API_KEY); 
      const URL=`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;        
      const response= await fetch(URL);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const result = await response.json();
      console.log(result);
      setMovies(result.results);

    }catch(error){
      console.error(error);
      console.log(`${error.message}`);
    }
  }

  useEffect(() => {
    fetchMovies();
  }, []);

  return (

    <div className="bg-black min-h-screen p-11"> 
      
      <h1 className="text-6xl font-extrabold text-[#E50914] mt=5 mb-20 text-center">
        The Movie Explorer
      </h1>

      <h2 className='text-6xl font-extrabold text-white mt=5 mb-20 pt-2'>
        SEARCH
      </h2>

      <input type="text" placeholder="Enter a Movie title" className="w-full py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
      </input>
      
      <h2 className='text-6xl font-extrabold text-white mt=5 mb-20 pt-20'>
        Popular
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

    </div>
  );
}

export default App;