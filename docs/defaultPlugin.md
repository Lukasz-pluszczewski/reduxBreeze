# Default plugin
Default plugin (when enabled) will manage actions of type "default"

The following definitions (24 lines):
```javascript
const actionsDefinitions = {
  exampleReducer: {
    exampleAction: {
      type: 'default',
      result: {
        exampleList: { source: 'payload', default: [], initial: [] },
      },
    },
    someOtherAction: {
      type: 'default',
      result: {
        'someObjectInState.someSubObject.myField': { source: 'payload.payloadField', default: ['myStrangeDefaultValue'], initial: [] },
      },
    },
  },
  otherReducer: {
    differentAction: {
      type: 'default',
      result: {
        nameOfTheTargetFieldInState: 'payload',
      }
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
    }
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
        exampleList: typeof action.payload === 'undefined' ? [] : action.payload, // here we use default value from action definition
      };
    case 'SOME_OTHER_ACTION':
      return {
        ...state,
        someObjectInState: {
          ...someObjectInState,
          someSubObject: {
            ...someSubObject,
            myField: typeof action.payload.payloadField === 'undefined' ? ['myStrangeDefaultValue'] : action.payload.payloadField,
          },
        }
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
   - **result** *object* object were keys are targets (paths in state) and values are:
     1. paths in action
     2. function that gets action and currentValue as arguments and should return new value
     3. objects with following values:
        - **source** *string* path from action the data is going to be taken from, can be nested e.g. 'payload.someField.someSubField'
        - **initial** *any* value that is going to be used in initial state in *target* path in state
        - **default** *any* value that is going to be used when not provided in the source path in action
