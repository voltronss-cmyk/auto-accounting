// Mesin akuntansi: dokumen transaksi -> jurnal khusus, buku besar, persediaan FIFO, neraca lajur, laporan.
const DEFAULT_ACCS=`1-1100|Cash in Bank|D
1-1200|Petty Cash|D
1-1300|Accounts Receivable|D
1-1400|Allowance for Doubtful Debt|K
1-1500|Merchandise Inventory|D
1-1600|Store Supplies|D
1-1700|Prepaid Insurance|D
1-1800|Prepaid Rent|D
1-1900|Prepaid Tax|D
1-2100|Equipment at Cost|D
1-2110|Equipment Accum Dep|K
2-1100|Accounts Payable|K
2-1200|Expense Payable|K
2-1300|Income Tax Payable|K
2-1400|PPN Payable|K
2-1500|PPN Outcome|K
2-1600|PPN Income|D
2-2100|Bank BCA Loan|K
3-1100|Owner Capital|K
3-1200|Owner Drawing|D
3-1300|Income Summary|K
4-1100|Sales|K
4-1200|Sales Retur|D
4-1300|Sales Discount|D
4-1400|Freight Collected|K
5-1100|Cost of Goods Sold|D
5-1200|Freight Paid|D
5-1300|Purchases Discount|K
6-1000|Advertising Expenses|D
6-1100|Telephone & Electricity Expenses|D
6-1200|Store Supplies Expenses|D
6-1300|Bad Debts Expenses|D
6-1400|Depreciation Expenses|D
6-1500|Insurance Expense|D
6-1600|Rent Expense|D
6-1700|Wages & Salaries|D
6-1800|Other Operating Expenses|D
7-1100|Interest Revenue|K
8-1100|Interest Expense|D
8-1200|Bank Service Charge|D
8-1300|Income Tax Expense|D`.split('\n').map(l=>{const [c,n,s]=l.split('|');return{c,n,s}});
let ACCS=DEFAULT_ACCS, AN=Object.fromEntries(ACCS.map(a=>[a.c,a]));
function setCOA(list){ACCS=[...list].sort((a,b)=>a.c.localeCompare(b.c));AN=Object.fromEntries(ACCS.map(a=>[a.c,a]));}
const BOOK={BKK:'CPJ',BKM:'CRJ',JPBK:'PJ',JPJK:'SJ',JM:'GJ',VKK:'PC',AJP:'AJP'};
const BOOKN={CPJ:'JURNAL PENGELUARAN KAS',CRJ:'JURNAL PENERIMAAN KAS',PJ:'JURNAL PEMBELIAN',SJ:'JURNAL PENJUALAN',GJ:'JURNAL UMUM',PC:'JURNAL KAS KECIL',AJP:'JURNAL PENYESUAIAN'};
const R=Math.round;

function defaultData(bulan,tahun,company){return {meta:{bulan,tahun,company:company||''},txs:[],
  settings:{accounts:DEFAULT_ACCS.map(a=>({...a})),open:{},customers:[],suppliers:[],items:[],ppn:10}}}
function normalize(D){const S=D.settings;S.accounts=S.accounts||DEFAULT_ACCS.map(a=>({...a}));S.open=S.open||{};
  ['customers','suppliers','items'].forEach(k=>S[k]=S[k]||[]);if(S.ppn==null)S.ppn=10;setCOA(S.accounts)}
function openBal(D,c){const S=D.settings,sm=(a,f)=>a.reduce((s,x)=>s+f(x),0);
  if(c==='1-1300'&&S.customers.length)return sm(S.customers,x=>+x.s||0);
  if(c==='2-1100'&&S.suppliers.length)return -sm(S.suppliers,x=>+x.s||0);
  if(c==='1-1500'&&S.items.length)return sm(S.items,x=>(+x.q||0)*(+x.p||0));
  return +S.open[c]||0}

const its=(f,IT)=>IT.map(i=>({k:i.k,q:+f['q_'+i.k]||0,p:+f['p_'+i.k]||0})).filter(x=>x.q>0);
const sumI=a=>a.reduce((s,x)=>s+x.q*x.p,0);
const parseLines=s=>(s||'').split('\n').map(l=>l.split(',').map(x=>x.trim())).filter(a=>AN[a[0]]).map(a=>[a[0],+a[1]||0,+a[2]||0,a[3]||'']);

function compute(D){
  const S=D.settings, warn=[], entries=[], unrep=[], sc={}, inv={};
  const IT=S.items; IT.forEach(i=>inv[i.k]={L:[{q:+i.q||0,p:+i.p||0}],rows:[]});
  const bal=k=>{const L=inv[k].L;return{q:L.reduce((s,x)=>s+x.q,0),a:L.reduce((s,x)=>s+x.q*x.p,0)}};
  const row=(k,t,d,o)=>{const b=bal(k);inv[k].rows.push({date:t.date,no:t.no,desc:d,...o,bq:b.q,ba:b.a})};
  const stIn=(k,t,d,q,p)=>{inv[k].L.push({q,p});row(k,t,d,{iq:q,ip:p})};
  const stOut=(k,t,d,q,onlyP)=>{let need=q,cost=0,L=inv[k].L;
    const ord=onlyP!=null?[...L.filter(x=>x.p===onlyP),...L.filter(x=>x.p!==onlyP)]:[...L];
    for(const x of ord){if(need<=0)break;const g=Math.min(x.q,need);if(!g)continue;x.q-=g;need-=g;cost+=g*x.p;row(k,t,d,{oq:g,op:x.p});}
    inv[k].L=L.filter(x=>x.q>0); if(need>0)warn.push(`${t.no}: stok ${k} kurang ${need} unit`); return cost;};
  const sorted=D.txs.map((t,i)=>({...t,i})).sort((a,b)=>a.date.localeCompare(b.date)||a.i-b.i);
  for(const t of sorted){
    const f=t.f||{},bk=BOOK[t.type],ket=f.ket,key=t.type+':'+t.kind,C='1-1100',I=its(f,IT),tot=sumI(I),ppn=R(tot*(S.ppn??10)/100);
    const P=(book,d,lines)=>entries.push({book,date:t.date,no:t.no,id:t.id,desc:d,lines:lines.filter(l=>l[1]||l[2]).map(l=>({a:l[0],d:l[1]||0,c:l[2]||0,s:l[3]||''}))});
    const cu=f.custn||f.cust||'', su=f.suppn||f.supp||'';
    const cogs=(d)=>{let c=0;I.forEach(x=>{const v=stOut(x.k,t,d,x.q);sc[t.no+'|'+x.k]={q:x.q,v};c+=v});P('GJ','HPP '+d,[['5-1100',c,0],['1-1500',0,c]])};
    switch(key){
      case 'BKK:lunas_utang':{const s=+f.sisa||0,d=+f.diskon||0;P(bk,ket||`Pelunasan utang ${su} ${f.inv||''}`,[['2-1100',s,0,f.supp],['5-1300',0,d],[C,0,s-d]]);break}
      case 'BKK:beli_aset':{const h=+f.harga||0,p=R(h*(S.ppn??10)/100);P(bk,ket||'Pembelian '+AN[f.akun||'1-2100'].n,[[f.akun||'1-2100',h,0],['2-1600',p,0],[C,0,h+p]]);break}
      case 'BKK:bayar_beban':{const j=+f.jumlah||0;P(bk,ket||'Pembayaran '+AN[f.akun].n,[[f.akun,j,0],[C,0,j]]);break}
      case 'BKK:bayar_ppn':{const a=+f.keluaran||0,b=+f.masukan||0;P(bk,ket||'Setor PPN',[['2-1500',a,0],['2-1600',0,b],[C,0,a-b]]);break}
      case 'BKK:isi_kk':{const T=unrep.splice(0).reduce((x,u)=>x+u.v,0);P(bk,ket||'Pengisian kembali kas kecil',[['1-1200',T,0],[C,0,T]]);break}
      case 'BKK:bayar_pinjaman':{const a=+f.pokok||0,b=+f.bunga||0;P(bk,ket||'Cicilan Bank BCA + bunga',[['2-2100',a,0],['8-1100',b,0],[C,0,a+b]]);break}
      case 'BKM:lunas_piutang':{const s=+f.sisa||0,d=+f.diskon||0;P(bk,ket||`Pelunasan piutang ${cu} ${f.inv||''}`,[[C,s-d,0],['4-1300',d,0],['1-1300',0,s,f.cust]]);break}
      case 'BKM:penjualan_tunai':{P(bk,ket||'Penjualan tunai',[[C,tot+ppn,0],['4-1100',0,tot],['2-1500',0,ppn]]);cogs('penjualan tunai '+t.no);break}
      case 'BKM:piutang_dihapus':{const j=+f.jumlah||0;P(bk,ket||'Piutang yang telah dihapus tertagih kembali',[['1-1300',j,0,f.cust],['1-1400',0,j],[C,j,0],['1-1300',0,j,f.cust]]);break}
      case 'JPJK:jual':{const fr=+f.freight||0;P(bk,ket||'Penjualan kredit '+cu,[['1-1300',tot+ppn+fr,0,f.cust],['4-1100',0,tot],['2-1500',0,ppn],['4-1400',0,fr]]);cogs('faktur '+t.no);break}
      case 'JPBK:beli':{const fr=+f.freight||0;P(bk,ket||'Pembelian kredit '+su,[['1-1500',tot,0],['2-1600',ppn,0],['5-1200',fr,0],['2-1100',0,tot+ppn+fr,f.supp]]);I.forEach(x=>stIn(x.k,t,'Pembelian '+su,x.q,x.p));break}
      case 'JM:retur_jual':{let c=0;I.forEach(x=>{const s=sc[f.inv+'|'+x.k],u=s&&s.q?s.v/s.q:bal(x.k).a/(bal(x.k).q||1);stIn(x.k,t,'Retur penjualan '+t.no,x.q,u);c+=x.q*u});
        P(bk,ket||`Retur penjualan ${cu} atas ${f.inv||''}`,[['4-1200',tot,0],['2-1500',ppn,0],['1-1300',0,tot+ppn,f.cust],['1-1500',c,0],['5-1100',0,c]]);break}
      case 'JM:retur_beli':{P(bk,ket||`Retur pembelian ${su} atas ${f.inv||''}`,[['2-1100',tot+ppn,0,f.supp],['1-1500',0,tot],['2-1600',0,ppn]]);I.forEach(x=>stOut(x.k,t,'Retur pembelian '+t.no,x.q,x.p));break}
      case 'AJP:penyusutan':{const v=R(((+f.cost||0)-(+f.residu||0))/((+f.umur||1)*12));P(bk,ket||'Beban penyusutan peralatan',[['6-1400',v,0],['1-2110',0,v]]);break}
      case 'VKK:voucher':{const j=+f.jumlah||0;P(bk,ket||'Voucher kas kecil '+f.akun,[[f.akun,j,0],['1-1200',0,j]]);unrep.push({a:f.akun,v:j});break}
      default: if(t.kind==='umum'){P(bk,ket||'Jurnal',parseLines(f.lines))}else warn.push(`${t.no}: jenis transaksi tidak dikenal`);
    }
  }
  entries.forEach(e=>{const d=e.lines.reduce((s,l)=>s+l.d,0),c=e.lines.reduce((s,l)=>s+l.c,0);if(Math.abs(d-c)>1)warn.push(`${e.no}: jurnal tidak seimbang (D ${d} / K ${c})`)});
  return {entries,inv,warn};
}

function report(D,E){
  const rows=ACCS.map(a=>{const o=openBal(D,a.c);let md=0,mc=0,j=0;
    E.entries.forEach(e=>e.lines.forEach(l=>{if(l.a!==a.c)return;if(e.book==='AJP')j+=l.d-l.c;else{md+=l.d;mc+=l.c}}));
    const ns=o+md-mc,s=ns+j;return {...a,o,md,mc,ns,j,s}}).filter(r=>r.o||r.md||r.mc||r.j);
  const rl=rows.filter(r=>r.c[0]>='4'),nr=rows.filter(r=>r.c[0]<'4');
  const profit=-rl.reduce((s,r)=>s+r.s,0), by=Object.fromEntries(rows.map(r=>[r.c,r]));
  const v=c=>by[c]?(by[c].s*(AN[c].s==='D'?1:-1)):0;
  return {rows,by,v,profit,rl,nr};
}
function ledgerOf(E,D,c){let b=openBal(D,c),sg=AN[c].s==='D'?1:-1;const out=[];
  E.entries.filter(e=>e.book!=='AJP').forEach(e=>e.lines.forEach(l=>{if(l.a===c){b+=l.d-l.c;out.push({date:e.date,desc:e.desc,no:e.no,d:l.d,c:l.c,b:b*sg})}})); return {open:openBal(D,c)*sg,rows:out}}
function subOf(E,D,acc,key,list){const x=list.find(z=>z.k===key);let b=x.s;const out=[];
  E.entries.filter(e=>e.book!=='AJP').forEach(e=>e.lines.forEach(l=>{if(l.a===acc&&l.s===key){b+=acc==='1-1300'?l.d-l.c:l.c-l.d;out.push({date:e.date,no:e.no,desc:e.desc,d:l.d,c:l.c,b})}}));return {open:x.s,rows:out,end:b}}
if(typeof module!=='undefined')module.exports={compute,report,defaultData,ACCS,AN};

function subList(D,E,acc,key){const m=new Map(D.settings[key].map(x=>[x.k,x]));
  E.entries.forEach(e=>e.lines.forEach(l=>{if(l.a===acc&&l.s&&!m.has(l.s)){const t=D.txs.find(x=>x.id===e.id)||{f:{}};
    m.set(l.s,{k:l.s,n:t.f.custn||t.f.suppn||l.s,s:0})}}));return [...m.values()]}
