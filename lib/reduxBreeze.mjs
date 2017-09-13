import _ from 'lodash';
import { combineReducers } from 'redux';

var babelHelpers = {};
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





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





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};







var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

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
 * @param {array} reducers
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

  // TODO add checking for plugins having the same name
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
 * @returns {{actionAdapter, reducerAdapter, initialStateAdapter}} merged plugin object
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
    console.warn(errorMessage + ' Duplicated adapters will be overwritten!');
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
 * @returns {string} upperSnakeCase action type (e.g. SOME_ACTION or with example suffix SOME_ACTION_SUFFIX)
 */
var createActionType = function createActionType(actionName) {
  var suffix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var prefix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  var upperSnakeCase = _.snakeCase(actionName).toUpperCase();
  return '' + (prefix ? prefix.toUpperCase() + '_' : '') + upperSnakeCase + (suffix ? '_' + suffix.toUpperCase() : '');
};

/**
 * Works like lodash _.set() but does not mutate object (doesn't work with array style keys like `someArray[2].anotherField`)
 * @param {object} object source object
 * @param {string|{[string]: any}} path in object to set value in or object with paths as keys and values as values (if path is an object it ignores 'value')
 * @param {any} value to set in given path
 * @param {string} delimiter path delimiter; by default: '.'
 * @returns {object} new object with value(s) changed
 */
var immutableSet = function immutableSet(object, path) {
  var value = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var delimiter = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '.';

  // console.log('immutableSet', {object, path, value, delimiter});
  if (!path) {
    return value;
  }
  if (_.isPlainObject(path)) {
    if (_.isEmpty(path)) {
      return object;
    }
    return _.reduce(path, function (accu, value, path) {
      return immutableSet(accu, path, value, delimiter);
    }, object);
  }

  var pathSplit = path.split(delimiter);
  if (pathSplit.length === 1) {
    return _extends({}, object, defineProperty({}, path, value));
  }
  var childObject = {};
  if (_.has(object, pathSplit[0])) {
    childObject = object[pathSplit[0]];
    if (!_.isPlainObject(childObject)) {
      throw new Error('Part of \'path\' provided is defined in \'object\' and is not a plain JS object but ' + (typeof childObject === 'undefined' ? 'undefined' : _typeof(childObject)) + '. It\'s most likely an error. Check the path and object provided to immutableSet function');
    }
  }
  return _extends({}, object, defineProperty({}, pathSplit[0], immutableSet(childObject, _.tail(pathSplit).join(delimiter), value, delimiter)));
};

var hasNotBeenDefined = function hasNotBeenDefined() {
  classCallCheck(this, hasNotBeenDefined);
};



var createDefaultPlugin = function createDefaultPlugin(_ref) {
  var createActionType = _ref.createActionType,
      immutableSet = _ref.immutableSet;
  return {
    /**
     * Object of functions that gets `actionDefinition` and `actionName` as arguments and return action creator
     */
    actionAdapter: {
      default: function _default(definition, actionName, config) {
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

          switch (action.type) {
            case createActionType(actionName):
              var resultsAssignements = {};
              if (Array.isArray(actionDefinition.result)) {
                resultsAssignements = actionDefinition.result.reduce(function (accu, _ref2) {
                  var sourcePath = _ref2.sourcePath,
                      targetPath = _ref2.targetPath,
                      _ref2$defaultValue = _ref2.defaultValue,
                      defaultValue = _ref2$defaultValue === undefined ? new hasNotBeenDefined() : _ref2$defaultValue;

                  if (!(defaultValue instanceof hasNotBeenDefined) && _.isUndefined(_.get(action, sourcePath))) {
                    accu[targetPath] = defaultValue;
                  }
                  accu[targetPath] = _.get(action, sourcePath);
                  return accu;
                }, {});
              } else {
                resultsAssignements = defineProperty({}, actionDefinition.resultName, action.payload);
              }
              return immutableSet(state, resultsAssignements);
            default:
              return state;
          }
        };
      }
    },

    /**
     * Object of functions that gets `actionDefinition` and `actionName` as arguments and return assignment object (with keys = paths, values = values to be saved in those paths)
     */
    initialStateAdapter: {
      default: function _default(definition, actionName) {
        var resultsAssignements = null;
        var defaultValue = void 0;
        if (_.has(definition, 'initialValue')) {
          defaultValue = definition.initialValue;
        } else if (definition.result === 'list') {
          defaultValue = [];
        } else if (definition.result === 'entity') {
          defaultValue = null;
        }

        if (Array.isArray(definition.result)) {
          resultsAssignements = definition.result.reduce(function (accu, _ref3) {
            var targetPath = _ref3.targetPath,
                result = _ref3.result,
                _ref3$initialValue = _ref3.initialValue,
                initialValue = _ref3$initialValue === undefined ? new hasNotBeenDefined() : _ref3$initialValue;

            if (initialValue instanceof hasNotBeenDefined) {
              accu[targetPath] = result === 'list' ? [] : null;
            } else {
              accu[targetPath] = initialValue;
            }
            return accu;
          }, {});
        } else {
          resultsAssignements = defineProperty({}, definition.resultName, defaultValue);
        }
        return resultsAssignements;
      }
    },

    /**
     * Function that gets getActionDefinitions function and return the object of selector functions NOTIMPLEMENTED
     * @param {function(array)} getActionDefinitions function that gets array of supported types as argument and returns (still nested in reducerNames) matching definitions
     */
    selectorsAdapter: function selectorsAdapter(getActionDefinitions) {
      var actionDefinitions = getActionDefinitions(['default']);
    },


    /**
     * Function that gets getActionDefinitions function and return the object of additional reduxBreeze methods NOTIMPLEMENTED
     * @param {function(array)} getActionDefinitions function that gets array of supported types as argument and returns (still nested in reducerNames) matching definitions
     * @returns {object} object of additional reduxBreeze methods
     */
    additionalMethods: function additionalMethods(getActionDefinitions) {
      return {
        sayHello: function sayHello() {
          console.log('hello');
        }
      };
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
   * @returns {*}
   */
  mapActionTypes: function mapActionTypes(actionType, pluginName, adapterType) {
    return actionType;
  }
};

var tools = {
  immutableSet: immutableSet,
  createActionType: createActionType,
  chainReducers: chainReducers,
  mergePlugins: mergePlugins,
  checkConflicts: checkConflicts
};

var createReduxBreezeInstance = function createReduxBreezeInstance(actionDefinitions) {
  for (var _len = arguments.length, plugins = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    plugins[_key - 2] = arguments[_key];
  }

  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultConfig;

  // merging plugins deeply
  var pluginsToMerge = config.useDefaultPlugin ? [createDefaultPlugin(tools)].concat(toConsumableArray(plugins.map(function (plugin) {
    return plugin(tools);
  }))) : plugins.map(function (plugin) {
    return plugin(tools);
  });

  var plugin = mergePlugins(pluginsToMerge, {
    strict: config.strict,
    mapActionTypes: config.mapActionTypes
  });

  /**
   * Function to generate initialState (and immutably deeply merge it with custom initialState) from actions definitions
   * @param {object} actions object of action definitions
   * @param {object} initialState optional custom initial state
   */
  var createInitialState = function createInitialState(actions) {
    var initialState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return _.reduce(actions, function (actionsState, actionDefinition, actionName) {
      if (plugin.initialStateAdapter[actionDefinition.type]) {
        return immutableSet(actionsState, plugin.initialStateAdapter[actionDefinition.type](actionDefinition, actionName));
      }
      return actionsState;
    }, initialState);
  };

  return {
    combineReducers: function combineReducers$$1() {
      var customReducers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var reducers = _.reduce(actionDefinitions, function (reducers, actions, reducerName) {
        // getting final initial state for this combined/chained reducer (triggering custom reducers to get their initial state)
        var initialState = createInitialState(actions, reducers[reducerName] ? reducers[reducerName](undefined, {}) : {});

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

export { tools };
export default createReduxBreezeInstance;
//# sourceMappingURL=reduxBreeze.mjs.map
