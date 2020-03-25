const booksResultReducer = (state = [], action) => {
  switch (action.type) {
    case "PUSH":
      // result
      return [...state, action.results];

    case "DELETE":
      // delete a single one
      // index
      const newState = state.filter(result => {
        return state.indexOf(result) !== action.index;
      });
      return newState;

    case "UPDATE":
      // update result with index passed in payload because filters just changed
      // results index
      let newState = state;
      // !!! CAN I DO IT? (SHOULD BE ABLE TO DO IT EVEN WITHOUTH newState)
      newState[action.index] = action.results;
      return newState;

    case "SET":
      // set new array
      // results
      return action.results;
    case "DELETE-ALL":
      return [];
  }
};

module.exports = booksResultReducer;
