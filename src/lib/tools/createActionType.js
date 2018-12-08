import snakeCase from 'lodash/snakeCase';

/**
 *
 * @param {string} actionName camelCase name of the action (e.g. someAction)
 * @param {string} suffix string that is going to be added at the end of the created action type
 * @param {string} prefix string that is going to be added at the beginning of the created action type
 * @return {string} upperSnakeCase action type (e.g. SOME_ACTION or with example suffix SOME_ACTION_SUFFIX)
 */
const createActionType = (actionName, suffix = '', prefix = '') => {
  const upperSnakeCase = snakeCase(actionName).toUpperCase();
  return `${prefix ? `${prefix.toUpperCase()}_` : ''}${upperSnakeCase}${suffix ? `_${suffix.toUpperCase()}` : ''}`;
};

export default createActionType;
