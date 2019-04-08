// check if user is holding stock
// then if do own check if you can sell (has enought to sell amount)
// if can sell then update money, transaction, and holding
function sellTransaction(req, res, db, transactionFunction){
  const uid = req.user.uid;
  const symbol = req.body.symbol;
  const amount = req.body.amount;
  const purchasePrice = 10; //use api to get price
  db.ref(`stocksHolding/${uid}/${symbol}`).once('value')
    .then((dataStockSnapshot) => {
      let data = dataStockSnapshot.val();
      if(!data)
        return Promise.all([
          'done',
          {status: 'error', message: 'symbol not found in portfolio'}
        ])
      let newHolding = Object.assign({}, data);
      // update amount holding
      newHolding.amount = data.amount - amount;
      // if less then 0 cant sell
      if(newHolding.amount < 0)
      return Promise.all([
        'done',
        {status: 'error', message: 'cannot sell more than own'}
      ])
      const newTransaction = {
          datePurchase: Date.now(),
          symbol: symbol,
          purchasePrice: purchasePrice, //use api to get price
          amount: amount,
          isBought: false
        };
      return Promise.all([
        newTransaction,
        db.ref(`usersData/${uid}/money`).once('value'),
        db.ref(`stocksHolding/${uid}/${symbol}`).set(newHolding.amount === 0 ? null : newHolding)
      ])
    })
    .then((results) => {
      if(results[0] === 'done') return results;
      const newTransaction = results[0];
      let money = results[1].val() || 0;
      let moneyUpdate = amount*purchasePrice + money;
      return Promise.all([
        db.ref(`usersData/${uid}/money`).set(moneyUpdate),
        db.ref(`transactionHistory/${uid}/${newTransaction.datePurchase}`).set(newTransaction)
      ]);
    })
    .then((r)=>{
      if(r[0] === 'done') return res.status(400).json(r[1]);
      return res.status(200).json({status:"ok"});
    })
    .catch((err) => res.status(400).json({status: 'error', message: 'error in sell/stocksHolding', err}));
}

module.exports = sellTransaction;
