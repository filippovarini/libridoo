const booksResultReducer = (state = [], action) => {
  switch (action.type) {
    case "R-PUSH":
      // result
      return [...state, action.results];

    case "R-DELETE":
      // delete a single one
      // index
      return state.filter(result => {
        return state.indexOf(result) !== action.index;
      });

    case "R-UPDATE":
      // update result with index passed in payload because filters just changed
      // results index
      // !!! CAN I DO IT? (SHOULD BE ABLE TO DO IT EVEN WITHOUTH newState)
      state[action.index] = action.results;
      return state;

    case "R-SET":
      // set new array
      // results
      return action.results;
    case "R-DELETE-ALL":
      return [];
    default:
      return state;
  }
};

module.exports = booksResultReducer;
