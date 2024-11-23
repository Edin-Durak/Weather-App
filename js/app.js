("use strict");
import { translations } from "./translations.js";

class WeatherApp {
  constructor() {
    this.currentLanguage = localStorage.getItem("language") || "bs";
    this.API_KEY = config.WEATHER_API_KEY;
    this.isMetric = true;
    this.autoRefreshInterval = 30 * 60 * 1000; // 30 minutes

    // First, initialize all elements
    this.initializeElements();

    // Show welcome content before setting up other functionality
    this.showWelcomeContent();

    // Then initialize the rest
    this.initializeEventListeners();
    this.initializeSidebar();
    this.displayRecentSearches();
    this.startAutoRefresh();
    this.initializeNetworkStatus();
    this.displayFavorites();
    this.initializeLanguage();

    // Update date and time every minute
    setInterval(() => {
      this.updateDateTime();
    }, 60000); // 60000 ms = 1 minute

    // Initial date/time update
    this.updateDateTime();
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
    this.favoriteToggle = document.getElementById("favoriteToggle");
    this.favoritesList = document.getElementById("favoritesList");
    this.languageToggle = document.getElementById("languageToggle");
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

    this.favoriteToggle.addEventListener("click", () => {
      this.toggleFavorite();
    });

    this.languageToggle.addEventListener("click", () => this.toggleLanguage());
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

    // First, remove welcome content if it exists
    const welcomeContent = document.querySelector(".welcome-content");
    if (welcomeContent) {
      welcomeContent.remove();
    }

    // Then show weather info
    const weatherInfo = document.getElementById("weatherInfo");
    if (weatherInfo) {
      weatherInfo.classList.remove("d-none");
    }

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

    // Update the weather data
    cityName.textContent = `${data.name}, ${data.sys.country}`;

    const cityTime = this.getLocalTime(Date.now(), data.timezone);

    // Format date and time
    const formatDateTime = (cityTime) => {
      // Get English format first
      const englishDate = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      }).format(cityTime);

      if (this.currentLanguage === "bs") {
        // Split the English date into parts
        const [weekday, monthDay, year] = englishDate.split(", ");
        const [month, day] = monthDay.split(" ");

        // Get translations from our translation object
        const translatedWeekday = translations.bs[weekday.toLowerCase()];
        const translatedMonth = translations.bs[month.toLowerCase()];

        // Format in Bosnian style
        currentDate.textContent = `${translatedWeekday}, ${day}. ${translatedMonth} ${year}.`;
      } else {
        currentDate.textContent = englishDate;
      }

      // Format time
      currentTime.textContent = new Intl.DateTimeFormat(
        this.currentLanguage === "bs" ? "bs-BA" : "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: this.currentLanguage === "bs" ? false : true,
        }
      ).format(cityTime);
    };

    formatDateTime(cityTime);

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

    const favorites = this.getFavorites();
    const isFavorite = favorites.some((fav) => fav.name === data.name);

    this.favoriteToggle.classList.toggle("active", isFavorite);
    this.favoriteToggle.querySelector("i").classList.toggle("fas", isFavorite);
    this.favoriteToggle.querySelector("i").classList.toggle("far", !isFavorite);
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

  async displayRecentSearches() {
    const recentSearches = JSON.parse(
      localStorage.getItem("recentSearches") || "[]"
    );
    const recentList = document.querySelector("#recentSearches");

    // First, update all weather data
    const updatedSearches = await Promise.all(
      recentSearches.map(async (city) => {
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${this.API_KEY}`
          );
          const weatherData = await response.json();

          return {
            ...city,
            temp: weatherData.main?.temp ?? 0,
            weatherIcon: weatherData.weather?.[0]?.icon || "01d",
          };
        } catch (error) {
          return city; // Keep existing data if fetch fails
        }
      })
    );

    // Update localStorage with fresh data
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));

    // Display updated data in the correct element
    recentList.innerHTML = updatedSearches
      .map(
        (city) => `
                <li class="recent-item d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-2">
                        <span class="recent-city" onclick="weatherApp.selectLocation(${
                          city.lat
                        }, ${city.lon}, '${city.name}')">${city.name}</span>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <div class="d-flex align-items-center gap-1">
                            ${
                              city.weatherIcon
                                ? `
                                <img 
                                    src="https://openweathermap.org/img/wn/${city.weatherIcon}.png" 
                                    alt="Weather icon"
                                    class="weather-icon-small"
                                    onerror="this.src='https://openweathermap.org/img/wn/01d.png'"
                                >
                            `
                                : ""
                            }
                            <span class="temperature" data-temp="${city.temp}">
                                ${this.formatTemperature(city.temp)}
                            </span>
                        </div>
                        <button 
                            class="btn btn-link text-danger p-0" 
                            onclick="event.stopPropagation(); weatherApp.deleteRecentSearch('${
                              city.name
                            }')"
                        >
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </li>
            `
      )
      .join("");
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
    const loader = document.getElementById("loader");
    const weatherInfo = document.getElementById("weatherInfo");

    if (loader) {
      loader.classList.remove("d-none");
    }
    if (weatherInfo) {
      weatherInfo.classList.add("d-none");
    }
  }

  hideLoader() {
    const loader = document.getElementById("loader");
    const weatherInfo = document.getElementById("weatherInfo");

    if (loader) {
      loader.classList.add("d-none");
    }
    if (weatherInfo) {
      weatherInfo.classList.remove("d-none");
    }
  }

  showError(message) {
    const errorMessage = translations[this.currentLanguage][message] || message;
    this.errorMessage.textContent = errorMessage;
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

    // Clear welcome content if it exists
    const welcomeContent = document.querySelector(".welcome-content");
    if (welcomeContent) {
      welcomeContent.remove();
    }

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

  formatTemperature(temp) {
    if (isNaN(temp)) return "0°";
    const temperature = Math.round(this.isMetric ? temp : (temp * 9) / 5 + 32);
    return `${temperature}°${this.isMetric ? "C" : "F"}`;
  }

  toggleUnit() {
    this.isMetric = !this.isMetric;
    // Update main weather display
    this.updateTemperatureDisplay();

    // Update recent searches temperature display
    const temperatures = document.querySelectorAll(
      ".recent-searches .temperature"
    );
    temperatures.forEach((tempElement) => {
      const rawTemp = parseFloat(tempElement.dataset.temp);
      tempElement.textContent = this.formatTemperature(rawTemp);
    });
  }

  showWelcomeContent() {
    const mainContent = document.querySelector(".main-content");

    // Create a new div for welcome content
    const welcomeDiv = document.createElement("div");
    welcomeDiv.className = "welcome-content text-center py-5";

    welcomeDiv.innerHTML = `
   <h1 class="typing-text" data-translate="welcomeTitle">
    
</h1>
      <div class="welcome-illustration mb-4 animate__animated animate__fadeIn animate__delay-1s">
        <img src="./images/weather-home.jpg" 
             alt="${translations[this.currentLanguage].weatherIllustration}" 
             class="welcome-image"
             width="400"
             height="300"
             loading="lazy"
             decoding="async"
        >
      </div>
      <div class="welcome-features animate__animated animate__fadeInUp animate__delay-2s">
        <div class="row g-4 justify-content-center align-items-stretch mt-3">
          <div class="col-md-4 d-flex">
            <div class="feature-card w-100">
              <i class="fas fa-search mb-3"></i>
              <h2 data-translate="searchCityTitle"></h2>
              <p data-translate="searchCityDesc"></p>
            </div>
          </div>
          <div class="col-md-4 d-flex">
            <div class="feature-card w-100">
              <i class="fas fa-clock mb-3"></i>
              <h2 data-translate="realTimeTitle"></h2>
              <p data-translate="realTimeDesc"></p>
            </div>
          </div>
          <div class="col-md-4 d-flex">
            <div class="feature-card w-100">
              <i class="fas fa-history mb-3"></i>
              <h2 data-translate="recentSearchesTitle"></h2>
              <p data-translate="recentSearchesDesc"></p>
            </div>
          </div>
        </div>
      </div>
    `;
    // Call translateUI after adding the content
    this.translateUI();

    // Prepend welcome content to main content (add it before weather info)
    mainContent.prepend(welcomeDiv);

    // Initialize typing animation
    this.initializeTypingAnimation();
  }

  toggleFavorite() {
    if (!this.lastWeatherData) return;

    const favorites = this.getFavorites();
    const cityData = {
      name: this.lastWeatherData.name,
      lat: this.lastWeatherData.coord.lat,
      lon: this.lastWeatherData.coord.lon,
    };

    const existingIndex = favorites.findIndex(
      (fav) => fav.name === cityData.name
    );

    if (existingIndex === -1) {
      favorites.push(cityData);
      this.favoriteToggle.classList.add("active");
      this.favoriteToggle.querySelector("i").classList.remove("far");
      this.favoriteToggle.querySelector("i").classList.add("fas");
    } else {
      favorites.splice(existingIndex, 1);
      this.favoriteToggle.classList.remove("active");
      this.favoriteToggle.querySelector("i").classList.remove("fas");
      this.favoriteToggle.querySelector("i").classList.add("far");
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    this.displayFavorites();
  }

  getFavorites() {
    return JSON.parse(localStorage.getItem("favorites") || "[]");
  }

  async displayFavorites() {
    const favorites = this.getFavorites();

    // Clear current list
    this.favoritesList.innerHTML = "";

    // Fetch current weather for each favorite city
    for (const city of favorites) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${config.WEATHER_API_KEY}&units=metric`
        );
        const weatherData = await response.json();

        // Create list item with current weather data
        const listItem = `
                <li class="favorite-item d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-2">
                        <span class="favorite-city" onclick="weatherApp.selectLocation(${
                          city.lat
                        }, ${city.lon}, '${city.name}')">
                            ${city.name}
                        </span>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <div class="d-flex align-items-center gap-1">
                            <img 
                                src="https://openweathermap.org/img/wn/${
                                  weatherData.weather[0].icon
                                }.png" 
                                alt="Weather icon"
                                class="weather-icon-small"
                                onerror="this.src='https://openweathermap.org/img/wn/01d.png'"
                            >
                            <span class="temperature" data-temp="${
                              weatherData.main.temp
                            }">
                                ${this.formatTemperature(weatherData.main.temp)}
                            </span>
                        </div>
                        <button 
                            class="btn btn-link text-danger p-0" 
                            onclick="event.stopPropagation(); weatherApp.removeFavorite('${
                              city.name
                            }')"
                        >
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </li>
            `;

        this.favoritesList.innerHTML += listItem;
      } catch (error) {
        console.error(`Error fetching weather for ${city.name}:`, error);
      }
    }
  }

  removeFavorite(cityName) {
    const favorites = this.getFavorites().filter(
      (city) => city.name !== cityName
    );
    localStorage.setItem("favorites", JSON.stringify(favorites));
    this.displayFavorites();

    if (this.lastWeatherData && this.lastWeatherData.name === cityName) {
      this.favoriteToggle.classList.remove("active");
      this.favoriteToggle.querySelector("i").classList.remove("fas");
      this.favoriteToggle.querySelector("i").classList.add("far");
    }
  }

  initializeLanguage() {
    this.updateLanguageButton();
    this.translateUI();
  }

  toggleLanguage() {
    // Change language
    this.currentLanguage = this.currentLanguage === "en" ? "bs" : "en";
    localStorage.setItem("language", this.currentLanguage);

    // Update UI
    this.updateLanguageButton();
    this.translateUI();

    // Update date and time with new language
    this.updateDateTime();

    // Refresh weather display if we have data
    if (this.lastWeatherData) {
      this.displayWeather(this.lastWeatherData);
    }
  }

  updateLanguageButton() {
    const langDisplay = this.currentLanguage.toUpperCase();
    this.languageToggle.querySelector(".current-lang").textContent =
      langDisplay;
  }

  translateUI() {
    document.querySelectorAll("[data-translate]").forEach((element) => {
      const key = element.getAttribute("data-translate");
      if (translations[this.currentLanguage][key]) {
        // For the welcome title, just change the text without animation
        if (element.classList.contains("typing-text")) {
          element.textContent = translations[this.currentLanguage].welcomeTitle;
          return;
        }

        if (element.tagName === "INPUT") {
          element.placeholder = translations[this.currentLanguage][key];
        } else {
          element.textContent = translations[this.currentLanguage][key];
        }
      }
    });
  }

  showLoading() {
    this.weatherContainer.innerHTML = `
        <div class="loading">
            <span>${translations[this.currentLanguage].loading}</span>
        </div>
    `;
  }

  initializeTypingAnimation() {
    const typingText = document.querySelector(".typing-text");
    if (!typingText) return;

    // Clear any existing content and ongoing animations
    typingText.textContent = "";

    // Get the correct text based on current language
    const textToType = translations[this.currentLanguage].welcomeTitle;

    let charIndex = 0;
    const typingDelay = 55;

    const typeChar = () => {
      if (charIndex < textToType.length) {
        typingText.textContent = textToType.slice(0, charIndex + 1);
        charIndex++;
        setTimeout(typeChar, typingDelay);
      }
    };

    // Start typing animation
    typeChar();
  }

  formatDate(date) {
    // Define the arrays of day and month keys
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const months = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];

    const dayKey = days[date.getDay()];
    const monthKey = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    // Get translated day and month names
    const translatedDay = translations[this.currentLanguage][dayKey];
    const translatedMonth = translations[this.currentLanguage][monthKey];

    // Format based on language
    if (this.currentLanguage === "bs") {
      return `${translatedDay}, ${day}. ${translatedMonth} ${year}.`; // Bosnian format
    } else {
      return `${translatedDay}, ${translatedMonth} ${day}, ${year}`; // English format
    }
  }

  updateDateTime() {
    const now = new Date();
    const dateElement = document.querySelector(".current-date");
    const timeElement = document.querySelector(".current-time");

    if (dateElement) {
      const formattedDate = this.formatDate(now);
      dateElement.textContent = formattedDate;
    }

    if (timeElement) {
      timeElement.textContent = now.toLocaleTimeString(
        this.currentLanguage === "bs" ? "bs-BA" : "en-US",
        { hour: "2-digit", minute: "2-digit" }
      );
    }
  }
}
// Initialize the app
const weatherApp = new WeatherApp();
window.weatherApp = weatherApp;
