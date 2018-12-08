import isNil from 'lodash/isNil';
import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import tail from 'lodash/tail';
import mapValues from 'lodash/mapValues';
import { connect as reduxConnect } from 'react-redux';

// see `_stringToPath.js` file in lodash repository
const pathPartReg = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
const backslashReg = /\\(\\)?/g;

/**
 * Function similar to lodash's pathToString implementation, converting string path to array
 * @param {string} path to be converted to array
 * @return {Array} path
 */
const stringToPath = path => {
  const result = [];
  path.replace(pathPartReg, function(match, number, quote, string) {
    if (quote) {
      result.push(string.replace(backslashReg, '$1'));
    } else {
      result.push(number ? parseInt(number) : match);
    }
  });
  return result;
};

/**
 *
 * @param {object|array} target object or array we'll get value from
 * @param {string|array} field in target we'll get requested value from
 * @param {boolean} throwError flag indicating if "cannot read property of undefined" error should be thrown
 * @param {any} defaultValue value that should be assigned if path has not been found in the object (ignored when throwError = true)
 * @return {any} requested value
 */
const getValue = (target, field, throwError, defaultValue) => {
  if (throwError) {
    return target[field];
  }
  return isNil(target) ? defaultValue : target[field];
};

/**
 * Function similar to lodash's get but it can throw an error when path has not been found
 * @param {object|array} target object or array we'll get value from
 * @param {string|array} path in target we'll get requested value from
 * @param {boolean} throwError flag indicating if "cannot read property of undefined" error should be thrown
 * @param {any} defaultValue value that should be assigned if path has not been found in the object (ignored when throwError = true)
 * @return {any} requested value
 */
const get = (target, path, throwError, defaultValue) => {
  if (!isArray(path) && !isPlainObject(path) && !isString(path)) {
    throw new Error(`Path passed to get function must be a string, array of strings and numbers or plain object but it's type is ${typeof path}`);
  }

  let pathSplit = path;
  if (!isArray(path)) {
    pathSplit = stringToPath(path);
  }
  if (pathSplit.length === 1) {
    return getValue(target, pathSplit[0], throwError, defaultValue);
  }
  return get(getValue(target, pathSplit[0]), tail(pathSplit), throwError, defaultValue);
};

/**
 * Function returning value based on path and state
 * @param {string|number} key prop name (to be used in error)
 * @param {object} state
 * @param {string} path path in object
 * @param {boolean} throwError flag indicating if "cannot read property of undefined" error should be thrown
 * @param {any} defaultValue value that should be assigned if path has not been found in the object (ignored when throwError = true)
 * @return {any} requested value
 */
const getValueForMapStateToProps = (key, state, path, throwError, defaultValue) => {
  if (isString(path)) {
    return get(state, path.replace(/^state\./, ''), throwError, defaultValue);
  }
  if (isFunction(path)) {
    return path(state);
  }
  throw new Error(`When using plain object in "connect", values must be either strings (paths to values in state) or functions (selectors). Check value in ${key} field`);
};

/**
 * Converts object of paths to traditional mapStateToProps function, exported for testing purposes
 * @param {object|function} mapState object of paths or traditional mapStateToProps function
 * @return {function} mapStateToProps function
 */
export const getNewMapState = mapState => {
  if (isPlainObject(mapState)) {
    return state => mapValues(mapState, (value, key) => {
      if (Array.isArray(value)) {
        return getValueForMapStateToProps(key, state, value[0], false, value[1]);
      }
      return getValueForMapStateToProps(key, state, value, true);
    });
  }
  return mapState;
};

/**
 * Works like react-redux connect but allows you to use object of paths as first argument
 * @param {object|function} mapState objects of paths or traditional mapStateToProps function
 * @param {array} rest rest of connect arguments
 * @return {function} connect HOC
 */
const connect = (mapState, ...rest) => reduxConnect(getNewMapState(mapState), ...rest);

export default connect;
