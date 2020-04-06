import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, combineReducers } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

// reducers
import userReducer from "./reducers/userReducer";
import selectedBooksReducer from "./reducers/selectebBooksReducer";
import booksResultReducer from "./reducers/booksResultReducer";
import errorReducer from "./reducers/errorReducer";

const reducers = combineReducers({
  user: userReducer,
  selectedBooks: selectedBooksReducer,
  booksResult: booksResultReducer,
  error: errorReducer
});

const store = createStore(reducers, composeWithDevTools());

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
