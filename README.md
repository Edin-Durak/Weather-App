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

## Live Demo

[View Live Demo](#) <!-- Add your deployed app URL here -->

## Screenshots

![Weather App Screenshot](screenshots/weather-app.png) <!-- Add your screenshot -->

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/weather-app.git
   ```

2. Navigate to the project directory:

   ```bash
   cd weather-app
   ```

3. Open `index.html` in your browser or use a local server.

### Configuration

1. Get your API key from [OpenWeather](https://openweathermap.org/api)
2. Replace the API key in `app.js`:

   ```javascript
   const API_KEY = "YOUR_API_KEY";
   ```

## Features in Detail

### Current Weather

- City name and country
- Current temperature
- Weather description with icon
- "Feels like" temperature
- Humidity percentage
- Wind speed
- Local time and date

### 5-Day Forecast

- Daily temperature forecasts
- Weather conditions
- Weather icons
- Day of the week

### User Interface

- Clean, modern design
- Responsive layout
- Animated weather transitions
- Loading indicators
- Error handling
- Offline status alerts

### Recent Searches

- Store up to 5 recent searches
- Quick access to previous searches
- Delete individual entries
- Persistent storage

## Code Structure

- `index.html`: Main HTML file
- `styles.css`: CSS styles for the app
- `app.js`: JavaScript logic for the app

  weather-app/
  │
  ├── index.html # Main HTML file
  ├── css/
  │ └── styles.css # Styles and animations
  ├── js/
  │ └── app.js # Main JavaScript file
  └── README.md # Documentation

## Development Features

- ES6+ JavaScript
- CSS Variables for theming
- Responsive design with media queries
- Error handling
- Offline detection
- Local storage management
- Asynchronous API calls
- Event delegation
- DOM manipulation

## API Integration

The app uses the following OpenWeather API endpoints:

- Current weather data
- 5-day forecast
- Geocoding for city search

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Weather data provided by [OpenWeather](https://openweathermap.org/)
- Icons by [Font Awesome](https://fontawesome.com/)
- Fonts by [Google Fonts](https://fonts.google.com/)

## Author

Edin Durak - [GitHub Profile](https://github.com/Edin-Durak)

## Support

For support, email edindurak8@gmail.com or open an issue on GitHub.
