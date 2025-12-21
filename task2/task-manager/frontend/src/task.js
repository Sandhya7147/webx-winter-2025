const searchEl = document.getElementById('task-name');
const username_l = document.getElementById('username-l');
const username_s = document.getElementById('username-s');
const pwd_l = document.getElementById('password-l');
const pwd_s = document.getElementById('password-s');

const container = document.getElementById('task-details');
const signup_container = document.getElementById('signup-modal');
const login_container = document.getElementById('login-modal');
const message_container = document.getElementById('message');
const main_app_container= document.getElementById('main-app');

const auth_modal = document.getElementById('auth-modal');

const submit_button = document.getElementById('submit');
const login_button = document.getElementById('login-button');
const signup_button = document.getElementById('signup-button');
const logout_button = document.getElementById('logout-button');

const login_confirm = document.getElementById('login-confirm');
const signup_confirm = document.getElementById('signup-confirm');

submit_button.addEventListener('click',handleSearchClick);
login_button.addEventListener('click',handleLoginClick);
signup_button.addEventListener('click',handleSignupClick);
login_confirm.addEventListener('click',handleLoginConfirm);
signup_confirm.addEventListener('click',handleSignupConfirm);
logout_button.addEventListener('click',handleLogoutClick);
const BASE_URL='http://localhost:3000';

const t=localStorage.getItem('jwttoken');
if (!t) {
    auth_modal.classList.remove('hidden');
    signup_container.classList.add('hidden');
    login_container.classList.remove('hidden');
    main_app_container.classList.add('hidden');
}
else{
    main_app_container.classList.remove('hidden');
    auth_modal.classList.add('hidden');
    getData();
}

function addDiv(className,message){
    const newdiv = document.createElement("div");
    newdiv.classList.add(className);
    newdiv.innerText=message;
    container.appendChild(newdiv);
}

function addDiv2(className,message,remove,add){
    const newdiv = document.createElement("div");
    newdiv.classList.add(className);
    newdiv.innerText=message;
    message_container.appendChild(newdiv);
    message_container.classList.remove(remove);
    message_container.classList.add(add);
}

async function postData(){
    try{
        let task=searchEl.value;
        submit_button.disabled = true;
        console.log(task);
        
        const token=localStorage.getItem('jwttoken');
        const response= await fetch(`${BASE_URL}/tasks/post`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
            title: task,
            completed: false
            }) 
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(`inside task.js ${result}`);
        await getData();
    } catch(error){
        console.error(error);
    } finally{
        submit_button.disabled = false;
    }
    
}
async function getData(){
    container.innerHTML = ""; 
    try{
        const token=localStorage.getItem('jwttoken');
        const response= await fetch(`${BASE_URL}/tasks/get`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(`inside task.js ${result}`);
        for (const task of result) {
            const title= task.title;
            addDiv('task-box',title);
        }
        
    } catch(error){
        console.error(error);
        if(error.message.includes('403')){
            let message='Access Denied';
            let className="message";
            let remove='success';
            let add='error';
            addDiv2(className,message,remove,add);
        }
    }
    
}

function handleSearchClick() {
    container.innerHTML = ""; 
    postData();
}

function handleLoginClick() {
    login_container.classList.remove('hidden');
    signup_container.classList.add('hidden');
}
function handleSignupClick() {
    login_container.classList.add('hidden');
    signup_container.classList.remove('hidden');
}

async function handleLoginConfirm(){

    message_container.innerHTML="";
     try{
        login_confirm.disabled=true;
        let usernamel=username_l.value;
        let pwdl=pwd_l.value;

        const response= await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            username: usernamel,
            pwd: pwdl
            }) 
        })

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(`inside task.js ${result}`);
        
        const tokenFromServer=result.accessToken;
        localStorage.setItem('jwttoken',tokenFromServer);
        auth_modal.classList.add('hidden');
        main_app_container.classList.remove('hidden');
        await getData();

    } catch(error){
        console.error(error);
        if(error.message.includes('404')){
            let message='Username not found. Please enter valid user name';
            let className="message";
            let remove='success';
            let add='error';
            addDiv2(className,message,remove,add);
        }
        else if(error.message.includes('401')){
            let message='Wrong Password. Please enter valid password';
            let className="message";
            let remove='success';
            let add='error';
            addDiv2(className,message,remove,add);
        }
    } finally{
        login_confirm.disabled=false;
    }
    
}
async function handleSignupConfirm(){
    message_container.innerHTML="";
    try{
        signup_confirm.disabled=true;
        let usernames=username_s.value;
        let pwds=pwd_s.value;

        const response= await fetch(`${BASE_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            username: usernames,
            pwd: pwds
            }) 
        })

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(`inside task.js ${result}`);
        let message='SIGN UP SUCCESS';
        let className="message";
        let remove='error';
        let add='success';
        addDiv2(className,message,remove,add);
        
    } catch(error){
        console.error(error);
        if(error.message.includes('409')){
            let message='Username already exist. Please enter another username';
            let className="message";
            let remove='success';
            let add='error';
            addDiv2(className,message,remove,add);
        }
    } finally{
        signup_confirm.disabled=false;
    }
    
}

function handleLogoutClick(){
    console.log('remove token from localStorage');
    container.innerHTML = "";
    localStorage.removeItem('jwttoken');
    main_app_container.classList.add('hidden');
    auth_modal.classList.remove('hidden');
    signup_container.classList.add('hidden');
    login_container.classList.remove('hidden');
}