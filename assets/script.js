// script.js

const apiKey = '7697dd5cd92a42508c8c4ab124e4beea';
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const searchHistory = document.getElementById('search-history');
const currentWeather = document.getElementById('current-weather');
const forecast = document.getElementById('forecast');

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city !== '') {
        getWeatherData(city);
        cityInput.value = '';
    }
});

function getWeatherData(city) {
    const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    
    fetch(geocodingUrl)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const { lat, lon } = data[0];
                const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
                
                fetch(weatherUrl)
                    .then(response => response.json())
                    .then(weatherData => {
                        displayCurrentWeather(weatherData.city.name, weatherData.list[0]);
                        displayForecast(weatherData.list);
                        saveSearchHistory(city);
                    })
                    .catch(error => console.log('Error fetching weather data:', error));
            } else {
                console.log('City not found');
            }
        })
        .catch(error => console.log('Error fetching coordinates:', error));
}

function displayCurrentWeather(city, weather) {
    const date = new Date(weather.dt * 1000).toLocaleDateString();
    const iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
    const temperature = weather.main.temp;
    const humidity = weather.main.humidity;
    const windSpeed = weather.wind.speed;

    currentWeather.innerHTML = `
        <h2 class="text-2xl font-bold mb-2">${city} (${date})</h2>
        <div class="flex items-center mb-4">
            <img src="${iconUrl}" alt="Weather Icon" class="w-16 h-16 mr-4">
            <div>
                <p class="text-xl">Temperature: ${temperature} °C</p>
                <p>Humidity: ${humidity}%</p>
                <p>Wind Speed: ${windSpeed} m/s</p>
            </div>
        </div>
    `;
}

function displayForecast(forecastData) {
    forecast.innerHTML = '';

    for (let i = 0; i < forecastData.length; i += 8) {
        const date = new Date(forecastData[i].dt * 1000).toLocaleDateString();
        const iconUrl = `https://openweathermap.org/img/w/${forecastData[i].weather[0].icon}.png`;
        const temperature = forecastData[i].main.temp;
        const humidity = forecastData[i].main.humidity;
        const windSpeed = forecastData[i].wind.speed;

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('bg-white', 'p-4', 'rounded-md', 'shadow-md', 'text-center');
        forecastItem.innerHTML = `
            <p class="font-bold mb-2">${date}</p>
            <img src="${iconUrl}" alt="Weather Icon" class="mx-auto mb-2 w-16 h-16">
            <p>Temperature: ${temperature} °C</p>
            <p>Humidity: ${humidity}%</p>
            <p>Wind Speed: ${windSpeed} m/s</p>
        `;

        forecast.appendChild(forecastItem);
    }
}

function saveSearchHistory(city) {
    let searchHistoryData = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!searchHistoryData.includes(city)) {
        searchHistoryData.push(city);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistoryData));
        updateSearchHistory();
    }
}

function updateSearchHistory() {
    searchHistory.innerHTML = '';
    let searchHistoryData = JSON.parse(localStorage.getItem('searchHistory')) || [];
    searchHistoryData.forEach(city => {
        const historyItem = document.createElement('div');
        historyItem.textContent = city;
        historyItem.classList.add('px-4', 'py-2', 'bg-white', 'rounded-md', 'shadow-md', 'mb-2', 'cursor-pointer', 'hover:bg-gray-100');
        historyItem.addEventListener('click', () => {
            getWeatherData(city);
        });
        searchHistory.appendChild(historyItem);
    });
}

// Load search history on page load
updateSearchHistory();