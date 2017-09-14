# reduxBreeze
>Powerful redux wrapper to make handling redux actions and reducers a breeze!

[![CircleCI](https://circleci.com/gh/Lukasz-pluszczewski/reduxBreeze.svg?style=svg)](https://circleci.com/gh/Lukasz-pluszczewski/reduxBreeze)

Library to make managing state, actionCreators, reducers in your redux application a breeze. You can finally stop copyPasting and start actually coding! :)

Note: This library is designed to help experienced developers in complex apps. If you are new to redux you definately should first learn how to use it, and when you get familiar with it and get bored by copying a lot of code, you can return to reduxBreeze ;)

Note2: This library is in early stage of development. Use at you own risk and, if you like the idea, feel free to help me making it epic! ;)

## FAQ
##### Why this exists?
Redux is really great! It allows you to have whole application state in one, easily accessible place and manage it in a predictable way. All is good... until your application gets big and you write tens or even hundreds of same reducer cases and action creators. You start thinking: "that's a lot of work a computer is perfect at: copying stuff around"
**Exactly!**

#### Are there good alternatives? 
Let me know if you find one.

#### I found a bug! What should I do?
There are at least 3 options:
1. Add an issue, write test(s) for bug you found, write fix that will make your test(s) pass, submit pull request
2. Add an issue, write test(s) for bug you found, submit pull request with you test(s)
3. Add an issue

All contributions are appreciated!

## Ok, so what do I get?
Let's imagine you created forms. A lot of forms. And you wanted to keep values in redux state.

Most likely you have a lot of similar code in your app
```javascript
export default function formReducer(state = initialState.form, action) {
  switch (action.type) {
    case CHANGE_FULL_NAME:
      return {
        ...state,
        fullName: action.payload,
      };
    default:
      return state;
}

export function changeFullName(fullName) {
  return {
    type: CHANGE_FULL_NAME,
    payload: fullName,
  };
}
```

What if I tell you that you can avoid writing these action creators and reducers? And, no, not by creating one CHANGE_FORM_FIELD action. ;) You can actually avoid writing even the single reducer or a single action creator!

Only define something like:
```javascript
changeFullName: {
  type: 'default',
  result: [
    { sourcePath: 'payload', targetPath: 'fullName' }
  ],
}
```
And that's all! No action creators written. No reducer cases! You want default values? Or maybe custom initial value?
```javascript
changeFullName: {
  type: 'default',
  result: [
    { sourcePath: 'payload', targetPath: 'fullName', defaultValue: 'John Doe', initialValue: 'No full name here yet' }
  ],
}
```
And then use it like this:
```javascript
this.props.changeFullName('John Smith');

...

connect(
  null,
  {
    changeFullName: reduxBreezeinstance.getAction('changeFullName'),
  }
)(MyFancyComponent);
```

"Huh, that's very simple example" you say. That is. But reduxBreeze is infinitely extensible! If you haven't found plugin that fits your use case (like using custom redux middleware and strangely managing side-effects) you can write your own in no-time. It's like writing your actionCreator, reducer and initialState ONCE. Once and for all!

Interested?
Dive into the documentation :)

## Glossary

**actionCreator**
[see redux documentation](http://redux.js.org/docs/basics/Actions.html#action-creators)

**actionDefinition**
Object with fields required by *plugin* used. By default actionDefinition must have *type* field which is it's *actionType*

**actionType**
(not to be confused with *reduxActionType*) a string which tells reduxBreeze which plugin should handle *actionDefinition*. Default plugin handles actions of type 'default'

**actionDefinitions**
Object that must be provided to reduxBreeze when creating it's instance. It's shape is as follows:
```javascript
{
  reducerName: {
    actionName: actionDefinition,
    action2Name: actionDefinition,
  },
  reducer2Name: {
    action3Name: actionDefinition,
  },
}
```

**actionName**
String specific for an action definition. It is used to get the actionCreator for it, as well as for generating *reduxActionType* (in case of default plugin)

**assignmentObject**
Object for immutableSet function. Its keys must be paths and values are values to be set in those paths. It must be returned by initialStateAdapters in plugins.

**reduxActionType**
String used [in redux actions](http://redux.js.org/docs/basics/Actions.html). In default plugin it generated from camel case *actionName* and is in the form: 'ACTION_NAME'

**plugin**
A function that gets *tools* object as it's first argument and *config* as it's second argument. It should return an object of following shape:
```javascript
{
  actionAdapter: {
    actionType(actionDefinition, actionName) {
      return actionCreator;
    },
  },
  reducerAdapter: {
    actionType(actionDefinition, actionName, initialState) {
      return reducer;
    },
  },
  initialStateAdapter: {
    actionType(actionDefinition, actionName) {
      return assignmentsObject;
    },
  },
}
```

## Usage

Examples uses defaultPlugin (it's enabled by default and provides simple functionality - details below)

#### Create actions definitions according documentation of the plugin(s) you use
```javascript
const actionsDefinitions = {
  exampleReducer: {
    exampleAction: {
      type: 'default',
      result: 'list',
      resultName: 'exampleList',
      defaultValue: [],
    },
    someOtherAction: {
      type: 'default',
      result: [
        { sourcePath: 'payload.payloadField', targetPath: 'someObjectInState.someSubObject.myField', defaultValue: ['myStrangeDefaultValue'], initialValue: [] },
      ],
    },
  },
};
```

#### Create reduxBreeze instance
```javascript
// myReduxBreezeInstance.js
import createBreeze from 'reduxBreeze';

// it's good to export reduxBreeze instance as you will need to use it a lot in different places
export default createBreeze(actionsDefinitions, config, plugin1, plugin2, plugin3);
```

#### Define your custom reducers like you always did
```javascript
// myCustomReducers.js
export default {
  exampleReducer,
  otherReducer,
};
```
Reducers that are to be generated will be smartly merged with your custom ones.

You also do not have to care about initialState. Use your initialState in your custom reducers like always and reduxBreeze will take care of everything!

#### Create root reducer for your store
```javascript
import { createStore } from 'redux'
import reduxBreezeInstance from 'myReduxBreezeInstance.js';
import myCustomReducers from 'myCustomReducers.js';

// reduxBreezeInstance has it's own combineReducer method that does same thing but also adds generated stuff to reducers and initial state
const store = createStore(reduxBreezeInstance.combineReducer(myCustomRedcuers));
```

#### Use your generated actions
```javascript
// myFancyComponent.js
import reduxBreezeInstance from 'myReduxBreezeInstance.js';

...

connect(
  null,
  {
    exampleAction: reduxBreezeInstance('eampleAction');
  }
)(MyFancyComponent);
```

## API

#### `createBreeze(actionsDefinition, config, ...plugin)`
 - `import createBreeze from 'reduxBreeze'`
 - function to create a reduxBreeze instance
 - arguments
   - **actionsDefinitions**: *object* Object with actions definitions
   - **config**: *object* configuration object (see below)
   - **plugin**: *function* plugin function (see below), you can add as many plugins as you want as consecutive arguments
 - returns **breezeInstance**

#### `actionsDefinitions`
 - Object with following structure
 ```javascript
 {
   reducerName: {
     actionName: actionDefinition
   }
 }
 ```

#### `actionDefinition`
 - Object of action definition
 - Default fields:
   - **type**: *string* type of the action (action types indicates which plugins should handle them)
 - Consult plugin documentation for other fields details

#### `config`
 - Object of config merged with default values
 - fields:
   - **useDefaultPlugin**: *boolean* (default: **true**) indicates whether default plugin should be applied
   - **strict**: *boolean* (default: **true**) if strict mode is turned on error will be thrown when two plugins tries to handle same actionType
   - **mapActionTypes**: *function(actionType: *string*, pluginName: *string*, adapterType: *string*)* (default: **actionType => actionType**) function to translate action types used by a plugin to action types used by you in actionDefinitions (useful when you have two plugins handling same actionType, you can just map one of those to different name)

#### `breezeInstance.combineReducers(reducers)`
 - equivalent of redux's combineReducers method but smartly merging generated reducers with your (optional) custom reducers
 - arguments:
   - **reducers**: *object* optional - can be exactly the same as with [redux's combineReducers](http://redux.js.org/docs/api/combineReducers.html)
 - returns: **rootReducer** (just pass it to [redux createStore](https://github.com/reactjs/redux/blob/master/docs/api/createStore.md))

#### `breezeInstance.getAction(actionName)`
 - Function to get action creator for a given action definition (to be used in redux connect)
 - arguments:
   - **actionName**: *string* name of the action (must be the same as key of the action definition)
 - returns: **actionCreator**

#### `tools.chainReducers(...reducer)`
 - `import { tools } from 'reduxBreeze'`
 - helper function to chain several reducers (and e.g. assign it to same field in redux state)
 - when called chained reducer, all chained reducers will be called in order, each getting state returned by previous one
 - arguments
   - **reducer**: *function* reducers to chain
 - return **chainedReducer**

#### `tools.createActionType(actionName, suffix, prefix)`
 - `import { tools } from 'reduxBreeze'`
 - helper function to create redux action type from actionName
 - arguments:
   - **actionName**: *string*
   - **suffix**: *string* (default: **''**) string that will be added at the end of the created action type
   - **prefix**: *string* (default: **''**) string that will be added at the beginning of the created action type
 - example:
 ```javascript
 tools.createActionType('myFancyName'); // MY_FANCY_NAME
 tools.createActionType('myFancyName', 'success'); // MY_FANCY_NAME_SUCCESS
 tools.createActionType('myFancyName', '', 'blah'); // BLAH_MY_FANCY_NAME
 ```

#### `tools.immmatableSet(object, path, value, delimiter)`
 - `import { tools } from 'reduxBreeze'`
 - works like lodash's _.set() but does not mutate the object (can be used to easily, immutably set value in complicated nested structure)
 - arguments:
   - **object**: *object* object to set value in
   - **path**: *string|{\[path: string\]: value: any}* path to the value you want to change, can be deep where field values are divided by *delimiter* (default: .) e.g. 'field.subField.somethingElse'. Can be an object e.g. { 'field.subField': 'newValue', 'anotherField.anotherSubField': 'anotherNewValue' } Lodash's array like syntax is not supported (e.g. 'field\[1\].subField')
   - **value**: *any* value to be set in the path (if path is an object *value* is ignored)
   - **delimiter**: *string* (defaut: **'.'**) delimiter used in the path
 - returns **newObject**

## Default plugin
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

## Default plugin API

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

## I wanna help!
Great!

All pull requests are appreciated as long as the code is well tested, documented and linted ;)

You may grab a thing from todo (see below) or write plugins for your use-case.

## Todo
 * make readme great again:
   * document config (not a big thing ;) )
   * document plugins api
   * add basic usage tutorial
   * add plugins tutorial
 * write action definitions validation (by default only checking for 'type' field, but make it plugin enabled)
 * add more plugins:
   * redux-saga
   * redux-thunk
   * redux-better-promise
 * add selectors functionality (plugin-enabled)
