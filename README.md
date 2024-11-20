# Modern Weather App

A sleek and responsive weather application that provides real-time weather information and forecasts for cities worldwide.

## Features

- 🌡️ Real-time weather data
- 🌍 Global city search
- 📱 Responsive design
- 🔄 Auto-refresh weather data
- 📍 Recent searches history
- 🌓 Temperature unit toggle (°C/°F)
- 📊 5-day weather forecast
- ⚡ Offline detection
- 🎯 Multiple location handling

## Technologies Used

- HTML5
- CSS3 with CSS Variables
- JavaScript (ES6+)
- OpenWeather API
- Bootstrap 5
- Font Awesome Icons

## Screenshots

Desktop
![127 0 0 1_5500_ (10)](https://github.com/user-attachments/assets/cf3b1916-3d1d-465b-9211-8082d0c779fe)

Mobile

![127 0 0 1_5500_ (11)](https://github.com/user-attachments/assets/c2199f5f-9b64-41cd-b768-87183130043d)

## Installation & Configuration

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/weather-app.git
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

weather-app/
├── index.html # Main HTML file
├── styles.css # Global styles and theme variables
├── images/
│ ├── cloudy.png # Favicon
│ └── weather-home.jpg# Welcome screen illustration
├── js/
│ ├── app.js # Main application logic
│ └── config.js # API configuration
└── README.md

## Configuration Details

The `config.js` file is essential for the application to work. It should export an object with the following structure:

```javascript
const config = {
  WEATHER_API_KEY: "your_api_key_here", // Your OpenWeather API key
};
```

Important notes about configuration:

- Never commit your actual API key to version control
- Keep your API key private and secure
- The app won't function without a valid API key
- Free tier API keys have rate limits (60 calls/minute)

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

2. 5-Day Forecast

   - Endpoint: `/data/2.5/forecast`
   - Provides 3-hour step forecast data

3. Geocoding API
   - Endpoint: `/geo/1.0/direct`
   - Handles city search and coordinates

## License

This project is licensed under the MIT License.

## Acknowledgments

- [OpenWeather](https://openweathermap.org/) for providing the weather data API
- [Bootstrap](https://getbootstrap.com/) for the CSS framework
- [Font Awesome](https://fontawesome.com/) for the icons

## Author and Support

- [Edin Durak](https://github.com/Edin-Durak)
- [Email](mailto:edindurak8@gmail.com)
