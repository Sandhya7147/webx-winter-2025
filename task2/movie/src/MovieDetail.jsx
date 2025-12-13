import {fetchAPI} from './fetch.jsx';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function MovieDetail(){
  console.log('inside MovieDetail');
  const [movie, setMovie] = useState({});
  const params = useParams(); 
  const movieId = params.movieId;
  const [gs, setGs]= useState([]);

  async function inter(){
    console.log('inside inter of MovieDetail');
    try{
      console.log('before fetchAPI call inside inter of MovieDetail');
      let r=await fetchAPI(movieId,'idsearch');
      console.log('after fetchAPI call inside inter of MovieDetail');
      console.log('before set inside inter of MovieDetail');
      setMovie(r);
      console.log('after set inside inter of MovieDetail');
      console.log(r); 
      setGs(r.genres);
      console.log('After setGenres');
      console.log(r.genres[0]);
    }catch(error){
      console.error(error);
      console.log(`${error.message}`);
    }
  }
  useEffect(()=>{inter();}, [movieId]);
  return(
    <div className='grid grid-cols-8 gap-6'>
      <div className='grid justify-center col-span-3'>
        <img
          src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
          alt = {movieId}
          className=''
        />
      </div>
      <div className='col-span-5'>
        <div className='font-mono text-5xl'>{movie.title}</div><br />
        <div className='text-xl'>{movie.tagline}</div>
        <div className="inline-block bg-yellow-500 text-gray-900 text-xs font-semibold px-2 py-0.5 rounded-full">
          ⭐ {movie.vote_average}
        </div>
        
        <div className='mt-6 font-semibold'>{movie.overview}</div><br />

        <div className='italic font-bold'>Genres</div>
        <div>
          <ul className='list-none'>
            {gs.map(el => (
              <li key={el.id}>
                {el.name} 
              </li>
            ))}
          </ul>
          
        </div>
      </div>

      
    </div>
  )
}
export default MovieDetail;