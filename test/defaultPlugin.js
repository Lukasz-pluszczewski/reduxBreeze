import { expect } from 'chai';
import { set } from 'perfect-immutable';

import { defaultPlugin as createDefaultPlugin, tools } from '../src/index';

describe('defaultPlugin', () => {
  const actionDefinition = {
    type: 'default',
    result: {
      value: 'payload',
      valueAltered: (action, currentValue) => (currentValue || '') + action.payload,
      valueStrangeAltered: { source: (action, currentValue) => [...currentValue, action.payload], initial: [] },
      valueStrange: { source: 'payload' },
      valueDefault: { source: 'nonExistent', default: 'defaultValue' },
      valueInitial: { source: 'payload', initial: 'initialValue' },
    },
  };

  it('should create initialState for default action', () => {
    const defaultPlugin = createDefaultPlugin(tools, {});
    const initialStateAdapter = defaultPlugin.initialStateAdapter.default;

    const initialState = set({}, initialStateAdapter(actionDefinition, 'testAction'));

    expect(initialState).to.be.deep.equal({
      value: null,
      valueAltered: null,
      valueStrangeAltered: [],
      valueStrange: null,
      valueDefault: null,
      valueInitial: 'initialValue',
    });
  });

  it('should create reducer that returns initial state', () => {
    const defaultPlugin = createDefaultPlugin(tools, {});
    const initialStateAdapter = defaultPlugin.initialStateAdapter.default;
    const reducerAdapter = defaultPlugin.reducerAdapter.default;

    const initialState = set({}, initialStateAdapter(actionDefinition, 'testAction'));

    const reducerResult = reducerAdapter(actionDefinition, 'testAction', initialState)(undefined, {});

    expect(reducerResult).to.be.deep.equal({
      value: null,
      valueAltered: null,
      valueStrangeAltered: [],
      valueStrange: null,
      valueDefault: null,
      valueInitial: 'initialValue',
    });
  });

  it('should create action based on a definition', () => {
    const defaultPlugin = createDefaultPlugin(tools, {});
    const actionAdapter = defaultPlugin.actionAdapter.default;

    const action = actionAdapter(actionDefinition, 'testAction');

    expect(action('testPayload')).to.be.deep.equal({
      type: 'TEST_ACTION',
      payload: 'testPayload',
    });
  });

  it('should create reducer that handles created action', () => {
    const defaultPlugin = createDefaultPlugin(tools, {});

    const actionAdapter = defaultPlugin.actionAdapter.default;
    const initialStateAdapter = defaultPlugin.initialStateAdapter.default;
    const reducerAdapter = defaultPlugin.reducerAdapter.default;

    const action = actionAdapter(actionDefinition, 'testAction');
    const initialState = set({}, initialStateAdapter(actionDefinition, 'testAction'));
    let reducerResult = reducerAdapter(actionDefinition, 'testAction', initialState)(undefined, action('foo'));
    reducerResult = reducerAdapter(actionDefinition, 'testAction', initialState)(reducerResult, action('bar'));

    expect(reducerResult).to.be.deep.equal({
      value: 'bar',
      valueAltered: 'foobar',
      valueStrangeAltered: ['foo', 'bar'],
      valueStrange: 'bar',
      valueDefault: 'defaultValue',
      valueInitial: 'bar',
    });
  });
});
