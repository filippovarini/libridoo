const AL1 = booksResult => {
  booksResult.forEach(resultObj => {
    // each search ui
    resultObj.filterResult.forEach(book => {
      //   init
      book.userSellsCount = 0;
      // each book in search ui
      for (const resultObjCompared of booksResult) {
        // each search
        for (const bookCompared of resultObjCompared.filterResult) {
          // each book
          if (bookCompared.sellerId === book.sellerId) {
            book.userSellsCount += 1;
            break;
            // if found, no reason to look for other same books by him
          }
        }
      }
    });
  });
  //   then sort
  booksResult.forEach(resultObj => {
    //   !!! DOES MAP AFFECT IT?
    resultObj.filterResult.sort((a, b) =>
      a.userSellsCount < b.userSellsCount ? 1 : -1
    );
  });

  return booksResult;
};

module.exports = AL1;
