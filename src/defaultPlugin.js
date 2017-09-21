import _ from 'lodash';

class hasNotBeenDefined {};

const calculateValue = (sourcePath, targetPath, source, target, value = new hasNotBeenDefined()) => {
  if (value instanceof hasNotBeenDefined) {
    sourcePath = _.isFunction(sourcePath) ? sourcePath(source) : sourcePath;
    return _.get(source, sourcePath);
  }
  if (_.isFunction(value)) {
    targetPath = _.isFunction(targetPath) ? targetPath(source) : targetPath;
    return value(source, _.get(target, targetPath));
  }
  return value;
};

const createAssignment = (sourcePath, targetPath, source, target, value) => ({
  targetPath: _.isFunction(targetPath) ? targetPath(source) : targetPath,
  value: calculateValue(sourcePath, targetPath, source, target, value),
});

const assignmentCreator = (assignmentList, source, target) => {
  _.reduce(assignmentList, (accu, assignmentElement) => {
    const assignment = createAssignment(
      assignmentElement.sourcePath,
      assignmentElement.targetPath,
      source,
      target,
      assignmentElement.value
    );
    accu[assignment.targetPath] = assignment.value;
    return accu;
  }, {});
};


// helper functions

/**
 * Creates initial values assignments for actions
 * @param {object} actionDefinition definition of the action
 * @param {string} actionName name of the action
 * @return {object} assignments object
 */
export const getInitialAssignments = (actionDefinition, actionName) => {
  const initialAssignments = {};
  const result = _.isFunction(actionDefinition.result)
    ? actionDefinition.result({})
    : actionDefinition.result;

  // figuring out initial values from assignments (in result field)
  if (Array.isArray(result)) {
    result.forEach(definition => {
      // we add assignments only if target path is explicit or can be calculated with empty action
      if (_.isFunction(definition.targetPath) || definition.targetPath({})) {
        const initialValue = _.has(definition, 'initialValue') ? definition.initialValue : null;
        initialAssignments[definition.targetPath] = initialValue;
      }
    });
  } else {
    const initialValue = _.has(actionDefinition, 'initialValue') ? actionDefinition.initialValue : null;
    initialAssignments[result || actionName] = initialValue;
  }

  // setting additional initial values assignments
  if (actionDefinition.initialValues) {
    _.forEach(actionDefinition.initialValues, (value, path) => initialAssignments[path] = value);
  }

  return initialAssignments;
};

/**
 * Function to get the value to be saved when action is dispatched (used in generated reducers)
 * @param {string} target path in the state to save the value to
 * @param {any|function(action: object, currentValue: any)} value value to be save or function to calculate it
 * @param {string} source path in the action object to get the value from
 * @param {object} action redux action object
 * @param {object} state current state
 * @return {any} value to be saved
 */
export const getValue = (target, value, source, action, state) => {
  if (_.isFunction(value)) {
    return value(
      action,
      _.get(state, target)
    );
  } else if (value) {
    return value;
  }
  return _.get(action, source);
};

/**
 * Function to get results assignments (used in generated reducers)
 * @param {object} actionDefinition definition of the action
 * @param {string} actionName name of the action
 * @param {object} action redux action object
 * @param {object} state current state
 * @return {object} assignments object
 */
export const getResultsAssignments = (actionDefinition, actionName, action, state) => {
  const resultAssignments = {};
  const result = _.isFunction(actionDefinition.result)
    ? actionDefinition.result(action)
    : actionDefinition.result;

  if (Array.isArray(result)) {
    result.forEach(resultDefinition => {
      const targetPath = _.isFunction(resultDefinition.targetPath)
        ? resultDefinition.targetPath(action)
        : resultDefinition.targetPath;
      const sourcePath = _.isFunction(resultDefinition.sourcePath)
        ? resultDefinition.sourcePath(action)
        : resultDefinition.sourcePath;

      resultAssignments[targetPath] = getValue(
        targetPath,
        resultDefinition.value,
        sourcePath,
        action,
        state
      );
    });
  } else {
    const sourcePath = _.isFunction(actionDefinition.sourcePath)
      ? actionDefinition.sourcePath(action)
      : actionDefinition.sourcePath;

    resultAssignments[result || actionName] = getValue(
      result || actionName,
      actionDefinition.value,
      sourcePath || 'result',
      action,
      state
    );
  }
  return resultAssignments;
};


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
          return immutableSet(state, getResultsAssignments(actionDefinition, actionName, action, state));
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
      return getInitialAssignments(actionDefinition, actionName);
    },
  },
});

export default createDefaultPlugin;
