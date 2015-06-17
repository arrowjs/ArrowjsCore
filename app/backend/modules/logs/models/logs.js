'use strict'
 /**
 * Created by thanhnv on 1/19/15.
 */
module.exports = function (sequelize, DataTypes) {
    let Log = sequelize.define("logs", {
        event_name: DataTypes.STRING,
        message: DataTypes.STRING,
        module_name: DataTypes.STRING,
        note: DataTypes.STRING,
        type: DataTypes.INTEGER
    }, {
        tableName: 'arr_log',
        createdAt: 'created_at',

        // I want updatedAt to actually be called updateTimestamp
        updatedAt: false,
        // And deletedAt to be called destroyTime (remember to enable paranoid for this to work)
        deletedAt: false
    });
    return Log;
};
