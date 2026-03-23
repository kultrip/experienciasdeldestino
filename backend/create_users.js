import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const users = [
  {
    email: 'charles.santana@gmail.com',
    password: '123456',
    role: 'delegado',
    province: 'Madrid',
    full_name: 'Charles Santana Delegado'
  },
  {
    email: 'charles.santana@edreamsodigeo.com',
    password: '123456',
    role: 'productor',
    province: 'Madrid',
    full_name: 'Charles Santana Productor'
  }
];

async function createOrUpdateUser(userData) {
  const { email, password, role, province, full_name } = userData;
  console.log(`\n--- Processing: ${email} ---`);

  // Check if user exists in auth
  const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const existingUser = existingUsers.users.find(u => u.email === email);

  if (existingUser) {
    console.log(`User ${email} exists in auth (id: ${existingUser.id}). Updating password...`);
    
    // Update password and confirm email
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      existingUser.id,
      { password: password, email_confirm: true }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      return;
    }
    
    console.log(`✅ Password updated for ${email}`);

    // Check/update profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', existingUser.id)
      .maybeSingle();

    if (!profile) {
      console.log('Creating profile...');
      const { error: insertError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          user_id: existingUser.id,
          email: email,
          role: role,
          province: province,
          full_name: full_name
        });
      
      if (insertError) {
        console.error('Error creating profile:', insertError);
      } else {
        console.log(`✅ Profile created for ${email}`);
      }
    } else {
      console.log(`✅ Profile already exists: role=${profile.role}, province=${profile.province}`);
    }

  } else {
    console.log(`User ${email} does not exist. Creating new user...`);
    
    // Create new user with password
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: full_name }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return;
    }

    console.log(`✅ User created: ${newUser.user.id}`);

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        user_id: newUser.user.id,
        email: email,
        role: role,
        province: province,
        full_name: full_name
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    } else {
      console.log(`✅ Profile created for ${email}`);
    }
  }
}

async function main() {
  console.log('Creating/updating users with password 123456...\n');
  
  for (const user of users) {
    await createOrUpdateUser(user);
  }
  
  console.log('\n✅ Done! Users can now login with password: 123456');
}

main().catch(console.error);
