const functions = require('firebase-functions');
const newUserHandler = require('./newUsers.js');
const admin = require('firebase-admin');
const validateFirebaseIdToken = require('./validate.js');

admin.initializeApp(functions.config().firebase);
const db = admin.database();


// create new user functions
exports.newUser = functions.auth.user().onCreate((user)=>{
  newUserHandler(user, db);
})


const express = require('express');
const app = express();
const cors = require('cors')({origin: true});
const bodyParser = require('body-parser');
app.use( bodyParser.json() );
app.use((req, res, next)=>{
  validateFirebaseIdToken(req, res, next, admin);
});

app.get('/user/money', (req, res)=>{
  const uid = req.user.uid;
  db.ref(`usersData/${uid}/money`).once('value')
    .then((dataSnapshot)=>{
      if(!dataSnapshot.val()) {
        return res.status(500).json({status: "error", message: "no data"});
        // should set money if there isnt for some reason
      }
      return res.send({money: dataSnapshot.val()});
    })
    .catch((err)=> res.status(500).json({status: "error", error: err}));
});

app.get('/user/transactions', (req, res)=>{
  const uid = req.user.uid;
  db.ref(`transactionHistory/${uid}`).once('value')
    .then((dataSnapshot)=>{
      if(!dataSnapshot.val()) {
        return res.status(500).json({status: "error", message: "no data"});
      }
      return res.send(dataSnapshot.toJSON());
    })
    .catch((err)=>res.status(500).json({status: "error", error: err}));
});

app.get('/user/holding', (req, res)=>{
  const uid = req.user.uid;
  db.ref(`stocksHolding/${uid}`).once('value')
    .then((dataSnapshot)=>{
      if(!dataSnapshot.val()){
        return res.status(500).json({status: "error", message: "no data"});
      }
      return res.send(dataSnapshot.toJSON());
    })
    .catch((err)=> res.status(500).json({status: "error", error: err}));
});

// just add a new transaction to the history and sends responce
function newTransactionHandler(res, req, uid, newTransaction){
  db.ref(`transactionHistory/${uid}/${newTransaction.datePurchase}`).set(newTransaction)
    .then(()=>{
      return res.status(200).json({status:"ok"});
    })
    .catch((err)=> res.status(500).json({status:"error", error: err}));
}

app.post('/user/transactions/buy', (req, res)=>{
  const uid = req.user.uid;
  const symbol = req.body.symbol;
  const amount = req.body.amount;
  const purchasePrice = 10;//use api to get price
  db.ref(`stocksHolding/${uid}/${symbol}`).once('value')
  .then((dataSnapshot)=>{
    // buying and holding then add more to holding
    let data = dataSnapshot.val();
    if(data){
      let newHolding = data.slice();
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
    return newTransactionHandler(res, req, uid, newTransaction);
  })
  .catch((err)=>{
    return res.status(500).json({status: "error", err});
  });
});

app.post('/user/transaction/sell', (req, res)=>{
  const uid = req.user.uid;
  const symbol = req.body.symbol;
  const datePurchase = Date.now();
  const amount = req.body.amount;
  const purchasePrice = 20; //use api to get price
  db.ref(`stocksHolding/${uid}/${symbol}`).once('value')
  .then((dataSnapshot)=>{
    let data = dataSnapshot.val();
    if(!data){
      return res.status(400).json({status:"error", message: 'no symbol found in portfolio'});
    }
    let newHolding = data.slice();
    // update amount holding
    newHolding.amount = data.amount - amount;
    if(newHolding.amount < 0){
      return res.status(400).json({status:"error", message: 'cannot sell more than own'});
    }
    else if(newHolding.amount === 0){
      newHolding = null; //delete the stock if it 0 holding
    }
    db.ref(`stocksHolding/${uid}/${symbol}`).set(newHolding);
    newHolding.isBought = true;
    return newTransaction(res, req, uid, newHolding);
  })
  .catch((err)=>{
    return res.status(500).json({status: "error", err});
  });
});


// endpoints
exports.app = functions.https.onRequest(app);
