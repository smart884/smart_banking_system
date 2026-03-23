const { db } = require('../firebase');

const createUser = async (userData) => {
  const userRef = db.collection('users').doc();
  await userRef.set(userData);
  return userRef.id;
};

const findUserByEmail = async (email) => {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).get();
  if (snapshot.empty) {
    return null;
  }
  return snapshot.docs[0].data();
};

module.exports = { createUser, findUserByEmail };
