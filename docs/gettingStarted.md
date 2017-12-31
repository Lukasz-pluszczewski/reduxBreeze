# Getting started

Examples uses defaultPlugin (it's enabled by default and provides simple functionality - details below)

#### 1. Create reduxBreeze instance
Because you will use reduxBreeze instance a lot, it's good to create separate file where you create and export it.
```javascript
// myReduxBreezeInstance.js
import createBreeze from 'redux-breeze';

const actionDefinitions = {};

export default createBreeze(actionsDefinitions);
```

#### 2. Apply it to your store
Change this code:
```javascript
import { createStore, combineReducers } from 'redux';
import myCustomReducers from 'myCustomReducers.js';

const store = createStore(combineReducer(myCustomReducers));
```

to this:
```javascript
import { createStore } from 'redux'
import reduxBreezeInstance from 'myReduxBreezeInstance.js';
import myCustomReducers from 'myCustomReducers.js';

const store = createStore(reduxBreezeInstance.combineReducer(myCustomRedcuers));
```

And **that's all!** Now you can use your reducers, actions etc. like before, unleashing the power of reduxBreeze at the same time ;)

# Creating my first actions

Let's make a form. Very small one. We would need one 'name' field with it's state in redux.

#### Let's create an action definition (we are using built-in 'default' plugin)
change line `const actionDefinitions = {};` in `myReduxBreezeInstance.js` to something like this:
```javascript
const actionDefinitions = {
  mySimpleForm: { // this is going to be a name of the reducer (thus a name of the part of the redux state that we use to keep our form data)
    setNameFieldValue: {
      type: 'default', // we tell reduxBreeze that default plugin should handle this action
      result: [
        {
          sourcePath: 'payload', // we tell defaultPlugin where it can find new value in an action
          targetPath: 'formValues.name' // we tell defaultPlugin where it should save the value in the redux state
          initialValue: '', // we tell defaultPlugin that initial value for `formValues.name` is empty string
        },
      ],
    }
  }
};
```

#### Now we can just use an action (without writing reducer, action creator or initial state)
```javascript
import breezeInstance from 'myReduxBreezeInstance';

class myForm extends Component {
  render() {
    return (
      <input
        value={this.props.name}
        onChange={e => this.props.setName(e.target.value)}
      />
    );
  }
}

export default connect(
  state => ({
    name: state.mySimpleForm.formValues.name,
  }),
  {
    setName: breezeInstance.getAction('setNameFieldValue'),
  }
)(myForm);
```

 **it just works!**
