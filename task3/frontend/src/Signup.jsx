import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_BASE_URL;

function Signup() {
  const navigate = useNavigate();
  function handleClickLogin(){
    navigate("/login");
  }
  
  const [inputUsername, setInputUsername] = useState("");
  const [inputPwd, setInputPwd] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSignUpConfirm(){
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
     try{
        
        const response= await fetch(`${BASE_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            username: inputUsername,
            pwd: inputPwd
            }) 
        })

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(`inside handleSignUpConfirm ${result}`);
        setSuccessMsg("Created account successfuly");
    } catch(error){
        console.error(error);
        if(error.message.includes('409')){
          setErrorMsg('Username already in use. Please enter a new user name');
        }
    } finally{
        setIsLoading(false)
    }
  }
  return (
     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      
      <div className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-md border border-gray-100">
        
        <div className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-md border border-gray-100 flex justify-center">
          <button 
            disabled={isLoading} 
            className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
            type='button'
            onClick={handleClickLogin}>
            LOGIN
          </button>
        </div>

        <br /> 
      	<div className="flex flex-col gap-5">
					<h1 className="text-3xl font-black text-gray-900 tracking-tight text-center">
            SIGN UP PAGE
          </h1>
          
          <div className="flex flex-col gap-3">
            <input 
              className="w-full bg-gray-50 border-none px-5 py-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-800"
              type="text"
              value={inputUsername} 
              onChange={(e) => setInputUsername(e.target.value)} 
              placeholder="Enter username" 
            />
					  <input 
              className="w-full bg-gray-50 border-none px-5 py-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-800"
              type="password" 
              value={inputPwd} 
              onChange={(e) => setInputPwd(e.target.value)}
              placeholder="Enter password" 
            />

          </div>
					
					
					<button 
            type='button'
            onClick={handleSignUpConfirm}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}>
              SIGNUP
          </button>

      	</div>

        <br />
        {errorMsg && <p className="text-red-500 text-xs text-center">{errorMsg}</p>}
        {successMsg && <p className="text-green-500 text-xs text-center">{successMsg}</p>}
    	</div>    
    </div>
  );

}

export default Signup;