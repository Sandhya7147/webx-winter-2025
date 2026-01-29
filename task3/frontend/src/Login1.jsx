import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_BASE_URL;

function Login() {
  const navigate = useNavigate();
  function handleClickSignUp(){
    navigate("/signup");
  }

  useEffect(() => {
    const token = localStorage.getItem('jwttoken');
    if (token) {
      navigate("/feed");
    }
  }, [navigate]);

  const [inputUsername, setInputUsername] = useState("");
  const [inputPwd, setInputPwd] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLoginConfirm(){
    setIsLoading(true);
    setErrorMsg("");
     try{
        const response= await fetch(`${BASE_URL}/login`, {
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
        console.log(`inside handleLoginConfirm ${result}`);
        
        const tokenFromServer=result.accessToken;
        localStorage.setItem('jwttoken',tokenFromServer);
        localStorage.setItem('username',result.username);
        localStorage.setItem('bio', result.bio ?? "");
        localStorage.setItem('pfp',result.pfp);
        navigate("/feed")
        

    } catch(error){
        console.error(error);
        if(error.message.includes('404')){
          setErrorMsg('Username not found. Please enter valid user name');
        }
        else if(error.message.includes('401')){
          setErrorMsg('Wrong Password. Please enter valid password');
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
            type='button'
            className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
            onClick={handleClickSignUp}>
              SIGN UP
          </button>
        </div>

        <br />
      	<div className="flex flex-col gap-5">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight text-center">
            LOGIN PAGE
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
            type="button"
            onClick={handleLoginConfirm}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}>
              LOGIN
          
          </button>
        </div>
        <br />
        {errorMsg && <p className="text-red-500 text-xs text-center">{errorMsg}</p>}
      </div>    
    </div>
  );
}

export default Login;