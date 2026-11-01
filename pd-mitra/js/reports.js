const fmt=n=>!n?'-':(n<0?'('+Math.round(-n).toLocaleString('id-ID')+')':Math.round(n).toLocaleString('id-ID'));
const fd=d=>d.split('-').reverse().join('/'), esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const td=(v,c='')=>`<td class="${c}">${v}</td>`, nn=v=>td(fmt(v),'n'), dc=v=>v>0?nn(v)+td('')+'':td('')+nn(-v);
const H=(t,D,sub)=>`<div class="rep-h"><b>PD MITRA</b><br>${t}<br><span class="muted">${sub||'Bulan '+['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][D.meta.bulan]+' '+D.meta.tahun} (dalam Rupiah)</span></div>`;
const T=(h,b)=>`<div class="scroll"><table><thead>${h}</thead><tbody>${b}</tbody></table></div>`;

function viewJournal(book,D,E){const es=E.entries.filter(e=>e.book===book);let b='',rc={};
 es.forEach(e=>e.lines.forEach((l,i)=>{b+=`<tr>${td(i?'':fd(e.date))}${td(i?'':esc(e.no))}${td(i?'':esc(e.desc))}${td(l.a)}${td((l.c&&!l.d?'&emsp;':'')+AN[l.a].n+(l.s?' ('+l.s+')':''))}${nn(l.d)}${nn(l.c)}</tr>`;
  (rc[l.a]=rc[l.a]||{d:0,c:0}).d+=l.d;rc[l.a].c+=l.c}));
 const sd=es.reduce((s,e)=>s+e.lines.reduce((x,l)=>x+l.d,0),0),sk=es.reduce((s,e)=>s+e.lines.reduce((x,l)=>x+l.c,0),0);
 const rb=Object.keys(rc).sort().map(a=>`<tr>${td(a)}${td(AN[a].n)}${nn(rc[a].d)}${nn(rc[a].c)}</tr>`).join('');
 return H(BOOKN[book],D)+(es.length?T('<tr><th>Tanggal<th>No. Bukti<th>Keterangan<th>Ref<th>Akun<th>Debet<th>Kredit</tr>',b+`<tr class=tot>${td('Total','')}<td colspan=4></td>${nn(sd)}${nn(sk)}</tr>`)
  +'<h3 style="margin-top:18px">Rekapitulasi</h3>'+T('<tr><th>Ref<th>Akun<th>Debet<th>Kredit</tr>',rb):'<p class=muted>Belum ada transaksi di jurnal ini.</p>');}

function viewLedger(D,E){let h=H('BUKU BESAR',D);ACCS.forEach(a=>{const L=ledgerOf(E,D,a.c);if(!L.rows.length&&!L.open)return;
 h+=`<h3>${a.c} – ${a.n}</h3>`+T('<tr><th>Tanggal<th>Keterangan<th>No. Bukti<th>Debet<th>Kredit<th>Saldo</tr>',`<tr>${td('')}${td('Saldo awal')}${td('')}${nn(0)}${nn(0)}${nn(L.open)}</tr>`+L.rows.map(r=>`<tr>${td(fd(r.date))}${td(esc(r.desc))}${td(esc(r.no))}${nn(r.d)}${nn(r.c)}${nn(r.b)}</tr>`).join(''))});return h}

function viewSub(D,E){let h=H('BUKU PEMBANTU PIUTANG & UTANG',D);
 [['1-1300','Piutang – ','customers'],['2-1100','Utang – ','suppliers']].forEach(([acc,t,k])=>{let tot=0;D.settings[k].forEach(x=>{const s=subOf(E,D,acc,x.k,D.settings[k]);tot+=s.end;
  h+=`<h3>${t}${x.k} ${x.n}</h3>`+T('<tr><th>Tanggal<th>No.<th>Keterangan<th>Debet<th>Kredit<th>Saldo</tr>',`<tr>${td('')}${td('')}${td('Saldo awal')}${nn(0)}${nn(0)}${nn(s.open)}</tr>`+s.rows.map(r=>`<tr>${td(fd(r.date))}${td(esc(r.no))}${td(esc(r.desc))}${nn(r.d)}${nn(r.c)}${nn(r.b)}</tr>`).join(''))});
  h+=`<p><b>Daftar saldo ${acc==='1-1300'?'piutang':'utang'}: ${fmt(tot)}</b></p>`});return h}

function viewInv(D,E){let h=H('KARTU PERSEDIAAN (FIFO – Perpetual)',D);ITEMS.forEach(i=>{const o=D.settings.inv[i.k];
 h+=`<h3>${i.k} – ${i.n}</h3>`+T('<tr><th>Tanggal<th>No.<th>Keterangan<th>Masuk (unit)<th>Harga<th>Jumlah<th>Keluar (unit)<th>Harga<th>Jumlah<th>Saldo unit<th>Saldo Rp</tr>',
  `<tr>${td('')}${td('')}${td('Saldo awal')}<td colspan=6></td>${nn(o.q)}${nn(o.q*o.p)}</tr>`+E.inv[i.k].rows.map(r=>`<tr>${td(fd(r.date))}${td(esc(r.no))}${td(esc(r.desc))}${nn(r.iq)}${nn(r.ip)}${nn(r.iq*r.ip)}${nn(r.oq)}${nn(r.op)}${nn(r.oq*r.op)}${nn(r.bq)}${nn(r.ba)}</tr>`).join(''))});return h}

function viewTB(D,E,mode){const r=report(D,E),k=mode==='ns'?'ns':'s';let b='',a=0,c=0;
 r.rows.forEach(x=>{const v=x[k];b+=`<tr>${td(x.c)}${td(x.n)}${mode==='ns'?dc(x.o)+nn(x.md)+nn(x.mc):''}${dc(v)}</tr>`;v>0?a+=v:c-=v});
 const cs=mode==='ns'?6:0;return H(mode==='ns'?'NERACA SALDO':'NERACA SALDO SETELAH PENYESUAIAN (NSSP)',D)+T(`<tr><th>Kode<th>Akun${mode==='ns'?'<th colspan=2>Neraca Percobaan<th>Mutasi D<th>Mutasi K':''}<th>Debet<th>Kredit</tr>`,b+`<tr class=tot><td colspan=${2+cs}>Total</td>${nn(a)}${nn(c)}</tr>`)}

function viewLajur(D,E){const r=report(D,E);let b='',S=Array(14).fill(0);
 const add=(i,v)=>{S[i*2+(v>0?0:1)]+=Math.abs(v)};
 r.rows.forEach(x=>{const rl=x.c[0]>='4'?x.s:0,nr=x.c[0]<'4'?x.s:0,vals=[x.o,x.md-x.mc,x.ns,x.j,x.s,rl,nr];
  vals.forEach((v,i)=>{if(v)add(i,v)});b+=`<tr>${td(x.c)}${td(x.n)}${vals.map(dc).join('')}</tr>`});
 const p=r.profit;b+=`<tr class=tot>${td('')}${td('Total')}${S.map(nn).join('')}</tr><tr class=tot>${td('')}${td(p>=0?'Laba bersih':'Rugi bersih')}<td colspan=10></td>${p>=0?nn(p)+td('')+td('')+nn(p):td('')+nn(-p)+nn(-p)+td('')}</tr>`;
 return H('NERACA LAJUR',D)+T('<tr><th rowspan=2>Kode<th rowspan=2>Akun'+['Neraca Percobaan','Mutasi','Neraca Saldo','AJP','NSSP','Rugi Laba','Neraca'].map(x=>`<th colspan=2>${x}`).join('')+'</tr><tr>'+'<th>D<th>K'.repeat(7)+'</tr>',b)}

const L2=(t,v,b)=>`<tr${b?' class=tot':''}>${td(t)}${nn(v)}</tr>`;
function viewLR(D,E){const r=report(D,E),v=r.v;const sales=v('4-1100'),net=sales-v('4-1200')-v('4-1300')+v('4-1400'),cg=v('5-1100')+v('5-1200')-v('5-1300'),gp=net-cg;
 const ox=ACCS.filter(a=>a.c[0]==='6').map(a=>[a.n,v(a.c)]).filter(x=>x[1]),ot=ox.reduce((s,x)=>s+x[1],0),oth=v('7-1100')-v('8-1100')-v('8-1200'),ebt=gp-ot+oth;
 return H('LAPORAN LABA RUGI',D,'(Year-to-date)')+T('<tr><th>Keterangan<th>Jumlah</tr>',L2('Sales',sales)+L2('Sales Retur',-v('4-1200'))+L2('Sales Discount',-v('4-1300'))+L2('Freight Collected',v('4-1400'))+L2('Penjualan bersih',net,1)
  +L2('Harga pokok penjualan (HPP + freight − potongan pembelian)',-cg)+L2('Laba kotor',gp,1)+ox.map(x=>L2(x[0],-x[1])).join('')+L2('Total beban operasi',-ot,1)
  +L2('Pendapatan bunga',v('7-1100'))+L2('Beban bunga',-v('8-1100'))+L2('Beban administrasi bank',-v('8-1200'))+L2('Laba sebelum pajak',ebt,1)+L2('Beban pajak penghasilan',-v('8-1300'))+L2('LABA BERSIH',ebt-v('8-1300'),1))}
function viewEk(D,E){const r=report(D,E),v=r.v,cap=v('3-1100'),dr=v('3-1200');return H('LAPORAN PERUBAHAN EKUITAS',D,'(Year-to-date)')+T('<tr><th>Keterangan<th>Jumlah</tr>',L2('Modal awal – Ruchdiana Capital',cap)+L2(r.profit>=0?'Laba bersih':'Rugi bersih',r.profit)+L2('Prive – Ruchdiana Drawing',-dr)+L2('MODAL AKHIR',cap+r.profit-dr,1))}
function viewNr(D,E){const r=report(D,E),by=r.by;const g=p=>r.rows.filter(x=>x.c[0]===p);const av=x=>x.s,lv=x=>-x.s;
 const A=g('1'),Li=g('2'),ta=A.reduce((s,x)=>s+av(x),0),tl=Li.reduce((s,x)=>s+lv(x),0),eq=(by['3-1100']?-by['3-1100'].s:0)+r.profit-(by['3-1200']?by['3-1200'].s:0);
 return H('NERACA',D,'Per akhir periode')+T('<tr><th colspan=2>AKTIVA<th colspan=2>PASSIVA</tr>',`<tr><td colspan=2 style="vertical-align:top;padding:0">${T('',A.map(x=>`<tr>${td(x.n)}${nn(av(x))}</tr>`).join(''))}</td><td colspan=2 style="vertical-align:top;padding:0">${T('',Li.map(x=>`<tr>${td(x.n)}${nn(lv(x))}</tr>`).join('')+L2('Modal akhir – Ruchdiana',eq))}</td></tr><tr class=tot>${td('Total aktiva')}${nn(ta)}${td('Total passiva')}${nn(tl+eq)}</tr>`)+(Math.abs(ta-tl-eq)>1?'<p class=err>Neraca tidak seimbang – periksa transaksi.</p>':'<p class=muted>✔ Neraca seimbang.</p>')}
