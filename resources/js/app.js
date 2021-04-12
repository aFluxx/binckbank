require('./bootstrap');

import Vue from 'vue';
import vuetify from './plugins/vuetify';
import App from './components/App';

document.addEventListener("DOMContentLoaded", function (event) {
    const opts = {
        theme: {
            themes: {
                light: {
                    primary: '#59c9a5',
                    secondary: '#424242',
                    accent: '#82B1FF',
                    error: '#FF5252',
                    info: '#2196F3',
                    success: '#4CAF50',
                    warning: '#FFC107',
                },
                dark: {
                    primary: '#59c9a5',
                    secondary: '#424242',
                    accent: '#82B1FF',
                    error: '#FF5252',
                    info: '#2196F3',
                    success: '#4CAF50',
                    warning: '#FFC107',
                },
            },
        },
    };

    new Vue({
        el: '#application',
        vuetify,
        render: h => h(App),
    });
});



