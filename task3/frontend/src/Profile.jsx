import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_BASE_URL;

function Profile({ onPostSuccess }){

  const navigate = useNavigate();

  const token=localStorage.getItem('jwttoken');
  const username=localStorage.getItem('username');
  const pfp=localStorage.getItem('pfp');
  const [postHeading, setPostHeading] = useState("");
  const [postContent, setPostContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMakePost, setIsLoadingMakePost] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalPostOpen, setIsModalPostOpen] = useState(false);
  const [newBio, setNewBio] = useState(localStorage.getItem('bio') || "");
  const [bio, setBio] = useState(localStorage.getItem('bio') || "");

  function handleLogoutClick(){
    localStorage.removeItem('jwttoken');
    localStorage.removeItem('username');
    localStorage.removeItem('bio');
    localStorage.removeItem('pfp');
    navigate("/login")
  }

  async function handleUpdateBio(){
    setIsLoading(true);
  
     try{
        
        const response= await fetch(`${BASE_URL}/updatebio`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
            bio:newBio
            }) 
        })

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        setBio(newBio);
        localStorage.setItem('bio', newBio ?? "");
        
        const result = await response.json();
        console.log(`inside handleUpdateBio ${result}`);
        setIsModalOpen(false);        

    } catch(error){
        console.error(error);
    } finally{
        setIsLoading(false)
    }
  }
  async function handlePostSubmit(){
     setIsLoadingMakePost(true);
     try{
      
        const response= await fetch(`${BASE_URL}/makepost`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              title: postHeading,
              content: postContent
            }) 
        })

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
       
        
        const result = await response.json();
        console.log(`inside handlePostSubmit ${result}`);

        setPostHeading("");
        setPostContent("");
        setIsModalPostOpen(false);      
        
        if (onPostSuccess) {
          onPostSuccess();
        }

    } catch(error){
        console.error(error);
    } finally{
        setIsLoadingMakePost(false)
    }
  }

  if (!token) {
    return(
      <div>
        <p className="text-red-500 text-xs text-center">PLEASE LOGIN</p>
      </div>
    )
  }

	return(
		<header className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center gap-4">
      <img 
        src={pfp} 
        alt="Profile" 
        className="w-16 h-16 rounded-full aspect-square object-cover ring-2 ring-blue-500"
      />

      <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-bold text-gray-800">{username}</h2>
          <p className="text-gray-500 text-sm">{bio}</p>
          <br />
          <button onClick={() => setIsModalOpen(true)} className="text-xs bg-gray-100 px-3 py-1 rounded-md hover:bg-gray-200">Edit</button>
      </div>
      
      <button className="bg-red-600 cursor-pointer text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors" onClick={handleLogoutClick}>LOGOUT</button>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 shadow-xl">
            <h3 className="font-bold mb-4">Update Your Bio</h3>
            <textarea 
              className="w-full border p-2 rounded-md mb-4" 
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              placeholder="Write something about yourself..."
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={handleUpdateBio} 
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>

              <button  
                onClick={() => {
                  setIsModalOpen(false);
                  setNewBio(bio); 
                }} 
                className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-red-500 text-white rounded-md font-medium transition-all hover:bg-red-600 active:scale-95 text-sm sm:text-base"
              >
                Cancel
              </button>           
            </div>
          </div>
        </div>
      )}
      <div className="w-full max-w-2xl mx-auto p-4">
      
        <button 
          onClick={() => setIsModalPostOpen(true)}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all text-lg"
        >
          + New Post
        </button>

     
        {isModalPostOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            
            <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 animate-in slide-in-from-bottom duration-300">
              
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-extrabold text-gray-800">Create Post</h2>
                <button onClick={() => setIsModalPostOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>

              <input 
                type="text"
                className="w-full mb-3 bg-gray-50 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 font-bold"
                placeholder="Post Title"
                value={postHeading}
                onChange={(e) => setPostHeading(e.target.value)}
              />

              <textarea 
                className="w-full h-48 sm:h-40 border-none bg-gray-50 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-800 text-lg"
                placeholder="What's happening?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              />

              <div className="flex flex-col sm:flex-row-reverse gap-3 mt-6">
                <button 
                  onClick={handlePostSubmit}
                  disabled={isLoadingMakePost}
                  className="w-full sm:w-32 py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                  {isLoading ? "..." : "Post"}
                </button>
                
                <button 
                  onClick={() => { setIsModalPostOpen(false); setPostContent(""); }}
                  className="w-full sm:w-32 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                >Cancel</button>
              </div>
            </div>
          </div>
        )}
    </div>

    </header>
	)
}

export default Profile;