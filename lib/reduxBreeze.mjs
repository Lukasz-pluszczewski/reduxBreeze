import _ from 'lodash';
import { combineReducers } from 'redux';
import { set } from 'perfect-immutable';
import { connect } from 'react-redux';

var babelHelpers = {};




var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();















var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};



































var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

babelHelpers;

/**
 * Helper for redux to attach reducers to one field instead of composing them into separate fields
 * @param {array} rawReducers array of unchained, not combined reducers
 * @return {function} reducer
 */
var chainReducers = function chainReducers(rawReducers) {
  return function (state, action) {
    var reducers = _.filter(rawReducers, function (reducer) {
      if (_.isNil(reducer)) {
        return false;
      }
      if (_.isFunction(reducer)) {
        return true;
      }
      throw new Error('reducers passed to chain reducers must be either a valida reducer (function) or nil (null or undefined)');
    });
    return reducers.reduce(function (accuState, reducer) {
      return reducer(accuState, action);
    }, state);
  };
};

/**
 * Converts object of paths to traditional mapStateToProps function
 * @param {object|function} mapState object of paths or traditional mapStateToProps function
 * @return {function} mapStateToProps function
 */
var getNewMapState = function getNewMapState(mapState) {
  if (_.isPlainObject(mapState)) {
    return function (state) {
      return _.mapValues(mapState, function (value, key) {
        if (_.isString(value)) {
          return _.get(state, value.replace(/^state\./, ''));
        }
        if (_.isFunction(value)) {
          return value(state);
        }
        throw new Error('When using plain object in "connect", values must be either strings (paths to values in state) or functions (selectors). Check value in ' + key + ' field');
      });
    };
  }
  return mapState;
};

/**
 * Works like react-redux connect but allows you to use object of paths as first argument
 * @param {object|function} mapState objects of paths or traditional mapStateToProps function
 * @param {array} rest rest of connect arguments
 * @return {function} connect HOC
 */
var connect$1 = function connect$$1(mapState) {
  for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    rest[_key - 1] = arguments[_key];
  }

  return connect.apply(undefined, [getNewMapState(mapState)].concat(rest));
};

/**
 * Checks if there are conflicts in plugins in given adapterType (conflict = two plugins handling same actionType)
 * @param {array} plugins list of plugins
 * @param {string} adapterType name of the adapter type: 'actionAdapter', 'reducerAdapter', 'initialStateAdapter'
 * @param {function(actionType: string, pluginName: string, adapterType: string)} map function that changes actionTypes to a new values
 * @return {string} error text or empty string if no conflicts found
 */
var checkConflicts = function checkConflicts(plugins, adapterType) {
  var map = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (actionType) {
    return actionType;
  };

  var foundAdapters = {};
  plugins.forEach(function (plugin) {
    if (plugin[adapterType]) {
      _.forEach(plugin[adapterType], function (adapter, actionType) {
        var mappedActionType = map(actionType, plugin.name, adapterType);
        if (!foundAdapters[mappedActionType]) {
          foundAdapters[mappedActionType] = [];
        }
        foundAdapters[mappedActionType].push(plugin.name);
      });
    }
  });
  return _(foundAdapters).map(function (listOfPlugins, actionType) {
    return listOfPlugins.length > 1 ? adapterType + ' \'' + actionType + '\' is defined in plugins: ' + listOfPlugins.join(',') : null;
  }).filter().join('; ');
};

/**
 * Function to merge different plugins into one plugin object
 * @param {array} plugins array of plugins objects
 * @param {boolean} strict with strict turned on we throw an error on plugin conflicts
 * @param {function} mapActionTypes function that changes names of action types
 * @return {{actionAdapter, reducerAdapter, initialStateAdapter}} merged plugin object
 */
var mergePlugins = function mergePlugins(plugins) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$strict = _ref.strict,
      strict = _ref$strict === undefined ? true : _ref$strict,
      _ref$mapActionTypes = _ref.mapActionTypes,
      mapActionTypes = _ref$mapActionTypes === undefined ? function (actionType) {
    return actionType;
  } : _ref$mapActionTypes;

  var actionAdapterConflicts = checkConflicts(plugins, 'actionAdapter', mapActionTypes);
  var reducerAdapterConflicts = checkConflicts(plugins, 'reducerAdapter', mapActionTypes);
  var initialStateAdapterConflicts = checkConflicts(plugins, 'initialStateAdapter', mapActionTypes);
  var conflicts = [];
  var conflictsVerbose = [];
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
    var errorMessage = 'Conflicts in adapters: ' + conflicts.join(', ') + '. ' + conflictsVerbose.join('. ') + '.';
    if (strict) {
      throw new Error(errorMessage);
    }
    console.warn(errorMessage + ' Duplicated adapters will be overwritten!'); // eslint-disable-line no-console
  }

  return {
    actionAdapter: plugins.reduce(function (actionAdapter, plugin) {
      return _extends({}, actionAdapter, _.reduce(plugin.actionAdapter, function (accu, actionAdapter, actionType) {
        accu[mapActionTypes(actionType, plugin.name, 'actionAdapter')] = actionAdapter;
        return accu;
      }, {}));
    }, {}),
    reducerAdapter: plugins.reduce(function (actionAdapter, plugin) {
      return _extends({}, actionAdapter, _.reduce(plugin.reducerAdapter, function (accu, reducerAdapter, actionType) {
        accu[mapActionTypes(actionType, plugin.name, 'reducerAdapter')] = reducerAdapter;
        return accu;
      }, {}));
    }, {}),
    initialStateAdapter: plugins.reduce(function (actionAdapter, plugin) {
      return _extends({}, actionAdapter, _.reduce(plugin.initialStateAdapter, function (accu, initialStateAdapter, actionType) {
        accu[mapActionTypes(actionType, plugin.name, 'initialStateAdapter')] = initialStateAdapter;
        return accu;
      }, {}));
    }, {})

  };
};

/**
 *
 * @param {string} actionName camelCase name of the action (e.g. someAction)
 * @param {string} suffix string that is going to be added at the end of the created action type
 * @param {string} prefix string that is going to be added at the beginning of the created action type
 * @return {string} upperSnakeCase action type (e.g. SOME_ACTION or with example suffix SOME_ACTION_SUFFIX)
 */
var createActionType = function createActionType(actionName) {
  var suffix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var prefix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  var upperSnakeCase = _.snakeCase(actionName).toUpperCase();
  return '' + (prefix ? prefix.toUpperCase() + '_' : '') + upperSnakeCase + (suffix ? '_' + suffix.toUpperCase() : '');
};

var getResultsAssignments = function getResultsAssignments(actionDefinition, actionName) {
  var action = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var state = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var result = _.isFunction(actionDefinition.result) ? actionDefinition.result(action) : actionDefinition.result;
  return _.reduce(result, function (accu, source, target) {
    if (_.isFunction(source)) {
      accu[target] = source(action, _.get(state, target));
    } else if (_.isPlainObject(source)) {
      if (_.isFunction(source.source)) {
        accu[target] = source.source(action, _.get(state, target));
      } else if (_.has(source, 'default') && !_.has(action, source.source)) {
        accu[target] = source.default;
      } else {
        accu[target] = _.get(action, source.source);
      }
    } else {
      accu[target] = _.get(action, source);
    }
    return accu;
  }, {});
};

var getInitialStateAssignments = function getInitialStateAssignments(actionDefinition) {
  var result = _.isFunction(actionDefinition.result) ? actionDefinition.result({}) : actionDefinition.result;
  return _.reduce(result, function (accu, source, target) {
    if (_.isPlainObject(source) && _.has(source, 'initial')) {
      accu[target] = source.initial;
    } else {
      accu[target] = null;
    }
    return accu;
  }, {});
};

var createDefaultPlugin = function createDefaultPlugin(_ref, config) {
  var createActionType = _ref.createActionType;
  return {
    name: 'redux-breeze-plugin-default',

    /**
     * Object of functions that gets `actionDefinition` and `actionName` as arguments and return action creator
     */
    actionAdapter: {
      default: function _default(actionDefinition, actionName) {
        return function (params) {
          return {
            type: createActionType(actionName),
            payload: params
          };
        };
      }
    },

    /**
     * Object of functions that gets `actionDefinition`, `actionName`, and `initialState` and returns a reducer
     */
    reducerAdapter: {
      default: function _default(actionDefinition, actionName, initialState) {
        return function () {
          var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
          var action = arguments[1];

          if (action.type === createActionType(actionName)) {
            return set(state, getResultsAssignments(actionDefinition, actionName, action, state));
          }
          return state;
        };
      }
    },

    /**
     * Object of functions that gets `actionDefinition` and `actionName` as arguments and return assignment object (with keys = paths, values = values to be saved in those paths)
     */
    initialStateAdapter: {
      default: function _default(actionDefinition, actionName) {
        return getInitialStateAssignments(actionDefinition, actionName);
      }
    }
  };
};

var defaultConfig = {
  useDefaultPlugin: true,
  strict: true,
  /**
   *
   * @param {string} actionType action type name (like 'default' in default plugin)
   * @param {string} pluginName name of the plugin
   * @param {string} adapterType type of adapter: 'actionAdapter', 'reducerAdapter', 'initialStateAdapter'
   * @return {string} changed actionType
   */
  mapActionTypes: function mapActionTypes(actionType, pluginName, adapterType) {
    return actionType;
  }
};

// still exported for backwards compatibility and testing purposes
var tools = {
  createActionType: createActionType,
  chainReducers: chainReducers,
  connect: connect$1,
  mergePlugins: mergePlugins,
  checkConflicts: checkConflicts
};

var createReduxBreezeInstance = function createReduxBreezeInstance(actionDefinitions) {
  for (var _len = arguments.length, plugins = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    plugins[_key - 2] = arguments[_key];
  }

  var userConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultConfig;

  var config = _extends({}, defaultConfig, userConfig);

  // merging plugins
  var pluginsToMerge = config.useDefaultPlugin ? [createDefaultPlugin(tools)].concat(toConsumableArray(plugins.map(function (plugin) {
    return plugin(tools, config);
  }))) : plugins.map(function (plugin) {
    return plugin(tools, config);
  });

  var plugin = mergePlugins(pluginsToMerge, {
    strict: config.strict,
    mapActionTypes: config.mapActionTypes
  });

  /**
   * Function to generate initialState (and immutably deeply merge it with custom initialState) from actions definitions
   * @param {object} actions object of action definitions
   * @param {object} initialState optional custom initial state
   * @return {object} created initial state (merged with provided initialState)
   */
  var createInitialState = function createInitialState(actions) {
    var initialState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return _.reduce(actions, function (actionsState, actionDefinition, actionName) {
      if (plugin.initialStateAdapter[actionDefinition.type]) {
        return set(actionsState, plugin.initialStateAdapter[actionDefinition.type](actionDefinition, actionName));
      }
      return actionsState;
    }, initialState);
  };

  return {
    combineReducers: function combineReducers$$1() {
      var customReducers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var reducers = _.reduce(actionDefinitions, function (reducers, actions, reducerName) {
        // getting final initial state for this combined/chained reducer (triggering custom reducers to get their initial state)
        var initialState = createInitialState(actions, reducers[reducerName] ? reducers[reducerName](undefined, {}) : {} // eslint-disable-line  no-undefined
        );

        // creating array of reducers tha are going to be chained on the `reducerName` field
        var reducersToChain = _.map(actions, function (actionDefinition, actionName) {
          if (plugin.reducerAdapter[actionDefinition.type]) {
            return plugin.reducerAdapter[actionDefinition.type](actionDefinition, actionName, initialState);
          }
          throw new Error('Unknown type \'' + actionDefinition.type + '\' of action \'' + actionName + '\'. It\'s most likely because you did not install plugin to handle reducer for this type of actions');
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
    getAction: function getAction(actionName, config) {
      var actionGroup = _.find(actionDefinitions, function (actionsList) {
        return _.has(actionsList, actionName);
      });
      if (!actionGroup) {
        throw new Error(actionName + ' action has not been found');
      }
      if (!plugin.actionAdapter[actionGroup[actionName].type]) {
        throw new Error('Unknown type \'' + actionGroup[actionName].type + '\' of \'' + actionName + '\' action. It\'s most likely because you did not install plugin to handle action creation for this type of actions');
      }
      return plugin.actionAdapter[actionGroup[actionName].type](actionGroup[actionName], actionName, config);
    },
    getActionDefinitions: function getActionDefinitions() {
      return actionDefinitions;
    },
    getMergedPlugin: function getMergedPlugin() {
      return plugin;
    }
  };
};

export { createActionType, chainReducers, connect$1 as connect, mergePlugins, checkConflicts, createDefaultPlugin as defaultPlugin, tools };
export default createReduxBreezeInstance;
//# sourceMappingURL=reduxBreeze.mjs.map
