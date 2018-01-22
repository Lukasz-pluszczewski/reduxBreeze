import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { checkConflicts } from '../../src/index';

chai.use(sinonChai);

describe('checkConflicts', () => {
  it('should return empty string when no conflicts were found', () => {
    const testResult = checkConflicts(
      [
        { name: 'plugin1', actionAdapter: { test1() {} } },
        { name: 'plugin2', actionAdapter: { test2() {} } },
      ],
      'actionAdapter'
    );

    expect(testResult).to.be.equal('');
  });
  it('should return non empty string when conflicts were found', () => {
    const testResult = checkConflicts(
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
    const testResult = checkConflicts(
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
