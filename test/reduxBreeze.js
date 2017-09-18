import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import createReduxBreezeInstance, { tools } from '../src/index';

chai.use(chaiAsPromised);
chai.use(sinonChai);

const testPlugin = ({ createActionType, immutableSet }) => ({
  name: 'test',

  /**
   * Object of functions that gets `actionDefinition` and `actionName` as arguments and return action creator
   */
  actionAdapter: {
    test(definition, actionName) {
      return params => ({
        params,
        somethingMore: 'someMoreValue',
      });
    },
  },

  /**
   * Object of functions that gets `actionDefinition`, `actionName`, and `initialState` and returns a reducer
   */
  reducerAdapter: {
    test(actionDefinition, actionName, initialState) {
      return (state = initialState, action) => {
        if (action.type) {
          return {
            ...state,
            field: state.field + 1,
            [actionName]: action.type,
          };
        }
        return state;
      };
    },
  },

  /**
   * Object of functions that gets `actionDefinition` and `actionName` as arguments and return assignment object (with keys = paths, values = values to be saved in those paths)
   */
  initialStateAdapter: {
    test(definition, actionName) {
      return {
        field: 1,
        [actionName]: null,
      };
    },
  },
});


describe('reduxBreeze', () => {
  const nativeConsoleWarn = console.warn;
  before(() => {
    console.warn = () => {};
  });
  after(() => {
    console.warn = nativeConsoleWarn;
  });

  describe('createInstance', () => {
    it('should mergePlugins', () => {
      const plugin1Value = {
        name: 'plugin1',
        actionAdapter: {
          test1: sinon.spy(),
        },
        reducerAdapter: {
          test1: sinon.spy(),
        },
        initialStateAdapter: {
          test1: sinon.spy(),
        },
      };
      const plugin2Value = {
        name: 'plugin2',
        actionAdapter: {
          test2: sinon.spy(),
          test3: sinon.spy(),
        },
        reducerAdapter: {
          test2: sinon.spy(),
          test3: sinon.spy(),
        },
        initialStateAdapter: {
          test2: sinon.spy(),
          test3: sinon.spy(),
        },
      };
      const plugin1 = sinon.spy(() => plugin1Value);
      const plugin2 = sinon.spy(() => plugin2Value);

      const reduxBreezeInstance = createReduxBreezeInstance({}, { useDefaultPlugin: false }, plugin1, plugin2);

      expect(plugin1).to.have.been.calledWith(tools);
      expect(plugin2).to.have.been.calledWith(tools);
      expect(reduxBreezeInstance.getMergedPlugin()).to.nested.include({
        'actionAdapter.test1': plugin1Value.actionAdapter.test1,
        'actionAdapter.test2': plugin2Value.actionAdapter.test2,
        'actionAdapter.test3': plugin2Value.actionAdapter.test3,
        'reducerAdapter.test1': plugin1Value.reducerAdapter.test1,
        'reducerAdapter.test2': plugin2Value.reducerAdapter.test2,
        'reducerAdapter.test3': plugin2Value.reducerAdapter.test3,
        'initialStateAdapter.test1': plugin1Value.initialStateAdapter.test1,
        'initialStateAdapter.test2': plugin2Value.initialStateAdapter.test2,
        'initialStateAdapter.test3': plugin2Value.initialStateAdapter.test3,
      });
    });
    it('should throw an error when plugins handle same types', () => {
      const plugin1 = () => ({
        name: 'plugin1',
        actionAdapter: {
          test1: sinon.spy(),
        },
        reducerAdapter: {
          test1: sinon.spy(),
        },
        initialStateAdapter: {
          test1: sinon.spy(),
        },
      });
      const plugin2 = () => ({
        name: 'plugin2',
        actionAdapter: {
          test1: sinon.spy(),
        },
        reducerAdapter: {
          test1: sinon.spy(),
        },
        initialStateAdapter: {
          test1: sinon.spy(),
        },
      });
      expect(() => createReduxBreezeInstance({}, { useDefaultPlugin: false }, plugin1, plugin2)).to.throw(Error);
    });
    it('should not throw error when plugins handle same types and we set strict to false', () => {
      const plugin1 = () => ({
        name: 'plugin1',
        actionAdapter: {
          test1: sinon.spy(),
        },
        reducerAdapter: {
          test1: sinon.spy(),
        },
        initialStateAdapter: {
          test1: sinon.spy(),
        },
      });
      const plugin2 = () => ({
        name: 'plugin2',
        actionAdapter: {
          test1: sinon.spy(),
        },
        reducerAdapter: {
          test1: sinon.spy(),
        },
        initialStateAdapter: {
          test1: sinon.spy(),
        },
      });
      expect(() => createReduxBreezeInstance({}, { strict: false, useDefaultPlugin: false }, plugin1, plugin2)).to.not.throw(Error);
    });
    it('should map adapter names', () => {
      const plugin1Value = {
        name: 'plugin1',
        actionAdapter: {
          test1: sinon.spy(),
        },
        reducerAdapter: {
          test1: sinon.spy(),
        },
        initialStateAdapter: {
          test1: sinon.spy(),
        },
      };
      const plugin2Value = {
        name: 'plugin2',
        actionAdapter: {
          test1: sinon.spy(),
        },
        reducerAdapter: {
          test1: sinon.spy(),
        },
        initialStateAdapter: {
          test1: sinon.spy(),
        },
      };
      const plugin1 = () => plugin1Value;
      const plugin2 = () => plugin2Value;

      const mapActionTypes = (actionType, pluginName, adapterType) => pluginName === 'plugin2' ? `plugin2${actionType}` : actionType;

      const reduxBreezeInstance = createReduxBreezeInstance({}, { useDefaultPlugin: false, mapActionTypes }, plugin1, plugin2);
      expect(reduxBreezeInstance.getMergedPlugin()).to.nested.include({
        'actionAdapter.test1': plugin1Value.actionAdapter.test1,
        'actionAdapter.plugin2test1': plugin2Value.actionAdapter.test1,
        'reducerAdapter.test1': plugin1Value.reducerAdapter.test1,
        'reducerAdapter.plugin2test1': plugin2Value.reducerAdapter.test1,
        'initialStateAdapter.test1': plugin1Value.initialStateAdapter.test1,
        'initialStateAdapter.plugin2test1': plugin2Value.initialStateAdapter.test1,
      });
    });
  });
  describe('instance', () => {
    it('should generate reducer with combineReducer function with no arguments', () => {
      const actionDefinitions = {
        exampleReducer: {
          someAction: {
            type: 'test',
          },
        },
        exampleReducer2: {
          someOtherAction: {
            type: 'test',
          },
        },
      };
      const expectedInitialState = {
        exampleReducer: {
          someAction: null,
          field: 1,
        },
        exampleReducer2: {
          someOtherAction: null,
          field: 1,
        },
      };

      const reduxBreezeInstance = createReduxBreezeInstance(actionDefinitions, { useDefaultPlugin: false }, testPlugin);
      const rootReducer = reduxBreezeInstance.combineReducers();

      expect(rootReducer(undefined, {}), 'Did not generate initial state correctly').to.be.deep.equal(expectedInitialState);
      expect(rootReducer(expectedInitialState, { type: 'SOMETHING' })).to.be.deep.equal({
        exampleReducer: {
          someAction: 'SOMETHING',
          field: 2,
        },
        exampleReducer2: {
          someOtherAction: 'SOMETHING',
          field: 2,
        },
      });
    });
    it('should merge generated reducers with custom ones with combineReducer function with argument', () => {
      const actionDefinitions = {
        exampleReducer: {
          someAction: {
            type: 'test',
          },
        },
        exampleReducer2: {
          someOtherAction: {
            type: 'test',
          },
        },
      };
      const customInitialState = {
        customField: 1,
      };
      const expectedInitialState = {
        exampleReducer: {
          someAction: null,
          field: 1,
          ...customInitialState,
        },
        exampleReducer2: {
          someOtherAction: null,
          field: 1,
        },
      };

      const customReducer = (state = customInitialState, action) => {
        if (action.type === 'SOMETHING') {
          return {
            ...state,
            customField: state.customField + 1,
          };
        }
        return state;
      };

      const reduxBreezeInstance = createReduxBreezeInstance(actionDefinitions, { useDefaultPlugin: false }, testPlugin);
      const rootReducer = reduxBreezeInstance.combineReducers({
        exampleReducer: customReducer,
      });

      expect(rootReducer(undefined, {}), 'Did not generate initial state correctly').to.be.deep.equal(expectedInitialState);
      expect(rootReducer(expectedInitialState, { type: 'SOMETHING' })).to.be.deep.equal({
        exampleReducer: {
          someAction: 'SOMETHING',
          field: 2,
          customField: 2,
        },
        exampleReducer2: {
          someOtherAction: 'SOMETHING',
          field: 2,
        },
      });
    });
    it('should throw an error when provided with action that cannot be handled by applied plugins', () => {
      const actionDefinitions = {
        exampleReducer: {
          someAction: {
            type: 'test',
          },
        },
        exampleReducer2: {
          unhandledAction: {
            type: 'unhandled',
          },
        },
      };

      const reduxBreezeInstance = createReduxBreezeInstance(actionDefinitions, { useDefaultPlugin: false }, testPlugin);
      expect(() => reduxBreezeInstance.combineReducers()).to.throw(Error);
      expect(() => reduxBreezeInstance.getAction('unhandledAction')).to.throw(Error);
    });
    it('should generate action creator', () => {
      const actionDefinitions = {
        exampleReducer: {
          someAction: {
            type: 'test',
          },
        },
      };

      const reduxBreezeInstance = createReduxBreezeInstance(actionDefinitions, { useDefaultPlugin: false }, testPlugin);
      expect(reduxBreezeInstance.getAction('someAction')('exampleParam')).to.be.deep.equal({
        params: 'exampleParam',
        somethingMore: 'someMoreValue',
      });
    });
  });

  describe('tools', () => {
    describe('checkConflicts', () => {
      it('should return empty string when no conflicts were found', () => {
        const testResult = tools.checkConflicts(
          [
            { name: 'plugin1', actionAdapter: { test1() {} } },
            { name: 'plugin2', actionAdapter: { test2() {} } },
          ],
          'actionAdapter'
        );

        expect(testResult).to.be.equal('');
      });
      it('should return non empty string when conflicts were found', () => {
        const testResult = tools.checkConflicts(
          [
            { name: 'plugin1', actionAdapter: { test1() {} } },
            { name: 'plugin2', actionAdapter: { test1() {} } },
          ],
          'actionAdapter'
        );

        expect(testResult).to.be.a('string');
        expect(testResult).to.not.be.equal('');
      });
      it('should use provided mpaActionTypes function to map actionTypes', () => {
        const mapActionTypes = sinon.spy((actionType, pluginName, adapterName) => pluginName);
        const testResult = tools.checkConflicts(
          [
            { name: 'test1', actionAdapter: { test1() {} } },
            { name: 'test2', actionAdapter: { test1() {} } },
          ],
          'actionAdapter',
          mapActionTypes
        );

        expect(mapActionTypes).to.have.been.calledTwice;
        expect(mapActionTypes).to.have.been.calledWith('test1', 'test1', 'actionAdapter');
        expect(mapActionTypes).to.have.been.calledWith('test1', 'test2', 'actionAdapter');
        expect(testResult).to.be.equal('');
      });
    });
    describe('mergePlugins', () => {
      it('should merge plugins without conflicts', () => {
        const plugin1 = {
          name: 'plugin1',
          actionAdapter: {
            test1: sinon.spy(),
          },
          reducerAdapter: {
            test1: sinon.spy(),
          },
          initialStateAdapter: {
            test1: sinon.spy(),
          },
        };
        const plugin2 = {
          name: 'plugin2',
          actionAdapter: {
            test2: sinon.spy(),
            test3: sinon.spy(),
          },
          reducerAdapter: {
            test2: sinon.spy(),
            test3: sinon.spy(),
          },
          initialStateAdapter: {
            test2: sinon.spy(),
            test3: sinon.spy(),
          },
        };
        const mergedPlugins = tools.mergePlugins([plugin1, plugin2]);

        expect(mergedPlugins).to.nested.include({
          'actionAdapter.test1': plugin1.actionAdapter.test1,
          'actionAdapter.test2': plugin2.actionAdapter.test2,
          'actionAdapter.test3': plugin2.actionAdapter.test3,
          'reducerAdapter.test1': plugin1.reducerAdapter.test1,
          'reducerAdapter.test2': plugin2.reducerAdapter.test2,
          'reducerAdapter.test3': plugin2.reducerAdapter.test3,
          'initialStateAdapter.test1': plugin1.initialStateAdapter.test1,
          'initialStateAdapter.test2': plugin2.initialStateAdapter.test2,
          'initialStateAdapter.test3': plugin2.initialStateAdapter.test3,
        });
      });
      it('should throw an error when there are conflicts', () => {
        const plugin1 = {
          name: 'plugin1',
          actionAdapter: {
            test1: sinon.spy(),
          },
          reducerAdapter: {
            test1: sinon.spy(),
          },
          initialStateAdapter: {
            test1: sinon.spy(),
          },
        };
        const plugin2 = {
          name: 'plugin2',
          actionAdapter: {
            test1: sinon.spy(),
          },
          reducerAdapter: {
            test1: sinon.spy(),
          },
          initialStateAdapter: {
            test1: sinon.spy(),
          },
        };
        expect(() => tools.mergePlugins([plugin1, plugin2])).to.throw(Error);
      });
      it('should not throw an error when there are conflicts but strict mode is turned off', () => {
        const plugin1 = {
          name: 'plugin1',
          actionAdapter: {
            test1: sinon.spy(),
          },
          reducerAdapter: {
            test1: sinon.spy(),
          },
          initialStateAdapter: {
            test1: sinon.spy(),
          },
        };
        const plugin2 = {
          name: 'plugin2',
          actionAdapter: {
            test1: sinon.spy(),
          },
          reducerAdapter: {
            test1: sinon.spy(),
          },
          initialStateAdapter: {
            test1: sinon.spy(),
          },
        };
        expect(() => tools.mergePlugins([plugin1, plugin2], { strict: false })).to.not.throw(Error);
      });
      it('should map actionNames', () => {
        const plugin1 = {
          name: 'plugin1',
          actionAdapter: {
            test1: sinon.spy(),
          },
          reducerAdapter: {
            test1: sinon.spy(),
          },
          initialStateAdapter: {
            test1: sinon.spy(),
          },
        };
        const plugin2 = {
          name: 'plugin2',
          actionAdapter: {
            test1: sinon.spy(),
          },
          reducerAdapter: {
            test1: sinon.spy(),
          },
          initialStateAdapter: {
            test1: sinon.spy(),
          },
        };
        const mapActionTypes = sinon.spy((actionType, pluginName, adapterType) => pluginName + actionType);
        let mergedPlugins = {};

        expect(() => mergedPlugins = tools.mergePlugins([plugin1, plugin2], { mapActionTypes })).to.not.throw(Error);

        expect(mapActionTypes).to.have.been.callCount(12);
        expect(mapActionTypes).to.have.been.calledWith('test1', 'plugin1', 'actionAdapter');
        expect(mapActionTypes).to.have.been.calledWith('test1', 'plugin2', 'actionAdapter');
        expect(mapActionTypes).to.have.been.calledWith('test1', 'plugin1', 'reducerAdapter');
        expect(mapActionTypes).to.have.been.calledWith('test1', 'plugin2', 'reducerAdapter');
        expect(mapActionTypes).to.have.been.calledWith('test1', 'plugin1', 'initialStateAdapter');
        expect(mapActionTypes).to.have.been.calledWith('test1', 'plugin2', 'initialStateAdapter');

        expect(mergedPlugins).to.nested.include({
          'actionAdapter.plugin1test1': plugin1.actionAdapter.test1,
          'actionAdapter.plugin2test1': plugin2.actionAdapter.test1,
          'reducerAdapter.plugin1test1': plugin1.reducerAdapter.test1,
          'reducerAdapter.plugin2test1': plugin2.reducerAdapter.test1,
          'initialStateAdapter.plugin1test1': plugin1.initialStateAdapter.test1,
          'initialStateAdapter.plugin2test1': plugin2.initialStateAdapter.test1,
        });
      });
    });
  });
});
