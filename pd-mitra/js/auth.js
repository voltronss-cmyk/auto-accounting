const $=s=>document.querySelector(s); let mode='login';
(async()=>{ const {data}=await sb.auth.getSession(); if(data.session) location.href='app.html'; })();
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{
  mode=b.dataset.m; document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x===b));
  $('#go').textContent = mode==='login'?'Masuk':'Daftar'; $('#pw2w').hidden = mode==='login'; $('#msg').textContent='';
});
$('#f').onsubmit=async e=>{ e.preventDefault(); const u=$('#u').value.trim(), p=$('#p').value, m=$('#msg'); m.textContent='';
  if(!/^[a-zA-Z0-9._-]{3,}$/.test(u)) return m.textContent='Username minimal 3 karakter (huruf, angka, . _ -).';
  if(p.length<6) return m.textContent='Password minimal 6 karakter.';
  if(mode==='register' && p!==$('#p2').value) return m.textContent='Konfirmasi password tidak sama.';
  const r = mode==='login' ? await sb.auth.signInWithPassword({email:mailOf(u),password:p})
                           : await sb.auth.signUp({email:mailOf(u),password:p,options:{data:{username:u}}});
  if(r.error) return m.textContent = r.error.message.includes('Invalid login')?'Username atau password salah.':r.error.message;
  if(!r.data.session) return m.textContent='Akun dibuat. Matikan "Confirm email" di Supabase lalu masuk.';
  location.href='pd-mitra/app.html';
};
