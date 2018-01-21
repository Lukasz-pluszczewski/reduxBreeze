# redux-breeze
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

## Documentation
 * [Getting started](docs/gettingStarted.md)
 * [Glossary](docs/glossary.md)
 * [Default plugin usage](docs/defaultPlugin.md)
 * [API](docs/api.md)
 * [Writing your own plugins](docs/writingPlugin.md)
 * [Changelog](docs/changelog.md)

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
  result: {
    fullName: 'payload',
  },
}
```
And that's all! No action creators written. No reducer cases! You want default values? Or maybe custom initial value?
```javascript
changeFullName: {
  type: 'default',
  result: {
    fullName: { source: 'payload', default: 'John Doe', initial: 'No full name here yet' },
  },
}
```
And then use it like this:
```javascript
this.props.changeFullName('John Smith');

...

connect(
  null,
  {
    changeFullName: reduxBreezeInstance.getAction('changeFullName'),
  }
)(MyFancyComponent);
```

"Huh, that's very simple example" you say. That is. But reduxBreeze is infinitely extensible! If you haven't found plugin that fits your use case (like using custom redux middleware and strangely managing side-effects) you can write your own in no-time. It's like writing your actionCreator, reducer and initialState ONCE. Once and for all!

Interested?
Dive into the documentation :)

## Plugins
- [redux-better-promise](https://github.com/Lukasz-pluszczewski/redux-breeze-plugin-better-promise)

## I wanna help!
Great!

All pull requests are appreciated as long as the code is well tested, documented and linted ;)

You may grab a thing from todo (see below) or write plugins for your use-case.

## Todo
 * write action definitions validation (by default only checking for 'type' field, but make it plugin enabled)
 * add more plugins:
   * redux-saga
   * redux-thunk
 * add selectors functionality (plugin-enabled)
