import _ from 'lodash';
import { connect as reduxConnect } from 'react-redux';

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
 * Converts object of paths to traditional mapStateToProps function
 * @param {object|function} mapState object of paths or traditional mapStateToProps function
 * @return {function} mapStateToProps function
 */
export const getNewMapState = mapState => {
  if (_.isPlainObject(mapState)) {
    return state => _.mapValues(mapState, (value, key) => {
      if (_.isString(value)) {
        return _.get(state, value.replace(/^state\./, ''));
      }
      if (_.isFunction(value)) {
        return value(state);
      }
      throw new Error(`When using plain object in "connect", values must be either strings (paths to values in state) or functions (selectors). Check value in ${key} field`);
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
export const connect = (mapState, ...rest) => reduxConnect(getNewMapState(mapState), ...rest);

/**
 * Checks if there are conflicts in plugins in given adapterType (conflict = two plugins handling same actionType)
 * @param {array} plugins list of plugins
 * @param {string} adapterType name of the adapter type: 'actionAdapter', 'reducerAdapter', 'initialStateAdapter'
 * @param {function(actionType: string, pluginName: string, adapterType: string)} map function that changes actionTypes to a new values
 * @return {string} error text or empty string if no conflicts found
 */
export const checkConflicts = (plugins, adapterType, map = actionType => actionType) => {
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
    console.warn(`${errorMessage} Duplicated adapters will be overwritten!`); // eslint-disable-line no-console
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
