const userReducer = (state = {}, action) => {
  if (action.type === "SET_USER") {
    // is it ok??
    return action.user;
  }
  if (action.type === "LOGOUT") {
    return action.user;
  }
};

module.exports = userReducer;
