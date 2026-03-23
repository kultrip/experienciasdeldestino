import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updatePrice() {
  const experienceId = '4ea74a02-72e9-4e6e-87f6-998ca4a54945';
  
  const { data, error } = await supabase
    .from('experiences')
    .update({ 
      price_numeric: 50,
      price_per_person: 50,
      price: '50€ por persona'
    })
    .eq('id', experienceId)
    .select();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Updated:', data);
  }
}

updatePrice();
