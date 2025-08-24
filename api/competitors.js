import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get all competitors
        const { data: competitors, error: fetchError } = await supabase
          .from('competitors')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        res.json(competitors);
        break;

      case 'POST':
        // Add new competitors (bulk insert)
        const newCompetitors = req.body;
        
        // Check if competitors already exist to avoid duplicates
        const existingNames = await supabase
          .from('competitors')
          .select('name')
          .in('name', newCompetitors.map(c => c.name));

        const existingSet = new Set(existingNames.data?.map(c => c.name) || []);
        const uniqueCompetitors = newCompetitors.filter(c => !existingSet.has(c.name));

        if (uniqueCompetitors.length > 0) {
          const { data, error } = await supabase
            .from('competitors')
            .insert(uniqueCompetitors)
            .select();

          if (error) throw error;
          res.json({ inserted: data.length, competitors: data });
        } else {
          res.json({ inserted: 0, message: 'All competitors already exist' });
        }
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
}
