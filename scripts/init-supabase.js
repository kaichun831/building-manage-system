// node scripts/init-supabase.js
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function initData() {
  // 建立 admin 帳號（若已存在則跳過）
  const { data: existing } = await supabase.from('users').select('id').eq('email', 'admin').single();
  if (!existing) {
    const hashedPassword = await bcrypt.hash('password', 10);
    await supabase.from('users').insert({
      email: 'admin', password: hashedPassword,
      name: '系統管理員', unit: 'ADMIN', role: 'admin'
    });
    console.log('✅ admin 帳號建立完成（帳號: admin / 密碼: password）');
  } else {
    console.log('⚠️  admin 帳號已存在，跳過建立');
  }

  // 初始公告（若無資料則建立）
  const { data: anns } = await supabase.from('announcements').select('id').limit(1);
  if (!anns || anns.length === 0) {
    await supabase.from('announcements').insert({
      title: '歡迎使用大廈管理系統',
      content: '本系統提供住戶線上服務，包含議題提報、公告查詢等功能。'
    });
    console.log('✅ 初始公告建立完成');
  }

  console.log('\nSupabase 初始化完成！');
  process.exit(0);
}

initData().catch(err => {
  console.error('初始化失敗:', err.message);
  process.exit(1);
});
