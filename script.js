/* --------------- Weather Web App  --------------------- */
let show = document.getElementById('show');
let search = document.getElementById('search');
let locationInput = document.getElementById('city');
let tenDays = document.getElementById('tenDays');
const modal = document.getElementById('tempDetailsModal');
const hourList = document.getElementById('hourList');
const cityInfo = document.getElementById('cityInfo');
const localBackendUrl = 'http://localhost:3000';
const serverUrl = 'https://novovrijeme.com/api/v2';

let searchedLocations = [];
let isModalOpen = false;
let currentDay = undefined;
let completeWeatherData = [];

const daysOfWeek = { 0: 'Ned', 1: 'Pon', 2: 'Uto', 3: 'Sri', 4: 'Čet', 5: 'Pet', 6: 'Sub' };
const monthInYear = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni', 'Juli', 'August', 'Septembar', 'Oktobar', 'Novmbar', 'Decembar'];
let selectedLocation = null;

let getWeather = async (event) => {
  event?.preventDefault();
  let params = new URL(document.location.toString()).searchParams;
  let cityParam = params.get('city');
  let cityValue = locationInput.value || cityParam;
  if (!cityValue) {
    // show.innerHTML = `<h3 class="error">Upišite ime grada</h3>`;
    show.innerHTML = '';
    tenDays.innerHTML = '';
    cityInfo.style.display = 'none';
    return;
  }

  show.innerHTML = `<h3 class="error">Učitavanje podataka u toku...</h3>`;
  tenDays.innerHTML = '';
  cityInfo.style.display = 'none';

  let latitude, longitude, country, name;

  try {
    if (event) {
      let locationAPI = `${serverUrl}/location?q=${cityValue}`;
      const res = await fetch(locationAPI);
      const locations = await res.json();
      if (!locations?.length) {
        show.innerHTML = `<h3 class="error">City not found</h3>`;
        return;
      }
      const closestLocation = locations[locations.length - 1];
      latitude = closestLocation.latitude;
      longitude = closestLocation.longitude;
      country = closestLocation.country;
      name = closestLocation.name;
    } else {
      latitude = selectedLocation.latitude;
      longitude = selectedLocation.longitude;
      country = selectedLocation.country;
      name = selectedLocation.name;
    }
    const weatherAPIUrl = `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${latitude}&lon=${longitude}`;
    const weatherRes = await fetch(weatherAPIUrl);
    const weatherData = await weatherRes.json();

    const timeSeries = weatherData.properties.timeseries;
    const currentDetails = timeSeries[0].data.instant.details;
    const nextHour = timeSeries[0].data.next_1_hours;
    const weatherDataByDay = getWeatherDataByDay(timeSeries);

    locationInput.value = '';
    show.innerHTML = `
        <h2 style="text-align:center">${name}, ${country}</h2>
        <div style="display:flex; flex-wrap:wrap; justify-content:center; align-items:center">
          <img src="./svg/${nextHour.summary.symbol_code}.svg" width=64 height=64/>
          <h1 style="white-space:nowrap; margin-left: 1.5rem;">${Math.round(currentDetails.air_temperature)}&#8451;</h1>
           </div>
 
        </div>
        `;
    let tenDaysHtml = ``;
    for (day of weatherDataByDay) {
      const date = new Date(day.time);
      tenDaysHtml += `
     <div onClick="return handleOpenModal(${date.getDate()})" id=${date.getDate()} class="dailyInfoContainer">
        <div style="flex: 1">
          <p>${daysOfWeek[date.getDay()]} ${date.getDate()} ${monthInYear[date.getMonth()]} </p>
        </div>
        <div style="flex:1">
          <div style="display:flex; column-gap:8px; max-width:170px">
            ${day.quarterOne ? `<img src="./svg/${day.quarterOne}.svg" width=36 height=36>` : '<div style="width:36px";height:36px ></div>'}
            ${day.quarterTwo ? `<img src="./svg/${day.quarterTwo}.svg" width=36 height=36>` : '<div style="width:36px";height:36px ></div>'}
            ${day.quarterThree ? `<img src="./svg/${day.quarterThree}.svg" width=36 height=36>` : '<div style="width:36px";height:36px ></div>'}
            ${day.quarterFour ? `<img src="./svg/${day.quarterFour}.svg" width=36 height=36>` : '<div style="width:36px";height:36px ></div>'}
          </div>
        </div>
        <div style="flex: 1; margin-left: 5px;">
          <p>${Math.round(day.minTemp)}&#8451/${Math.round(day.maxTemp)}&#8451;</p>
        </div>
        <div style="display:flex; flex:1; justify-content:flex-end"><img class="iconRight" src="svg/chevron-forward-sharp.svg" alt="arrow right"></div>
     </div>`;
    }
    tenDays.innerHTML = tenDaysHtml;
    cityInfo.style.display = 'block';
  } catch (error) {
    show.innerHTML = `<h3 class="error">Error fetching data</h3>`;
  }
};

const getWeatherDataByDay = (timeseries) => {
  let tenDaysData = {};
  completeWeatherData = timeseries;
  for (entry of timeseries) {
    const time = new Date(entry.time);
    const currentHours = time.getHours();
    const currentDate = time.getDate();
    const next6Hours = entry.data.next_6_hours?.details;
    const next6HoursSummary = entry.data.next_6_hours?.summary;

    if (!tenDaysData[currentDate]) {
      tenDaysData[currentDate] = { ...entry, minTemp: next6Hours?.air_temperature_min, maxTemp: next6Hours?.air_temperature_max };
    }

    if (!tenDaysData[currentDate]['quarterOne'] && currentHours >= 0 && currentHours < 6) {
      tenDaysData[currentDate] = { ...entry, minTemp: next6Hours?.air_temperature_min, maxTemp: next6Hours?.air_temperature_max, quarterOne: next6HoursSummary?.symbol_code };
    } else if (!tenDaysData[currentDate]['quarterTwo'] && currentHours >= 6 && currentHours < 12) {
      tenDaysData[currentDate]['quarterTwo'] = next6HoursSummary?.symbol_code;
    } else if (!tenDaysData[currentDate]['quarterThree'] && currentHours >= 12 && currentHours < 18) {
      tenDaysData[currentDate]['quarterThree'] = next6HoursSummary?.symbol_code;
    } else if (!tenDaysData[currentDate]['quarterFour'] && currentHours >= 18 && currentHours <= 23) {
      tenDaysData[currentDate]['quarterFour'] = next6HoursSummary?.symbol_code;
    }

    if (next6Hours?.air_temperature_min < tenDaysData[currentDate]?.minTemp) {
      tenDaysData[currentDate].minTemp = next6Hours?.air_temperature_min;
    }
    if (next6Hours?.air_temperature_max > tenDaysData[currentDate]?.maxTemp) {
      tenDaysData[currentDate].maxTemp = next6Hours?.air_temperature_max;
    }
  }
  return Object.values(tenDaysData).slice(0, 10);
};

search.addEventListener('click', getWeather);
window.addEventListener('load', getWeather);
let searchTimeout = null;
const cityList = document.getElementById('cities-list-wrapper');

locationInput.addEventListener('input', (event) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    const textVal = event.target.value;
    try {
      if (!event.target.value) {
        cityList.innerHTML = '';
        return;
      }
      let locationAPI = `${serverUrl}/location?q=${textVal}`;
      const res = await fetch(locationAPI);
      const locations = await res.json();
      searchedLocations = locations;
      cityList.innerHTML = '';
      for (searchLocation of searchedLocations) {
        cityList.innerHTML += `<li class="searchedLocation" id=${searchLocation.id}>${searchLocation.name}, ${searchLocation.region?.name || ''}, ${searchLocation.country}</li>`;
      }
      if (!searchedLocations.length) {
        cityList.innerHTML = '<li>No results found</li>';
      }
    } catch (error) {
      cityList.innerHTML = '<li>Error loading locations</li>';
    }
  }, 200);
});

function showResultBox() {
  document.getElementById('resultBox').style.display = 'block';
}
window.onclick = function (event) {
  if (!event.target.matches('.input_box')) {
    if (event.target.classList?.[0] === 'searchedLocation') {
      const locationSplits = event.target.textContent.split(',');
      locationInput.value = `${locationSplits[0]}, ${locationSplits[2]}`;
      selectedLocation = searchedLocations.find((item) => item.id === event.target.id) || searchedLocations?.[0];
      console.log(selectedLocation);
      getWeather();
      cityList.innerHTML = '';
    }
    document.getElementById('resultBox').style.display = 'none';
  }
};

window.onkeydown = function (event) {
  if (isModalOpen && event.key === 'Escape') {
    handleCloseModal();
  }
};

function handleOpenModal(id) {
  isModalOpen = true;
  modal.style.display = 'block';
  const weatherOfDay = completeWeatherData.filter((item) => new Date(item.time).getDate() === id);
  const modalDate = document.getElementById('modal-date');
  const currentDate = new Date(weatherOfDay[0].time);
  modalDate.textContent = `${daysOfWeek[currentDate.getDay()]} ${currentDate.getDate()} ${monthInYear[currentDate.getMonth()]}`;
  for (day of weatherOfDay) {
    const next1HoursSummary = day.data.next_1_hours?.summary || day.data.next_6_hours?.summary;
    const temperature = Math.round(day.data?.instant?.details?.air_temperature);
    const hour = new Date(day.time).getHours();
    hourList.innerHTML += `<div  style="display: flex; padding: 4px; border-bottom: 1px solid gray; align-items: center">
        <div style="flex: 1">
          <p>${hour}:00</p>
        </div>
        <div style="flex:1">
          <div style="display:flex; column-gap:8px; max-width:170px">
            ${next1HoursSummary?.symbol_code ? `<img src="./svg/${next1HoursSummary.symbol_code}.svg" alt="weather_icon" width=36 height=36>` : "<div style='width:36px;height:36px'></div>"}
          </div>
        </div>
        <div style="flex: 1; color:#BF3131; ">
          <p>${temperature}&#8451;</p>
        </div>
     </div>`;
  }
  window.scrollTo({ top: window.innerWidth < 760 ? 0 : 150 });
}

function handleCloseModal() {
  modal.style.display = 'none';
  hourList.innerHTML = '';
  isModalOpen = false;
}

modal.onclick = function (event) {
  if (!modal.children[0].contains(event.target)) {
    handleCloseModal();
  }
};
