# Default plugin
Default plugin (when enabled) will manage actions of type "default"

The following definitions (24 lines):
```javascript
const actionsDefinitions = {
  exampleReducer: {
    exampleAction: {
      type: 'default',
      resultName: 'exampleList', // needed if result is a string, it's a name of the filed in a state where we will save the value
      defaultValue: [], // value to be set when you will not provide any
      initialValue: [], // value to be set in initial state
    },
    someOtherAction: {
      type: 'default',
      result: [
        { sourcePath: 'payload.payloadField', targetPath: 'someObjectInState.someSubObject.myField', defaultValue: ['myStrangeDefaultValue'], initialValue: [] },
        { sourcePath: 'payload.otherPayloadField', targetPath: 'field', result: 'list' }, // result below works exactly like above: sets default value to empty array
      ],
    },
  },
  otherReducer: {
    differentAction: {
      type: 'default',
      result: 'entity', // everything except 'list' here will set default value to null
      resultName: 'nameOfTheTargetFieldInState',
    },
  },
};
```

Will result in the following initialState (14 lines):
```javascript
{
  exampleReducer: {
    exampleList: [],
    someObjectInState: {
      someSubObject: {
        myField: [],
      },
    },
    field: [],
  },
  otherReducer: {
    nameOfTheTargetFieldInState: null,
  },
}
```

And in reducers like these (35 lines):
```javascript
exampleReducer(state = initialState.exampleReducer, action) {
  switch(action.type) {
    case 'EXAMPLE_ACTION':
      return {
        ...state,
        exampleList: typeof action.payload === 'undefined' ? [] : action.payload, // here we use defaultValue from action definition
      };
    case 'SOME_OTHER_ACTION':
      return {
        ...state,
        someObjectInState: {
          ...someObjectInState,
          someSubObject: {
            ...someSubObject,
            myField: typeof action.payload === 'undefined' ? ['myStrangeDefaultValue'] : action.payload,
          },
        },
        field: action.payload.otherPayloadField,
      };
    default:
      return state;
  }
}

otherReducer(state = initialState.otherReducer, action) {
  switch(action.type) {
    case 'DIFFERENT_ACTION':
      return {
        ...state,
        nameOfTheTargetFieldInState: action.payload,
      };
    default:
      return state;
  }
}
```

And in action creators that would look like these (20 lines):
```javascript
function exampleAction(params) {
  return {
    type: 'EXAMPLE_ACTION',
    payload: params,
  };
}

function someOtherAction(params) {
  return {
    type: 'SOME_OTHER_ACTION',
    payload: params,
  };
}

function differentAction(params) {
  return {
    type: 'DIFFERENT_ACTION',
    payload: params,
  };
}
```

Be honest and tell me: do you really want to write these 69 lines of code, over and over again instead of, clean, understandable 24?

And it's just the beginning! :)

# Default plugin API

#### `actionDefinition`
 - fields:
   - **type**: *string = 'default'* action type, must be 'default' to be handled by default plugin
   - **initialValue** *any* value that is going to be used in initial state in *targetPath*
   - **defaultValue** *any* value that is going to be used when not provided in the action
   - **result**: *string|array<{sourcePath: string, targetPath: string, initialValue: any, defaultValue, any, result: string}>* path where payload should be saved
     - **sourcePath** *string|function(action)* path from action the data is going to be taken from, can be nested e.g. 'payload.someField.someSubField', or function that returns that path
     - **targetPath** *string|function(action)* path in reducer's state, the data is going to be saved in, can be nested e.g. 'someField.someSubField' or function that returns that path
     - **initialValue** *any* value that is going to be used in initial state in *targetPath*
     - **defaultValue** *any* value that is going to be used when not provided in the action
     - **value** *function(action, currentValue)|any* function that gets an action object and current state value (based on targetPath) and returns value to be saved, or hardcoded value to be set
