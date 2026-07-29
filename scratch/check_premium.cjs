const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fnrrxofmvyamgbspypok.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucnJ4b2ZtdnlhbWdic3B5cG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NzU2ODIsImV4cCI6MjA5MzQ1MTY4Mn0.Dyn05z0kZnjaCaWao1lMXcNuUXcl3W-4yGzg9qb0Ik4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPremium() {
  console.log('=== Premium User Stats ===\n');

  // 1. Currently premium users
  const { data: premiumUsers, error: e1 } = await supabase
    .from('profiles')
    .select('id, email, full_name, is_premium, premium_expiry_date, created_at')
    .eq('is_premium', true);

  if (e1) {
    console.error('Error fetching premium users:', e1.message);
  } else {
    console.log(`Currently Premium Users: ${premiumUsers.length}`);
    premiumUsers.forEach(u => {
      const expiry = u.premium_expiry_date ? new Date(u.premium_expiry_date).toLocaleDateString() : 'No expiry';
      console.log(`  - ${u.full_name || 'No Name'} (${u.email}) | Expiry: ${expiry}`);
    });
  }

  // 2. All approved payment requests (users who ever bought premium)
  const { data: approvedPayments, error: e2 } = await supabase
    .from('payment_requests')
    .select('id, user_email, plan_name, plan_price, status, created_at')
    .eq('status', 'approved');

  if (e2) {
    console.error('Error fetching approved payments:', e2.message);
  } else {
    const uniqueBuyers = [...new Set(approvedPayments.map(p => p.user_email))];
    console.log(`\nTotal Approved Payments (all time): ${approvedPayments.length}`);
    console.log(`Unique Users Who Bought Premium (all time): ${uniqueBuyers.length}`);
    const totalRevenue = approvedPayments.reduce((sum, p) => sum + (p.plan_price || 0), 0);
    console.log(`Total Revenue: Rs. ${totalRevenue.toLocaleString()}`);
    console.log('\nPayment History:');
    approvedPayments.forEach(p => {
      console.log(`  - ${p.user_email} | ${p.plan_name || 'N/A'} | Rs. ${p.plan_price || 0} | ${new Date(p.created_at).toLocaleDateString()}`);
    });
  }

  // 3. All payment requests (for full picture)
  const { data: allPayments, error: e3 } = await supabase
    .from('payment_requests')
    .select('status');

  if (!e3) {
    const pending = allPayments.filter(p => p.status === 'pending').length;
    const approved = allPayments.filter(p => p.status === 'approved').length;
    const rejected = allPayments.filter(p => p.status === 'rejected').length;
    console.log(`\n=== Payment Request Breakdown ===`);
    console.log(`  Pending:  ${pending}`);
    console.log(`  Approved: ${approved}`);
    console.log(`  Rejected: ${rejected}`);
    console.log(`  Total:    ${allPayments.length}`);
  }

  // 4. Total users for context
  const { count, error: e4 } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (!e4) {
    console.log(`\nTotal Registered Users: ${count}`);
  }
}

checkPremium().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
