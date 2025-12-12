import React,{ useState, useEffect } from 'react';
import FetchMovies from './fetch.jsx';

function App() {
  const [isDisplayS, setIsDisplayS] = useState(false);
  const [valueS, setvalueS] = useState({});

  function HandleEnterClick1(){
    setIsDisplayS(true);
    const entryEl = document.getElementById('movie-entry');
    setvalueS({query: entryEl.value, type: 'search'});
  }

  return (

    <div className="bg-black min-h-screen p-11"> 
      
      <h1 className="text-6xl font-extrabold text-[#E50914] mt=5 mb-20 text-center">
        The Movie Explorer
      </h1>

      <h2 className='text-6xl font-extrabold text-white mt=5 mb-20 pt-2'>
        SEARCH
      </h2>

      <div className='grid grid-cols-10 gap-3'>
        <input id="movie-entry"type="text" placeholder="Enter a Movie title" className="col-span-9 w-full py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </input>
        <button onClick={HandleEnterClick1} className='bg-[#E50914] rounded-full border border-[#E50914] focus:border-white'>
        ENTER
        </button>
      </div>
      <div className='mt-20'>
      {isDisplayS && 
        <FetchMovies query={valueS.query} n={5} type={valueS.type} />
      }
      </div>
      
      <h2 className='text-6xl font-extrabold text-white mt=5 mb-20 pt-20'>
        Popular
      </h2>

      <FetchMovies n={11} type='popular' />

    </div>
  );
}

export default App;