// function that handles the sell transaction
function sellTransaction(req, res, db, transactionFunction){
  const uid = req.user.uid;
  const symbol = req.body.symbol;
  const amount = req.body.amount;
  const purchasePrice = 10; //use api to get price
  db.ref(`stocksHolding/${uid}/${symbol}`).once('value')
    .then((dataStockSnapshot) => {
      let data = dataStockSnapshot.val();
      if(!data)
        return res.status(400).json({status: 'error', message: 'symbol not found in portfolio'});
      let newHolding = Object.assign({}, data);
      // update amount holding
      newHolding.amount = data.amount - amount;
      // if less then 0 cant sell
      if(newHolding.amount < 0)
        return res.status(400).json({status: 'error', message: 'cannot sell more than own'});
      // if sell evrything then delete the entry
      db.ref(`stocksHolding/${uid}/${symbol}`).set(newHolding.amount === 0 ? null : newHolding);
      // get money update and update and also add new transaction
      db.ref(`usersData/${uid}/money`).once('value')
        .then((dataMoneySnapshot)=>{
          let money = dataMoneySnapshot.val() || 0;
          let moneyUpdate = amount*purchasePrice + money;
          const newTransaction = {
              datePurchase: Date.now(),
              symbol: symbol,
              purchasePrice: purchasePrice, //use api to get price
              amount: amount,
              isBought: false
            };
          return transactionFunction(res, req, uid, newTransaction, moneyUpdate);
        })
        .catch((err) => res.status(400).json({status: 'error', message: 'error in sell/money'}));
    })
    .catch((err) => res.status(400).json({status: 'error', message: 'error in sell/stocksHolding'}));
}

module.exports = sellTransaction;
