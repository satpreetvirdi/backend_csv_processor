// supabaseClient.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://cutwrjgqqgejxhdchmdf.supabase.co"
const supabaseKey = process.env.SUPABASE_ANON_KEY; // Replace with your anon key

const supabase = createClient(supabaseUrl, supabaseKey);
console.log("Supabase client created");
module.exports = supabase;
