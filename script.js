/* --------------- Weather Web App  --------------------- */
let show = document.getElementById('show');
let search = document.getElementById('search');
let cityVal = document.getElementById('city');
let tenDays = document.getElementById('tenDays');
const cityInfo = document.getElementById('cityInfo');

const bosniaHerzegovinaCities = [
  { name: 'Sarajevo', latitude: 43.8563, longitude: 18.4131 },
  { name: 'Banja Luka', latitude: 44.7758, longitude: 17.1854 },
  { name: 'Tuzla', latitude: 44.5374, longitude: 18.6696 },
  { name: 'Zenica', latitude: 44.2014, longitude: 17.9034 },
  { name: 'Mostar', latitude: 43.3423, longitude: 17.8128 },
  { name: 'Bihać', latitude: 44.8168, longitude: 15.87 },
  { name: 'Bugojno', latitude: 44.057, longitude: 17.4507 },
  { name: 'Brčko', latitude: 44.872, longitude: 18.8083 },
  { name: 'Bijeljina', latitude: 44.7638, longitude: 19.2164 },
  { name: 'Prijedor', latitude: 44.9817, longitude: 16.7137 },
  { name: 'Doboj', latitude: 44.7347, longitude: 18.086 },
  { name: 'Cazin', latitude: 44.9661, longitude: 15.9439 },
  { name: 'Travnik', latitude: 44.2264, longitude: 17.6708 },
  { name: 'Gradiška', latitude: 45.1347, longitude: 17.9858 },
  { name: 'Sanski Most', latitude: 44.7659, longitude: 16.6676 },
  { name: 'Velika Kladuša', latitude: 45.1899, longitude: 15.8063 },
  { name: 'Visoko', latitude: 43.9883, longitude: 18.18 },
  { name: 'Živinice', latitude: 44.4492, longitude: 18.6492 },
  { name: 'Konjic', latitude: 43.6511, longitude: 17.9619 },
  { name: 'Zavidovići', latitude: 44.445, longitude: 18.1492 },
  { name: 'Čapljina', latitude: 43.1125, longitude: 17.6778 },
  { name: 'Gračanica', latitude: 44.7035, longitude: 18.3076 },
  { name: 'Bosanska Krupa', latitude: 44.8825, longitude: 16.15 },
  { name: 'Tešanj', latitude: 44.6117, longitude: 17.9825 },
  { name: 'Srebrenik', latitude: 44.7078, longitude: 18.4897 },
  { name: 'Bosanska Gradiška', latitude: 45.14, longitude: 17.9814 },
  { name: 'Derventa', latitude: 44.9719, longitude: 17.9071 },
  { name: 'Novi Travnik', latitude: 44.1675, longitude: 17.6578 },
  { name: 'Bosanski Brod', latitude: 45.1381, longitude: 17.9842 },
  { name: 'Goražde', latitude: 43.6679, longitude: 18.975 },
  { name: 'Bosanski Novi', latitude: 45.0453, longitude: 16.3792 },
  { name: 'Mrkonjić Grad', latitude: 44.4189, longitude: 17.0814 },
  { name: 'Kakanj', latitude: 44.1275, longitude: 18.1144 },
  { name: 'Ljubuški', latitude: 43.1964, longitude: 17.545 },
  { name: 'Žepče', latitude: 44.4267, longitude: 18.035 },
  { name: 'Zvornik', latitude: 44.3842, longitude: 19.1071 },
  { name: 'Vogošća', latitude: 43.9128, longitude: 18.3269 },
  { name: 'Jajce', latitude: 44.3414, longitude: 17.2653 },
  { name: 'Orašje', latitude: 45.0086, longitude: 18.6925 },
  { name: 'Stolac', latitude: 43.0914, longitude: 17.9592 },
  { name: 'Pale', latitude: 43.816, longitude: 18.5686 },
  { name: 'Hadžići', latitude: 43.8433, longitude: 18.1294 },
  { name: 'Ilijaš', latitude: 43.9475, longitude: 18.2769 },
  { name: 'Kiseljak', latitude: 43.9458, longitude: 17.8158 },
  { name: 'Grude', latitude: 43.375, longitude: 17.3875 },
  { name: 'Drvar', latitude: 44.3311, longitude: 16.3844 },
  { name: 'Glamoč', latitude: 44.0569, longitude: 16.8219 },
  { name: 'Kupres', latitude: 43.865, longitude: 17.275 },
  { name: 'Teslić', latitude: 44.6117, longitude: 17.8553 },
  { name: 'Istočno Sarajevo', latitude: 43.85, longitude: 18.3833 },
  { name: 'Ključ', latitude: 44.5339, longitude: 16.7764 },
  { name: 'Bosansko Grahovo', latitude: 44.1819, longitude: 16.3289 },
  { name: 'Široki Brijeg', latitude: 43.3842, longitude: 17.5947 },
  { name: 'Kotor Varoš', latitude: 44.6344, longitude: 17.3169 },
  { name: 'Trnovo', latitude: 43.6589, longitude: 18.4378 },
  { name: 'Bosanski Petrovac', latitude: 44.5511, longitude: 16.3789 },
  { name: 'Maglaj', latitude: 44.5458, longitude: 18.1017 },
  { name: 'Ljubinje', latitude: 42.8675, longitude: 18.4475 },
  { name: 'Modriča', latitude: 44.9706, longitude: 18.2961 },
  { name: 'Šipovo', latitude: 44.3019, longitude: 17.0869 },
  { name: 'Neum', latitude: 42.915, longitude: 17.6175 },
  { name: 'Bosanska Dubica', latitude: 45.1733, longitude: 16.8092 },
  { name: 'Bosanska Otoka', latitude: 44.8283, longitude: 16.9069 },
  { name: 'Petrovo', latitude: 44.7781, longitude: 17.2744 },
  { name: 'Breza', latitude: 44.1169, longitude: 18.2681 },
  { name: 'Srbac', latitude: 45.0972, longitude: 17.5242 },
  // Add more cities here...
];

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
  const searchedCity = bosniaHerzegovinaCities.find((searchElement) => searchElement.name.toLowerCase() === cityValue.toLowerCase());
  let latitude;
  let longitude;
  let country;
  if (!searchedCity) {
    let locationAPI = `https://novovrijeme.com/api/v2/location?q=${cityValue}`;
    const res = await fetch(locationAPI);
    const locationData = await res.json();
    const locations = locationData?._embedded?.location;
    if (!locations?.length) {
      show.innerHTML = `<h3 class="error">City not found</h3>`;
      tenDays.innerHTML = '';
      cityInfo.style.display = 'none';
      return;
    }
    const closestLocation = locations[locations.length - 1];
    console.log('called API', locationData, closestLocation);
    latitude = closestLocation.position.lat;
    longitude = closestLocation.position.lon;
    country = closestLocation.country.name;
  } else {
    latitude = searchedCity.latitude;
    longitude = searchedCity.longitude;
    country = 'BA';
  }

  const weatherAPIUrl = `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${latitude}&lon=${longitude}`;
  const weatherRes = await fetch(weatherAPIUrl);
  const weatherData = await weatherRes.json();

  const timeSeries = weatherData.properties.timeseries;
  const currentDetails = timeSeries[0].data.instant.details;
  const nextHour = timeSeries[0].data.next_1_hours;
  const weatherDataByDay = getWeatherDataByDay(timeSeries);
  console.log(timeSeries, weatherDataByDay);

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
