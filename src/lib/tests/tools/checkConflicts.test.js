import { checkConflicts } from '../../index';

describe('checkConflicts', () => {
  it('should return empty string when no conflicts were found', () => {
    const testResult = checkConflicts(
      [
        { name: 'plugin1', actionAdapter: { test1() {} } },
        { name: 'plugin2', actionAdapter: { test2() {} } },
      ],
      'actionAdapter'
    );

    expect(testResult).toBe('');
  });
  it('should return non empty string when conflicts were found', () => {
    const testResult = checkConflicts(
      [
        { name: 'plugin1', actionAdapter: { test1() {} } },
        { name: 'plugin2', actionAdapter: { test1() {} } },
      ],
      'actionAdapter'
    );

    expect(typeof testResult).toBe('string');
    expect(testResult).not.toBe('');
  });
  it('should use provided mpaActionTypes function to map actionTypes', () => {
    const mapActionTypes = jest.fn((actionType, pluginName, adapterName) => pluginName);
    const testResult = checkConflicts(
      [
        { name: 'test1', actionAdapter: { test1() {} } },
        { name: 'test2', actionAdapter: { test1() {} } },
      ],
      'actionAdapter',
      mapActionTypes
    );

    expect(mapActionTypes).toHaveBeenCalledTimes(2);
    expect(mapActionTypes).toHaveBeenCalledWith('test1', 'test1', 'actionAdapter');
    expect(mapActionTypes).toHaveBeenCalledWith('test1', 'test2', 'actionAdapter');
    expect(testResult).toBe('');
  });
});
