'use strict';
const _ = require('lodash')

module.exports = function modelToTemplate(type, model) {
  if (type === 'mongodb') return parseMongoSchema(model);
  return parseSQLSchema(model)
}

function parseMongoSchema(model) {
  const schema = model ? model.schema.obj : {}
  console.log(model.schema.obj);
  return mongoTemplate(schema)
}

function mongoTemplate(schema) {
  const template = {}
  Object.keys(schema).map(function (key) {
    const type = _.isArray(schema[key]) ? 'Array' :
      _.isFunction(schema[key]) ? schema[key].name :
        schema[key].type ? schema[key].type.name : 'Nested'

    template[key] = {}
    template[key].type = type

    if (template[key].type === 'Array') {
      template[key].subType = !schema[key][0] ? 'none' :
        _.isFunction(schema[key][0]) ? schema[key][0].name :
          schema[key][0].type ? schema[key][0].type.name : 'Nested'
    }
    //mongoose build-in validator
    schema[key].enum && (template[key].enum = schema[key].enum)
    schema[key].match && (template[key].match = schema[key].match)
    schema[key].maxlength && (template[key].maxlength = schema[key].maxlength)
    schema[key].minlength && (template[key].minlength = schema[key].minlength)
    schema[key].max && (template[key].max = schema[key].max)
    schema[key].min && (template[key].min = schema[key].min)
    schema[key].default && (template[key].default = schema[key].default)

    if (schema[key].arrTable) {
      template[key].arrTable = schema[key].arrTable
    }

    if (schema[key].arrInput) {
      template[key].arrInput = schema[key].arrInput
    } else {
      switch (template[key].type) {
        case 'String':
          template[key].arrInput = 'text'
          break;
        case 'Number':
          template[key].arrInput = 'number'
          break;
        case 'Boolean':
          template[key].arrInput = 'checkbox'
          break;
        case 'Date':
          template[key].arrInput = 'date'
          break;
        case 'Array':
          schema[key][0].enum && (template[key].enum = schema[key][0].enum)
          schema[key][0].match && (template[key].match = schema[key][0].match)
          schema[key][0].maxlength && (template[key].maxlength = schema[key][0].maxlength)
          schema[key][0].minlength && (template[key].minlength = schema[key][0].minlength)
          schema[key][0].max && (template[key].max = schema[key][0].max)
          schema[key][0].min && (template[key].min = schema[key][0].min)
          schema[key][0].default && (template[key].default = schema[key][0].default)

          if (schema[key][0].arrInput) {
            template[key].element = schema[key][0].arrInput
          } else {
            switch (template[key].subType) {
              case 'String':
                template[key].element = 'text'
                break;
              case 'Number':
                template[key].element = 'number'
                break;
              case 'Boolean':
                template[key].element = 'checkbox'
                break;
              case 'Date':
                template[key].element = 'date'
                break;
              case 'Nested':
                template[key].element = mongoTemplate(schema[key][0])
                break;
              case 'Array':
                template[key].element = mongoTemplate({arrayElement: schema[key][0]})
                break;
              default:
                template[key].element = 'none'
                break;
            }
          }
          break;
        case 'Nested':
          template[key].template = mongoTemplate(schema[key])
          break;
        default:
          template[key].arrInput = 'none'
      }
    }
  })
  return template
}

function parseSQLSchema(model) {
  
}