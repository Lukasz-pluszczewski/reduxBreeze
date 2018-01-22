# API

#### `assignmentsObject`
 - Object with keys being paths (like 'field.subField') and values being values tobe put in those paths
 - used by `tools.immutableSet` function and must be returned by a initialStateAdapter in plugin
 - example
 ```javascript
 const assignmentsObject = {
   'fieldOne.subField': 'some value',
   'fieldTwo': 2,
   'another.nullableField': null,
 };
 ```

#### `createBreeze(actionsDefinition, config, ...plugin)`
 - `import createBreeze from 'redux-breeze'`
 - function to create a redux-breeze instance
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

#### `chainReducers(...reducer)`
 - `import { chainReducers } from 'redux-breeze'`
 - helper function to chain several reducers (and e.g. assign it to same field in redux state)
 - when called chained reducer, all chained reducers will be called in order, each getting state returned by previous one
 - arguments
   - **reducer**: *function* reducers to chain
 - return **chainedReducer**

#### `createActionType(actionName, suffix, prefix)`
 - `import { createActionType } from 'redux-breeze'`
 - helper function to create redux action type from actionName
 - arguments:
   - **actionName**: *string*
   - **suffix**: *string* (default: **''**) string that will be added at the end of the created action type
   - **prefix**: *string* (default: **''**) string that will be added at the beginning of the created action type
 - example:
 ```javascript
 createActionType('myFancyName'); // MY_FANCY_NAME
 createActionType('myFancyName', 'success'); // MY_FANCY_NAME_SUCCESS
 createActionType('myFancyName', '', 'blah'); // BLAH_MY_FANCY_NAME
 ```

#### `connect(mapStateToProps, mapDispatchToProps, mergeProps, options)`
 - `import { connect } from 'redux-breeze'`
 - wrapper for react-redux connect that transform mapStateToProps plain object to standard mapStateToProps function
 - arguments:
   - **mapStateToProps**: *function|object* standard function or object of paths in state or functions (see example below)
   - ... all other arguments exactly the same as in [connect](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options)
 - example:
 ```javascript
 // standard connect
 connect(
   state => ({
     foo: state.foo.value,
     bar: state.foo.value,
     noValue: state.noValue && state.noValue.value,
     baz: state.baz.value,
   })
 )(MyComponent);
 
 // redux-breeze connect
 connect(
   {
     foo: 'state.foo.value',
     bar: 'bar.value', // you can omit 'state.' from the begining of path
     noValue: 'noValue.value' // no error thrown, if noValue is undefined this will return undefined as well
     baz: state => state.baz.value, // you can also use selectors by passing a function that accepts state as argument
   }
 )(MyComponent);
 ```
