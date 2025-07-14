
const { createClient } = require('@supabase/supabase-js');
const supabase = require('../supabase');

// Create an admin client for user lookup (service role key)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function register(email, password) {
  // 1. Lookup user by email using admin client
  const { data: users, error: lookupError } = await supabaseAdmin.auth.admin.listUsers({ email });
  if (lookupError) {
    throw new Error('Error looking up user.');
  }
  const user = users?.users?.[0];
  if (user) {
    throw new Error('A user with this email already exists.');
  }

  // 2. Proceed with normal sign up
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function login(email, password) {
  // 1. Lookup user by email using admin client
  const { data: users, error: lookupError } = await supabaseAdmin.auth.admin.listUsers({ email });
  if (lookupError) {
    throw new Error('Error looking up user.');
  }
  const user = users?.users?.[0];
  if (user && !user.email_confirmed_at) {
    throw new Error('Please verify your email before logging in.');
  }

  // 2. Proceed with normal sign in (even if user does not exist)
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}

module.exports = {
  register,
  login,
};
