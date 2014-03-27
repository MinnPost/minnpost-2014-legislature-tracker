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
  baseUrl: 'js',
  paths: {
    'requirejs': '../bower_components/requirejs/require',
    'text': '../bower_components/text/text',
    'jquery': '../bower_components/jquery/dist/jquery.min',
    'underscore': '../bower_components/underscore/underscore',
    'Backbone': '../bower_components/backbone/backbone',
    'Ractive': '../bower_components/ractive/build/Ractive-legacy.min',
    'Ractive-events-tap': '../bower_components/ractive-events-tap/Ractive-events-tap.min',
    'moment': '../bower_components/moment/min/moment.min',
    'legislature-tracker': '../bower_components/legislature-tracker/dist/legislature-tracker.min',
    'minnpost-2014-legislature-tracker': 'app'
  }
});


// Create main application
define('minnpost-2014-legislature-tracker', [
  'jquery', 'underscore', 'helpers',
  'Backbone', 'Ractive', 'Ractive-events-tap'
], function(
    $, _, helpers,
    Backbone, Ractive, RactiveEventsTap
  ) {

  // Constructor for app
  var App = function(options) {
    this.options = _.extend(this.defaultOptions, options);
    this.el = this.options.el;
    if (this.el) {
      this.$el = $(this.el);
      this.$content = this.$el.find('.content-container');
    }
    this.start();
  };

  // Extend with custom methods
  _.extend(App.prototype, {
    // Start function
    start: function() {

    },

    // Default options
    defaultOptions: {
      projectName: 'minnpost-2014-legislature-tracker'
    }

  });

  return App;
});
