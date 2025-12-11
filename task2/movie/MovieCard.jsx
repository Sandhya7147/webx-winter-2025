import React from 'react';

function MovieCard({ movie }) {
  
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden transform transition duration-300 hover:scale-[1.06] cursor-pointer">
      
      <img 
        src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
        alt = {movie.id}
        className="w-full h-72 object-cover"
      />
      
      <div className="p-4">

        <h3 className="text-xl font-bold text-white mb-2 truncate">
          {movie.title}<br /> {movie.release_date}
        </h3>
        
        <p className="text-sm text-gray-400 mb-3">{movie.genre}</p>
        
        <div className="inline-block bg-yellow-500 text-gray-900 text-xs font-semibold px-2 py-0.5 rounded-full">
          ⭐ {movie.vote_average}
        </div>

      </div>
    </div>
  );
}

export default MovieCard;