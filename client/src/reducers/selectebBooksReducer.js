const clusterGenerator = (books, state) => {
  let newState = state;
  books.forEach(book => {
    // fint existing cluster
    let ownCluster = newState.filter(cluster => {
      return cluster.sellerId === book.sellerId;
    })[0];
    if (!ownCluster) {
      // first book sold by this user
      let sellerInfo = book.sellerUser;
      const delivery = book.sellerUser.deliveryInfo;
      sellerInfo.place = book.place;
      delete book.place;
      delete sellerInfo.deliveryInfo;
      delete book.sellerUser;
      newState = [
        ...newState,
        { sellerId: book.sellerId, delivery, sellerInfo, Books: [book] }
      ];
    } else {
      // already a cluster (already stored seller info)
      delete book.place;
      delete book.sellerUser;
      const index = newState.indexOf(ownCluster);
      ownCluster.Books.push(book);
      newState[index] = ownCluster;
    }
  });
  return newState;
};

const clusterDelete = (book, state) => {
  let newState = state;
  let ownCluster = newState.filter(cluster => {
    return cluster.sellerId === book.sellerId;
  })[0];
  if (!ownCluster) {
    return newState;
  } else {
    const clusterIndex = newState.indexOf(ownCluster);
    if (ownCluster.Books.length === 0) {
      newState.splice(clusterIndex, 1);
    } else {
      delete book.sellerUser;
      delete book.place;
      const bookIndex = ownCluster.Books.indexOf(book);
      ownCluster.Books.splice(bookIndex, 1);
      newState[clusterIndex] = ownCluster;
    }
    return newState;
  }
};

const selectedBooksReducer = (state = [], action) => {
  switch (action.type) {
    case "PUSH":
      // push one book
      // book
      return clusterGenerator([action.book], state);

    case "SET":
      // set all books after refresh
      // [books]
      return clusterGenerator(action.books, state);

    case "DELETE":
      // delete one from cart
      // book
      return clusterDelete(book, state);

    case "DELETE-ALL":
      // finished, need to empty
      return [];
  }
};

module.exports = selectedBooksReducer;
