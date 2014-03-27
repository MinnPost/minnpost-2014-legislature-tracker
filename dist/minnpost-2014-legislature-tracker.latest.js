
/**
 * Helpers functions such as formatters or extensions
 * to libraries.
 */
define('helpers', ['jquery', 'underscore', 'backbone'],
  function($, _, Backbone) {



  /**
   * Override Backbone's ajax call to use JSONP by default as well
   * as force a specific callback to ensure that server side
   * caching is effective.
   */
  Backbone.ajax = function() {
    var options = arguments;

    if (options[0].dataTypeForce !== true) {
      options[0].dataType = 'jsonp';
      options[0].jsonpCallback = 'mpServerSideCachingHelper' +
        _.hash(options[0].url);
    }
    return Backbone.$.ajax.apply(Backbone.$, options);
  };



  // Create object of methods to use
  return {
    /**
     * Formats number
     */
    formatNumber: function(num, decimals) {
      decimals = (_.isUndefined(decimals)) ? 2 : decimals;
      var rgx = (/(\d+)(\d{3})/);
      split = num.toFixed(decimals).toString().split('.');

      while (rgx.test(split[0])) {
        split[0] = split[0].replace(rgx, '$1' + ',' + '$2');
      }
      return (decimals) ? split[0] + '.' + split[1] : split[0];
    },

    /**
     * Formats number into currency
     */
    formatCurrency: function(num) {
      return '$' + this.formatNumber(num, 2);
    },

    /**
     * Formats percentage
     */
    formatPercent: function(num) {
      return this.formatNumber(num * 100, 1) + '%';
    },

    /**
     * Formats percent change
     */
    formatPercentChange: function(num) {
      return ((num > 0) ? '+' : '') + this.formatPercent(num);
    },

    /**
     * Converts string into a hash (very basically).
     */
    hash: function(str) {
      return Math.abs(_.reduce(str.split(''), function(a, b) {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0));
    },

    /**
     * Creates identifier for things like CSS classes.
     */
    identifier: function(str) {
      return str.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-').replace(/[^\w-]+/g,'');
    },

    /**
     * Returns version of MSIE.
     */
    isMSIE: function() {
      var match = /(msie) ([\w.]+)/i.exec(navigator.userAgent);
      return match ? parseInt(match[2], 10) : false;
    },

    /**
     * Wrapper for a JSONP request
     */
    jsonpRequest: function() {
      var options = arguments[0];

      options.dataType = 'jsonp';
      options.jsonpCallback = 'mpServerSideCachingHelper' +
        _.hash(options.url);
      return $.ajax.apply($, [options]);
    },

    /**
     * Data source handling.  For development, we can call
     * the data directly from the JSON file, but for production
     * we want to proxy for JSONP.
     *
     * `name` should be relative path to dataset minus the .json
     *
     * Returns jQuery's defferred object.
     */
    getLocalData: function(name, options) {
      var thisHelper = this;
      var proxyPrefix = options.jsonpProxy;
      var useJSONP = false;
      var defers = [];

      this.data = this.data || {};
      name = (_.isArray(name)) ? name : [ name ];

      // If the data path is not relative, then use JSONP
      if (options && options.dataPath.indexOf('http') === 0) {
        useJSONP = true;
      }

      // Go through each file and add to defers
      _.each(name, function(d) {
        var defer;
        if (_.isUndefined(thisHelper.data[d])) {

          if (useJSONP) {
            defer = thisHelper.jsonpRequest({
              url: proxyPrefix + encodeURI(options.dataPath + d + '.json')
            });
          }
          else {
            defer = $.getJSON(options.dataPath + d + '.json');
          }

          $.when(defer).done(function(data) {
            thisHelper.data[d] = data;
          });
          defers.push(defer);
        }
      });

      return $.when.apply($, defers);
    },

    /**
     * Get remote data.  Provides a wrapper around
     * getting a remote data source, to use a proxy
     * if needed, such as using a cache.
     */
    getRemoteData: function(options) {
      options.dataType = 'jsonp';

      if (this.options.remoteProxy) {
        options.url = options.url + '&callback=proxied_jqjsp';
        options.url = app.options.remoteProxy + encodeURIComponent(options.url);
        options.callback = 'proxied_jqjsp';
        options.cache = true;
      }

      return $.ajax(options);
    }
  };
});

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
    'LT': '../bower_components/legislature-tracker/dist/legislature-tracker.min',
    'minnpost-2014-legislature-tracker': 'app'
  }
});


// Create main application
define('minnpost-2014-legislature-tracker', [
  'jquery', 'underscore', 'helpers', 'LT'
], function(
    $, _, helpers, LT
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
      this.lt = new LT(_.extend({}, this.options, {
        el: this.$el
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
      legImageProxy: 'http://i-mage-proxerific.herokuapp.com/resize?size=100x100&url='
    }

  });

  return App;
});

