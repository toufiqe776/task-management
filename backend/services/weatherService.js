import axios from 'axios';

const getWeatherByLocation = async (location) => {
  if (!location || !process.env.OPENWEATHER_API_KEY) {
    return null;
  }

  try {
    const { data } = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: location,
        appid: process.env.OPENWEATHER_API_KEY,
        units: 'metric',
      },
    });

    const icon = data.weather?.[0]?.icon;

    return {
      temperature: Math.round(data.main?.temp ?? 0),
      description: data.weather?.[0]?.description || 'Weather unavailable',
      icon: icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : '',
    };
  } catch (error) {
    console.error(`Weather fetch error for ${location}: ${error.message}`);
    return null;
  }
};

export default getWeatherByLocation;
