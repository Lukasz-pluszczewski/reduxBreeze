# reduxBreeze
>Powerful redux wrapper to make handling redux actions and reducers a breeze!

[![CircleCI](https://circleci.com/gh/Lukasz-pluszczewski/reduxBreeze.svg?style=svg)](https://circleci.com/gh/Lukasz-pluszczewski/reduxBreeze)

Library to make managing state, actionCreators, reducers in your redux application a breeze. You can finally stop copyPasting and start actually coding! :)

Note: This library is designed to help experienced developers in complex apps. If you are new to redux you definately should first learn how to use it, and when you get familiar to it and get bored by copying a lot of code, you can return to reduxBreeze ;)

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

"Huh, that's very simple example" you say. That is. But reduxBreeze is infinitely extensible! If you haven't found plugin that fit's your use case (like using custom redux middleware and strangely managing side-effects) you can write your own in no-time. It's like writing your actionCreator, reducer and initialState ONCE. Once and for all!

Interested?
Dive into the documentation :)

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
import createReduxBreeze from 'reduxBreeze';

// it's good to export reduxBreeze instance as you will need to use it a lot in different places
export default createReduxBreeze(actionsDefinitions, config, plugin1, plugin2, plugin3);
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

#### Default plugin
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
        { sourcePath: 'payload.otherPayloadField, targetPath: 'field', result: 'list' } // result here works exactly like above: sets default value to empty array
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

## Plugins API

Section under construction! Will be available very soon!

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
   * redux-sage
   * redux-thunk
   * redux-better-promise
 * add selectors functionality (plugin-enabled)
