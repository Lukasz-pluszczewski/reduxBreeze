# API

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

#### `tools.immutable(object, path, value, delimiter)`
 - `import { tools } from 'reduxBreeze'`
 - works like lodash's _.set() but does not mutate the object (can be used to easily, immutably set value in complicated nested structure)
 - arguments:
   - **object**: *object* object to set value in
   - **path**: *string|{\[path: string\]: value: any}* path to the value you want to change, can be deep where field values are divided by *delimiter* (default: .) e.g. 'field.subField.somethingElse'. Can be an object e.g. { 'field.subField': 'newValue', 'anotherField.anotherSubField': 'anotherNewValue' } Lodash's array like syntax is not supported (e.g. 'field\[1\].subField')
   - **value**: *any* value to be set in the path (if path is an object *value* is ignored)
   - **delimiter**: *string* (defaut: **'.'**) delimiter used in the path
 - returns **newObject**
