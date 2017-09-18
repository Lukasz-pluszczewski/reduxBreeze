import _ from 'lodash';

class hasNotBeenDefined {}

const createDefaultPlugin = ({ createActionType, immutableSet }, config) => ({
  /**
   * Object of functions that gets `actionDefinition` and `actionName` as arguments and return action creator
   */
  actionAdapter: {
    default(actionDefinition, actionName) {
      return params => ({
        type: createActionType(actionName),
        payload: params,
      });
    },
  },

  /**
   * Object of functions that gets `actionDefinition`, `actionName`, and `initialState` and returns a reducer
   */
  reducerAdapter: {
    default(actionDefinition, actionName, initialState) {
      return (state = initialState, action) => {
        if (action.type === createActionType(actionName)) {
          let resultsAssignments;

          // result is array of assignments
          if (Array.isArray(actionDefinition.result)) {
            resultsAssignments = actionDefinition.result.reduce(
              (
                accu,
                {
                  sourcePath,
                  targetPath,
                  defaultValue = new hasNotBeenDefined(),
                  value = new hasNotBeenDefined(),
                }
              ) => {
                // setting default value if one has not been provided and defaultValue is defined
                if (
                  !(defaultValue instanceof hasNotBeenDefined)
                  && _.isUndefined(_.get(action, sourcePath))
                  && value instanceof hasNotBeenDefined
                ) {
                  accu[targetPath] = _.isFunction(defaultValue) ? defaultValue(action) : defaultValue;

                // setting value based on sourcePath
                } else if (value instanceof hasNotBeenDefined) {
                  accu[targetPath] = _.get(action, _.isFunction(sourcePath) ? sourcePath(action) : sourcePath);

                // setting value calculated by a 'value' function
                } else if (_.isFunction(value)) {
                  accu[targetPath] = value(action, _.get(state, targetPath));

                // setting hardcoded value from 'value' field in the definition
                } else {
                  accu[targetPath] = value;
                }
                return accu;
              },
              {}
            );

          // result is a string ('list', 'entity') or is not provided
          } else {
            const resultName = actionDefinition.resultName || actionName;

            // setting default value if one has not been provided and defaultValue is defined
            if (
              _.has(actionDefinition, 'defaultValue')
              && _.isUndefined(action.payload)
              && _.has()
            ) {
              resultsAssignments = { [resultName]: actionDefinition.defaultValue };
            } else if (!_.has(actionDefinition, 'value')) {
              resultsAssignments = { [resultName]: action.payload };

            // setting value calculated by a 'value' function
            } else if (_.isFunction(actionDefinition.value)) {
              resultsAssignments = { [resultName]: actionDefinition.value(action, state[resultName]) };

            // setting hardcoded value from 'value' field in the definition
            } else {
              resultsAssignments = { [resultName]: actionDefinition.value };
            }
          }
          return immutableSet(state, resultsAssignments);
        }
        return state;
      };
    },
  },

  /**
   * Object of functions that gets `actionDefinition` and `actionName` as arguments and return assignment object (with keys = paths, values = values to be saved in those paths)
   */
  initialStateAdapter: {
    default(actionDefinition, actionName) {
      let resultsAssignements = null;
      let defaultValue;
      if (_.has(actionDefinition, 'initialValue')) {
        defaultValue = actionDefinition.initialValue;
      } else if (actionDefinition.result === 'list') {
        defaultValue = [];
      } else if (actionDefinition.result === 'entity') {
        defaultValue = null;
      }

      if (Array.isArray(actionDefinition.result)) {
        resultsAssignements = actionDefinition.result.reduce(
          (accu, { targetPath, result, initialValue = new hasNotBeenDefined() }) => {
            if (initialValue instanceof hasNotBeenDefined) {
              accu[targetPath] = result === 'list' ? [] : null;
            } else {
              accu[targetPath] = initialValue;
            }
            return accu;
          },
          {}
        );
      } else {
        resultsAssignements = { [actionDefinition.resultName]: defaultValue };
      }
      return resultsAssignements;
    },
  },
});

export default createDefaultPlugin;
