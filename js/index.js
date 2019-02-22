const eventHub = new Vue();

Vue.component('input-and-table', {
    template:   `<div class="wrapper" v-if="showTable">
                    <div class="container table-container">
                        <table class="asteroid-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Name</th>
                                    <th>Speed Km/h</th>
                                    <th>Min Diameter</th>
                                    <th>Max Diameter</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in dangerousAsteroidsUse">
                                    <td>{{ item.asteroidSpecs.close_approach_data[0].close_approach_date }}</td>
                                    <td>{{ item.asteroidSpecs.name }}</td>
                                    <td>{{ Number(item.asteroidSpecs.close_approach_data[0].relative_velocity.kilometers_per_hour).toFixed(2) }}</td>
                                    <td>{{ item.asteroidSpecs.estimated_diameter.meters.estimated_diameter_min.toFixed(2) }}</td>
                                    <td>{{ item.asteroidSpecs.estimated_diameter.meters.estimated_diameter_max.toFixed(2) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="container input-container">
                        <div class="field">
                            <label class="label">Enter asteroid name from table</label>
                            <div class="control">
                                <input class="input" type="text" id="asteroid-input" list="datalist-asteroids" v-model="asteroidInput" @keypress="setupAsteroidSearch">
                                <datalist id="datalist-asteroids"></datalist>
                            </div>
                        </div>
                        <div class="ul-holder" v-show="selectedAsteroids.length > 0">
                            <ul id="selected-asteroids" @click="deleteItem">
                            </ul>
                        </div>
                    </div>
                    <button class="button is-info generate-results" @click="getTimesTraveled" v-show="selectedAsteroids.length > 0">Generate Results</button>
                </div>`,
    data() {
        return {
            dangerousAsteroids: [],
            dangerousAsteroidsUse: [],
            showTable:  null,
            asteroidInput: '',
            selectedAsteroids: '',
            asteroidsToBeShown: '',
            asteroidsTraveledCalc: [],
        }
    },

    methods: { 
        getDangerousAsteroids: function(value) {
            this.dangerousAsteroids = value;
            this.dangerousAsteroidsUse = this.dangerousAsteroids;
        },

        showTableFunc: function(value) {
            this.showTable = value;
        },

        clearDatalist: function() {
            const dataList = document.getElementById('datalist-asteroids');
            dataList.innerHTML = ''
        },

        setupDatalist: function() {
            const dataList = document.getElementById('datalist-asteroids');
            this.dangerousAsteroidsUse.forEach(asteroid => {
                const option = `
                <option value=${asteroid.asteroidSpecs.name.replace(/\s/g, "")} 
                data-id="${asteroid.asteroidSpecs.id}">
                `;
                dataList.innerHTML += option;
            });
        },

        setupAsteroidSearch: function(e) {
            const dataListOptions = document.querySelectorAll("option");
            const selectedAsteroidsList = document.getElementById('selected-asteroids');
            if(e.keyCode === 13) {
                dataListOptions.forEach(option => {
                    if(option.value == this.asteroidInput) {
                        const selectedAsteroid = document.createElement("li");
                        selectedAsteroid.setAttribute(
                          "data-id",
                          option.getAttribute("data-id")
                        );
                        selectedAsteroid.innerHTML = `${option.value}<a class="delete-icon"><i class="fas fa-times"></i></a>`;
                        selectedAsteroid.classList.add("selected-asteroid");
                        selectedAsteroidsList.appendChild(selectedAsteroid);

                        this.selectedAsteroids = document.querySelectorAll('.selected-asteroid');

                        this.dangerousAsteroidsUse = this.dangerousAsteroidsUse.filter(item => item.asteroidSpecs.name.replace(/\s/g, "") !== option.value);
                        this.asteroidInput = '';
                    }
                });
            }
        },

        deleteItem: function(e) {
            if(e.target.parentElement.classList.contains('delete-icon')) {
                const dataList = document.getElementById('datalist-asteroids');
                const option = `<option value="${e.target.parentElement.parentElement.textContent}" data-id="${e.target.parentElement.parentElement.getAttribute('data-id')}"`;
                dataList.innerHTML += option;
                e.target.parentElement.parentElement.remove();
                this.selectedAsteroids = document.querySelectorAll('.selected-asteroid');
                this.dangerousAsteroids.forEach(item => {
                    if(item.asteroidSpecs.id == e.target.parentElement.parentElement.getAttribute('data-id')) {
                        this.dangerousAsteroidsUse.push(item);
                    }
                });
            }
        },

        getTimesTraveled: function() {
            let counter = 0;
            this.asteroidsToBeShown = this.dangerousAsteroidsUse
                                        .filter(x => !this.dangerousAsteroids.includes(x))
                                        .concat(this.dangerousAsteroids.filter(x => !this.dangerousAsteroidsUse.includes(x)));
            this.asteroidsToBeShown.forEach(item => {
                 axios.get(item.asteroidSpecs.links.self)
                    .then(res => {
                        this.asteroidsTraveledCalc.push( 
                            {
                                name: res.data.name,
                                traveled: res.data.close_approach_data.filter(date => {
                                    return (
                                        Number(date.close_approach_date.substring(0, 4)) > 1900 &&
                                        Number(date.close_approach_date.substring(0, 4)) < 1999
                                    );
                                    }).length,
                            }
                        );  
                        localStorage.setItem('Asteroids', JSON.stringify(this.asteroidsTraveledCalc));
                        counter++

                        if(counter === this.asteroidsToBeShown.length) {
                            window.location = "results.html"
                        }
                        
                    });
            });
           
        }
    },

    created() {
        eventHub.$on('getdangerousasteroids', this.getDangerousAsteroids);
        eventHub.$on('showtable', this.showTableFunc);
        // console.log(this.dangerousAsteroids, this.dangerousAsteroidsUse)
    },

    updated() {
        this.clearDatalist();
        this.setupDatalist();
    }
})

Vue.component('form-container', {
    template:   `<div class="container form-container">
                    <div class="field">
                    <label class="label">Start Date</label>
                        <div class="control">
                            <input class="input" type="date" v-model="startDate">
                        </div>
                    </div>
                    <div class="field">
                    <label class="label">End Date</label>
                        <div class="control">
                            <input class="input" type="date" v-model="endDate">
                        </div>
                    </div>
                    <button class="button is-info submit-btn" v-on:click="getAsteroids">Submit</button>
                </div>`,
    data() {
        return {
            startDate: '',
            endDate: '',
            dangerousAsteroids: [],
            showTable : false,
        }
    },

    methods: {
        getAsteroids: function() {
            this.dangerousAsteroids = [];
            const dates = this.parseDates();
            const apiKey = 'x0HeIJzRCLm3lj0zrfXt2LltusKVCO7aoHmRkVq2'
            const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${dates[0]}&end_date=${dates[1]}&api_key=${apiKey}`
            axios.get(url)
                .then(res =>{
                    this.dangerousAsteroids = [];
                    for(let key in res.data.near_earth_objects) {
                        res.data.near_earth_objects[key].forEach((item, index) => {
                            if (res.data.near_earth_objects[key][index].is_potentially_hazardous_asteroid === true) {
                            date = key;
                            specs = item;
                            this.dangerousAsteroids.push({ date: date, asteroidSpecs: specs });
                            }
                        });
                    }

                    this.showTable = true;
                    eventHub.$emit('getdangerousasteroids', this.dangerousAsteroids);
                    eventHub.$emit('showtable', this.showTable)
                })
                .catch(err => {
                    alert('Maximum difference between dates must be 7 days.');
                });
        },
        parseDates: function() {
            const startDateSplit = this.startDate.split("-");
            const endDateSplit = this.endDate.split("-");
            const startDateFormated = `${startDateSplit[0]}-${startDateSplit[1]}-${startDateSplit[2]}`
            const endDateFormated = `${endDateSplit[0]}-${endDateSplit[1]}-${endDateSplit[2]}`
            return [startDateFormated, endDateFormated]
        }
    }
});

const homePage = {
    template:   `<div class="container main-container">
                    <form-container></form-container>
                    <input-and-table></input-and-table>
                </div>`
};

const router = new VueRouter({
    routes: [
        {
            path: '/',
            component: homePage
        }
    ]
})

new Vue({
    router: router,
    el: '#root',
})

