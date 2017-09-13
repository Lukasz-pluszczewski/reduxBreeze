# Library boilerplate
>Powerful redux wrapper to make handling redux actions and reducers a breeze!

[![CircleCI](https://circleci.com/gh/Lukasz-pluszczewski/reduxBreeze.svg?style=svg)](https://circleci.com/gh/Lukasz-pluszczewski/reduxBreeze)

Library to make managing state, actionCreators, reducers in your redux application a breeze. You can finally stop copyPasting and start actually coding! :)

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

What if I tell you that you can avoid writing these action creators and reducers? Adn, no, not by creating one CHANGE_FORM_FIELD action. ;) You can actually avoid writing even the single reducer or a single action creator! And only define something like:
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

#### Create actions definitions
```javascript
const actionsDefinitions = {
  exampleReducer: {
    exampleAction: {
      type: 'default',
      result: 'list',
      resultName: 'exampleList',
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

#### Create root reducer for your store
```javascript
import { createStore } from 'redux'
import reduxBreezeInstance from 'myReduxBreezeInstance.js';
import myCustomReducers from 'myCustomReducers.js';

// reduxBreezeInstance has it's own combineReducer method that does same thing but adding generated stuff to reducers and initial state
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

## I wanna help!
Great!

All pull requests are appreciated as long as the code is well tested, documented and linted ;)

You may want to write plugins for your use-case. The most needed once are:
 * redux-sage
 * redux-thunk