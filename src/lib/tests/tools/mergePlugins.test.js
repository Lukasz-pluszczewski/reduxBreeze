import { mergePlugins } from '../../index';

describe('mergePlugins', () => {
  it('should merge plugins without conflicts', () => {
    const plugin1 = {
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
    const plugin2 = {
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
    const mergedPlugins = mergePlugins([plugin1, plugin2]);

    expect(mergedPlugins).toMatchObject({
      actionAdapter: {
        test1: plugin1.actionAdapter.test1,
        test2: plugin2.actionAdapter.test2,
        test3: plugin2.actionAdapter.test3,
      },
      reducerAdapter: {
        test1: plugin1.reducerAdapter.test1,
        test2: plugin2.reducerAdapter.test2,
        test3: plugin2.reducerAdapter.test3,
      },
      initialStateAdapter: {
        test1: plugin1.initialStateAdapter.test1,
        test2: plugin2.initialStateAdapter.test2,
        test3: plugin2.initialStateAdapter.test3,
      },
    });
  });
  it('should throw an error when there are conflicts', () => {
    const plugin1 = {
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
    const plugin2 = {
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
    expect(() => mergePlugins([plugin1, plugin2])).toThrowError(Error);
  });
  it('should not throw an error when there are conflicts but strict mode is turned off', () => {
    const plugin1 = {
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
    const plugin2 = {
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
    expect(() => mergePlugins([plugin1, plugin2], { strict: false })).not.toThrow(Error);
  });
  it('should map actionNames', () => {
    const plugin1 = {
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
    const plugin2 = {
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
    const mapActionTypes = jest.fn((actionType, pluginName, adapterType) => pluginName + actionType);
    let mergedPlugins = {};

    expect(() => mergedPlugins = mergePlugins([plugin1, plugin2], { mapActionTypes })).not.toThrow(Error);

    expect(mapActionTypes).toHaveBeenCalledTimes(12);
    expect(mapActionTypes).toHaveBeenCalledWith('test1', 'plugin1', 'actionAdapter');
    expect(mapActionTypes).toHaveBeenCalledWith('test1', 'plugin2', 'actionAdapter');
    expect(mapActionTypes).toHaveBeenCalledWith('test1', 'plugin1', 'reducerAdapter');
    expect(mapActionTypes).toHaveBeenCalledWith('test1', 'plugin2', 'reducerAdapter');
    expect(mapActionTypes).toHaveBeenCalledWith('test1', 'plugin1', 'initialStateAdapter');
    expect(mapActionTypes).toHaveBeenCalledWith('test1', 'plugin2', 'initialStateAdapter');

    expect(mergedPlugins).toMatchObject({
      actionAdapter: {
        plugin1test1: plugin1.actionAdapter.test1,
        plugin2test1: plugin2.actionAdapter.test1,
      },
      reducerAdapter: {
        plugin1test1: plugin1.reducerAdapter.test1,
        plugin2test1: plugin2.reducerAdapter.test1,
      },
      initialStateAdapter: {
        plugin1test1: plugin1.initialStateAdapter.test1,
        plugin2test1: plugin2.initialStateAdapter.test1,
      },
    });
  });
});
