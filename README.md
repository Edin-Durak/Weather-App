# Modern Weather App

A sleek and responsive weather application that provides real-time weather information and forecasts for cities worldwide, with multi-language support and dynamic weather messages.

## Features

- 🌡️ Real-time weather data with hourly forecasts
- 🌍 Global city search with multiple location handling
- 📱 Responsive design for all devices
- 🔄 Auto-refresh weather data every 30 minutes
- 📍 Recent searches history
- ⭐ Favorites system for quick access
- 🌓 Temperature unit toggle (°C/°F) with persistence
- 📊 5-day weather forecast with hourly breakdown
- 🌤️ Dynamic weather messages based on conditions
- 🌙 Day/Night detection for contextual messages
- 🔤 Multi-language support (English/Bosnian)
- ⚡ Offline detection and handling
- ⌚ Local time display with timezone support
- 💫 Smooth animations and transitions

## Technologies Used

- HTML5
- CSS3 with CSS Variables
- JavaScript (ES6+)
- OpenWeather API
- Bootstrap 5
- Font Awesome Icons
- Animate.css

## Screenshots

Desktop

![127 0 0 1_5500_ (14)](https://github.com/user-attachments/assets/7a9384af-be63-4d6a-ae4a-f6e2973d660b)

Mobile

![127 0 0 1_5500_ (15)](https://github.com/user-attachments/assets/7a3e5caf-1031-4732-95ec-02473a3c72af)

## Installation & Configuration

1. Clone the repository:

   ```bash
   git clone https://github.com/Edin-Durak/Weather-App.git
   ```

2. Navigate to the project directory:

   ```bash
   cd weather-app
   ```

3. Create configuration file:

   - Create a new file `js/config.js`
   - Add your OpenWeather API configuration:

   ```javascript
   const config = {
     WEATHER_API_KEY: "your_api_key_here",
   };
   ```

   - Get your API key from [OpenWeather](https://openweathermap.org/api)

4. Open `index.html` in your browser or use a local server.

## Project Structure

```
weather-app/
├── index.html          # Main HTML file
├── styles.css         # Global styles and animations
├── images/
│ ├── cloudy.png      # Favicon
│ └── weather-home.jpg # Welcome illustration
├── js/
│ ├── app.js          # Main application logic
│ ├── config.js       # API configuration
│ └── translations.js # Language translations
└── README.md
```

## Language Support

The app supports two languages:

- English (EN)
- Bosnian (BS)

Features of the translation system:

- Dynamic language switching
- Persistent language preference
- Translated weather descriptions and messages
- Localized date and time formats
- Dynamic weather messages based on:
  - Current weather conditions
  - Time of day (day/night)
  - Weather severity
- Animated welcome messages

## Development Features

- ES6+ JavaScript with modern class-based architecture
- CSS Variables for dynamic theming
- Responsive design with mobile-first approach
- Comprehensive error handling and user feedback
- Offline detection and connectivity monitoring
- Local storage for persistent user preferences
- Asynchronous API calls with proper error handling
- Event delegation for better performance
- DOM manipulation with performance optimization
- Welcome screen with typing animation
- Smooth transitions and loading states

## API Integration

The app integrates with OpenWeather API using three main endpoints:

1. Current Weather Data

   - Endpoint: `/data/2.5/weather`
   - Used for real-time weather information

2. 5-Day/Hourly Forecast

   - Endpoint: `/data/2.5/forecast`
   - Provides 3-hour step forecast data
   - Used for both 5-day and hourly forecasts

3. Geocoding API
   - Endpoint: `/geo/1.0/direct`
   - Handles city search and coordinates

## Configuration Details

Important notes about configuration:

- Never commit your actual API key to version control
- Keep your API key private and secure
- The app won't function without a valid API key
- Free tier API keys have rate limits (60 calls/minute)

## License

This project is licensed under the MIT License.

## Acknowledgments

- [OpenWeather](https://openweathermap.org/) for providing the weather data API
- [Bootstrap](https://getbootstrap.com/) for the CSS framework
- [Font Awesome](https://fontawesome.com/) for the icons

## Author and Support

- [Edin Durak](https://github.com/Edin-Durak)
- [Email](mailto:edindurak8@gmail.com)
