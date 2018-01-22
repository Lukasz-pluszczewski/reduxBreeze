import _ from 'lodash';

/**
 * Checks if there are conflicts in plugins in given adapterType (conflict = two plugins handling same actionType)
 * @param {array} plugins list of plugins
 * @param {string} adapterType name of the adapter type: 'actionAdapter', 'reducerAdapter', 'initialStateAdapter'
 * @param {function(actionType: string, pluginName: string, adapterType: string)} map function that changes actionTypes to a new values
 * @return {string} error text or empty string if no conflicts found
 */
const checkConflicts = (plugins, adapterType, map = actionType => actionType) => {
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

export default checkConflicts;
