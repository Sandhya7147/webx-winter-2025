import { useState, useEffect } from 'react';
import { Routes, Route, Navigate} from 'react-router-dom';

import Signup from './Signup.jsx';
import Login from './Login1.jsx';
import Feed from './Feed.jsx';
import Post from './Post.jsx';


function App() {

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <Routes>
        <Route path="/" element={<Login/>} /> 
        <Route path="/signup" element={<Signup/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/feed" element={<Feed/>} />
        <Route path="/feed/:postId" element={<Post/>} />
      </Routes>
    </div>
  );
}


export default App;