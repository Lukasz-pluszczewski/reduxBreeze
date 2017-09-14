# Plugins API

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
     - fields:
       - **\[actionType: string\]**: *function(actionDefinition: object, actionName: string)* adapter that gets actionDefinition and should return assignmentObject (only for this particular action)
 - example [see default plugin](https://github.com/Lukasz-pluszczewski/reduxBreeze/blob/master/src/defaultPlugin.js)
