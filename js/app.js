/**
 * Main application file for: minnpost-2014-legislature-tracker
 *
 * This pulls in all the parts
 * and creates the main object for the application.
 */

/**
 * RequireJS config which maps out where files are and shims
 * any non-compliant libraries.
 */
require.config({
  shim: {
    'tabletop': {
      exports: 'Tabletop'
    }
  },
  baseUrl: 'js',
  paths: {
    'requirejs': '../bower_components/requirejs/require',
    'text': '../bower_components/text/text',
    'jquery': '../bower_components/jquery/dist/jquery.min',
    'underscore': '../bower_components/underscore/underscore',
    'backbone': '../bower_components/backbone/backbone',
    'tabletop': '../bower_components/tabletop/src/tabletop',
    'Ractive': '../bower_components/ractive/build/Ractive-legacy.min',
    'Ractive-events-tap': '../bower_components/ractive-events-tap/Ractive-events-tap.min',
    'moment': '../bower_components/moment/min/moment.min',
    'LT': '../bower_components/legislature-tracker/dist/legislature-tracker',
    'minnpost-2014-legislature-tracker': 'app'
  }
});


// Create main application
define('minnpost-2014-legislature-tracker', [
  'jquery', 'underscore', 'helpers', 'LT',
  'text!templates/application.mustache'
], function(
    $, _, helpers, LT, tApplication
  ) {

  // Constructor for app
  var App = function(options) {
    this.options = _.extend(this.defaultOptions, options);
    this.el = this.options.el;
    if (this.el) {
      this.$el = $(this.el);
      this.$el.html(tApplication);
      this.$content = this.$el.find('.content-container');
    }
  };

  // Extend with custom methods
  _.extend(App.prototype, {
    // Start function
    start: function() {
      this.lt = new LT(_.extend({}, this.options, {
        el: this.$content
      }));
    },

    // Default options
    defaultOptions: {
      projectName: 'minnpost-2014-legislature-tracker',
      imagePath: '../images/',
      tabletopOptions: {
        parameterize: 'http://gs-proxy.herokuapp.com/proxy?url='
      },
      state: 'MN',
      session: '2013-2014',
      OSKey: '49c5c72c157d4b37892ddb52c63d06be',
      eKey: '0AjYft7IGrHzNdE1LbFhMU25zYVdoV0lCVDlDZXI1Tnc',
      legImageProxy: 'http://i-mage-proxerific.herokuapp.com/resize?size=100x100&url=',
      osBillParse: function(billD, app) {
        billD.sources = _.map(billD.sources, function(b) {
          if (b.url.match(/\.revisor\.mn\.gov/i)) {
            b.text = 'Bill on MN Revisor of Statutes site';
          }
          return b;
        });
        return billD;
      },
      wordTranslations: {
        sponsors: {
          'Primary sponsors': 'Chief authors',
          'primary sponsors': 'chief authors',
          'Primary sponsor': 'Chief author',
          'primary sponsor': 'chief author'
        }
      }
    }

  });

  return App;
});
