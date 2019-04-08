// function hanndles when new user get's created
function newUserHandler(user, db){
  const uid = user.uid;
  db.ref(`usersData/${uid}`).set({ money: 5000 },
    ()=>{ return 'done' });
}

module.exports = newUserHandler;
