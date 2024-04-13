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
const monthInYear = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
let selectedLocation = null;

let getWeather = async (event) => {
  event?.preventDefault();
  let params = new URL(document.location.toString()).searchParams;
  let cityParam = params.get('city');
  let cityValue = locationInput.value || cityParam;
  let latitude, longitude, country, name;
  let ipLocation;

  show.innerHTML = `<h3 class="error">Učitavanje podataka u toku...</h3>`;
  tenDays.innerHTML = '';
  cityInfo.style.display = 'none';

  if (!cityValue) {
    const navigatorLocation = await getGeoLocation();
    if (navigatorLocation?.latitude) {
      latitude = navigatorLocation.latitude;
      selectedLocation = {
        latitude: navigatorLocation.latitude,
        longitude: navigatorLocation.longitude,
        country: '',
        name: `${Math.round((navigatorLocation.latitude + Number.EPSILON) * 10000) / 10000}, ${Math.round((navigatorLocation.longitude + Number.EPSILON) * 10000) / 10000}`,
      };
    } else {
      ipLocation = await getIpAddressLocation();
      if (!ipLocation?.latitude) {
        show.innerHTML = `<h3 class="error">GeoLocation not available for this browser</h3>`;
        tenDays.innerHTML = '';
        cityInfo.style.display = 'none';
        return;
      }
      latitude = ipLocation.latitude;
      longitude = ipLocation.longitude;
      country = ipLocation.country_name;
      name = ipLocation.city;
      cityValue = ipLocation.city;
    }
  } else {
    ipLocation = null;
  }

  try {
    if (event && cityValue) {
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
        <h2 style="text-align:center">
         ${ipLocation ? '<img height=24 width=24 src="svg/location-pin.svg"/>' : ''} ${name}${country ? `, ${country}` : ''} ${ipLocation ? '(IP Location)' : ''}
        </h2>
        <div style="display:flex; flex-wrap:wrap; justify-content:center; align-items:center">
          <img src="./svg/${nextHour.summary.symbol_code}.svg" width=64 height=64/>
          <h1 style="white-space:nowrap; margin-left: 1.5rem;">${Math.round(currentDetails.air_temperature)}&#8451;</h1>
           </div>
 
        </div>
        `;
    let tenDaysHtml = ``;
    for (day of weatherDataByDay) {
      const date = calculateLocalTime(day.time);
      tenDaysHtml += `
     <div onClick="return handleOpenModal(${date.getDate()})" id=${date.getDate()} class="dailyInfoContainer">
        <div style="flex: 1;min-width:75px">
          <p style="white-space:nowrap">${daysOfWeek[date.getDay()]} ${date.getDate()} ${monthInYear[date.getMonth()]} </p>
          <p class="temp_container_mob">${Math.round(day.minTemp)}&#8451/${Math.round(day.maxTemp)}&#8451;</p>
          <p class="rain_container_mob">${Math.round(day.precAmount)}&#13221;</p>
        </div>
        <div style="flex:1">
          <div style="display:flex; column-gap:8px; max-width:170px">
            ${day.quarterOne ? `<img src="./svg/${day.quarterOne}.svg" width=36 height=36>` : '<div style="width:36px";height:36px ></div>'}
            ${day.quarterTwo ? `<img src="./svg/${day.quarterTwo}.svg" width=36 height=36>` : '<div style="width:36px";height:36px ></div>'}
            ${day.quarterThree ? `<img src="./svg/${day.quarterThree}.svg" width=36 height=36>` : '<div style="width:36px";height:36px ></div>'}
            ${day.quarterFour ? `<img src="./svg/${day.quarterFour}.svg" width=36 height=36>` : '<div style="width:36px";height:36px ></div>'}
          </div>
        </div>
        <div class="temp_container">
          <p>${Math.round(day.minTemp)}&#8451/${Math.round(day.maxTemp)}&#8451;</p>
        </div>
        <div class="rain_container">
          <p>${Math.round(day.precAmount)} mm</p>
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
    const localTime = calculateLocalTime(entry.time);
    const currentHours = localTime.getHours();
    const currentDate = localTime.getDate();
    const next6Hours = entry.data.next_6_hours?.details;
    const next6HoursSummary = entry.data.next_6_hours?.summary;

    if (!tenDaysData[currentDate]) {
      tenDaysData[currentDate] = { ...entry, minTemp: next6Hours?.air_temperature_min, maxTemp: next6Hours?.air_temperature_max, precAmount: next6Hours?.precipitation_amount };
    }

    if (!tenDaysData[currentDate]['quarterOne'] && currentHours >= 0 && currentHours < 6) {
      tenDaysData[currentDate] = {
        ...entry,
        minTemp: next6Hours?.air_temperature_min,
        maxTemp: next6Hours?.air_temperature_max,
        quarterOne: next6HoursSummary?.symbol_code,
        precAmount: next6Hours?.precipitation_amount,
      };
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
    if (next6Hours?.precipitation_amount) {
      tenDaysData[currentDate].precAmount += next6Hours?.precipitation_amount;
    }
  }
  return Object.values(tenDaysData).slice(0, 10);
};
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
  const weatherOfDay = completeWeatherData.filter((item) => calculateLocalTime(item.time).getDate() === id);
  const modalDate = document.getElementById('modal-date');
  const currentDate = new Date(weatherOfDay[0].time);
  modalDate.textContent = `${daysOfWeek[currentDate.getDay()]} ${currentDate.getDate()} ${monthInYear[currentDate.getMonth()]}`;
  for (day of weatherOfDay) {
    const localTime = calculateLocalTime(day.time);
    const next1HoursSummary = day.data.next_1_hours?.summary || day.data.next_6_hours?.summary;
    const temperature = Math.round(day.data?.instant?.details?.air_temperature);
    const hour = localTime.getHours();
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
  // window.scrollTo({ top: window?.innerWidth < 760 ? 0 : 150 });
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

const calculateLocalTime = (time) => {
  let localTime;
  const date = new Date(time);
  if (selectedLocation?.timeZone) {
    const localeTimeString = date.toLocaleString('en-US', { timeZone: selectedLocation.timeZone });
    localTime = new Date(localeTimeString);
  } else {
    localTime = date;
  }
  return localTime;
};

// This is GPS location
const getGeoLocation = async () => {
  // Check if geolocation is supported by the browser
  if ('geolocation' in navigator) {
    // Prompt user for permission to access their location
    try {
      const result = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(
          // Success callback function
          (position) => {
            // Get the user's latitude and longitude coordinates
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            resolve({ latitude: lat, longitude: lng });
          },
          // Error callback function
          (error) => {
            // Handle errors, e.g. user denied location sharing permissions
            console.error('Error getting user location:', error);
            reject(error);
          },
          (error) => reject(error)
        )
      );
      return result;
    } catch (error) {
      console.log(error);
    }
  } else {
    // Geolocation is not supported by the browser
    console.error('Geolocation is not supported by this browser.');
  }
};

// This location from IP Address server
const getIpAddressLocation = async () => {
  let err;
  try {
    const res = await fetch('https://geolocation-db.com/json/');
    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
    err = error;
  }
  return { err };
};

search.addEventListener('click', getWeather);
window.addEventListener('load', getWeather);