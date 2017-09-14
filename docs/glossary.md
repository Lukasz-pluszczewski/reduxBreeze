# Glossary

**actionCreator**
[see redux documentation](http://redux.js.org/docs/basics/Actions.html#action-creators)

**actionDefinition**
Object with fields required by *plugin*. By default actionDefinition must have *type* field which is it's *actionType*

**actionType**
(not to be confused with *reduxActionType*) a string which tells reduxBreeze which plugin should handle *actionDefinition*. Default plugin handles actions of type 'default'

**actionDefinitions**
Object that must be provided to reduxBreeze when creating it's instance. It's shape is as follows:
```javascript
actionDefinitions = {
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
({
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
})
```
