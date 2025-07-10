
const { createClient } = require('@supabase/supabase-js'); // Correctly import from the library
const supabase = require('../supabase');


async function isAuthenticated(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  // Validate the token and get the user
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  req.user = user;
  // Create a new Supabase client scoped to the user's request
  // This ensures all subsequent database calls in this request respect RLS
  req.supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  next();
}

module.exports = {
  isAuthenticated,
};
