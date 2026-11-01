// Definisi form: jenis dokumen -> bentuk transaksi -> field.  [nama,label,tipe,default]
const TYPES={BKK:'BKK – Bukti Kas Keluar',BKM:'BKM – Bukti Kas Masuk',JPBK:'JPBK – Jurnal Pembelian Kredit',JPJK:'JPJK – Jurnal Penjualan Kredit',JM:'JM – Jurnal Memorial',VKK:'VKK – Voucher Kas Kecil',AJP:'AJP – Jurnal Penyesuaian'};
const IT=['_i','Barang','items'], UM=['lines','Baris jurnal: kode akun,debet,kredit[,kode customer/supplier] (satu per baris)','area'];
const KINDS={
 BKK:{lunas_utang:['Pelunasan utang dagang',[['supp','Supplier','supp'],['inv','No. faktur','text'],['sisa','Utang yang dilunasi (Rp)','num'],['diskon','Potongan pembelian (Rp)','num']]],
  beli_aset:['Pembelian peralatan (+PPN 10%)',[['akun','Akun aset','acc','1-2100'],['harga','Harga tanpa PPN','num']]],
  bayar_beban:['Pembayaran beban / hutang biaya',[['akun','Akun didebet','acc','6-1700'],['jumlah','Jumlah','num']]],
  bayar_ppn:['Setor PPN',[['keluaran','PPN Outcome (Rp)','num'],['masukan','PPN Income (Rp)','num']]],
  isi_kk:['Pengisian kembali kas kecil (otomatis dari voucher)',[]],
  bayar_pinjaman:['Cicilan pinjaman + bunga',[['pokok','Pokok','num'],['bunga','Bunga','num']]],
  umum:['Lainnya (manual)',[UM]]},
 BKM:{lunas_piutang:['Pelunasan piutang dagang',[['cust','Customer','cust'],['inv','No. faktur','text'],['sisa','Piutang yang dilunasi (Rp)','num'],['diskon','Potongan penjualan (Rp)','num']]],
  penjualan_tunai:['Penjualan tunai (+PPN, HPP otomatis)',[IT]],
  piutang_dihapus:['Piutang dihapus tertagih kembali',[['cust','Customer','cust'],['jumlah','Jumlah diterima','num']]],
  umum:['Lainnya (manual)',[UM]]},
 JPBK:{beli:['Pembelian kredit (+PPN)',[['supp','Supplier','supp'],IT,['freight','Freight Paid','num']]],umum:['Lainnya (manual)',[UM]]},
 JPJK:{jual:['Penjualan kredit (+PPN, HPP otomatis)',[['cust','Customer','cust'],IT,['freight','Freight Collected','num']]],umum:['Lainnya (manual)',[UM]]},
 JM:{retur_jual:['Retur penjualan',[['cust','Customer','cust'],['inv','No. faktur asal','text'],IT]],
  retur_beli:['Retur pembelian',[['supp','Supplier','supp'],['inv','No. faktur asal','text'],IT]],umum:['Lainnya (manual)',[UM]]},
 VKK:{voucher:['Voucher kas kecil',[['akun','Akun didebet','acc','6-1800'],['jumlah','Jumlah (≤ Rp1.000.000)','num']]]},
 AJP:{penyusutan:['Penyusutan peralatan bulanan',[['cost','Harga perolehan','num',22800000],['residu','Nilai residu','num',3300000],['umur','Umur ekonomis (tahun)','num',4]]],umum:['Lainnya (manual)',[UM]]}};

function fieldHTML(x,D){const [n,l,t,d]=x,v=d!==undefined?`value="${d}"`:'';
 if(t==='items')return ITEMS.map(i=>`<label>${i.n} – Qty<input type=number data-n="q_${i.k}" min=0></label><label>${i.n} – Harga/unit (tanpa PPN)<input type=number data-n="p_${i.k}" min=0></label>`).join('');
 if(t==='area')return `<label style="grid-column:1/-1">${l}<textarea rows=4 data-n="${n}"></textarea></label>`;
 if(t==='num')return `<label>${l}<input type=number data-n="${n}" ${v} min=0></label>`;
 const opt=t==='cust'?D.settings.customers.map(c=>`<option value="${c.k}">${c.k} – ${c.n}`):t==='supp'?D.settings.suppliers.map(c=>`<option value="${c.k}">${c.k} – ${c.n}`):t==='acc'?ACCS.map(a=>`<option value="${a.c}" ${a.c===d?'selected':''}>${a.c} ${a.n}`):null;
 return opt?`<label>${l}<select data-n="${n}">${opt.join('')}</select></label>`:`<label>${l}<input data-n="${n}"></label>`;}
