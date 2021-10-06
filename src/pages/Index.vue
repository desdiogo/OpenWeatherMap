<template>
  <q-page class="flex column" :class="bgClass">
    <div class="col q-pt-lg q-px-md">
      <q-input
        v-model="state.search"
        @keyup.enter="getWeatherBySearch"
        placeholder="Pesquisar"
        dark
        borderless
      >
        <template v-slot:before>
          <q-icon
            @click="getLocation"
            name="my_location"
          />
        </template>

        <template v-slot:hint>
          Field hint
        </template>

        <template v-slot:append>
          <q-btn
            @click="getWeatherBySearch"
            round
            dense
            flat
            icon="search"
          />
        </template>
      </q-input>
    </div>
    <template v-if="state.weatherData">
      <div class="col text-white text-center">
        <div class="text-h4 text-weight-light">
          {{ state.weatherData.name }}
        </div>
        <div class="text-h6 text-weight-light">
          {{ getDate() }}
        </div>
        <div>
          <img
            :src="`https://openweathermap.org/img/wn/${state.weatherData.weather[0].icon}@4x.png`"
            alt="Temp"
          >
        </div>
        <div class="row justify-center wrap-xs no-wrap-md">
          <div class="col-xs-12 col-md-2 q-mb-lg">
            <div class="text-h6">Máximo</div>
            <div class="text-h4 text-weight-thin relative-position">
              <span>{{ kevinToCelsius(state.weatherData.main.temp_max) }}</span>
              <span class="text-h6 text-weight-thin relative-position degree-temp">&deg;C</span>
            </div>
          </div>
          <div class="col-xs-12 col-md-2 q-mb-lg">
            <div class="text-h1 text-weight-thin relative-position">
              <span>{{ kevinToCelsius(state.weatherData.main.temp) }}</span>
              <span class="text-h4 relative-position degree">&deg;C</span>
            </div>
            <div class="text-h6 text-weight-light">
              {{ ucFirst(state.weatherData.weather[0].description) }}
            </div>
          </div>
          <div class="col-xs-12 col-md-2 q-mb-lg">
            <div class="text-h6">Mínimo</div>
            <div class="text-h4 text-weight-thin relative-position">
              <span>{{ kevinToCelsius(state.weatherData.main.temp_min) }}</span>
              <span class="text-h6 text-weight-thin relative-position degree-temp">&deg;C</span>
            </div>
          </div>
        </div>
        <div class="text-h6 text-weight-light q-mt-lg">
          <div class="row justify-center">
            <div class="col-xs-5 col-sm-3 col-lg-1 text-center">
              <span>Umidade</span>
            </div>
            <div class="col-xs-2 col-md-1 text-center">
              <span class="justify-lg-end">{{ state.weatherData.main.humidity }}%</span>
            </div>
          </div>
          <div class="row justify-center wrap">
            <div class="col-xs-5 col-sm-3 col-lg-1 text-center">
              <span>Nascer do Sol</span>
            </div>
            <div class="col-xs-2 col-md-1 text-center">
              <span>{{ sunrise }}</span>
            </div>
          </div>
          <div class="row justify-center">
            <div class="col-xs-5 col-sm-3 col-lg-1 text-center">
              <span>Pôr do Sol</span>
            </div>
            <div class="col-xs-2 col-md-1 text-center">
              <span>{{ sunset }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="col column text-center text-white">
        <div class="col text-h2 text weight-thin">
          Quasar<br>Weather
        </div>
        <q-btn
          @click="getLocation"
          class="col"
          flat
          no-caps
        >
          <q-icon left size="3em" name="my_location"></q-icon>
          <div>Procure minha localização</div>
        </q-btn>
      </div>
    </template>
    <div class="col skyline">
    </div>
  </q-page>
</template>

<script>
import { defineComponent, reactive, computed } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'PageIndex',
  setup () {
    const $q = useQuasar()

    const state = reactive({
      search: '',
      weatherData: false,
      lat: 0,
      lon: 0,
      apiKey: process.env.API_KEY
    })

    // eslint-disable-next-line vue/return-in-computed-property
    const bgClass = computed(() => {
      if (state.weatherData) {
        if (state.weatherData.weather[0].icon.endsWith('n')) {
          return 'bg-night'
        }

        return 'bg-day'
      }
    })

    const twelveHoursMil = 43200000

    const sunrise = computed(() => getTime(state.weatherData.sys.sunrise - twelveHoursMil))

    const sunset = computed(() => getTime(state.weatherData.sys.sunset))

    function getWeatherByCoords () {
      api(`weather?lat=${state.lat}&lon=${state.lon}&lang=pt_br&appid=${state.apiKey}`)
        .then((response) => {
          console.log(response)
          state.weatherData = response.data
        })
        .finally(() => {
          $q.loading.hide()
        })
    }

    function getLocation () {
      $q.loading.show()
      navigator.geolocation.getCurrentPosition(
        position => {
          state.lat = position.coords.latitude
          state.lon = position.coords.longitude
          getWeatherByCoords()
        }
      )
    }

    function ucFirst (string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
    }

    function kevinToCelsius (temp) {
      return (temp - 273.15).toFixed(0)
    }

    function getWeatherBySearch () {
      $q.loading.show()
      api(`weather?q=${state.search}&lang=pt_br&appid=${state.apiKey}`)
        .then((response) => {
          state.weatherData = response.data
        })
        .finally(() => {
          state.search = ''
          $q.loading.hide()
        })
    }

    function getTime (time) {
      let hours = new Date(time).getHours()

      if (hours < 10) {
        hours = `0${hours}`
      }

      let minutes = new Date(time).getMinutes()

      if (minutes < 10) {
        minutes = `0${minutes}`
      }

      return `${hours}:${minutes}`
    }

    function getDate () {
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
      return new Intl.DateTimeFormat('pt-BR', options).format(new Date())
    }

    return {
      state,
      bgClass,
      sunrise,
      sunset,
      getLocation,
      ucFirst,
      kevinToCelsius,
      getWeatherBySearch,
      getDate
    }
  }
})
</script>

<style lang="sass">
.q-page
  background: linear-gradient(to right, #136a8a, #267871)

  &.bg-night
    background: linear-gradient(to bottom, #232526, #414345)

  &.bg-day
    background: linear-gradient(to bottom, #00b4db, #0083b0)

.degree
  top: -44px

.degree-temp
  top: -10px

.skyline
  flex: 0 0 100px
  background: url('../assets/skyline.png') center bottom
  background-size: contain
</style>
