const clusterGenerator = (books, state) => {
  let newState = state;
  books.forEach(stateBook => {
    // prevent from changing the state
    const book = Object.assign({}, stateBook);
    // fint existing cluster
    let ownCluster = newState.filter(cluster => {
      return cluster.sellerId === book.sellerId;
    })[0];
    if (!ownCluster) {
      // first book sold by this user
      let sellerInfoState = book.sellerUser;
      // prevent from changing state
      let sellerInfo = Object.assign({}, sellerInfoState);
      // see whether it was choosen or not
      let choosen = false;
      if (sessionStorage.getItem("__cds_Ids")) {
        JSON.parse(sessionStorage.getItem("__cds_Ids")).forEach(id => {
          if (book.sellerId === id) choosen = true;
        });
      }
      const delivery = { ...book.sellerUser.deliveryInfo, choosen };
      sellerInfo.place = book.place;
      delete book.place;
      delete sellerInfo.deliveryInfo;
      delete book.sellerUser;
      // on SBs refresh, book doesn't have userSellsCount. Still good
      delete book.userSellsCount;
      newState = [
        ...newState,
        { sellerId: book.sellerId, delivery, sellerInfo, Books: [book] }
      ];
    } else {
      // already a cluster (already stored seller info)
      delete book.place;
      delete book.sellerUser;
      delete book.userSellsCount;
      const index = newState.indexOf(ownCluster);
      ownCluster.Books.push(book);
      newState[index] = ownCluster;
    }
  });
  return newState;
};

const toggleDelivery = (clusterIndex, state) => {
  const newState = [...state];
  newState[clusterIndex].delivery.choosen = !newState[clusterIndex].delivery
    .choosen;
  return newState;
};

const clusterDelete = (clusterIndex, bookIndex, state) => {
  let newState = [...state];
  const cluster = newState[clusterIndex];
  if (cluster.Books.length === 1) {
    // only one book, remove cluster
    newState.splice(clusterIndex, 1);
  } else {
    cluster.Books.splice(bookIndex, 1);
  }
  return newState;
};

const selectedBooksReducer = (state = [], action) => {
  switch (action.type) {
    case "SB-PUSH":
      // push one book
      // book
      return clusterGenerator([action.book], state);

    case "SB-SET":
      // set all books after refresh
      // [books]
      return clusterGenerator(action.books, state);

    case "TOGGLE-DELIVERY":
      return toggleDelivery(action.clusterIndex, state);

    case "SB-DELETE":
      // delete one from cart
      // book
      return clusterDelete(action.clusterIndex, action.bookIndex, state);

    case "SB-DELETE-ALL":
      // finished, need to empty
      return [];

    case "GENERAL-DELETE":
      // just purchased
      return [];

    default:
      return state;
  }
};

export default selectedBooksReducer;
