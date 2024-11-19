"use strict";

class WeatherApp {
  constructor() {
    this.API_KEY = "0db368783c9990590af7ec04591afe56"; // Your API key
    this.isMetric = true;
    this.autoRefreshInterval = 30 * 60 * 1000; // 30 minutes
    this.initializeElements();
    this.initializeEventListeners();
    this.initializeSidebar();
    this.displayRecentSearches();
    this.startAutoRefresh();
    this.initializeNetworkStatus();
  }

  initializeElements() {
    this.searchForm = document.getElementById("searchForm");
    this.searchInput = document.getElementById("searchInput");
    this.weatherInfo = document.getElementById("weatherInfo");
    this.loader = document.getElementById("loader");
    this.errorMessage = document.getElementById("errorMessage");
    this.unitToggle = document.getElementById("unitToggle");
    this.recentSearches = document.getElementById("recentSearches");
    this.locationModal = document.getElementById("locationModal");
    this.locationList = document.getElementById("locationList");
    this.offlineAlert = document.getElementById("offlineAlert");
  }

  initializeEventListeners() {
    this.searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.getWeather();
    });

    this.unitToggle.addEventListener("click", () => {
      this.isMetric = !this.isMetric;
      this.unitToggle.classList.add("switching");

      // Remove the class after animation completes
      setTimeout(() => {
        this.unitToggle.classList.remove("switching");
      }, 300);

      if (this.lastWeatherData) {
        this.displayWeather(this.lastWeatherData);
      }
      if (this.lastForecastData) {
        this.displayForecast(this.lastForecastData);
      }
    });
  }

  initializeSidebar() {
    this.sidebar = document.getElementById("sidebar");
    this.sidebarToggle = document.getElementById("sidebarToggle");

    if (this.sidebar && this.sidebarToggle) {
      this.sidebarToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        this.sidebar.classList.toggle("active");
      });

      document.addEventListener("click", (e) => {
        if (window.innerWidth <= 1024) {
          if (
            !this.sidebar.contains(e.target) &&
            !this.sidebarToggle.contains(e.target)
          ) {
            this.sidebar.classList.remove("active");
          }
        }
      });

      window.addEventListener("resize", () => {
        if (window.innerWidth > 1024) {
          this.sidebar.classList.remove("active");
        }
      });
    }
  }

  initializeNetworkStatus() {
    this.handleNetworkStatus();

    window.addEventListener("online", () => this.handleNetworkStatus());
    window.addEventListener("offline", () => this.handleNetworkStatus());
  }

  handleNetworkStatus() {
    if (navigator.onLine) {
      this.offlineAlert.classList.add("d-none");
      if (this.lastWeatherData) {
        this.searchCity(
          this.lastWeatherData.coord.lat,
          this.lastWeatherData.coord.lon,
          this.lastWeatherData.name
        );
      }
    } else {
      this.offlineAlert.classList.remove("d-none");
      this.weatherInfo.classList.add("d-none");
    }
  }

  async getWeather() {
    if (!navigator.onLine) {
      this.offlineAlert.classList.remove("d-none");
      return;
    }

    const search = this.searchInput.value.trim();
    if (!search) return;

    this.showLoader();
    try {
      // First, try to get coordinates
      const coordsResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${search}&limit=5&appid=${this.API_KEY}`
      );
      const coordsData = await coordsResponse.json();

      if (!coordsData.length) {
        throw new Error("Location not found. Please try a city name.");
      }

      if (coordsData.length > 1) {
        this.hideLoader();
        this.showLocationSelection(coordsData);
        return;
      }

      // Handle single result
      const location = coordsData[0];
      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${this.API_KEY}`
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${this.API_KEY}`
        ),
      ]);

      const weatherData = await weatherResponse.json();
      const forecastData = await forecastResponse.json();

      this.displayWeather(weatherData);
      this.displayForecast(forecastData);
      this.hideError();
    } catch (error) {
      this.showError(
        error.message || "Unable to fetch weather data. Please try again."
      );
      console.error("Error:", error);
    } finally {
      this.hideLoader();
    }
  }

  convertTemperature(temp) {
    return this.isMetric ? temp : (temp * 9) / 5 + 32;
  }

  formatTemperature(temp) {
    const converted = this.convertTemperature(temp);
    const unit = this.isMetric ? "°C" : "°F";
    return `${Math.round(converted)}${unit}`;
  }

  getLocalTime(timestamp, timezoneOffset) {
    // Create a UTC date first
    const utcDate = new Date(timestamp);

    // Convert UTC to the city's local time using the timezone offset
    const cityTimeMillis = utcDate.getTime() + timezoneOffset * 1000;
    const cityDate = new Date(cityTimeMillis);

    return cityDate;
  }

  displayWeather(data) {
    this.lastWeatherData = data;
    this.weatherInfo.classList.remove("d-none");

    // Add animation reset class
    const weatherCard = document.querySelector(".current-weather");
    weatherCard.classList.add("animate-weather");

    // Remove animation class after animation completes
    setTimeout(() => {
      weatherCard.classList.remove("animate-weather");
    }, 500);

    const cityName = document.querySelector(".city-name");
    const currentTemp = document.querySelector(".current-temp");
    const weatherDesc = document.querySelector(".weather-description");
    const currentDate = document.querySelector(".current-date");
    const currentTime = document.querySelector(".current-time");
    const feelsLike = document.querySelector(".feels-like");
    const humidity = document.querySelector(".humidity");
    const windSpeed = document.querySelector(".wind-speed");
    const weatherIcon = document.querySelector(".weather-icon-large");

    cityName.textContent = `${data.name}, ${data.sys.country}`;

    const cityTime = this.getLocalTime(Date.now(), data.timezone);

    // Format date
    currentDate.textContent = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }).format(cityTime);

    // Format time
    currentTime.textContent = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }).format(cityTime);

    const temp = this.isMetric ? data.main.temp : (data.main.temp * 9) / 5 + 32;
    const feelsLikeTemp = this.isMetric
      ? data.main.feels_like
      : (data.main.feels_like * 9) / 5 + 32;
    const unit = this.isMetric ? "°C" : "°F";

    currentTemp.textContent = `${Math.round(temp)}${unit}`;
    weatherDesc.textContent = data.weather[0].description;
    feelsLike.textContent = `${Math.round(feelsLikeTemp)}${unit}`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    weatherIcon.innerHTML = `
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" 
             alt="${data.weather[0].description}"
             class="weather-icon">
    `;

    this.addToRecentSearches(data);
  }

  displayForecast(data) {
    this.lastForecastData = data;
    const forecastContainer = document.querySelector(".forecast-container");
    forecastContainer.innerHTML = "";

    const dailyForecasts = data.list
      .filter((forecast) => forecast.dt_txt.includes("12:00:00"))
      .slice(0, 5);

    dailyForecasts.forEach((forecast) => {
      const date = new Date(forecast.dt * 1000);
      const day = date.toLocaleDateString("en-US", { weekday: "short" });

      forecastContainer.innerHTML += `
        <div class="forecast-card">
          <h3>${day}</h3>
          <img src="https://openweathermap.org/img/wn/${
            forecast.weather[0].icon
          }@2x.png" 
               alt="${forecast.weather[0].description}"
               class="weather-icon">
          <p class="forecast-temp">${this.formatTemperature(
            forecast.main.temp
          )}</p>
          <p class="forecast-desc">${forecast.weather[0].description}</p>
        </div>
      `;
    });
  }

  addToRecentSearches(cityData) {
    let recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    const newCity = {
      name: cityData.name,
      lat: cityData.coord.lat,
      lon: cityData.coord.lon,
      country: cityData.sys.country,
    };

    // Filter based on city name
    recent = recent.filter((city) => {
      // Handle both string and object formats
      return typeof city === "string"
        ? city !== newCity.name
        : city.name !== newCity.name;
    });

    recent.unshift(newCity);
    recent = recent.slice(0, 5);

    // Store the updated array
    localStorage.setItem("recentSearches", JSON.stringify(recent));
    this.displayRecentSearches();
  }

  displayRecentSearches() {
    const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    if (this.recentSearches) {
      this.recentSearches.innerHTML = recent
        .map((city) => {
          // Handle both string and object formats
          const cityName = typeof city === "string" ? city : city.name;
          const cityCountry = typeof city === "string" ? "" : city.country;
          const cityLat = typeof city === "string" ? null : city.lat;
          const cityLon = typeof city === "string" ? null : city.lon;

          if (cityLat && cityLon) {
            return `
              <li class="recent-item pointer">
                <div class="recent-city" onclick="weatherApp.searchCity(${cityLat}, ${cityLon}, '${cityName}')">
                  <i class="fas fa-history"></i>
                  <span>${cityName}${
              cityCountry ? `, ${cityCountry}` : ""
            }</span>
                </div>
                <button class="delete-recent" onclick="weatherApp.deleteRecentSearch('${cityName}')">
                  <i class="fas fa-times"></i>
                </button>
              </li>
            `;
          } else {
            // For old format entries, just show the city name without click functionality
            return `
              <li class="recent-item pointer">
                <div class="recent-city">
                  <i class="fas fa-history"></i>
                  <span>${cityName}</span>
                </div>
                <button class="delete-recent" onclick="weatherApp.deleteRecentSearch('${cityName}')">
                  <i class="fas fa-times"></i>
                </button>
              </li>
            `;
          }
        })
        .join("");
    }
  }

  async searchCity(lat, lon, name) {
    this.searchInput.value = name;

    try {
      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.API_KEY}`
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${this.API_KEY}`
        ),
      ]);

      const weatherData = await weatherResponse.json();
      const forecastData = await forecastResponse.json();

      this.displayWeather(weatherData);
      this.displayForecast(forecastData);
      this.hideError();
    } catch (error) {
      this.showError("Unable to fetch weather data. Please try again.");
      console.error("Error in searchCity:", error); // Debug log
    }
  }

  showLoader() {
    this.loader.classList.remove("d-none");
    this.weatherInfo.classList.add("d-none");
  }

  hideLoader() {
    this.loader.classList.add("d-none");
    this.weatherInfo.classList.remove("d-none");
  }

  showError(message) {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.remove("d-none");
  }

  hideError() {
    this.errorMessage.classList.add("d-none");
  }

  deleteRecentSearch(cityName) {
    let recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    recent = recent.filter((city) => city.name !== cityName);
    localStorage.setItem("recentSearches", JSON.stringify(recent));
    this.displayRecentSearches();
  }

  showLocationSelection(locations) {
    this.locationList.innerHTML = locations
      .map(
        (loc) => `
        <li onclick="weatherApp.selectLocation(${loc.lat}, ${loc.lon}, '${
          loc.name
        }')">
            ${loc.name}${loc.state ? `, ${loc.state}` : ""}, ${loc.country}
        </li>
    `
      )
      .join("");
    this.locationModal.classList.remove("d-none");
  }

  closeLocationModal() {
    this.locationModal.classList.add("d-none");
  }

  async selectLocation(lat, lon, name) {
    this.closeLocationModal();
    this.searchInput.value = name;

    try {
      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.API_KEY}`
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${this.API_KEY}`
        ),
      ]);

      const weatherData = await weatherResponse.json();
      const forecastData = await forecastResponse.json();

      this.displayWeather(weatherData);
      this.displayForecast(forecastData);
      this.hideError();
    } catch (error) {
      this.showError("Unable to fetch weather data. Please try again.");
    }
  }

  startAutoRefresh() {
    setInterval(() => {
      if (this.lastWeatherData) {
        this.searchCity(
          this.lastWeatherData.coord.lat,
          this.lastWeatherData.coord.lon,
          this.lastWeatherData.name
        );
      }
    }, this.autoRefreshInterval);
  }
}

// Initialize the app
const weatherApp = new WeatherApp();
