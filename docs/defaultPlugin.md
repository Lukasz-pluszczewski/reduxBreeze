# Default plugin
Default plugin (when enabled) will manage actions of type "default"

The following definitions (24 lines):
```javascript
const actionsDefinitions = {
  exampleReducer: {
    exampleAction: {
      type: 'default',
      result: 'list', // just sets default value to empty array if you don't provide default it
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
   - **result**: *string|array<{sourcePath: string, targetPath: string, initialValue: any, defaultValue, any, result: string}>* type of the result; if 'list' then initialValue will be emtpy string by default; if 'entity' default initial value will be null;
     - **sourcePath** *string* path from action the data is going to be taken from, can be nested e.g. 'payload.someField.someSubField'
     - **targetPath** *string* path in reducer's state, the data is going to be saved in, can be nested e.g. 'someField.someSubField'
     - **initialValue** *any* value that is going to be used in initial state in *targetPath*
     - **defaultValue** *any* value that is going to be used when not provided in the action
     - **result** *string* when initialValue not provided, it will be based on *result*; if 'list' the initialValue is going to be empty array; if 'entity' the initialValue is going to be null

## Plugins API

#### `plugin(tools, config)`
 - parameters
   - **tools**: *object* object of tools (consist of *chainReducer*, *createActionType*, *immutableSet*)
   - **config**: *object* reduxBreeze config object
 - returns **pluginObject**

#### `pluginObject`
 - fields:
   - **actionAdapter**: *object*
     - fields:
       - **\[actionType: string\]**: *function(actionDefinition: object, actionName: string)* adapter that gets action definition and should return action creator

   - **reducerAdapter**: *object*
     - fields:
       - **\[actionType: string\]**: *function(actionDefinition: object, actionName: string, initialState: any)* adapter that gets action definition and initialSate and returns reducer (reducer to handle only that one action)

   - **initialStateAdapter**: *object*
     - fields;
       **\[actionType: string\]**: *function(actionDefinition: object, actionName: string)* adapter that gets actionDefinition and should return assignmentObject (only for this particular action)
 - example [see default plugin](src/defaultPlugin.js)
