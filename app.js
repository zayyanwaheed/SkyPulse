const apiKey = "65104df2a36d09f00f7e9cf4f747a4a4";

// DOM Elements
const searchForm = document.querySelector("#search-bar");
const searchInput = document.querySelector("#search-bar input");

// Hero Section Elements
const tempElement = document.querySelector(".temp");
const conditionElement = document.querySelector(".temp-box p");
const iconElement = document.querySelector(".temp-box img");
const highTempElement = document.querySelector("#highest-temps");
const lowTempElement = document.querySelector("#lowest-temps");
const locationElement = document.querySelector(".location");

// Section 3 - Hourly Forecast
const hourlyForecastContainer = document.querySelector(".hourly-forecast-container");

// Section 4 - Weather Conditions
const humidityElement = document.querySelector("#humidity");
const uvElement = document.querySelector("#uv-index");
const windSpeedElement = document.querySelector("#wind-speed");
const visibilityElement = document.querySelector("#visibility");

// Section 5 - 5-Day Forecast
const daysForecastContainer = document.querySelector(".days-forecast");

// Current forecast data storage
let currentForecastData = null;
let selectedDate = null;

// Weather icon mapping
const weatherIcons = {
    "Clear": "sun.png",
    "Clouds": "cloud.png",
    "Rain": "rain.png",
    "Drizzle": "rain.png",
    "Thunderstorm": "rain.png",
    "Snow": "cloud.png",
    "Mist": "cloud.png",
    "Fog": "cloud.png",
    "Haze": "sunny-cloud.png"
};

// Initialize app on page load
document.addEventListener("DOMContentLoaded", () => {
    showLoader();
    createCalendarModal();
    createDayDetailModal();
    addCalendarButtonToForecast();
    getUserLocation();
});

// Search form event listener
searchForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const city = searchInput.value.trim();
    if (!city) return;
    showLoader();
    getWeatherByCity(city);
});

// Add Calendar Button to 5-Day Forecast Section
function addCalendarButtonToForecast() {
    const section5Title = document.querySelector(".section-5");
    if (section5Title) {
        const calendarBtn = document.createElement("button");
        calendarBtn.className = "forecast-calendar-btn";
        calendarBtn.innerHTML = '<i class="fa-regular fa-calendar"></i>';
        calendarBtn.title = "Open Calendar";
        calendarBtn.addEventListener("click", showCalendar);
        section5Title.appendChild(calendarBtn);
    }
}

// Create Calendar Modal
function createCalendarModal() {
    const modal = document.createElement("div");
    modal.className = "calendar-modal";
    modal.id = "calendarModal";
    modal.innerHTML = `
        <div class="calendar-content">
            <div class="calendar-header">
                <button class="calendar-nav" id="prevMonth"><i class="fa-solid fa-chevron-left"></i></button>
                <h3 id="calendarMonthYear"></h3>
                <button class="calendar-nav" id="nextMonth"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <div class="calendar-weekdays">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>
            <div class="calendar-days" id="calendarDays"></div>
            <button class="close-calendar" id="closeCalendar">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById("closeCalendar").addEventListener("click", hideCalendar);
    document.getElementById("prevMonth").addEventListener("click", () => changeMonth(-1));
    document.getElementById("nextMonth").addEventListener("click", () => changeMonth(1));
    
    modal.addEventListener("click", (e) => {
        if (e.target === modal) hideCalendar();
    });
}

// Create Day Detail Modal
function createDayDetailModal() {
    const modal = document.createElement("div");
    modal.className = "day-detail-modal";
    modal.id = "dayDetailModal";
    modal.innerHTML = `
        <div class="day-detail-content">
            <button class="close-detail" id="closeDetail"><i class="fa-solid fa-xmark"></i></button>
            <div class="day-detail-header">
                <h2 id="detailDate"></h2>
            </div>
            <div class="day-detail-hero">
                <img id="detailIcon" src="" alt="">
                <div class="detail-temp" id="detailTemp"></div>
                <p id="detailCondition"></p>
                <div class="detail-temp-var">
                    <p id="detailHigh"></p>
                    <p id="detailLow"></p>
                </div>
            </div>
            <h3>24-HOUR FORECAST</h3>
            <div class="hourly-24-container" id="hourly24Container"></div>
            <h3>CONDITIONS</h3>
            <div class="detail-conditions" id="detailConditions"></div>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById("closeDetail").addEventListener("click", hideDayDetail);
    
    modal.addEventListener("click", (e) => {
        if (e.target === modal) hideDayDetail();
    });
}

// Calendar variables
let currentCalendarDate = new Date();

// Show calendar
function showCalendar() {
    const modal = document.getElementById("calendarModal");
    modal.classList.add("active");
    renderCalendar();
}

// Hide calendar
function hideCalendar() {
    const modal = document.getElementById("calendarModal");
    modal.classList.remove("active");
}

// Change month
function changeMonth(delta) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
    renderCalendar();
}

// Render calendar
function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    document.getElementById("calendarMonthYear").textContent = 
        new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const daysContainer = document.getElementById("calendarDays");
    daysContainer.innerHTML = "";
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.className = "calendar-day empty";
        daysContainer.appendChild(empty);
    }
    
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement("div");
        dayEl.className = "calendar-day";
        dayEl.textContent = day;
        
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            dayEl.classList.add("today");
        }
        
        if (selectedDate === dateStr) {
            dayEl.classList.add("selected");
        }
        
        if (currentForecastData && currentForecastData[dateStr]) {
            dayEl.classList.add("has-data");
        }
        
        dayEl.addEventListener("click", () => selectDate(dateStr));
        daysContainer.appendChild(dayEl);
    }
}

// Select date from calendar
function selectDate(dateStr) {
    selectedDate = dateStr;
    hideCalendar();
    
    if (currentForecastData && currentForecastData[dateStr]) {
        showDayDetail(currentForecastData[dateStr]);
    }
}

// Show day detail modal
function showDayDetail(dayData) {
    const modal = document.getElementById("dayDetailModal");
    const date = new Date(dayData.dt * 1000);
    
    document.getElementById("detailDate").textContent = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const mainCondition = getMostCommonCondition(dayData.conditions);
    const iconFile = weatherIcons[mainCondition] || "sun.png";
    
    document.getElementById("detailIcon").src = iconFile;
    document.getElementById("detailIcon").alt = mainCondition;
    
    const avgTemp = Math.round(dayData.temps.reduce((a, b) => a + b, 0) / dayData.temps.length);
    document.getElementById("detailTemp").textContent = `${avgTemp}°C`;
    document.getElementById("detailCondition").textContent = getConditionText(mainCondition);
    
    const maxTemp = Math.round(Math.max(...dayData.temps));
    const minTemp = Math.round(Math.min(...dayData.temps));
    document.getElementById("detailHigh").textContent = `H: ${maxTemp}°C`;
    document.getElementById("detailLow").textContent = `L: ${minTemp}°C`;
    
    render24HourForecast(dayData.hourlyData);
    renderDetailConditions(dayData);
    
    modal.classList.add("active");
}

// Hide day detail modal
function hideDayDetail() {
    const modal = document.getElementById("dayDetailModal");
    modal.classList.remove("active");
}

// Render 24-hour forecast with more details
function render24HourForecast(hourlyData) {
    const container = document.getElementById("hourly24Container");
    container.innerHTML = "";
    
    if (!hourlyData || hourlyData.length === 0) {
        container.innerHTML = "<p>No hourly data available</p>";
        return;
    }
    
    hourlyData.forEach((item, index) => {
        const date = new Date(item.dt * 1000);
        const hour = date.getHours();
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        const timeLabel = index === 0 ? "Now" : `${displayHour}${ampm}`;
        
        const temp = Math.round(item.main.temp);
        const condition = item.weather[0].main;
        const iconFile = weatherIcons[condition] || "sun.png";
        const humidity = item.main.humidity;
        const windSpeed = Math.round(item.wind.speed * 2.237);
        const feelsLike = Math.round(item.main.feels_like);
        const pop = item.pop ? Math.round(item.pop * 100) : 0;
        
        const hourBar = document.createElement("div");
        hourBar.className = "hour-24-bar";
        hourBar.innerHTML = `
            <div class="hour-24-time">${timeLabel}</div>
            <div class="hour-24-icon"><img src="${iconFile}" alt="${condition}"></div>
            <div class="hour-24-temp">${temp}°</div>
            <div class="hour-24-bar-visual" style="--temp-height: ${Math.max(10, Math.min(100, temp + 20))}%"></div>
            <div class="hour-24-details">
                <span class="hour-feels">Feels ${feelsLike}°</span>
                <span class="hour-humidity"><i class="fa-solid fa-droplet"></i> ${humidity}%</span>
                <span class="hour-wind"><i class="fa-solid fa-wind"></i> ${windSpeed}mph</span>
                ${pop > 0 ? `<span class="hour-rain"><i class="fa-solid fa-cloud-rain"></i> ${pop}%</span>` : ''}
            </div>
        `;
        container.appendChild(hourBar);
    });
}

// Render detail conditions
function renderDetailConditions(dayData) {
    const container = document.getElementById("detailConditions");
    
    const avgHumidity = Math.round(dayData.humidity.reduce((a, b) => a + b, 0) / dayData.humidity.length);
    const avgWind = Math.round(dayData.windSpeed.reduce((a, b) => a + b, 0) / dayData.windSpeed.length);
    const maxUv = Math.max(...dayData.uvIndex);
    
    container.innerHTML = `
        <div class="detail-condition-card">
            <i class="fa-solid fa-droplet"></i>
            <span class="label">Humidity</span>
            <span class="value">${avgHumidity}%</span>
        </div>
        <div class="detail-condition-card">
            <i class="fa-solid fa-wind"></i>
            <span class="label">Wind</span>
            <span class="value">${avgWind} mph</span>
        </div>
        <div class="detail-condition-card">
            <i class="fa-solid fa-sun"></i>
            <span class="label">UV Index</span>
            <span class="value">${maxUv}</span>
        </div>
        <div class="detail-condition-card">
            <i class="fa-solid fa-cloud-rain"></i>
            <span class="label">Rain Chance</span>
            <span class="value">${dayData.rainChance || 0}%</span>
        </div>
    `;
}

// Show loader overlay
function showLoader() {
    let loader = document.querySelector(".loader-overlay");
    if (!loader) {
        loader = document.createElement("div");
        loader.className = "loader-overlay";
        loader.innerHTML = `
            <div class="loading"></div>
            <p>Loading weather data...</p>
        `;
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(186, 230, 253, 0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            gap: 1rem;
        `;
        document.body.appendChild(loader);
    }
    loader.style.display = "flex";
}

// Hide loader
function hideLoader() {
    const loader = document.querySelector(".loader-overlay");
    if (loader) {
        loader.style.display = "none";
    }
}

// Get user's location using Geolocation API
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherByCoords(lat, lon);
            },
            (error) => {
                console.log("Geolocation error:", error);
                getWeatherByCity("San Francisco");
            }
        );
    } else {
        getWeatherByCity("San Francisco");
    }
}

// Get weather by coordinates
async function getWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        if (!response.ok) throw new Error("Location not found");
        const data = await response.json();
        
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        const forecastData = await forecastResponse.json();
        
        updateUI(data, forecastData);
        hideLoader();
    } catch (error) {
        console.error(error);
        hideLoader();
        alert("Unable to fetch weather data. Please try again.");
    }
}

// Get weather by city name
async function getWeatherByCity(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        if (!response.ok) throw new Error("City not found");
        const data = await response.json();
        
        const lat = data.coord.lat;
        const lon = data.coord.lon;
        
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const forecastData = await forecastResponse.json();
        
        updateUI(data, forecastData);
        hideLoader();
    } catch (error) {
        console.error(error);
        hideLoader();
        alert(error.message);
    }
}

// Update all UI elements
function updateUI(data, forecastData) {
    updateCurrentWeather(data);
    updateHourlyForecast(forecastData);
    updateWeatherConditions(data);
    updateFiveDayForecast(forecastData);
}

// Update current weather section (Hero)
function updateCurrentWeather(data) {
    const temperature = Math.round(data.main.temp);
    tempElement.textContent = `${temperature}°C`;
    
    const condition = data.weather[0].main;
    conditionElement.textContent = getConditionText(condition);
    
    const iconFile = weatherIcons[condition] || "sun.png";
    iconElement.src = iconFile;
    iconElement.alt = condition;
    
    const cityName = data.name;
    const countryCode = data.sys.country;
    locationElement.innerHTML = `
        <i class="fa-solid fa-location-dot"></i>
        ${cityName}, ${countryCode}
    `;
    
    const high = Math.round(data.main.temp_max);
    const low = Math.round(data.main.temp_min);
    highTempElement.textContent = `H: ${high}°C`;
    lowTempElement.textContent = `L: ${low}°C`;
}

// Update hourly forecast with more details
function updateHourlyForecast(forecastData) {
    if (!forecastData || !forecastData.list) return;
    
    const hourlyData = forecastData.list.slice(0, 8);
    hourlyForecastContainer.innerHTML = "";
    
    hourlyData.forEach((item, index) => {
        const date = new Date(item.dt * 1000);
        const hour = date.getHours();
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        const timeLabel = index === 0 ? "Now" : `${displayHour}${ampm}`;
        
        const temp = Math.round(item.main.temp);
        const condition = item.weather[0].main;
        const iconFile = weatherIcons[condition] || "sun.png";
        const humidity = item.main.humidity;
        const windSpeed = Math.round(item.wind.speed * 2.237);
        const feelsLike = Math.round(item.main.feels_like);
        const pop = item.pop ? Math.round(item.pop * 100) : 0;
        
        const hourCard = document.createElement("div");
        hourCard.className = "hour-card detailed";
        hourCard.innerHTML = `
            <div class="time">${timeLabel}</div>
            <div class="hf-icon">
                <img src="${iconFile}" alt="${condition}">
            </div>
            <div class="hf-temp">${temp}°C</div>
            <div class="hf-details">
                <span class="hf-feels">Feels ${feelsLike}°</span>
                <span class="hf-humidity"><i class="fa-solid fa-droplet"></i> ${humidity}%</span>
                <span class="hf-wind"><i class="fa-solid fa-wind"></i> ${windSpeed}mph</span>
                ${pop > 0 ? `<span class="hf-rain"><i class="fa-solid fa-cloud-rain"></i> ${pop}%</span>` : ''}
            </div>
        `;
        hourlyForecastContainer.appendChild(hourCard);
    });
}

// Update weather conditions (Section 4)
function updateWeatherConditions(data) {
    const humidity = data.main.humidity;
    humidityElement.textContent = `${humidity}%`;
    
    const temp = data.main.temp;
    const dewPoint = Math.round(temp - ((100 - humidity) / 5));
    const dewPointElement = humidityElement.nextElementSibling;
    if (dewPointElement) dewPointElement.textContent = `Dew point: ${dewPoint}°`;
    
    const windSpeed = Math.round(data.wind.speed * 2.237);
    windSpeedElement.textContent = `${windSpeed} mph`;
    
    const windDeg = data.wind.deg;
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const windDir = directions[Math.round(windDeg / 45) % 8];
    const windDirElement = windSpeedElement.nextElementSibling;
    if (windDirElement) windDirElement.textContent = `Direction: ${windDir}`;
    
    const visibilityMiles = data.visibility ? Math.round(data.visibility / 1609.34) : 10;
    visibilityElement.textContent = `${visibilityMiles} mi`;
    
    const condition = data.weather[0].main;
    let uvIndex = 0;
    if (condition === "Clear") uvIndex = Math.floor(Math.random() * 3) + 5;
    else if (condition === "Clouds") uvIndex = Math.floor(Math.random() * 3) + 2;
    else uvIndex = Math.floor(Math.random() * 2) + 1;
    
    uvElement.textContent = uvIndex;
    
    let riskLevel = "Low";
    if (uvIndex >= 3 && uvIndex <= 5) riskLevel = "Moderate";
    else if (uvIndex >= 6 && uvIndex <= 7) riskLevel = "High";
    else if (uvIndex >= 8) riskLevel = "Very High";
    
    const uvSubElement = uvElement.nextElementSibling;
    if (uvSubElement) uvSubElement.textContent = `${riskLevel} risk`;
}

// Get most common condition from array
function getMostCommonCondition(conditions) {
    const conditionCounts = {};
    conditions.forEach(c => {
        conditionCounts[c] = (conditionCounts[c] || 0) + 1;
    });
    return Object.keys(conditionCounts).reduce((a, b) => 
        conditionCounts[a] > conditionCounts[b] ? a : b
    );
}

// Update 5-day forecast with clickable cards
function updateFiveDayForecast(forecastData) {
    if (!forecastData || !forecastData.list) return;
    
    const dailyData = {};
    
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toISOString().split('T')[0];
        
        if (!dailyData[dayKey]) {
            dailyData[dayKey] = {
                temps: [],
                conditions: [],
                hourlyData: [],
                humidity: [],
                windSpeed: [],
                uvIndex: [],
                rainChance: 0,
                dt: item.dt
            };
        }
        dailyData[dayKey].temps.push(item.main.temp);
        dailyData[dayKey].conditions.push(item.weather[0].main);
        dailyData[dayKey].hourlyData.push(item);
        dailyData[dayKey].humidity.push(item.main.humidity);
        dailyData[dayKey].windSpeed.push(item.wind.speed * 2.237);
        
        const condition = item.weather[0].main;
        let uv = 0;
        if (condition === "Clear") uv = Math.floor(Math.random() * 3) + 5;
        else if (condition === "Clouds") uv = Math.floor(Math.random() * 3) + 2;
        else uv = Math.floor(Math.random() * 2) + 1;
        dailyData[dayKey].uvIndex.push(uv);
        
        if (item.pop) {
            dailyData[dayKey].rainChance = Math.max(dailyData[dayKey].rainChance, Math.round(item.pop * 100));
        }
    });
    
    currentForecastData = dailyData;
    
    const days = Object.keys(dailyData).slice(1, 6);
    
    daysForecastContainer.innerHTML = "";
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    days.forEach(dayKey => {
        const dayData = dailyData[dayKey];
        const date = new Date(dayData.dt * 1000);
        const dayName = dayNames[date.getDay()];
        
        const maxTemp = Math.round(Math.max(...dayData.temps));
        const minTemp = Math.round(Math.min(...dayData.temps));
        
        const mainCondition = getMostCommonCondition(dayData.conditions);
        const iconFile = weatherIcons[mainCondition] || "sun.png";
        const conditionText = getShortConditionText(mainCondition);
        
        const dayCard = document.createElement("div");
        dayCard.className = "day-card clickable";
        dayCard.innerHTML = `
            <p class="day">${dayName}</p>
            <img src="${iconFile}" alt="${mainCondition}">
            <p class="condition">${conditionText}</p>
            <p class="temps">
                <span>${maxTemp}°C</span>
                <span>${minTemp}°C</span>
            </p>
            <div class="click-hint"><i class="fa-solid fa-chevron-up"></i></div>
        `;
        
        dayCard.addEventListener("click", () => showDayDetail(dayData));
        daysForecastContainer.appendChild(dayCard);
    });
}

// Helper function to get readable condition text
function getConditionText(condition) {
    const conditionMap = {
        "Clear": "Clear Sky",
        "Clouds": "Mostly Cloudy",
        "Rain": "Rainy",
        "Drizzle": "Light Rain",
        "Thunderstorm": "Thunderstorm",
        "Snow": "Snowy",
        "Mist": "Misty",
        "Fog": "Foggy",
        "Haze": "Hazy"
    };
    return conditionMap[condition] || condition;
}

// Helper function to get short condition text for 5-day forecast
function getShortConditionText(condition) {
    const conditionMap = {
        "Clear": "Sunny",
        "Clouds": "Cloudy",
        "Rain": "Rainy",
        "Drizzle": "Drizzle",
        "Thunderstorm": "Storm",
        "Snow": "Snow",
        "Mist": "Mist",
        "Fog": "Fog",
        "Haze": "Haze"
    };
    return conditionMap[condition] || condition;
}