// All cities JSON
let allCities;

// Scrambled api key
const scrambled = ['4ljoj2c', 'a1lco4p', '1ib48jh9', '27663a4c'];

window.onload = function () {
  getCurrentPositionWeather();

  document.getElementById('select-text').addEventListener('submit', (event) => {
    display.loading = true;
    display.dataAvailable = false;
    const city = document.getElementsByTagName('input')[0].value;
    getCityWeather(city);
    event.preventDefault();
  });

  // User clicks element to get current location weather
  document.getElementById('select-current').addEventListener('click', () => {
    display.loading = true;
    display.dataAvailable = false;
    getCurrentPositionWeather();
  });

  populateTextAutocomplete();
};

const display = new Vue({
  el: '#display',
  data: {
    loading: true,
    dataAvailable: false,
    errorMessage: '',
    tempUnits: 'celcius',
    response: {},
  },
  methods: {
    tempInUnits: function (tempInKelvin) {
      switch (this.tempUnits) {
        case 'celcius':
          return (tempInKelvin - 273.15).toFixed(2) + '°C';
        case 'fahrenheit':
          return ((tempInKelvin * 9) / 5 - 459.67).toFixed(2) + '°F';
        default:
          return '';
      }
    },
    toggleTempUnits: function () {
      this.tempUnits = this.tempUnits === 'celcius' ? 'fahrenheit' : 'celcius';
    },
  },
});

const apiKey = () =>
  scrambled.reduce((acc, curr, index) => {
    return acc.concat(parseInt(curr, 32 - (index * 5 + 1)).toString(0x10));
  }, '');

// Make API weather request with current lat/lon coordinates
const getCurrentPositionWeather = () => {
  // Check that the geolocation object exists in window's navigator
  if ('geolocation' in navigator) {
    // Try to get user's location (this will prompt the user)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Extract lat/lon coordinates
        const crd = position.coords;

        // Create API url endpoint
        const url = `//api.openweathermap.org/data/2.5/weather?lat=${
          crd.latitude
        }&lon=${crd.longitude}&appid=${apiKey()}`;

        // Make API Call
        fetch(url).then((response) => {
          // Error checking
          if (!response.ok) {
            throw new Error(
              'Network response was not ok. Response status ' + response.status
            );
          }

          // JSON-ify response
          response.json().then((data) => {
            // Populate display fields with response data
            display.response = data;

            // Alert Vue object that data is available
            display.dataAvailable = true;
          });
        });
      },
      // Error getting user's location (usually they did not allow permissions)
      (error) => {
        display.loading = false;
        display.errorMessage = 'Error: ' + error.message;
      }
    );
  } else {
    display.loading = false;
    alert('Cannot get geolocation API');
  }
};

// Make API weather request with city name
const getCityWeather = (city) => {
  // Check that the geolocation object exists in window's navigator
  if ('geolocation' in navigator) {
    // Create API url endpoint
    const url = `//api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey()}`;

    // Make API Call
    fetch(url).then((response) => {
      // Error checking
      if (!response.ok) {
        display.loading = false;
        display.errorMessage = `Error status ${response.status}: ${response.statusText}`;
        return;
      }

      // JSON-ify response
      response.json().then((data) => {
        // Populate display fields with response data
        display.response = data;

        // Alert Vue object that data is available
        display.dataAvailable = true;
      });
    });
  } else {
    display.loading = false;
    alert('Cannot get geolocation API');
  }
};

// Populate text autocomplete with city names
const populateTextAutocomplete = () => {
  fetch(
    'https://pkgstore.datahub.io/core/world-cities/world-cities_json/data/5b3dd46ad10990bca47b04b4739a02ba/world-cities_json.json'
  )
    .then((response) => response.json())
    .then((data) => {
      data.forEach((obj) => {
        const item = document.createElement('option');
        item.value = obj.name + ', ' + obj.country;
        document.getElementsByTagName('datalist')[0].appendChild(item);
      });
    });
};
