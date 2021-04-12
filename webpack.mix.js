const mix = require('laravel-mix');

mix.webpackConfig({
   resolve: {
      fallback: {
         fs: false,
      }
   },
});

class VuetifyRules {
   webpackRules() {
      return {
         test: /\.s(c|a)ss$/,
         use: [
            'vue-style-loader',
            'css-loader',
            {
               loader: 'sass-loader',
               options: {
                  implementation: require('sass'),
                  sassOptions: {
                     fiber: require('fibers'),
                     indentedSyntax: true, // optional
                  },
               },
            },
         ],
      };
   }
}

mix.extend('vuetify-rules', new VuetifyRules());

mix.setPublicPath('public')
   .js('resources/js/app.js', './public/js')
   .vue()
   .postCss("resources/css/app.css", "./public/css", [
      require("tailwindcss"),
   ])
   .version();

if (mix.inProduction()) {
   mix.version();
}
