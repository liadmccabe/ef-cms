const joi = require('joi-browser');

function toRawObject(entity) {
  const keys = Object.keys(entity);
  const obj = {};
  for (let key of keys) {
    const value = entity[key];
    if (Array.isArray(value)) {
      obj[key] = value.map(v => toRawObject(v));
    } else if (typeof value === 'object' && value !== null) {
      obj[key] = toRawObject(value);
    } else {
      obj[key] = value;
    }
  }
  return obj;
}

function getFormattedValidationErrorsHelper(entity) {
  const errors = entity.getValidationErrors();
  console.log('errros', errors)
  if (!errors) return null;
  for (let key of Object.keys(errors)) {
    console.log('errors[key]', errors[key])
    if (Array.isArray(errors[key])) {
      errors[key] = errors[key].map(error =>
        Object.keys(error).map(otherKey => {
          const errorMap = entity.getErrorToMessageMap()[otherKey];
          if (Array.isArray(errorMap)) {
            for (let errorObject of errorMap) {
              console.log('errorOBject', errorObject, errorObject)
              if (
                typeof errorObject === 'object' &&
                error[otherKey].indexOf(errorObject.contains) > -1
              ) {
                return errorObject.message;
              } else {
                return errorObject;
              }
            }
          }
          return errorMap;
        }),
      );
    } else {
      const errorMap = entity.getErrorToMessageMap()[key];
      console.log('errorMap', errorMap)
      if (Array.isArray(errorMap)) {
        for (let errorObject of errorMap) {
          if (
            typeof errorObject === 'object' &&
            errors[key].indexOf(errorObject.contains) > -1
          ) {
            errors[key] = errorObject.message;
            break;
          } else {
            errors[key] = errorObject;
          }
        }
      } else {
        errors[key] = errorMap;
        console.log('setting', errors[key])
      }
    }
  }
  return errors;
}

function getFormattedValidationErrors(entity) {
  const keys = Object.keys(entity);
  const obj = {};
  let errors = null;
  if (entity && entity.getFormattedValidationErrors) {
    errors = getFormattedValidationErrorsHelper(entity);
  }
  if (errors) {
    Object.assign(obj, errors);
  }
  for (let key of keys) {
    const value = entity[key];
    console.log(value, entity[key])
    if (Array.isArray(value)) {

      obj[key] = value
        .map(v => getFormattedValidationErrors(v))
        .filter(v => v)
        .map((v, index) => ({ ...v, index }));
      if (obj[key].length === 0) {
        if (errors && errors[key]) {
          obj[key] =
            (entity.getErrorToMessageMap() || {})[key] ||
            'An invalid value was found';
        } else {
          delete obj[key];
        }
      }
    } else if (
      typeof value === 'object' &&
      value &&
      value.getFormattedValidationErrors
    ) {
      obj[key] = getFormattedValidationErrors(value);
      if (!obj[key]) delete obj[key];
    } else {
      console.log(obj[key], value)
      // obj[key] = value;
    }
  }
  console.log('here', obj)
  return Object.keys(obj).length === 0 ? null : obj;
}

exports.joiValidationDecorator = function(
  entityConstructor,
  schema,
  customValidate,
  errorToMessageMap,
) {
  entityConstructor.prototype.getErrorToMessageMap = function() {
    return errorToMessageMap;
  };

  entityConstructor.prototype.isValid = function isValid() {
    return (
      joi.validate(this, schema, { allowUnknown: true }).error === null &&
      (customValidate ? customValidate.call(this) : true)
    );
  };

  entityConstructor.prototype.getValidationError = function getValidationError() {
    return joi.validate(this, schema, { allowUnknown: true }).error;
  };

  entityConstructor.prototype.validate = function validate() {
    if (!this.isValid()) {
      throw new Error(
        `The ${entityConstructor.name ||
          ''} entity was invalid ${this.getValidationError()}`,
      );
    }
    return this;
  };

  entityConstructor.prototype.getFormattedValidationErrors = function() {
    return getFormattedValidationErrors(this);
  };

  entityConstructor.prototype.getValidationErrors = function getValidationErrors() {
    const { error } = joi.validate(this, schema, {
      allowUnknown: true,
      abortEarly: false,
    });
    if (!error) return null;
    const errors = {};
    error.details.forEach(detail => {
      errors[detail.context.key] = detail.message;
    });
    return errors;
  };

  entityConstructor.prototype.validateWithError = function validate(error) {
    if (!this.isValid()) {
      error.message = `${error.message} ${this.getValidationError()}`;
      throw error;
    }
    return this;
  };

  entityConstructor.prototype.toRawObject = function convertToRawObject() {
    return toRawObject(this);
  };

  entityConstructor.validateRawCollection = function(collection) {
    return collection.map(entity =>
      new entityConstructor(entity).validate().toRawObject(),
    );
  };

  entityConstructor.validateCollection = function(collection) {
    return collection.map(entity => entity.validate());
  };
};
