require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('user_id, email, full_name, role, password_hash')
    .limit(2);

  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('Users in database:', data.length);
    data.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
      console.log(`  Hash preview: ${user.password_hash.substring(0, 20)}...`);
    });
  }
}

checkUsers();
