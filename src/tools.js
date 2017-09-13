import _ from 'lodash';

/**
 * Helper for redux to attach reducers to one field instead of composing them into separate fields
 * @param {array} rawReducers array of unchained, not combined reducers
 * @return {function} reducer
 */
export const chainReducers = rawReducers => (state, action) => {
  const reducers = _.filter(rawReducers, reducer => {
    if (_.isNil(reducer)) {
      return false;
    }
    if (_.isFunction(reducer)) {
      return true;
    }
    throw new Error('reducers passed to chain reducers must be either a valida reducer (function) or nil (null or undefined)');
  });
  return reducers.reduce((accuState, reducer) => reducer(accuState, action), state);
};

/**
 * Checks if there are conflicts in plugins in given adapterType (conflict = two plugins handling same actionType)
 * @param {array} plugins list of plugins
 * @param {string} adapterType name of the adapter type: 'actionAdapter', 'reducerAdapter', 'initialStateAdapter'
 * @param {function(actionType: string, pluginName: string, adapterType: string)} map function that changes actionTypes to a new values
 * @return {string} error text or empty string if no conflicts found
 */
export const checkConflicts = (plugins, adapterType, map = actionType => actionType) => {
  // TODO add checking for plugins having the same name
  const foundAdapters = {};
  plugins.forEach(plugin => {
    if (plugin[adapterType]) {
      _.forEach(plugin[adapterType], (adapter, actionType) => {
        const mappedActionType = map(actionType, plugin.name, adapterType);
        if (!foundAdapters[mappedActionType]) {
          foundAdapters[mappedActionType] = [];
        }
        foundAdapters[mappedActionType].push(plugin.name);
      });
    }
  });
  return _(foundAdapters)
    .map((listOfPlugins, actionType) => listOfPlugins.length > 1 ? `${adapterType} '${actionType}' is defined in plugins: ${listOfPlugins.join(',')}` : null)
    .filter()
    .join('; ');
};

/**
 * Function to merge different plugins into one plugin object
 * @param {array} plugins array of plugins objects
 * @param {boolean} strict with strict turned on we throw an error on plugin conflicts
 * @param {function} mapActionTypes function that changes names of action types
 * @return {{actionAdapter, reducerAdapter, initialStateAdapter}} merged plugin object
 */
export const mergePlugins = (plugins, { strict = true, mapActionTypes = actionType => actionType } = {}) => {
  const actionAdapterConflicts = checkConflicts(plugins, 'actionAdapter', mapActionTypes);
  const reducerAdapterConflicts = checkConflicts(plugins, 'reducerAdapter', mapActionTypes);
  const initialStateAdapterConflicts = checkConflicts(plugins, 'initialStateAdapter', mapActionTypes);
  const conflicts = [];
  const conflictsVerbose = [];
  if (actionAdapterConflicts) {
    conflicts.push('actionAdapters');
    conflictsVerbose.push(actionAdapterConflicts);
  }
  if (reducerAdapterConflicts) {
    conflicts.push('reducerAdapters');
    conflictsVerbose.push(reducerAdapterConflicts);
  }
  if (initialStateAdapterConflicts) {
    conflicts.push('initialStateAdapters');
    conflictsVerbose.push(initialStateAdapterConflicts);
  }

  if (conflicts.length) {
    const errorMessage = `Conflicts in adapters: ${conflicts.join(', ')}. ${conflictsVerbose.join('. ')}.`;
    if (strict) {
      throw new Error(errorMessage);
    }
    console.warn(`${errorMessage} Duplicated adapters will be overwritten!`);
  }

  return {
    actionAdapter: plugins.reduce((actionAdapter, plugin) => ({
      ...actionAdapter,
      ..._.reduce(plugin.actionAdapter, (accu, actionAdapter, actionType) => {
        accu[mapActionTypes(actionType, plugin.name, 'actionAdapter')] = actionAdapter;
        return accu;
      }, {}),
    }), {}),
    reducerAdapter: plugins.reduce((actionAdapter, plugin) => ({
      ...actionAdapter,
      ..._.reduce(plugin.reducerAdapter, (accu, reducerAdapter, actionType) => {
        accu[mapActionTypes(actionType, plugin.name, 'reducerAdapter')] = reducerAdapter;
        return accu;
      }, {}),
    }), {}),
    initialStateAdapter: plugins.reduce((actionAdapter, plugin) => ({
      ...actionAdapter,
      ..._.reduce(plugin.initialStateAdapter, (accu, initialStateAdapter, actionType) => {
        accu[mapActionTypes(actionType, plugin.name, 'initialStateAdapter')] = initialStateAdapter;
        return accu;
      }, {}),
    }), {}),

  };
};

/**
 *
 * @param {string} actionName camelCase name of the action (e.g. someAction)
 * @param {string} suffix string that is going to be added at the end of the created action type
 * @param {string} prefix string that is going to be added at the beginning of the created action type
 * @return {string} upperSnakeCase action type (e.g. SOME_ACTION or with example suffix SOME_ACTION_SUFFIX)
 */
export const createActionType = (actionName, suffix = '', prefix = '') => {
  const upperSnakeCase = _.snakeCase(actionName).toUpperCase();
  return `${prefix ? `${prefix.toUpperCase()}_` : ''}${upperSnakeCase}${suffix ? `_${suffix.toUpperCase()}` : ''}`;
};

/**
 * Works like lodash _.set() but does not mutate object (doesn't work with array style keys like `someArray[2].anotherField`)
 * @param {object} object source object
 * @param {string|object} path in object to set value in or object with paths as keys and values as values (if path is an object it ignores 'value')
 * @param {any} value to set in given path
 * @param {string} delimiter path delimiter; by default: '.'
 * @return {object} new object with value(s) changed
 */
export const immutableSet = (object, path, value = null, delimiter = '.') => {
  // console.log('immutableSet', {object, path, value, delimiter});
  if (!path) {
    return value;
  }
  if (_.isPlainObject(path)) {
    if (_.isEmpty(path)) {
      return object;
    }
    return _.reduce(path, (accu, value, path) => immutableSet(accu, path, value, delimiter), object);
  }

  const pathSplit = path.split(delimiter);
  if (pathSplit.length === 1) {
    return {
      ...object,
      [path]: value,
    };
  }
  let childObject = {};
  if (_.has(object, pathSplit[0])) {
    childObject = object[pathSplit[0]];
    if (!_.isPlainObject(childObject)) {
      throw new Error(`Part of 'path' provided is defined in 'object' and is not a plain JS object but ${typeof childObject}. It's most likely an error. Check the path and object provided to immutableSet function`);
    }
  }
  return {
    ...object,
    [pathSplit[0]]: immutableSet(childObject, _.tail(pathSplit).join(delimiter), value, delimiter),
  };
};
