// function for buy transaction
function buyTransaction(req, res, db, newTransactionHandler){
  const uid = req.user.uid;
  const symbol = req.body.symbol;
  const amount = req.body.amount;
  const purchasePrice = 10;//use api to get price
  db.ref(`usersData/${uid}/money`).once('value')
    .then((dataMoneySnapshot)=>{
      // check if have money to buy stuff
      let money = dataMoneySnapshot.val() || 0;
      let moneyLeft = money - (amount * purchasePrice);
      if(!dataMoneySnapshot.val() || moneyLeft < 0)
        return res.status(400).json({status: "error", message: "not enough money"});
      // if there is enough money then check if the stocksHolding there exist a stock alread to update amount
      db.ref(`stocksHolding/${uid}/${symbol}`).once('value')
        .then((dataStockSnapshot)=>{
          // buying and holding then add more to holding
          let data = dataStockSnapshot.val();
          if(data){
            let newHolding = Object.assign({}, data);
            // averageprice = (previous.amount*previous.averageprice)+(this.amount*this.averageprice)/totalamount
            let previousTotal = (data.amount*data.averagePrice);
            let currentTotal = (amount*purchasePrice);
            let totalHolding = amount + data.amount;
            newHolding.averagePrice = (previousTotal+currentTotal)/totalHolding;
            newHolding.amount = totalHolding;
            db.ref(`stocksHolding/${uid}/${symbol}`).set(newHolding);
          }
          else {
            let newHolding = {
              symbol: symbol,
              averagePrice: purchasePrice,
              amount: amount
            };
            db.ref(`stocksHolding/${uid}/${symbol}`).set(newHolding);
          }
          const newTransaction = {
              datePurchase: Date.now(),
              symbol: symbol,
              purchasePrice: purchasePrice, //use api to get price
              amount: amount,
              isBought: true
            };
          return newTransactionHandler(res, req, uid, newTransaction, moneyLeft);
        })
        .catch((err) => res.status(500).json({status: "error", error: err}));
    })
    .catch((err) => res.status(500).json({status:"error", error: err}));
}

module.exports = buyTransaction;
