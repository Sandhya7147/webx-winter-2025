const searchEl = document.getElementById('task-name');
const container = document.getElementById('task-details');
const submit_button = document.getElementById('submit');

submit_button.addEventListener('click',handleSearchClick);

function addDiv(className,message){
    const newdiv = document.createElement("div");
    newdiv.classList.add(className);
    newdiv.innerText=message;
    container.appendChild(newdiv);
}

async function postData(){
    try{
        let task=searchEl.value;
        submit_button.disabled = true;
        console.log(task);

        const response= await fetch('http://localhost:3000/tasks/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            title: task,
            completed: false
            }) 
        })

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(`inside task.js ${result}`);
        addDiv('id',result.id);
        addDiv('task',result.task);
        
    } catch(error){
        console.error(error);
    } finally{
        submit_button.disabled = false;
    }
    
}

function handleSearchClick() {
    container.innerHTML = ""; 
    postData();
}