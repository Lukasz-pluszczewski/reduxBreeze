import reduce from 'lodash/reduce';
import map from 'lodash/map';
import find from 'lodash/find';
import has from 'lodash/has';
import { combineReducers } from 'redux';
import { set } from 'perfect-immutable';
import { defaultPlugin, tools, mergePlugins, chainReducers } from './index';

const defaultConfig = {
  useDefaultPlugin: true,
  strict: true,
  /**
   *
   * @param {string} actionType action type name (like 'default' in default plugin)
   * @param {string} pluginName name of the plugin
   * @param {string} adapterType type of adapter: 'actionAdapter', 'reducerAdapter', 'initialStateAdapter'
   * @return {string} changed actionType
   */
  mapActionTypes(actionType, pluginName, adapterType) {
    return actionType;
  },
};

const createReduxBreezeInstance = (actionDefinitions, userConfig = defaultConfig, ...plugins) => {
  const config = {
    ...defaultConfig,
    ...userConfig,
  };

  // merging plugins
  const pluginsToMerge = config.useDefaultPlugin
    ? [defaultPlugin(tools), ...plugins.map(plugin => plugin(tools, config))]
    : plugins.map(plugin => plugin(tools, config));

  const plugin = mergePlugins(
    pluginsToMerge,
    {
      strict: config.strict,
      mapActionTypes: config.mapActionTypes,
    }
  );

  /**
   * Function to generate initialState (and immutably deeply merge it with custom initialState) from actions definitions
   * @param {object} actions object of action definitions
   * @param {object} initialState optional custom initial state
   * @return {object} created initial state (merged with provided initialState)
   */
  const createInitialState = (actions, initialState = {}) => reduce(
    actions,
    (actionsState, actionDefinition, actionName) => {
      if (plugin.initialStateAdapter[actionDefinition.type]) {
        return set(
          actionsState,
          plugin.initialStateAdapter[actionDefinition.type](actionDefinition, actionName)
        );
      }
      return actionsState;
    },
    initialState
  );

  return {
    combineReducers(customReducers = {}) {
      const reducers = reduce(actionDefinitions, (reducers, actions, reducerName) => {
        // getting final initial state for this combined/chained reducer (triggering custom reducers to get their initial state)
        const initialState = createInitialState(
          actions,
          reducers[reducerName] ? reducers[reducerName](undefined, {}) : {} // eslint-disable-line  no-undefined
        );

        // creating array of reducers tha are going to be chained on the `reducerName` field
        const reducersToChain = map(actions, (actionDefinition, actionName) => {
          if (plugin.reducerAdapter[actionDefinition.type]) {
            return plugin.reducerAdapter[actionDefinition.type](actionDefinition, actionName, initialState);
          }
          throw new Error(`Unknown type '${actionDefinition.type}' of action '${actionName}'. It's most likely because you did not install plugin to handle reducer for this type of actions`);
        });

        // adding custom reducer (if one has been provided) at the end of the chain for the user to be able to modify default behaviour
        if (reducers[reducerName]) {
          reducersToChain.push(reducers[reducerName]);
        }

        reducers[reducerName] = chainReducers(reducersToChain);
        return reducers;
      }, customReducers);
      return combineReducers(reducers);
    },
    getAction(actionName, config) {
      const actionGroup = find(actionDefinitions, actionsList => has(actionsList, actionName));
      if (!actionGroup) {
        throw new Error(`${actionName} action has not been found`);
      }
      if (!plugin.actionAdapter[actionGroup[actionName].type]) {
        throw new Error(`Unknown type '${actionGroup[actionName].type}' of '${actionName}' action. It's most likely because you did not install plugin to handle action creation for this type of actions`);
      }
      return plugin.actionAdapter[actionGroup[actionName].type](actionGroup[actionName], actionName, config);
    },
    getActionDefinitions() {
      return actionDefinitions;
    },
    getMergedPlugin() {
      return plugin;
    },
  };
};

export default createReduxBreezeInstance;
