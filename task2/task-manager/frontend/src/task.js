const searchEl = document.getElementById('task-name');
const username_l = document.getElementById('username-l');
const username_s = document.getElementById('username-s');
const pwd_l = document.getElementById('password-l');
const pwd_s = document.getElementById('password-s');

const container = document.getElementById('task-details');
const error_main_container = document.getElementById('error-main');
const greetings_container = document.getElementById('greetings');

const signup_container = document.getElementById('signup-modal');
const login_container = document.getElementById('login-modal');
const message_container = document.getElementById('message');
const main_app_container= document.getElementById('main-app');
const admin_view_container= document.getElementById('admin-view');

const auth_modal = document.getElementById('auth-modal');

const submit_button = document.getElementById('submit');
const login_button = document.getElementById('login-button');
const signup_button = document.getElementById('signup-button');
const logout_button = document.getElementById('logout-button');
const logout_button_admin = document.getElementById('logout-button-admin');

const login_confirm = document.getElementById('login-confirm');
const signup_confirm = document.getElementById('signup-confirm');

submit_button.addEventListener('click',handleSearchClick);
login_button.addEventListener('click',handleLoginClick);
signup_button.addEventListener('click',handleSignupClick);
login_confirm.addEventListener('click',handleLoginConfirm);
signup_confirm.addEventListener('click',handleSignupConfirm);
logout_button.addEventListener('click',handleLogoutClick);
logout_button_admin.addEventListener('click',handleLogoutClick);
const BASE_URL='http://localhost:3000';

const t=localStorage.getItem('jwttoken');
const isAdmin=localStorage.getItem('isAdmin') === 'true';

if (!t) {
    auth_modal.classList.remove('hidden');
    signup_container.classList.add('hidden');
    login_container.classList.remove('hidden');
    main_app_container.classList.add('hidden');
    admin_view_container.classList.add('hidden');
}
else{
    main_app_container.classList.remove('hidden');
    auth_modal.classList.add('hidden');
    const Username=localStorage.getItem('username');
    
    if(isAdmin){
        main_app_container.classList.add('hidden');
        admin_view_container.classList.remove('hidden');
        loadAdminDashboard();
    }
    else{
        greetings_container.innerText=`WELCOME ${Username}`;
        main_app_container.classList.remove('hidden');
        admin_view_container.classList.add('hidden');
        getData();
    }
}

function addDiv(className,task){
    const message= task.title;
    const newdiv = document.createElement("div");
    const newinput = document.createElement("input");
    const newlabel = document.createElement("label");
    const deletebtn = document.createElement("button");
    newinput.checked = task.completed; 
    if (task.completed) {
        newlabel.classList.add('strikethrough');
    }
    else{
        newlabel.classList.remove('strikethrough');
    }
    const dbid=task.id;
    
    deletebtn.innerText = "Delete";
    deletebtn.classList.add("delete-btn")
    newdiv.classList.add(className);
    newinput.type="checkbox";
    newinput.id="id-"+dbid;
    newlabel.htmlFor = "id-"+dbid;
    newinput.addEventListener('change', function() {
        if (this.checked) {
            newlabel.classList.add('strikethrough');
            updateData(dbid,true);
        }else {
            newlabel.classList.remove('strikethrough');
            updateData(dbid,false);
        }
    });
    deletebtn.addEventListener('click', function() {
        deleteData(dbid,newdiv); 
    });
    newlabel.innerText=message;
    newdiv.appendChild(newinput);
    newdiv.appendChild(newlabel);
    newdiv.appendChild(deletebtn);
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
        if (task===''){
            throw new Error("Empty task name");
        }
        error_main_container.innerText="";
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
        addDiv('task-box', result);
        searchEl.value = "";
    } catch(error){
        console.error(error);
        if (error.message==='Empty task name'){
            error_main_container.innerText="Enter a task please!";
        }
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
            addDiv('task-box',task);
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

async function updateData(task_id,completed){
    try{
        const token=localStorage.getItem('jwttoken');
        const response= await fetch(`${BASE_URL}/tasks/patch`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
            id: task_id,
            completed: completed
            }) 
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(`inside task.js ${result}`);
    } catch(error){
        console.error(error);
    }
    
}
async function deleteData(task_id,newdiv){
    try{
        const token=localStorage.getItem('jwttoken');
        const response= await fetch(`${BASE_URL}/tasks/${task_id}/delete`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        newdiv.remove();
        const result = await response.json();
        console.log(`inside task.js ${result}`);
    } catch(error){
        console.error(error);
    }
    
}
function handleSearchClick() {
    postData();
}

function handleLoginClick() {
    message_container.innerHTML="";
    login_container.classList.remove('hidden');
    signup_container.classList.add('hidden');
}
function handleSignupClick() {
    message_container.innerHTML="";
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
        localStorage.setItem('username',result.username);
        //only to display admin page and is not used to access DB
        localStorage.setItem('isAdmin',result.isAdmin);
        auth_modal.classList.add('hidden');
        greetings_container.innerText = `WELCOME ${result.username}`;
        if (result.isAdmin) {
            admin_view_container.classList.remove('hidden');
            main_app_container.classList.add('hidden');
            await loadAdminDashboard();
        } else {
            main_app_container.classList.remove('hidden');
            admin_view_container.classList.add('hidden');
            await getData();
        }
        

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
    localStorage.removeItem('isAdmin');
    main_app_container.classList.add('hidden');
    admin_view_container.classList.add('hidden');
    auth_modal.classList.remove('hidden');
    signup_container.classList.add('hidden');
    login_container.classList.remove('hidden');
}

async function adminToggleStatus(task_id, completed) {

    try{
        const token=localStorage.getItem('jwttoken');
        const response= await fetch(`${BASE_URL}/tasks/patch`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
            id: task_id,
            completed: completed
            }) 
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        console.log(`inside adminToggleStatus ${result}`);
        return true;
    } catch(error){
        console.error(error);
        return false;
    }    
}
async function adminDeleteTask(task_id){
    try{
        const token=localStorage.getItem('jwttoken');
        const response= await fetch(`${BASE_URL}/tasks/${task_id}/delete`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        console.log(`ADMIN DELETE SUCCESS ${result}`);
        return true;
    } catch(error){
        console.error(error);
        return false;
    }
    
}
function renderAdminTable(tasks) {
    const adminTbody = document.getElementById('admin-table-body');
    adminTbody.innerHTML = ""; 
    if (tasks.length === 0) {
        const error_admin_container = document.getElementById('error-admin');
        error_admin_container.innerText = "No tasks found in the database!";
        return;
    }
    tasks.forEach(task => {
        const row = document.createElement('tr');

        const userCell = document.createElement('td');
        userCell.textContent = task.username;
        const idCell = document.createElement('td');
        idCell.textContent = task.id;
        const titleCell = document.createElement('td');
        titleCell.textContent = task.title;
        const statusCell = document.createElement('td');
        statusCell.textContent = task.completed ? '✅ Completed' : '⏳ Pending';
        
        const actionCell = document.createElement('td');
        actionCell.classList.add('action-cell');

        // Toggle Status Button
        const statusBtn = document.createElement('button');
        statusBtn.textContent = "Toggle Status";
        statusBtn.addEventListener('click', async () => {
            statusBtn.disabled = true;
            //adminToggleStatus(task.id, task.completed);
            let newStatus = !task.completed;
            const success = await adminToggleStatus(task.id, newStatus);
            const error_admin_container = document.getElementById('error-admin');
            if (success) {
                error_admin_container.innerText = "";
                task.completed = newStatus;
                statusCell.textContent = newStatus ? '✅ Completed' : '⏳ Pending';
                statusBtn.disabled = false;
            } else {
                statusBtn.disabled = false;
                error_admin_container.innerText = "Update failed";
            }
        });

        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener('click', async () => {
            deleteBtn.disabled = true;
            const success = await adminDeleteTask(task.id);
            if (success) {
                row.remove(); 
            } else {
                deleteBtn.disabled = false;
            }
        });

        actionCell.appendChild(statusBtn);
        actionCell.appendChild(deleteBtn);

        row.append(userCell, idCell, titleCell, statusCell,actionCell);
        adminTbody.appendChild(row);
    });
}

async function loadAdminDashboard() {
    const error_admin_container = document.getElementById('error-admin');
    error_admin_container.innerText = "";
    try {
        const token = localStorage.getItem('jwttoken');
        const response = await fetch(`${BASE_URL}/admin/tasks/get`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Not authorized for admin view");
        const allTasks = await response.json();
        
        renderAdminTable(allTasks);
    } catch (error) {
        console.error("Admin Error:", error);
        error_admin_container.innerText = "Access Denied: Admin privileges required";
    }
}