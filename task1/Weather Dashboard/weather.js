const searchEl = document.getElementById('city-name');
const typeEl = document.getElementById('type');
const container = document.getElementById('weather-details');
const daysContainer = document.getElementById('days-container');
const submit_button = document.getElementById('submit');
handleType();
submit_button.addEventListener('click',handleSearchClick);
typeEl.addEventListener('change',handleType);

function addDiv(className,message){
    const newdiv = document.createElement("div");
    newdiv.classList.add(className);
    newdiv.innerText=message;
    container.appendChild(newdiv);
}



function displayLoc(r){
    let className='city-heading';
    let message=`${r.location['name']}: ${r.location['region']}, ${r.location['country']}`
    addDiv(className,message);
}

function addElementCurrent(r){  
    displayLoc(r);
    const c=r.current;
    const newdiv = document.createElement("div");
    newdiv.classList.add("current");
    container.appendChild(newdiv);

    const hum = document.createElement("div");
    hum.innerText=`Humidity: ${c.humidity}`;
    newdiv.appendChild(hum);

    const ws = document.createElement("div");
    ws.innerText=` Wind Speed: ${c.gust_kph} km/h`;
    newdiv.appendChild(ws);

    const temp = document.createElement("div");
    temp.innerText=`Temperature: ${c.temp_c} \u00B0C`;
    newdiv.appendChild(temp);
    

}

function addElementForecast(r,d) {
    displayLoc(r);
    const newTable = document.createElement("table");
    container.appendChild(newTable);
    newTable.classList.add('tabular');
    const newThead = document.createElement("thead");
    newThead.classList.add('heading');
    const newTbody = document.createElement("tbody");
    newTbody.classList.add('content');
    newTable.appendChild(newThead);
    newTable.appendChild(newTbody);
    
    const arr=['avghumidity','avgtemp_c','avgtemp_f','avgvis_km'];
    const arr2=['Date','Avg Humidity','Avg Temp in Celsius','Avg Temp in Farenheit','Avg Visibilty in km'];
    for(let j of arr2){
            const newDiv = document.createElement("div");
            newDiv.classList.add('table-heading');
            newDiv.textContent = j;
            newThead.appendChild(newDiv);
    }
    const f=r.forecast.forecastday;
    console.log("Before for outer loop")
    for (let i=0;i<d;i++){
        let da=f[i].day;
        const newDiv = document.createElement("div");
        newDiv.classList.add('rows')
        newDiv.textContent = f[i].date;
        newTbody.appendChild(newDiv);
        console.log("Before for inner loop")
        for(let j of arr){
            const newDiv = document.createElement("div");
            newDiv.classList.add('rows')
            newDiv.textContent = da[j];
            newTbody.appendChild(newDiv);
        }
        
    }
}


function displayData(r){
    const c=r.current;
    humidityEl.innerText=c.humidity;
    windSpeedEl.innerText=`${c.gust_kph} km/h`;
    tempEl.innerText=`${c.temp_c} degree Celsius`;
}

async function fetchData(d){
    try{
        let city=searchEl.value;
        let t=typeEl.value;
       
        console.log(city);
        const API_KEY="YOUR_API_KEY";
        const url=`http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=${d}`;
        const response= await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(result);

        if (t===''){
            throw new Error("Choose Current Weather or Forecast");
        }
        else if(t==='Forecast'){
            addElementForecast(result,d);
        }
        else{
            addElementCurrent(result);
        }
        

    } catch(error){
        console.error(error);
        console.log(`${error.message}`);//typeof gives string
        if(error.message.includes('400')){
            let className = 'error-message';
            let message ='PLEASE ENTER VALID CITY NAME';
            addDiv(className,message);
        }
        if(error.message==='Choose Current Weather or Forecast'){
            let className = 'error-message';
            let message ='PLEASE CHOOSE CURRENT WEATHER/ FORECAST';
            addDiv(className,message);
        }
    }
}

function handleSearchClick() {
    container.innerHTML = ""; 
    let d=1;
    try{
        if(typeEl.value==='Forecast'){
            const daysEl = document.getElementById('days');
            d =daysEl.value;
            if (d === "" || isNaN(Number(d))){
                throw new Error("Enter number only");}
        } 
        fetchData(d);       
    }catch(error){
        if(error.message==='Enter number only'){
            let className = 'error-message';
            let message ='PLEASE ENTER NUMBER ONLY FOR DAYS';
            addDiv(className,message);
        }
    }   
    
}

function handleType(){
    if(typeEl.value==='Forecast'){
        container.innerHTML = '';
        daysContainer.innerHTML="";
        const newInput = document.createElement('input');
        newInput.placeholder='Enter number of days of forecast';
        newInput.type='number';
        newInput.id='days';
        daysContainer.appendChild(newInput);
    }
    else{
        daysContainer.innerHTML="";
        container.innerHTML = "";
    }
}