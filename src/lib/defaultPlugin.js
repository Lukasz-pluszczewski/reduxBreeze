import _ from 'lodash';
import { set } from 'perfect-immutable';

const getResultsAssignments = (actionDefinition, actionName, action = {}, state = {}) => {
  const result = _.isFunction(actionDefinition.result) ? actionDefinition.result(action) : actionDefinition.result;
  return _.reduce(result, (accu, source, target) => {
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

const getInitialStateAssignments = actionDefinition => {
  const result = _.isFunction(actionDefinition.result) ? actionDefinition.result({}) : actionDefinition.result;
  return _.reduce(result, (accu, source, target) => {
    if (_.isPlainObject(source) && _.has(source, 'initial')) {
      accu[target] = source.initial;
    } else {
      accu[target] = null;
    }
    return accu;
  }, {});
};


const createDefaultPlugin = ({ createActionType }, config) => ({
  name: 'redux-breeze-plugin-default',

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
          return set(state, getResultsAssignments(actionDefinition, actionName, action, state));
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
      return getInitialStateAssignments(actionDefinition, actionName);
    },
  },
});

export default createDefaultPlugin;
