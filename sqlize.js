var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var _         = require('lodash');
var db        = {};

var nconf = require('nconf')
nconf.file({ file: __dirname + '/config.json' });
var dbURI = nconf.get('db');

module.exports = function (cb) {
  console.log('Initializing Sequelize');
  // create your instance of sequelize
  var sequelize = new Sequelize(dbURI, {
    logging: false, // set to console.log for logs
    pool: {
      maxConnections: 100,
      maxIdleTime: 30
    }
  });

  console.log('Defining Tweeter Model')
  var Tweeter = sequelize.define('Tweeter', {
    id: {
      type: Sequelize.BIGINT,
      unique: true,
      primaryKey:true
    },
    id_str: {
      type: Sequelize.STRING,
      unique: true
    },
    name: Sequelize.STRING,
    screen_name: Sequelize.STRING,
    location: Sequelize.STRING,
    description: Sequelize.TEXT,
    url: Sequelize.STRING,
    protected: Sequelize.BOOLEAN,
    followers_count: Sequelize.BIGINT,
    friends_count: Sequelize.BIGINT,
    listed_count: Sequelize.BIGINT,
    created_at: Sequelize.STRING,
    favourites_count: Sequelize.BIGINT,
    utc_offset: Sequelize.BIGINT,
    time_zone: Sequelize.STRING,
    geo_enabled: Sequelize.BOOLEAN,
    verified: Sequelize.BOOLEAN,
    statuses_count: Sequelize.BIGINT,
    lang: Sequelize.STRING,
    is_translation_enabled: Sequelize.BOOLEAN,
    profile_background_tile: Sequelize.BOOLEAN,
    profile_image_url: Sequelize.STRING,
    profile_image_url_https: Sequelize.STRING,
    profile_banner_url: Sequelize.STRING,
    profile_link_color: Sequelize.STRING,
    profile_sidebar_border_color: Sequelize.STRING,
    profile_sidebar_fill_color: Sequelize.STRING,
    profile_text_color: Sequelize.STRING,
    profile_use_background_image: Sequelize.BOOLEAN,
    default_profile: Sequelize.BOOLEAN,
    default_profile_image: Sequelize.BOOLEAN,
    following: Sequelize.BOOLEAN,
    follow_request_sent: Sequelize.BOOLEAN,
    notifications: Sequelize.BOOLEAN
  })

  db['Tweeter'] = Tweeter;

  // Synchronizing any model changes with database.
  // WARNING: this will DROP your database everytime you re-run your application
  var force = true
  sequelize
    .sync({force: force})
    .complete(function(err){
      if (err) {
        console.log("An error occured %j",err);
        return cb(err)
      }
      if (force) {
        console.log("Database synchronized, all tables dropped");
      } else {
        console.log("Database synchronized");
      }
      db.Sequelize = Sequelize
      db.sequelize = sequelize
      return cb(null, db)
  });
}
