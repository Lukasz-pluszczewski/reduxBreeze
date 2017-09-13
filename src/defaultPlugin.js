import _ from 'lodash';

class hasNotBeenDefined{};

const createDefaultPlugin = ({ createActionType, immutableSet }) => ({
  /**
   * Object of functions that gets `actionDefinition` and `actionName` as arguments and return action creator
   */
  actionAdapter: {
    default(definition, actionName, config) {
      return (params) => {
        return {
          type: createActionType(actionName),
          payload: params,
        }
      };
    },
  },

  /**
   * Object of functions that gets `actionDefinition`, `actionName`, and `initialState` and returns a reducer
   */
  reducerAdapter: {
    default(actionDefinition, actionName, initialState) {
      return (state = initialState, action) => {
        switch (action.type) {
          case createActionType(actionName):
            let resultsAssignements = {};
            if (Array.isArray(actionDefinition.result)) {
              resultsAssignements = actionDefinition.result.reduce(
                (accu, { sourcePath, targetPath, defaultValue = new hasNotBeenDefined() }) => {
                  if (!(defaultValue instanceof hasNotBeenDefined) && _.isUndefined(_.get(action, sourcePath))) {
                    accu[targetPath] = defaultValue;
                  }
                  accu[targetPath] = _.get(action, sourcePath);
                  return accu;
                },
                {}
              );
            } else {
              resultsAssignements = {
                [actionDefinition.resultName]: action.payload,
              };
            }
            return immutableSet(state, resultsAssignements);
          default:
            return state;
        }
      };
    },
  },

  /**
   * Object of functions that gets `actionDefinition` and `actionName` as arguments and return assignment object (with keys = paths, values = values to be saved in those paths)
   */
  initialStateAdapter: {
    default (definition, actionName) {
      let resultsAssignements = null;
      let defaultValue;
      if (_.has(definition, 'initialValue')) {
        defaultValue = definition.initialValue;
      } else if (definition.result === 'list') {
        defaultValue = [];
      } else if (definition.result === 'entity') {
        defaultValue = null;
      }

      if (Array.isArray(definition.result)) {
        resultsAssignements = definition.result.reduce((accu, { targetPath, result, initialValue = new hasNotBeenDefined }) => {
          if (initialValue instanceof hasNotBeenDefined) {
            accu[targetPath] = result === 'list' ? [] : null;
          } else {
            accu[targetPath] = initialValue;
          }
          return accu;
        }, {});
      } else {
        resultsAssignements = { [definition.resultName]: defaultValue };
      }
      return resultsAssignements;
    },
  },

  /**
   * Function that gets getActionDefinitions function and return the object of selector functions NOTIMPLEMENTED
   * @param {function(array)} getActionDefinitions function that gets array of supported types as argument and returns (still nested in reducerNames) matching definitions
   */
  selectorsAdapter(getActionDefinitions) {
    const actionDefinitions = getActionDefinitions(['default']);

  },

  /**
   * Function that gets getActionDefinitions function and return the object of additional reduxBreeze methods NOTIMPLEMENTED
   * @param {function(array)} getActionDefinitions function that gets array of supported types as argument and returns (still nested in reducerNames) matching definitions
   * @returns {object} object of additional reduxBreeze methods
   */
  additionalMethods(getActionDefinitions) {
    return {
      sayHello() {
        console.log('hello');
      }
    };
  }
});

export default createDefaultPlugin;
