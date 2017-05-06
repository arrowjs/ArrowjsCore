'use strict';
module.exports = function (actions, model, template) {

  actions.findById = function (id) {
    return model.findById(id)
      .lean();
  };

  actions.find = function (conditions) {
    return model.find(conditions);
  };

  actions.create = function (data) {
      let newObj = {}
      Object.keys(template).map((key) => {
        newObj[key] = data[key]
      })
      return model.create(newObj)
        .then(function (newData) {
          return newData
      })
  };
  actions.update = function (id, data) {
    let newObj = {}
    Object.keys(template).map((key) => {
      newObj[key] = data[key]
    })
    return model.findByIdAndUpdate(id, newObj)
      .then(function (newData) {
        return newData
      })
  };
  actions.destroy = function (id) {
    return model.findByIdAndRemove(id)
      .then(function () {
        return null
      })
  };
};