import _ from 'lodash';

const calculateValue = (sourcePath, targetPath, source, target, value) => {
  if (value === undefined) {
    sourcePath = _.isFunction(sourcePath) ? sourcePath(source) : sourcePath;
    return _.get(source, sourcePath);
  }
  if (_.isFunction(value)) {
    targetPath = _.isFunction(targetPath) ? targetPath(source) : targetPath;
    return value(source, _.get(target, targetPath));
  }
  return value;
};

const createAssignment = (sourcePath, targetPath, source = {}, target = {}, value) => {
  targetPath = _.isFunction(targetPath) ? targetPath(source) : targetPath;
  if (!targetPath) {
    return null;
  }
  return {
    targetPath,
    value: calculateValue(sourcePath, targetPath, source, target, value),
  };
};

const assignmentCreator = (assignmentList, source = {}, target = {}) => {
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

const getResultsAssignments = (actionDefinition, actionName, action, state, defaultSource = 'payload') => {
  const result = _.isFunction(actionDefinition.result) ? actionDefinition.result(action) : actionDefinition.result;
  if (Array.isArray(result)) {
    return assignmentCreator(result, action, state);
  }
  return assignmentCreator(
    [{
      sourcePath: actionDefinition.sourcePath || defaultSource,
      targetPath: actionDefinition.targetPath || actionName,
      value: actionDefinition.value,
    }],
    action,
    state
  );
};

const getInitialStateAssignments = (actionDefinition, actionName) => {
  const result = _.isFunction(actionDefinition.result) ? actionDefinition.result({}) : actionDefinition.result;
  if (Array.isArray(result)) {
    return assignmentCreator(result);
  }
  return assignmentCreator(
    [{
      targetPath: actionDefinition.targetPath || actionName,
      value: actionDefinition.initialValue || null,
    }]
  );
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
