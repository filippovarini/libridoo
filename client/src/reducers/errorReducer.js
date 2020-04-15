const errorReducer = (state = {}, action) => {
  switch (action.type) {
    case "E-SET":
      return action.error;
    case "E-DELETE":
      return {};
    default:
      return state;
  }
};

export default errorReducer;
