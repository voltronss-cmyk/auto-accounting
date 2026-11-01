// Contoh transaksi Desember 2016 (dari DATA_PELAJARI.pdf) – untuk uji coba dan tombol "Muat contoh".
const SAMPLE=(()=>{const q=(a,b,c,d)=>({q_T1301C:a,p_T1301C:b,q_T7102C:c,p_T7102C:d});let n=0;
const T=(type,no,day,kind,f)=>({id:'s'+(++n),type,no,date:'2016-12-'+String(day).padStart(2,'0'),kind,f});
return [
 T('BKK','BKK11-1',1,'bayar_beban',{akun:'2-1200',jumlah:3000000,ket:'Pembayaran gaji karyawan November 2016'}),
 T('BKK','BKK12-1',1,'beli_aset',{akun:'1-2100',harga:3000000}),
 T('BKM','BKM12-1',3,'lunas_piutang',{cust:'C001',inv:'F11-12',sisa:34100000,diskon:310000}),
 T('VKK','V12-1',4,'voucher',{akun:'6-1100',jumlah:900000,ket:'Rekening listrik & telepon'}),
 T('JPJK','F12-1',6,'jual',{cust:'C002',freight:500000,...q(8,18500000,5,15000000)}),
 T('BKK','BKK12-2',6,'lunas_utang',{supp:'S003',inv:'Fk2016',sisa:28600000,diskon:260000}),
 T('JM','NK12-1',7,'retur_jual',{cust:'C002',inv:'F12-1',...q(2,18500000,1,15000000)}),
 T('VKK','V12-2',9,'voucher',{akun:'1-1600',jumlah:1000000,ket:'Perlengkapan toko'}),
 T('BKK','BKK12-3',9,'lunas_utang',{supp:'S001',inv:'C15234',sisa:23100000,diskon:0}),
 T('JPBK','F05',10,'beli',{supp:'S003',freight:1000000,...q(11,16000000,8,12500000)}),
 T('JM','NK-1',11,'retur_beli',{supp:'S003',inv:'F05',...q(1,16000000,2,12500000)}),
 T('BKM','BKM12-2',12,'lunas_piutang',{cust:'C002',inv:'F12-1',sisa:188600000,diskon:0}),
 T('BKM','KN01',13,'penjualan_tunai',q(5,18000000,8,14500000)),
 T('BKM','BKM12-3',14,'lunas_piutang',{cust:'C002',inv:'F11-25',sisa:28600000,diskon:0}),
 T('BKK','BKK12-4',15,'bayar_ppn',{keluaran:4500000,masukan:3000000}),
 T('VKK','V12-3',17,'voucher',{akun:'3-1200',jumlah:1000000,ket:'Prive pemilik'}),
 T('JPJK','F12-2',18,'jual',{cust:'C001',freight:2000000,...q(6,18500000,4,15000000)}),
 T('BKK','BKK12-5',18,'lunas_utang',{supp:'S003',inv:'F05',sisa:259500000,diskon:0}),
 T('BKM','BKM12-4',20,'piutang_dihapus',{cust:'C004',jumlah:6000000}),
 T('JPBK','A17',22,'beli',{supp:'S001',...q(12,16350000,14,12635000)}),
 T('BKK','BKK12-6',23,'lunas_utang',{supp:'S002',inv:'F1289',sisa:17600000,diskon:0}),
 T('BKM','BKM12-5',25,'lunas_piutang',{cust:'C003',inv:'F11-10',sisa:23100000,diskon:0}),
 T('VKK','V12-4',26,'voucher',{akun:'6-1800',jumlah:800000,ket:'Perbaikan atap toko'}),
 T('JPJK','F12-3',27,'jual',{cust:'C003',...q(15,18500000,10,15000000)}),
 T('JPBK','G11',29,'beli',{supp:'S002',...q(10,16400000,10,12400000)}),
 T('BKK','BKK12-7',30,'isi_kk',{}),
 T('BKK','BKK12-8',30,'bayar_pinjaman',{pokok:15000000,bunga:3000000})];})();
if(typeof module!=='undefined')module.exports=SAMPLE;
