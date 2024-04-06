/* --------------- Weather Web App  --------------------- */
let show = document.getElementById('show');
let search = document.getElementById('search');
let cityVal = document.getElementById('city');
let tenDays = document.getElementById('tenDays');
const cityInfo = document.getElementById('cityInfo');
const localBackendUrl = 'http://localhost:3000';
const serverUrl = 'https://novovrijeme.com/api/v2';

const daysOfWeek = { 0: 'Nedelja', 1: 'Ponedeljak', 2: 'Utorak', 3: 'Srijeda', 4: 'Četvrtak', 5: 'Petak', 6: 'Subota' };
const monthInYear = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni', 'Juli', 'August', 'Septembar', 'Oktobar', 'Novmbar', 'Decembar'];

let getWeather = async (event) => {
  event.preventDefault();
  let params = new URL(document.location.toString()).searchParams;
  let cityParam = params.get('city');
  let cityValue = cityVal.value || cityParam;
  if (!cityValue) {
    show.innerHTML = `<h3 class="error">Upišite ime grada</h3>`;
    return;
  }
  let locationAPI = `${serverUrl}/location?q=${cityValue}`;
  const res = await fetch(locationAPI);
  const locations = await res.json();
  if (!locations?.length) {
    show.innerHTML = `<h3 class="error">City not found</h3>`;
    tenDays.innerHTML = '';
    cityInfo.style.display = 'none';
    return;
  }
  const closestLocation = locations[locations.length - 1];
  console.log('called API', locations);
  const latitude = closestLocation.latitude;
  const longitude = closestLocation.longitude;
  const country = closestLocation.country;
  const weatherAPIUrl = `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${latitude}&lon=${longitude}`;
  const weatherRes = await fetch(weatherAPIUrl);
  const weatherData = await weatherRes.json();

  const timeSeries = weatherData.properties.timeseries;
  const currentDetails = timeSeries[0].data.instant.details;
  const nextHour = timeSeries[0].data.next_1_hours;
  const weatherDataByDay = getWeatherDataByDay(timeSeries);
  // console.log(timeSeries, weatherDataByDay);

  cityVal.value = '';
  show.innerHTML = `
        <h2>${cityValue}, ${country}</h2>
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
     <div style="display: flex; padding: 12px; border-bottom: 1px solid gray; align-items: center">
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
        <div style="flex: 1; color:#BF3131;">
          <p>${Math.round(day.minTemp)}&#8451/${Math.round(day.maxTemp)}&#8451;</p>
        </div>
     </div>`;
  }
  tenDays.innerHTML = tenDaysHtml;
  cityInfo.style.display = 'block';
};

const getWeatherDataByDay = (timeseries) => {
  let tenDaysData = {};
  for (entry of timeseries) {
    const time = new Date(entry.time);
    const UTCHours = time.getUTCHours();
    const currentDate = time.getUTCDate();
    const next6Hours = entry.data.next_6_hours?.details;
    const next6HoursSummary = entry.data.next_6_hours?.summary;

    if (!tenDaysData[currentDate]) {
      tenDaysData[currentDate] = { ...entry, minTemp: next6Hours?.air_temperature_min, maxTemp: next6Hours?.air_temperature_max };
    }

    switch (UTCHours) {
      case 0:
        tenDaysData[currentDate] = { ...entry, minTemp: next6Hours?.air_temperature_min, maxTemp: next6Hours?.air_temperature_max, quarterOne: next6HoursSummary?.symbol_code };
        break;
      case 6:
        tenDaysData[currentDate]['quarterTwo'] = next6HoursSummary?.symbol_code;
        break;
      case 12:
        tenDaysData[currentDate]['quarterThree'] = next6HoursSummary?.symbol_code;
        break;
      case 18:
        tenDaysData[currentDate]['quarterFour'] = next6HoursSummary?.symbol_code;
        break;
      default:
        break;
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
