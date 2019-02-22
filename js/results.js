Vue.component('results', {
    template:   `<div class="container">
                    <button class="button is-info" @click="reset">Go back</button>
                    <ul class="results-ul">
                        <li v-for="item in asteroidData">
                            <div class="bar">
                                <p class="name">{{ item.name }}</p>
                                <p class="value" v-bind:class="colorBars(item.traveled)">{{ item.traveled }}</p>
                            </div>
                        </li>
                    </ul>
                </div>`,

    data() {
        return {
            asteroidData: '',
        }
    },

    methods: { 
        getAsteroidData: function() {
            this.asteroidData = JSON.parse(localStorage.getItem('Asteroids'))
        },

        colorBars: function(value) {
            switch(true) {
                case (value < 25):
                    return "green";
                case value > 25 && value < 45:
                    return "yellow";
                case value > 45 && value < 70:
                    return "orange";
                case value > 75:
                    return "red"
            }
        },

        reset: function() {
            localStorage.clear();
            if(localStorage.length === 0) {
                window.location = 'index.html'
            }
        }
    },

    created() {
        this.getAsteroidData();
    }
});


new Vue({
    el: '#root'
})