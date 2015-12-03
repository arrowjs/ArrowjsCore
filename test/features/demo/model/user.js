
module.exports = function (sequelize,Datatypes) {
    var User = sequelize.define('user', {
        id : {
            type: Datatypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        username: {
            type: Datatypes.STRING,
            unique: true
        }
    }, {
        freezeTableName : true
    });
    return User
}