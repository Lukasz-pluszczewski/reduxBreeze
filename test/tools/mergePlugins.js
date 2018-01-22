import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { mergePlugins } from '../../src/index';

chai.use(sinonChai);

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
    const mergedPlugins = mergePlugins([plugin1, plugin2]);

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
    expect(() => mergePlugins([plugin1, plugin2])).to.throw(Error);
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
    expect(() => mergePlugins([plugin1, plugin2], { strict: false })).to.not.throw(Error);
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

    expect(() => mergedPlugins = mergePlugins([plugin1, plugin2], { mapActionTypes })).to.not.throw(Error);

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
