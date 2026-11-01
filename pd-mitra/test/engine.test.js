const {compute,report,defaultData}=require('../js/engine.js'),S=require('../js/sample.js');
const D=defaultData(12,2016);D.txs=S;const E=compute(D),r=report(D,E);
const sd=r.rows.reduce((s,x)=>s+(x.s>0?x.s:0),0),sc=r.rows.reduce((s,x)=>s+(x.s<0?-x.s:0),0);
console.log('warn',E.warn,'\nentries',E.entries.length,'TB D',sd,'K',sc,'laba',r.profit);
console.log('kas',r.by['1-1100'].s,'kas kecil',r.by['1-1200'].s,'persediaan',r.by['1-1500'].s,'AR',r.by['1-1300'].s,'AP',r.by['2-1100'].s);
console.log('stok',Object.fromEntries(Object.entries(E.inv).map(([k,v])=>[k,v.L.map(x=>x.q+'@'+x.p)])));
