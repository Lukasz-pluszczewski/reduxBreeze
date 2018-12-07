import createReduxBreezeInstance, { tools } from '../index';

const testPlugin = ({ createActionType }) => ({
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

const defaultPluginDefinitions = {
  simple: {
    type: 'default',
    resultName: 'exampleList', // needed if result is a string, it's a name of the filed in a state where we will save the value
    defaultValue: [], // value to be set when you will not provide any
  },
  someOtherAction: {
    type: 'default',
    result: [
      { sourcePath: 'payload.payloadField', targetPath: 'someObjectInState.someSubObject.myField', defaultValue: ['myStrangeDefaultValue'], initialValue: [] },
      { sourcePath: 'payload.otherPayloadField', targetPath: 'field', result: 'list' }, // result below works exactly like above: sets default value to empty array
    ],
  },
};


describe('reduxBreeze', () => {
  const nativeConsoleWarn = console.warn;
  beforeAll(() => {
    console.warn = () => {};
  });
  afterAll(() => {
    console.warn = nativeConsoleWarn;
  });

  describe('createInstance', () => {
    it('should mergePlugins', () => {
      const plugin1Value = {
        name: 'plugin1',
        actionAdapter: {
          test1: jest.fn(),
        },
        reducerAdapter: {
          test1: jest.fn(),
        },
        initialStateAdapter: {
          test1: jest.fn(),
        },
      };
      const plugin2Value = {
        name: 'plugin2',
        actionAdapter: {
          test2: jest.fn(),
          test3: jest.fn(),
        },
        reducerAdapter: {
          test2: jest.fn(),
          test3: jest.fn(),
        },
        initialStateAdapter: {
          test2: jest.fn(),
          test3: jest.fn(),
        },
      };
      const plugin1 = jest.fn(() => plugin1Value);
      const plugin2 = jest.fn(() => plugin2Value);

      const reduxBreezeInstance = createReduxBreezeInstance({}, { useDefaultPlugin: false }, plugin1, plugin2);

      expect(plugin1.mock.calls[0][0]).toMatchObject(tools);
      expect(plugin2.mock.calls[0][0]).toMatchObject(tools);
      expect(reduxBreezeInstance.getMergedPlugin()).toMatchObject({
        actionAdapter: {
          test1: plugin1Value.actionAdapter.test1,
          test2: plugin2Value.actionAdapter.test2,
          test3: plugin2Value.actionAdapter.test3,
        },
        reducerAdapter: {
          test1: plugin1Value.reducerAdapter.test1,
          test2: plugin2Value.reducerAdapter.test2,
          test3: plugin2Value.reducerAdapter.test3,
        },
        initialStateAdapter: {
          test1: plugin1Value.initialStateAdapter.test1,
          test2: plugin2Value.initialStateAdapter.test2,
          test3: plugin2Value.initialStateAdapter.test3,
        },
      });
    });
    it('should throw an error when plugins handle same types', () => {
      const plugin1 = () => ({
        name: 'plugin1',
        actionAdapter: {
          test1: jest.fn(),
        },
        reducerAdapter: {
          test1: jest.fn(),
        },
        initialStateAdapter: {
          test1: jest.fn(),
        },
      });
      const plugin2 = () => ({
        name: 'plugin2',
        actionAdapter: {
          test1: jest.fn(),
        },
        reducerAdapter: {
          test1: jest.fn(),
        },
        initialStateAdapter: {
          test1: jest.fn(),
        },
      });
      expect(() => createReduxBreezeInstance({}, { useDefaultPlugin: false }, plugin1, plugin2)).toThrowError(Error);
    });
    it('should not throw error when plugins handle same types and we set strict to false', () => {
      const plugin1 = () => ({
        name: 'plugin1',
        actionAdapter: {
          test1: jest.fn(),
        },
        reducerAdapter: {
          test1: jest.fn(),
        },
        initialStateAdapter: {
          test1: jest.fn(),
        },
      });
      const plugin2 = () => ({
        name: 'plugin2',
        actionAdapter: {
          test1: jest.fn(),
        },
        reducerAdapter: {
          test1: jest.fn(),
        },
        initialStateAdapter: {
          test1: jest.fn(),
        },
      });
      expect(() => createReduxBreezeInstance({}, { strict: false, useDefaultPlugin: false }, plugin1, plugin2)).not.toThrow(Error);
    });
    it('should map adapter names', () => {
      const plugin1Value = {
        name: 'plugin1',
        actionAdapter: {
          test1: jest.fn(),
        },
        reducerAdapter: {
          test1: jest.fn(),
        },
        initialStateAdapter: {
          test1: jest.fn(),
        },
      };
      const plugin2Value = {
        name: 'plugin2',
        actionAdapter: {
          test1: jest.fn(),
        },
        reducerAdapter: {
          test1: jest.fn(),
        },
        initialStateAdapter: {
          test1: jest.fn(),
        },
      };
      const plugin1 = () => plugin1Value;
      const plugin2 = () => plugin2Value;

      const mapActionTypes = (actionType, pluginName, adapterType) => pluginName === 'plugin2' ? `plugin2${actionType}` : actionType;

      const reduxBreezeInstance = createReduxBreezeInstance({}, { useDefaultPlugin: false, mapActionTypes }, plugin1, plugin2);
      expect(reduxBreezeInstance.getMergedPlugin()).toMatchObject({
        actionAdapter: {
          test1: plugin1Value.actionAdapter.test1,
          plugin2test1: plugin2Value.actionAdapter.test1,
        },
        reducerAdapter: {
          test1: plugin1Value.reducerAdapter.test1,
          plugin2test1: plugin2Value.reducerAdapter.test1,
        },
        initialStateAdapter: {
          test1: plugin1Value.initialStateAdapter.test1,
          plugin2test1: plugin2Value.initialStateAdapter.test1,
        },
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

      // Did not generate initial state correctly
      expect(rootReducer(undefined, {})).toEqual(expectedInitialState);
      expect(rootReducer(expectedInitialState, { type: 'SOMETHING' })).toEqual({
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

      // Did not generate initial state correctly
      expect(rootReducer(undefined, {})).toEqual(expectedInitialState);
      expect(rootReducer(expectedInitialState, { type: 'SOMETHING' })).toEqual({
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
      expect(() => reduxBreezeInstance.combineReducers()).toThrowError(Error);
      expect(() => reduxBreezeInstance.getAction('unhandledAction')).toThrowError(Error);
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
      expect(reduxBreezeInstance.getAction('someAction')('exampleParam')).toEqual({
        params: 'exampleParam',
        somethingMore: 'someMoreValue',
      });
    });
  });
});
