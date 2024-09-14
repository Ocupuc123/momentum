document.addEventListener('DOMContentLoaded', () => {
  const TOWN_DEFAULT = 'Краснодар';
  const timeElement = document.querySelector('.time');
  const dateElement = document.querySelector('.date');
  const temperatureElement = document.querySelector('.temperature');
  const locationElement = document.querySelector('.location');
  const locationStorege = localStorage.getItem('location');
  const taskInput = document.querySelector('.task-input');
  const taskList = document.querySelector('.task-list');
  const deleteCompletedTasksButton = document.querySelector('.delete-completed-tasks-button');

  locationElement.textContent = TOWN_DEFAULT;

  const updateWeather = (lat, lon) => {
    const urlWeatherDecoder = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=is_day&hourly=temperature_2m,precipitation,rain,showers,snowfall,cloud_cover&forecast_days=1`;

    fetch(urlWeatherDecoder)
      .then((response) => response.json())
      .then((data) => {
        const currentTemperature = data.hourly.temperature_2m[data.hourly.temperature_2m.length - 1];
        const temperatureUnit = data.hourly_units.temperature_2m;
        const isDay = data.current.is_day;

        temperatureElement.textContent = `${isDay ? '☀️' : '🌙'}${currentTemperature}${temperatureUnit}`;
      })
      .catch((error) => console.error(error));
  };

  const getLocation = (lat, lon) => {
    const urlLocationDecoder = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

    fetch(urlLocationDecoder)
      .then((response) => response.json())
      .then((data) => {
        const town = data.address.town;

        const location = {
          town,
          lat,
          lon,
        };

        localStorage.setItem('location', JSON.stringify(location));
        locationElement.textContent = town;
      })
      .catch((error) => console.error(error));
  };

  if (locationStorege) {
    const { town, lat, lon } = JSON.parse(locationStorege);

    updateWeather(lat, lon);
    locationElement.textContent = town;
  } else {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      updateWeather(latitude, longitude);
      getLocation(latitude, longitude);
    });
  }

  const monthEndings = {
    январь: 'я',
    февраль: 'я',
    март: 'а',
    апрель: 'я',
    май: 'я',
    июнь: 'я',
    июль: 'я',
    август: 'а',
    сентябрь: 'я',
    октябрь: 'я',
    ноябрь: 'я',
    декабрь: 'я',
  };

  const updateTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    timeElement.textContent = `${hours}:${minutes}:${seconds}`;

    const day = now.getDate();
    const month = now.toLocaleString('ru-RU', { month: 'long' });
    const dayOfWeek = now.toLocaleString('ru-RU', { weekday: 'long' });
    const monthWithSuffix = month.replace(/(я|ь|й)$/, monthEndings[month]);

    dateElement.textContent = `${day} ${monthWithSuffix}, ${dayOfWeek}`;
  };

  updateTime();

  setInterval(updateTime, 1000);

  const timeIntervals = {
    '00:00-06:00': 'assets/images/01.jpg',
    '06:00-12:00': 'assets/images/02.jpg',
    '12:00-18:00': 'assets/images/03.jpg',
    '18:00-00:00': 'assets/images/04.jpg',
  };

  const getCurrentBackground = () => {
    const currentTime = new Date();
    const hours = currentTime.getHours();

    let currentImgeUrl;
    let timeInterval;

    switch (true) {
      case hours >= 0 && hours < 6:
        timeInterval = '00:00-06:00';
        break;
      case hours >= 6 && hours < 12:
        timeInterval = '06:00-12:00';
        break;
      case hours >= 12 && hours < 18:
        timeInterval = '12:00-18:00';
        break;
      case hours >= 18 && hours < 24:
        timeInterval = '18:00-00:00';
        break;
    }

    const imageUrl = timeIntervals[timeInterval];
    currentImgeUrl = imageUrl;

    return currentImgeUrl;
  };

  const currentBackground = getCurrentBackground();

  const createBackground = () => {
    const image = new Image();
    image.src = currentBackground;
    image.classList.add('cover-bg');
    image.alt = 'background image';

    document.body.appendChild(image);
  };

  const updateBackground = () => {
    const newBackground = getCurrentBackground();

    if (newBackground !== currentBackground) {
      document.querySelector('.cover-bg').remove();
      createBackground();
    }
  };

  setInterval(updateBackground, 10 * 60 * 1000);

  createBackground();

  const addTask = () => {
    const taskText = taskInput.value.trim();

    if (taskText === '') {
      alert('Введите текст задачи!');
      return;
    }

    const taskHTML = `
    <label class="list-group-item d-flex gap-2">
      <input class="form-check-input flex-shrink-0" type="checkbox">
      <span>${taskText}</span>
      <button class="btn btn-primary btn-sm ms-auto" type="button">Удалить</button>
    </label>
  `;
    const taskElement = document.createElement('div');

    taskElement.innerHTML = taskHTML;
    taskList.appendChild(taskElement.children[0]);
    taskInput.value = '';
  };

  const deleteTask = (event) => {
    if (event.target.classList.contains('btn-primary')) {
      const taskElement = event.target.parentNode;
      taskElement.remove();
    }
  };

  const toggleTaskStatus = (event) => {
    if (event.target.type === 'checkbox') {
      const taskElement = event.target.parentNode;
      taskElement.classList.toggle('completed');

      if (taskElement.classList.contains('completed')) {
        event.target.checked = true;
      } else {
        event.target.checked = false;
      }
    }
  };

  const deleteCompletedTasks = () => {
    const completedTasks = taskList.querySelectorAll('.completed');
    completedTasks.forEach((task) => task.remove());
  };

  taskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      addTask();
    }
  });

  taskList.addEventListener('click', deleteTask);

  taskList.addEventListener('change', toggleTaskStatus);

  deleteCompletedTasksButton.addEventListener('click', deleteCompletedTasks);
});
