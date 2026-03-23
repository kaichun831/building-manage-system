// 執行此腳本來初始化 Firebase 資料
// node scripts/init-firebase.js

require('dotenv').config({ path: '.env.local' });

const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function initData() {
  // 建立 admin 帳號（若已存在則跳過）
  const adminSnapshot = await db.collection('users').where('email', '==', 'admin').get();
  if (adminSnapshot.empty) {
    const hashedPassword = await bcrypt.hash('password', 10);
    await db.collection('users').add({
      email: 'admin',
      password: hashedPassword,
      name: '系統管理員',
      unit: 'ADMIN',
      role: 'admin',
      createdAt: new Date()
    });
    console.log('✅ admin 帳號建立完成（帳號: admin / 密碼: password）');
  } else {
    console.log('⚠️  admin 帳號已存在，跳過建立');
  }
  console.log('\nFirebase 初始化完成！');
  process.exit(0);
}

initData().catch(err => {
  console.error('初始化失敗:', err);
  process.exit(1);
});
