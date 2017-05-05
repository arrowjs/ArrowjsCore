/**
 * Created by trquoccuong on 5/5/2017.
 */
'use strict';
const _ = require('lodash');

/**
 * Associate all models that are loaded into ArrowApplication.models. Associate logic defined in /config/database.js
 * @param {ArrowApplication} arrow
 * @return {ArrowApplication} arrow
 */

module.exports = function setupModels(arrow) {
  let defaultDatabase = require('../libs/database').db();
  if (defaultDatabase && defaultDatabase.__arrowDB.dialect !== 'mongodb' && arrow.models && Object.keys(arrow.models).length > 0) {
    /* istanbul ignore next */
    let defaultQueryResolve = function () {
      return new Promise(function (fulfill) {
        fulfill("No models")
      })
    };

    //Load model associate rules defined in /config/database.js
    let databaseFunction = require(arrow.arrFolder + "config/database");

    Object.keys(arrow.models).forEach(function (modelName) {
      if ("associate" in arrow.models[modelName]) {
        arrow.models[modelName].associate(arrow.models);
      }
    });

    /* istanbul ignore else */
    if (databaseFunction.associate) {
      let resolve = Promise.resolve();
      resolve.then(function () {
        //Execute models associate logic in /config/database.js
        return databaseFunction.associate(arrow.models)
      }).then(function () {
        defaultDatabase.sync();  //Sequelize.sync: sync all defined models to the DB.
      })
    }


    //Assign raw query function of Sequelize to arrow.models object
    //See Sequelize raw query http://docs.sequelizejs.com/en/latest/docs/raw-queries/
    /* istanbul ignore next */
    if (defaultDatabase.query) {
      arrow.models.rawQuery = defaultDatabase.query.bind(defaultDatabase);
      _.merge(arrow.models, defaultDatabase);
    } else {
      arrow.models.rawQuery = defaultQueryResolve;
    }

  }
  return arrow
};