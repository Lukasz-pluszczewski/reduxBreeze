import forEach from 'lodash/forEach';
import lodashMap from 'lodash/map';
import filter from 'lodash/filter';
import join from 'lodash/join';

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
      forEach(plugin[adapterType], (adapter, actionType) => {
        const mappedActionType = map(actionType, plugin.name, adapterType);
        if (!foundAdapters[mappedActionType]) {
          foundAdapters[mappedActionType] = [];
        }
        foundAdapters[mappedActionType].push(plugin.name);
      });
    }
  });
  const mapped = lodashMap(foundAdapters, (listOfPlugins, actionType) => listOfPlugins.length > 1 ? `${adapterType} '${actionType}' is defined in plugins: ${listOfPlugins.join(',')}` : null);
  return join(filter(mapped), '; ');
};

export default checkConflicts;
