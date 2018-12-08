import reduce from 'lodash/reduce';
import checkConflicts from './checkConflicts';

/**
 * Function to merge different plugins into one plugin object
 * @param {array} plugins array of plugins objects
 * @param {boolean} strict with strict turned on we throw an error on plugin conflicts
 * @param {function} mapActionTypes function that changes names of action types
 * @return {{actionAdapter, reducerAdapter, initialStateAdapter}} merged plugin object
 */
const mergePlugins = (plugins, { strict = true, mapActionTypes = actionType => actionType } = {}) => {
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
      ...reduce(plugin.actionAdapter, (accu, actionAdapter, actionType) => {
        accu[mapActionTypes(actionType, plugin.name, 'actionAdapter')] = actionAdapter;
        return accu;
      }, {}),
    }), {}),
    reducerAdapter: plugins.reduce((actionAdapter, plugin) => ({
      ...actionAdapter,
      ...reduce(plugin.reducerAdapter, (accu, reducerAdapter, actionType) => {
        accu[mapActionTypes(actionType, plugin.name, 'reducerAdapter')] = reducerAdapter;
        return accu;
      }, {}),
    }), {}),
    initialStateAdapter: plugins.reduce((actionAdapter, plugin) => ({
      ...actionAdapter,
      ...reduce(plugin.initialStateAdapter, (accu, initialStateAdapter, actionType) => {
        accu[mapActionTypes(actionType, plugin.name, 'initialStateAdapter')] = initialStateAdapter;
        return accu;
      }, {}),
    }), {}),
  };
};

export default mergePlugins;
