function buyTransaction(req, res, db, newTransactionHandler){
  const uid = req.user.uid;
  const symbol = req.body.symbol.toUpperCase();
  const amount = req.body.amount;
  const purchasePrice = req.body.value;//use api to get price
  db.ref(`usersData/${uid}/money`).once('value')
    .then((dataMoneySnapshot) => {
      // check if have money to buy stuff
      let money = dataMoneySnapshot.val() || 0;
      let moneyLeft = money - (amount * purchasePrice);
      if(!dataMoneySnapshot.val() || moneyLeft < 0)
        return Promise.all([
          'done',
          {status: "error", message: "not enough money"}
        ])
      // if there is enough money then check if the stocksHolding there exist a stock alread to update amount
      return Promise.all([moneyLeft, db.ref(`stocksHolding/${uid}/${symbol}`).once('value')])
    })
    .then((result) => {
      if(result[0] === 'done') return Promise.all(result);
      // buying and holding then add more to holding
      let moneyLeft = result[0];
      let data = result[1].val();
      let newHolding = null;
      if(data){
        newHolding = Object.assign({}, data);
        // averageprice = (previous.amount*previous.averageprice)+(this.amount*this.averageprice)/totalamount
        let previousTotal = (data.amount*data.averagePrice);
        let currentTotal = (amount*purchasePrice);
        let totalHolding = amount + data.amount;
        newHolding.averagePrice = (previousTotal+currentTotal)/totalHolding;
        newHolding.amount = totalHolding;
      }
      else {
        newHolding = {
          symbol: symbol,
          averagePrice: purchasePrice,
          amount: amount
        };
      }
      const newTransaction = {
          datePurchase: Date.now(),
          symbol: symbol,
          purchasePrice: purchasePrice, //use api to get price
          amount: amount,
          isBought: true
        };
      return Promise.all([
        db.ref(`stocksHolding/${uid}/${symbol}`).set(newHolding),
        db.ref(`usersData/${uid}/money`).set(moneyLeft),
        db.ref(`transactionHistory/${uid}/${newTransaction.datePurchase}`).set(newTransaction)
      ])
    })
    .then((r)=>{
      if(r[0] === 'done') return res.status(400).json(r[1]);
      return res.status(200).json({status:"ok"});
    })
    .catch((err) => {console.log(err); return res.status(500).json({status:"error", error: err})} );
}

module.exports = buyTransaction;
