const $=s=>document.querySelector(s), V=$('#view');
let proj=null, user=null, editing=null, saveT;
const TABS=[['input','Input'],['daftar','Transaksi'],['CPJ','BKK'],['CRJ','BKM'],['PJ','JPBK'],['SJ','JPJK'],['GJ','JM'],['PC','Kas Kecil'],['AJP','AJP'],['bb','Buku Besar'],['sub','Buku Pembantu'],['ic','Kartu Persediaan'],['ns','Neraca Saldo'],['nl','Neraca Lajur'],['nssp','NSSP'],['lr','Laba Rugi'],['ek','Ekuitas'],['nr','Neraca'],['awal','Saldo Awal']];
const BLN=['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const fail=e=>{V.innerHTML=`<div class="card err">Terjadi kesalahan: ${esc(e.message||e)}<br><span class=muted>Pastikan js/config.js dan supabase/schema.sql sudah disiapkan.</span></div>`};

(async()=>{const {data}=await sb.auth.getSession(); if(!data.session) return location.href='index.html';
  user=data.session.user; $('#who').textContent='👤 '+(user.user_metadata.username||'Profil');
  addEventListener('hashchange',route); route();})();

async function route(){try{const m=(location.hash.slice(1)||'/').split('/');
  if(m[1]==='p') return await openProject(m[2],m[3]||'input');
  proj=null; if(m[1]==='help') return help(); if(m[1]==='profile') return profile(); await menu();}catch(e){fail(e)}}

async function menu(){const L=await DB.list();
  V.innerHTML=`<h2>Riwayat proyek akuntansi</h2><div class=grid>${L.map(p=>`<div class="card proj" data-id="${p.id}"><b>${esc(p.name)}</b><br><span class=muted>Diubah ${new Date(p.updated_at).toLocaleDateString('id-ID')}</span><br><br><button class="btn alt red noprint" data-del="${p.id}" style="color:#fff">Hapus</button></div>`).join('')}
  <div class="card proj add" id="new">＋ Proyek baru</div></div>${L.length?'':'<p class=muted>Belum ada proyek. Buat proyek bulanan pertama Anda.</p>'}`;
  V.querySelectorAll('[data-id]').forEach(e=>e.onclick=()=>location.hash=`#/p/${e.dataset.id}/input`);
  V.querySelectorAll('[data-del]').forEach(b=>b.onclick=async ev=>{ev.stopPropagation();if(confirm('Hapus proyek ini?')){await DB.remove(b.dataset.del);menu()}});
  $('#new').onclick=newProject;}

function newProject(){V.innerHTML=`<div class=card style="max-width:420px"><h3>Proyek baru</h3><label>Bulan<select id=nb>${BLN.slice(1).map((b,i)=>`<option value=${i+1}>${b}`)}</select></label><label>Tahun<input id=ny type=number value=${new Date().getFullYear()}></label><button class=btn id=ok>Buat</button> <button class="btn alt" onclick="location.hash='#/'">Batal</button></div>`;
  $('#nb').value=new Date().getMonth()+1;
  $('#ok').onclick=async()=>{const b=+$('#nb').value,y=+$('#ny').value;try{const p=await DB.create(`Laporan ${BLN[b]} ${y}`,defaultData(b,y));location.hash=`#/p/${p.id}/input`}catch(e){fail(e)}}}

async function openProject(id,tab){if(!proj||proj.id!==id){const r=await DB.get(id);proj={id:r.id,name:r.name,data:r.data};}
  const D=proj.data,E=compute(D);let body='';
  const B={CPJ:1,CRJ:1,PJ:1,SJ:1,GJ:1,PC:1,AJP:1};
  if(tab==='input')body=inputView(); else if(tab==='daftar')body=listView(D); else if(B[tab])body=viewJournal(tab,D,E); else if(tab==='bb')body=viewLedger(D,E);
  else if(tab==='sub')body=viewSub(D,E); else if(tab==='ic')body=viewInv(D,E); else if(tab==='ns')body=viewTB(D,E,'ns'); else if(tab==='nssp')body=viewTB(D,E,'s');
  else if(tab==='nl')body=viewLajur(D,E); else if(tab==='lr')body=viewLR(D,E); else if(tab==='ek')body=viewEk(D,E); else if(tab==='nr')body=viewNr(D,E); else if(tab==='awal')body=awalView(D);
  V.innerHTML=`<h2>${esc(proj.name)}</h2><div class=ptabs>${TABS.map(([k,n])=>`<a href="#/p/${id}/${k}" class="${k===tab?'on':''}">${n}</a>`).join('')}</div>
   ${E.warn.length?`<div class=warn><b>Perhatian:</b><br>${E.warn.map(esc).join('<br>')}</div>`:''}<div class=card>${body}${tab==='input'||tab==='daftar'||tab==='awal'?'':'<p class=noprint><button class="btn alt" onclick="print()">🖨 Cetak / PDF</button></p>'}</div>`;
  if(tab==='input')bindInput(); if(tab==='daftar')bindList(); if(tab==='awal')bindAwal();}

function persist(){clearTimeout(saveT);return DB.save(proj.id,proj.name,proj.data)}

function inputView(){const t=editing?proj.data.txs.find(x=>x.id===editing):null;
  return `<h3>${t?'Edit':'Input'} dokumen transaksi</h3><div class=grid>
  <label>Jenis dokumen<select id=fType>${Object.entries(TYPES).map(([k,v])=>`<option value=${k}>${v}`).join('')}</select></label>
  <label>Nomor dokumen<input id=fNo placeholder="mis. BKK12-1, F12-1"></label>
  <label>Tanggal<input type=date id=fDate value="${proj.data.meta.tahun}-${String(proj.data.meta.bulan).padStart(2,'0')}-01"></label>
  <label>Bentuk transaksi<select id=fKind></select></label></div><div id=fFields class=grid></div>
  <label>Keterangan (opsional, mengganti keterangan otomatis)<input id=fKet></label>
  <button class=btn id=fAdd>${t?'Simpan perubahan':'Tambah ke jurnal'}</button> ${t?'<button class="btn alt" id=fCancel>Batal</button>':'<button class="btn alt" id=fSample>Muat contoh Desember 2016</button>'}<p id=fMsg class=muted></p>`;}
function bindInput(){const D=proj.data,t=editing?D.txs.find(x=>x.id===editing):null;
  const kinds=()=>{$('#fKind').innerHTML=Object.entries(KINDS[$('#fType').value]).map(([k,v])=>`<option value=${k}>${v[0]}`).join('');fields()};
  const fields=()=>{$('#fFields').innerHTML=KINDS[$('#fType').value][$('#fKind').value][1].map(x=>fieldHTML(x,D)).join('')};
  $('#fType').onchange=kinds;$('#fKind').onchange=fields;kinds();
  if(t){$('#fType').value=t.type;kinds();$('#fKind').value=t.kind;fields();$('#fNo').value=t.no;$('#fDate').value=t.date;$('#fKet').value=t.f.ket||'';
    document.querySelectorAll('[data-n]').forEach(e=>e.value=t.f[e.dataset.n]??e.value);}
  $('#fAdd').onclick=async()=>{const no=$('#fNo').value.trim(),date=$('#fDate').value;if(!no||!date)return $('#fMsg').textContent='Nomor dan tanggal wajib diisi.';
    const f={ket:$('#fKet').value.trim()};document.querySelectorAll('[data-n]').forEach(e=>f[e.dataset.n]=e.value);
    const tx={id:t?t.id:crypto.randomUUID(),type:$('#fType').value,no,date,kind:$('#fKind').value,f};
    if(t)D.txs[D.txs.indexOf(t)]=tx;else D.txs.push(tx);editing=null;await persist().catch(fail);
    if(t)location.hash=`#/p/${proj.id}/daftar`;else{$('#fMsg').textContent=`✔ ${no} ditambahkan (${D.txs.length} dokumen).`;$('#fNo').value='';}};
  if($('#fCancel'))$('#fCancel').onclick=()=>{editing=null;location.hash=`#/p/${proj.id}/daftar`};
  if($('#fSample'))$('#fSample').onclick=async()=>{if(D.txs.length&&!confirm('Tambahkan contoh ke dokumen yang sudah ada?'))return;D.txs.push(...SAMPLE.map(x=>({...x,id:crypto.randomUUID()})));await persist();openProject(proj.id,'daftar')};}

function listView(D){const rows=[...D.txs].sort((a,b)=>a.date.localeCompare(b.date));
  return `<h3>Dokumen transaksi (${rows.length})</h3>`+T('<tr><th>Tanggal<th>No.<th>Jenis<th>Bentuk<th></tr>',rows.map(x=>`<tr>${td(fd(x.date))}${td(esc(x.no))}${td(x.type)}${td(KINDS[x.type]?.[x.kind]?.[0]||x.kind)}<td><button class="btn alt" data-e="${x.id}">Edit</button> <button class="btn alt" data-x="${x.id}">Hapus</button></td></tr>`).join(''));}
function bindList(){V.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{editing=b.dataset.e;location.hash=`#/p/${proj.id}/input`});
  V.querySelectorAll('[data-x]').forEach(b=>b.onclick=async()=>{if(!confirm('Hapus dokumen ini?'))return;proj.data.txs=proj.data.txs.filter(x=>x.id!==b.dataset.x);await persist();openProject(proj.id,'daftar')})}

function awalView(D){return `<h3>Saldo awal & master data</h3><p class=muted>Berisi neraca saldo awal (Rupiah; debet positif, kredit negatif), daftar customer/supplier beserta saldo awal, dan persediaan awal. Default: PD MITRA per 30 November 2016.</p><textarea id=aw rows=18 style="font-family:monospace">${esc(JSON.stringify(D.settings,null,1))}</textarea><p><button class=btn id=awS>Simpan</button> <span id=awM class=muted></span></p>`}
function bindAwal(){$('#awS').onclick=async()=>{try{proj.data.settings=JSON.parse($('#aw').value);await persist();$('#awM').textContent='✔ Tersimpan'}catch(e){$('#awM').textContent='JSON tidak valid: '+e.message}}}

function help(){V.innerHTML=`<div class=card><h2>Bantuan</h2><ol><li>Buat <b>proyek baru</b> per bulan di menu Proyek.</li><li>Di tab <b>Input</b>: pilih jenis dokumen (BKK/BKM/JPBK/JPJK/JM), isi nomor dokumen, tanggal, lalu bentuk transaksinya.</li><li>Jurnal khusus, buku besar, buku pembantu, kartu persediaan (FIFO), neraca saldo, neraca lajur, laporan terbentuk otomatis di tab preview.</li><li>HPP dihitung otomatis dari FIFO saat penjualan; PPN 10% dihitung otomatis.</li><li>Jika bentuk transaksi tidak tersedia, pilih <b>Lainnya (manual)</b>.</li><li>Tab <b>Saldo Awal</b> untuk mengubah neraca saldo awal dan master customer/supplier.</li></ol></div>`}
function profile(){V.innerHTML=`<div class=card style="max-width:420px"><h2>Profil</h2><p>Username: <b>${esc(user.user_metadata.username||'-')}</b></p><label>Password baru<input id=np type=password></label><button class=btn id=cp>Ubah password</button> <button class="btn alt" id=lo>Keluar</button><p id=pm class=muted></p></div>`;
  $('#cp').onclick=async()=>{const r=await sb.auth.updateUser({password:$('#np').value});$('#pm').textContent=r.error?r.error.message:'✔ Password diubah'};
  $('#lo').onclick=async()=>{await sb.auth.signOut();location.href='index.html'}}
