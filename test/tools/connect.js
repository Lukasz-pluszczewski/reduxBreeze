import { expect } from 'chai';
import { getNewMapState } from '../../src/tools/connect';

describe('getNewMapState', () => {
  it('should create map function out of plain object', () => {
    const mapState = {
      foo: 'state.foo.value',
      bar: 'bar.value',
      baz: state => state.baz.value,
    };

    const state = {
      foo: {
        value: 'fooValue',
      },
      bar: {
        value: 'barValue',
      },
      baz: {
        value: 'bazValue',
      },
    };

    expect(getNewMapState(mapState)(state)).to.be.deep.equal({
      foo: 'fooValue',
      bar: 'barValue',
      baz: 'bazValue',
    });
  });

  it('should throw an error if path has not been found in state', () => {
    const mapState = {
      noValue: 'no.value.here',
    };

    const state = {
      noValue: {},
    };

    expect(() => getNewMapState(mapState)(state)).to.throw(Error);
  });

  it('should not throw an error if path has not been found in state but default value has been provided', () => {
    const mapState = {
      noValue: ['no.value.here', 'default value'],
    };

    const state = {
      noValue: {},
    };

    expect(getNewMapState(mapState)(state)).to.be.deep.equal({
      noValue: 'default value',
    });
  });

  it('should return map function without altering it', () => {
    const mapState = state => ({ foo: state.foo.value });

    const state = {
      foo: {
        value: 'fooValue',
      },
    };

    expect(getNewMapState(mapState)(state)).to.be.deep.equal({
      foo: 'fooValue',
    });
  });
});
