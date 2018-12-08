import isPlainObject from 'lodash/isPlainObject';
import isFunction from 'lodash/isFunction';
import reduce from 'lodash/reduce';
import get from 'lodash/get';
import has from 'lodash/has';
import { set } from 'perfect-immutable';

const getResultsAssignments = (actionDefinition, actionName, action = {}, state = {}) => {
  const result = isFunction(actionDefinition.result) ? actionDefinition.result(action) : actionDefinition.result;
  return reduce(result, (accu, source, target) => {
    if (isFunction(source)) {
      accu[target] = source(action, get(state, target));
    } else if (isPlainObject(source)) {
      if (isFunction(source.source)) {
        accu[target] = source.source(action, get(state, target));
      } else if (has(source, 'default') && !has(action, source.source)) {
        accu[target] = source.default;
      } else {
        accu[target] = get(action, source.source);
      }
    } else {
      accu[target] = get(action, source);
    }
    return accu;
  }, {});
};

const getInitialStateAssignments = actionDefinition => {
  const result = isFunction(actionDefinition.result) ? actionDefinition.result({}) : actionDefinition.result;
  return reduce(result, (accu, source, target) => {
    if (isPlainObject(source) && has(source, 'initial')) {
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
