const booksResult = [
  {
    filterResult: [
      {
        userSellsCount: 4,
        price: 1,
        sellerId: 1
      },
      {
        userSellsCount: 2,
        price: 1,
        sellerId: 2
      },
      {
        userSellsCount: 2,
        price: 2,
        sellerId: 3
      },
      {
        userSellsCount: 4,
        price: 2,
        sellerId: 4
      },
      {
        userSellsCount: 7,
        price: 1,
        sellerId: 5
      },
      {
        userSellsCount: 2,
        price: 1,
        sellerId: 6
      },
      {
        userSellsCount: 3,
        price: 2,
        sellerId: 7
      },
      {
        userSellsCount: 3,
        price: 1,
        sellerId: 8
      },
      {
        userSellsCount: 4,
        price: 1,
        sellerId: 9
      }
    ]
  }
];

const sellerIds = [7, 8, 9];

const al = (booksResult, sellerIds) => {
  booksResult.forEach(resultObj => {
    //   !!! DOES MAP AFFECT IT?
    resultObj.filterResult.sort((a, b) =>
      // a.userSellsCount < b.userSellsCount ? 1 : -1
      // put sellerIds on top
      // !sellerIds.includes(a.sellerId) && sellerIds.includes(b.sellerId) ?
      // -1 : sellerIds.includes(a.sellerId) && !sellerIds.includes(b.sellerId) ? -1 :

      a.userSellsCount < b.userSellsCount
        ? 1
        : a.userSellsCount === b.userSellsCount
        ? Number(a.price) <= Number(b.price)
          ? -1
          : 1
        : -1
    );
  });
  return booksResult;
};

console.log(al(booksResult, sellerIds)[0].filterResult);
