import filter from 'lodash/filter';
import isNil from 'lodash/isNil';
import isFunction from 'lodash/isFunction';

/**
 * Helper for redux to attach reducers to one field instead of composing them into separate fields
 * @param {array} rawReducers array of unchained, not combined reducers
 * @return {function} reducer
 */
const chainReducers = rawReducers => (state, action) => {
  const reducers = filter(rawReducers, reducer => {
    if (isNil(reducer)) {
      return false;
    }
    if (isFunction(reducer)) {
      return true;
    }
    throw new Error('reducers passed to chain reducers must be either a valida reducer (function) or nil (null or undefined)');
  });
  return reducers.reduce((accuState, reducer) => reducer(accuState, action), state);
};

export default chainReducers;
