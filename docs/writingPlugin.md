# Plugins API

#### `plugin(tools, config)`
 - parameters
   - **tools**: *object* object of tools (consist of *chainReducer*, *createActionType*)
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
     - fields:
       - **\[actionType: string\]**: *function(actionDefinition: object, actionName: string)* adapter that gets actionDefinition and should return assignmentObject (only for this particular action)
 - example [see default plugin](https://github.com/Lukasz-pluszczewski/reduxBreeze/blob/master/src/defaultPlugin.js)

# Writing your first plugin

Let's imagine you use redux-thunk, and you custom apiClient to make requests and manage state accordingly. You write following actionCreators:
```javascript
function askedApi() {
  return {
    type: 'ASKED_API',
  };
}

function askedApiSuccess(data) {
  return {
    type: 'ASKED_API_SUCCESS',
    payload: data,
  }
}

function askedApiError(error) {
  return {
    type: 'ASKED_ASPI_ERROR',
    payload: error,
  }
}

function askApi() {
  return dispatch => {
    dispatch(askedApi());
    apiClient.get('url/api/v1')
      .then(data => dispatch(askedApiSuccess(data)))
      .catch(error => dispatch(askedApiError(error)));
  };
}
```

And reducer that looks like this:
```javascript
const initialState = {
  askApiLoading: false, // indicates that request has been sent and we are waiting for response
  askApiError: null,
  askApiData: [],
};

function myReducer(state = initialState, action) {
  case ASKED_API:
    return {
      ...state,
      askApiLoading: true,
    };
  case ASKED_API_SUCCESS:
    return {
      ...state,
      askApiLoading: false,
      askApiError: null,
      askApiData: action.payload,
    };
  case ASKED_API_SUCCESS:
    return {
      ...state,
      askApiLoading: false,
      askApiError: action.payload,
      askApiData: [],
    };
}
```

Let's create simple plugin that will make all of this for you

#### 1. think how you would like actionDefinition to look like
Action definition must always have `type` field to tell reduxBreeze which plugin should handle it.

You can add as many fields, used by your plugin, as you wish (they can be of any type: functions, nested objects or whatever you need)
```javascript
const actionDefinitions = {
  myReducer: {
    askApi: {
      type: 'apiRequest', // let's find a proper type to distinguish it from other types
      method: 'get',
      url: 'url/api/v1/',
      initial: [], // we can set it to array or null depending on type of data we expect
    },
  },
};
```

#### 2. create a plugin function
Plugin is a function that gets a tools object and returns list of adapters
```javascript
const myPlugin = tools => ({
  actionAdapter: {},
  reducerAdapter: {},
  initialStateAdapter: {},
});
```

#### 2. let's create our first actionAdapter that will take care of creating action creators for us
Action adapter is a function that returns action creator for particular action definition.

You can use reduxBreeze tools object if you want. Here we use createActionType helper to transform our camelCase action name to redux-like ACTION_NAME
```javascript
const myPlugin = tools => ({
  actionAdapter: {
    apiRequest(actionDefinition, actionName) {
      return (data) => {
        return dispatch => {
          dispatch({
            type: tools.createActionType(actionName)
          });
          apiClient.[actionDefinition.method](actionDefinition.url, data)
            .then(data => dispatch({
              type: tools.createActionType(actionName, 'success'),
              payload: data,
            }))
            .catch(error => dispatch({
              type: tools.createActionType(actionName, 'error'),
              payload: error,
            }));
        };
      };
    };
  },
  reducerAdapter: {},
  initialStateAdapter: {},
});
```

#### 3. next we will create reducerAdapter
Reducer adapter is a function that returns reducer handling only that one action.

In our case, one action definition can, in fact, result in three different redux actions being dispatched:
```javascript
const myPlugin = tools => ({
  actionAdapter: {...},
  reducerAdapter: {
    apiRequest(actionDefinition, actionName, initialState) {
      return (state = initialState, action) => {
        case [tools.createActionType(actionName)]:
            return {
              ...state,
              [`${actionName}Loading`]: true,
            };
          case [tools.createActionType(actionName, 'success')]:
            return {
              ...state,
              [`${actionName}Loading`]: false,
              [`${actionName}Error`]: null,
              [`${actionName}Data`]: action.payload,
            };
          case [tools.createActionType(actionName, 'success')]:
            return {
              ...state,
              [`${actionName}Loading`]: false,
              [`${actionName}Error`]: action.payload,
              [`${actionName}Data`]: actionDefinition.initial,
            };
      };
    }
  },
  initialStateAdapter: {},
});
```

#### 4. last part is creating initialStateAdapter
Initial state adapter is a function that returns state assignments (see [glossary](glossary.md))

```javascript
const myPlugin = tools => ({
  actionAdapter: {...},
  reducerAdapter: {...},
  initialStateAdapter: {
    apiRequest(actionDefinition, actionName) {
      return {
        [`${actionName}Loading`]: false,
        [`${actionName}Error`]: null,
        [`${actionName}Data`]: actionDefinition.initial,
      };
    }
  },
});
```

Voilà! You've just literally wrote reducer, action creator and state 'once and for all'! :)

Now you can do magic!
```javascript
const actionDefinitions = {
  myReducer: {
    getCars: {
      type: 'apiRequest',
      method: 'get',
      url: 'v1/cars',
      initial: [],
    },
    getPeople: {
      type: 'apiRequest',
      method: 'get',
      url: 'v1/people',
      initial: [],
    },
    postPerson: {
      type: 'apiRequest',
      method: 'post',
      url: 'v1/people',
      initial: null,
    },
  },
};
```

And we get following initialState:
```javascript
const initialState = {
  getCarsLoading: false,
  getCarsError: null,
  getCarsData: [],
  getPeopleLoading: false,
  getPeopleError: null,
  getPeopleData: [],
  postPersonLoading: false,
  postPersonError: null,
  postPersonData: null,
};
```

You can now get an action and dispatch it like this:
```javascript
class myComponent extends Component {
  render() {
    return <button onClick={this.props.postPerson(personData)}>
      submit
    </button>;
  }
}

export default connect(null, { postPerson: breezeInstance.getAction('postPerson') })(myComponent);

```
