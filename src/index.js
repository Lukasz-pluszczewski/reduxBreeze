import chainReducers from './tools/chainReducers';
import checkConflicts from './tools/checkConflicts';
import connect from './tools/connect';
import createActionType from './tools/createActionType';
import mergePlugins from './tools/mergePlugins';

import defaultPlugin from './defaultPlugin';
import createReduxBreezeInstance from './reduxBreeze';

export {
  chainReducers,
  checkConflicts,
  connect,
  createActionType,
  mergePlugins,
  defaultPlugin,
};

// still exported for backwards compatibility and testing purposes
export const tools = {
  chainReducers,
  checkConflicts,
  connect,
  createActionType,
  mergePlugins,
};

export default createReduxBreezeInstance;
