const AL1 = (booksResult, sellerIds) => {
  console.log(booksResult, sellerIds);
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
  if (!sellerIds) {
    booksResult.forEach(resultObj => {
      //   !!! DOES MAP AFFECT IT?
      resultObj.filterResult.sort((a, b) =>
        // a.userSellsCount < b.userSellsCount ? 1 : -1
        a.userSellsCount < b.userSellsCount
          ? 1
          : a.userSellsCount === b.userSellsCount
          ? Number(a.price) <= Number(b.price)
            ? -1
            : 1
          : -1
      );
    });
  } else {
    console.log("shitting");
    booksResult.forEach(resultObj => {
      //   !!! DOES MAP AFFECT IT?
      resultObj.filterResult.sort((a, b) =>
        // a.userSellsCount < b.userSellsCount ? 1 : -1
        // put sellerIds on top
        // !sellerIds.includes(a.sellerId) && sellerIds.includes(b.sellerId) ?
        // -1 : sellerIds.includes(a.sellerId) && !sellerIds.includes(b.sellerId) ? -1 :
        (sellerIds.includes(a.sellerId) && sellerIds.includes(b.sellerId)) ||
        (!sellerIds.includes(a.sellerId) && !sellerIds.includes(b.sellerId))
          ? // same, perform basic
            a.userSellsCount < b.userSellsCount
            ? 1
            : a.userSellsCount === b.userSellsCount
            ? Number(a.price) <= Number(b.price)
              ? -1
              : 1
            : -1
          : !sellerIds.includes(a.sellerId) && sellerIds.includes(b.sellerId)
          ? 1
          : -1
      );
    });
  }

  return booksResult;
};

export default AL1;
