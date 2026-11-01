const sb = supabase.createClient(APP_CONFIG.SUPABASE_URL, APP_CONFIG.SUPABASE_ANON_KEY);
const DB = {
  async list(){ const {data,error}=await sb.from('projects').select('id,name,updated_at').order('updated_at',{ascending:false}); if(error) throw error; return data; },
  async get(id){ const {data,error}=await sb.from('projects').select('*').eq('id',id).single(); if(error) throw error; return data; },
  async create(name,d){ const {data,error}=await sb.from('projects').insert({name,data:d}).select().single(); if(error) throw error; return data; },
  async save(id,name,d){ const {error}=await sb.from('projects').update({name,data:d,updated_at:new Date().toISOString()}).eq('id',id); if(error) throw error; },
  async remove(id){ const {error}=await sb.from('projects').delete().eq('id',id); if(error) throw error; }
};
const mailOf = u => u.toLowerCase().replace(/[^a-z0-9._-]/g,'') + '@akuntan.app';
