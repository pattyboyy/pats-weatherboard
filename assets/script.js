const apiKey = '72c11aca14ce707bc2722d56639d1fdf';
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const currentWeatherDiv = document.getElementById('current-weather');
const forecastDiv = document.getElementById('forecast');
const searchHistoryList = document.getElementById('search-history');

// Function to fetch weather data from OpenWeatherMap API
async function fetchWeatherData(city) {
    try {
        const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
        const geocodingResponse = await fetch(geocodingUrl);

        if (!geocodingResponse.ok) {
            if (geocodingResponse.status === 401) {
                throw new Error('Invalid API key');
            } else {
                throw new Error('Failed to fetch geocoding data');
            }
        }

        const geocodingData = await geocodingResponse.json();

        if (geocodingData.length === 0) {
            throw new Error('City not found');
        }

        const { lat, lon } = geocodingData[0];

        const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${apiKey}`;
        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error('Failed to fetch weather data');
        }

        const weatherData = await weatherResponse.json();

        return weatherData;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

// Function to display current weather conditions
function displayCurrentWeather(weatherData) {
    const { current } = weatherData;

    const html = `
        <h3 class="text-xl font-bold">${weatherData.timezone}</h3>
        <p class="mb-2">Date: ${new Date(current.dt * 1000).toLocaleDateString()}</p>
        <img class="mx-auto mb-2" src="https://openweathermap.org/img/w/${current.weather[0].icon}.png" alt="Weather Icon">
        <p class="mb-2">Temperature: ${current.temp}°C</p>
        <p class="mb-2">Humidity: ${current.humidity}%</p>
        <p>Wind Speed: ${current.wind_speed} m/s</p>
    `;

    currentWeatherDiv.innerHTML = html;
}

// Function to display 5-day forecast
function displayForecast(weatherData) {
    const { daily } = weatherData;

    let html = '';

    for (let i = 1; i <= 5; i++) {
        const forecast = daily[i];

        html += `
            <div class="bg-gray-100 rounded-lg p-4 text-center">
                <p class="mb-2">Date: ${new Date(forecast.dt * 1000).toLocaleDateString()}</p>
                <img class="mx-auto mb-2" src="https://openweathermap.org/img/w/${forecast.weather[0].icon}.png" alt="Weather Icon">
                <p class="mb-2">Temperature: ${forecast.temp.day}°C</p>
                <p class="mb-2">Wind Speed: ${forecast.wind_speed} m/s</p>
                <p>Humidity: ${forecast.humidity}%</p>
            </div>
        `;
    }

    forecastDiv.innerHTML = html;
}

// Function to save search history to local storage
function saveSearchHistory(city) {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
}

// Function to render search history
function renderSearchHistory() {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

    let html = '';

    searchHistory.forEach(city => {
        html += `<li><a href="#" data-city="${city}" class="text-blue-500 hover:text-blue-700">${city}</a></li>`;
    });

    searchHistoryList.innerHTML = html;
}

// Function to handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (city) {
        try {
            const weatherData = await fetchWeatherData(city);
            displayCurrentWeather(weatherData);
            displayForecast(weatherData);
            saveSearchHistory(city);
            renderSearchHistory();
            cityInput.value = '';
        } catch (error) {
            if (error.message === 'City not found') {
                alert('City not found. Please try a different city.');
            } else if (error.message === 'Invalid API key') {
                alert('Invalid API key. Please check your API key and try again.');
            } else {
                alert('Failed to fetch weather data. Please try again.');
            }
        }
    }
}

// Function to handle search history click
async function handleSearchHistoryClick(event) {
    if (event.target.matches('a')) {
        const city = event.target.dataset.city;

        try {
            const weatherData = await fetchWeatherData(city);
            displayCurrentWeather(weatherData);
            displayForecast(weatherData);
        } catch (error) {
            if (error.message === 'City not found') {
                alert('City not found. Please try a different city.');
            } else if (error.message === 'Invalid API key') {
                alert('Invalid API key. Please check your API key and try again.');
            } else {
                alert('Failed to fetch weather data. Please try again.');
            }
        }
    }
}

// Event listeners
searchForm.addEventListener('submit', handleFormSubmit);
searchHistoryList.addEventListener('click', handleSearchHistoryClick);

// Initial render of search history
renderSearchHistory();