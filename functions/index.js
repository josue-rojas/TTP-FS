const functions = require('firebase-functions');
const newUserHandler = require('./newUsers.js');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);
const db = admin.database();


// create new user functions
exports.newUser = functions.auth.user().onCreate((user)=>{
  newUserHandler(user, db);
})


const express = require('express');
const app = express();
const cors = require('cors')({origin: true});
const validateFirebaseIdToken = require('./validate.js');
const sellTransaction = require('./selltransaction.js');
const buyTransaction = require('./buyTransaction.js');
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
// also handles money management
function newTransactionHandler(res, req, uid, newTransaction, moneyLeft){
  db.ref(`usersData/${uid}/money`).set(moneyLeft).then(()=>{
    db.ref(`transactionHistory/${uid}/${newTransaction.datePurchase}`).set(newTransaction)
      .catch((err)=> res.status(500).json({status:"error", message: 'error/newTransactionHandler transaction'}))
    return res.status(200).json({status:"ok"});
  })
  .catch((err)=> res.status(500).json({status:"error usermoney", error: err}));
}

app.post('/user/transactions/buy', (req, res)=>{
  return buyTransaction(req, res, db, newTransactionHandler);
});

app.post('/user/transactions/sell', (req, res)=>{
  return sellTransaction(req, res, db, newTransactionHandler);
});


// endpoints
exports.app = functions.https.onRequest(app);
