const { db } = require('../firebase');

const createUser = async (userData) => {
  const userRef = db.collection('users').doc();
  const newUser = {
    id: userRef.id,
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await userRef.set(newUser);
  return newUser;
};

const getUserByEmail = async (email) => {
  const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].data();
};

const getUserById = async (id) => {
  const doc = await db.collection('users').doc(id).get();
  if (!doc.exists) return null;
  return doc.data();
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById
};
