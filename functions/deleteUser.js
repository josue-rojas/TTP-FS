function deleteUserHandler(user, db){
  const uid = user.uid;
  console.log('gonna delete stuff');
  db.ref(`usersData/${uid}`).set(null);
  db.ref(`transactionHistory/${uid}`).set(null);
  db.ref(`stocksHolding/${uid}`).set(null);
  return `done`;
}

module.exports = deleteUserHandler;
