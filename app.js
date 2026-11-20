const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0);
const todayISO = () => new Date().toISOString().slice(0,10);
const seedRuko = [
 {id:1,name:'Ruko Anggrek',address:'Jl. Melati No. 12',price:25000000,status:'Tersedia',desc:'Ruko dua lantai, lokasi strategis.'},
 {id:2,name:'Ruko Cendana',address:'Jl. Merdeka No. 8',price:30000000,status:'Tersedia',desc:'Dekat pusat perdagangan.'},
 {id:3,name:'Ruko Kenanga',address:'Jl. Sudirman No. 21',price:22000000,status:'Tersedia',desc:'Cocok untuk usaha dan kantor.'}
];
const get = (k, fallback) => JSON.parse(localStorage.getItem(k) || JSON.stringify(fallback));
const save = (k,v) => localStorage.setItem(k,JSON.stringify(v));
if(!localStorage.getItem('ruko_data')) save('ruko_data',seedRuko);
if(!localStorage.getItem('rent_data')) save('rent_data',[]);
if(!localStorage.getItem('pay_data')) save('pay_data',[]);
let currentUser=null, currentPage='dashboard';
const navAdmin=[['dashboard','▦','Dashboard'],['ruko','⌂','Data Ruko'],['rentals','▤','Penyewaan'],['payments','◎','Pembayaran'],['reports','▥','Laporan Keuangan']];
const navTenant=[['dashboard','▦','Dashboard'],['ruko','⌂','Daftar Ruko'],['myrentals','▤','Penyewaan Saya'],['mypayments','◎','Pembayaran Saya']];
const navOwner=[['dashboard','▦','Dashboard Pemilik'],['owner-ruko','⌂','Ruko Saya'],['owner-rentals','▤','Penyewaan Ruko'],['owner-income','◎','Pendapatan']];
$('today').textContent=new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
$('loginForm').addEventListener('submit',e=>{
 e.preventDefault(); const u=$('username').value.trim(),p=$('password').value;
 if(u==='admin'&&p==='admin123') currentUser={username:'Admin Pengelola',role:'admin'};
 else if(u==='penyewa'&&p==='user123') currentUser={username:'Penyewa Demo',role:'tenant'};
 else if(u==='pemilik'&&p==='owner123') currentUser={username:'Pemilik Demo',role:'owner'};
 else {$('loginError').textContent='Username atau password tidak sesuai.';return;}
 $('loginPage').classList.add('hidden');$('app').classList.remove('hidden');startApp();
});
$('logoutBtn').onclick=()=>{currentUser=null;$('app').classList.add('hidden');$('loginPage').classList.remove('hidden');$('loginForm').reset();};
function startApp(){
 $('userName').textContent=currentUser.username;$('userRole').textContent=currentUser.role==='admin'?'Administrator':currentUser.role==='owner'?'Pemilik Toko':'Penyewa';$('avatar').textContent=currentUser.role==='admin'?'A':currentUser.role==='owner'?'O':'P';
 const nav=currentUser.role==='admin'?navAdmin:currentUser.role==='owner'?navOwner:navTenant;
 $('navigation').innerHTML=nav.map(([id,ic,label])=>`<button class="nav-btn ${id===currentPage?'active':''}" data-page="${id}" data-icon="${ic}"><span>${ic} &nbsp; ${label}</span></button>`).join('');
 $('navigation').querySelectorAll('button').forEach(b=>b.onclick=()=>render(b.dataset.page));
 render('dashboard');
}
function render(page){
 currentPage=page;const nav=currentUser.role==='admin'?navAdmin:currentUser.role==='owner'?navOwner:navTenant;
 $('navigation').innerHTML=nav.map(([id,ic,label])=>`<button class="nav-btn ${id===page?'active':''}" data-page="${id}" data-icon="${ic}"><span>${ic} &nbsp; ${label}</span></button>`).join('');
 $('navigation').querySelectorAll('button').forEach(b=>b.onclick=()=>render(b.dataset.page));
 const titles={dashboard:currentUser.role==='owner'?'Dashboard Pemilik':'Dashboard',ruko:'Data Ruko',rentals:'Data Penyewaan',payments:'Pembayaran',reports:'Laporan Keuangan',myrentals:'Penyewaan Saya',mypayments:'Pembayaran Saya','owner-ruko':'Ruko Saya','owner-rentals':'Penyewaan Ruko','owner-income':'Pendapatan Pemilik'};
 $('pageTitle').textContent=titles[page]||'Dashboard';
 const views={dashboard:dashboardView,ruko:rukoView,rentals:rentalsView,payments:paymentsView,reports:reportsView,myrentals:myRentalsView,mypayments:myPaymentsView,'owner-ruko':ownerRukoView,'owner-rentals':ownerRentalsView,'owner-income':ownerIncomeView};
 $('content').innerHTML=views[page]();
}
function stat(label,value,note='Ringkasan data saat ini'){return `<div class="stat"><div class="stat-label">${label}</div><div class="stat-value">${value}</div><div class="stat-note">${note}</div></div>`}
function dashboardView(){
 const r=get('ruko_data',[]), rents=get('rent_data',[]), pays=get('pay_data',[]);
 const paid=pays.filter(p=>p.status==='Berhasil').reduce((s,p)=>s+p.amount,0);
 if(currentUser.role==='owner'){
 const owned=r.filter(x=>x.owner===currentUser.username),myRent=rents.filter(x=>x.owner===currentUser.username),myPay=pays.filter(x=>x.owner===currentUser.username&&x.status==='Berhasil'),gross=myPay.reduce((s,p)=>s+p.amount,0),commission=myPay.reduce((s,p)=>s+(p.commission||0),0);
 return `<div class="stats">${stat('Ruko Saya',owned.length)}${stat('Sedang Disewa',owned.filter(x=>x.status==='Disewa').length)}${stat('Pendapatan Kotor',money(gross))}${stat('Pendapatan Bersih',money(gross-commission))}</div><div class="panel"><h3>Dashboard Pemilik Toko</h3><p class="muted">Kelola unit ruko, pantau status penyewaan, dan lihat pendapatan setelah komisi platform.</p><button class="btn primary" onclick="render('owner-ruko')">Kelola Ruko Saya</button></div>`;
 }
 if(currentUser.role==='admin') return `<div class="stats">${stat('Total Ruko',r.length)}${stat('Total Penyewaan',rents.length)}${stat('Pembayaran Berhasil',pays.filter(p=>p.status==='Berhasil').length)}${stat('Komisi Platform (10%)',money(pays.filter(p=>p.status==='Berhasil').reduce((s,p)=>s+(p.commission||Math.round(p.amount*.1)),0)))}</div>
 <div class="panel"><div class="panel-head"><h3>Aktivitas Terbaru</h3><span class="muted">Transaksi terbaru</span></div>${transactionTable(pays.slice().reverse().slice(0,5))}</div>
 <div class="notice">Gunakan menu Data Ruko untuk mengelola unit, menu Penyewaan untuk memproses permintaan, dan Laporan Keuangan untuk melihat pendapatan berdasarkan periode.</div>`;
 const mine=rents.filter(x=>x.tenant===currentUser.username);
 return `<div class="stats">${stat('Ruko Tersedia',r.filter(x=>x.status==='Tersedia').length)}${stat('Penyewaan Saya',mine.length)}${stat('Tagihan Belum Dibayar',mine.filter(x=>x.status==='Menunggu Pembayaran').length)}${stat('Pembayaran Berhasil',get('pay_data',[]).filter(p=>p.tenant===currentUser.username&&p.status==='Berhasil').length)}</div><div class="panel"><h3>Selamat datang di RukoSpace</h3><p class="muted">Cari ruko yang sesuai kebutuhan usaha Anda, ajukan penyewaan, lalu lakukan pembayaran melalui menu Pembayaran.</p><button class="btn primary" onclick="render('ruko')">Lihat daftar ruko</button></div>`;
}
function rukoView(){
 const rows=get('ruko_data',[]),admin=currentUser.role==='admin',owner=currentUser.role==='owner',shown=owner?rows.filter(x=>x.owner===currentUser.username):rows;
 return `${(admin||owner)?`<div class="panel"><div class="panel-head"><h3>${owner?'Kelola Ruko Milik Anda':'Data Ruko'}</h3>${owner?`<button class="btn primary" onclick="rukoModal()">+ Tambah Ruko</button>`:''}</div>`:''}<div class="grid-ruko">${shown.map(r=>`<article class="ruko-card"><div class="ruko-visual" style="${r.image?`background-image:url('${r.image}');background-size:cover;background-position:center`:''}">${r.image?'': '🏢'}</div><div class="ruko-body"><h3>${esc(r.name)}</h3><p>📍 ${esc(r.address)}</p><p>${esc(r.desc||'Unit ruko untuk disewakan.')}</p><div class="price">${money(r.price)} <small class="muted">/ tahun</small></div><span class="status ${r.status==='Tersedia'?'available':'occupied'}">${r.status}</span><div style="margin-top:14px">${(admin||owner)?`${owner?`<button class="small-btn" onclick="rukoModal(${r.id})">Edit</button> <button class="small-btn red" onclick="deleteRuko(${r.id})">Hapus</button>`:''}`:r.status==='Tersedia'?`<button class="btn primary" onclick="requestRent(${r.id})">Ajukan Sewa</button>`:'<small class="muted">Sedang disewa</small>'}</div></div></article>`).join('')}</div>${(admin||owner)?'</div>':''}`;
}
function rukoModal(id){
 const all=get('ruko_data',[]),r=all.find(x=>x.id===id)||{name:'',address:'',price:'',desc:'',status:'Tersedia'};
 modal('Form Data Ruko',`<form id="rukoForm" class="form-grid"><div class="field"><label>Nama Ruko</label><input name="name" required value="${esc(r.name)}"></div><div class="field"><label>Harga per Tahun (Rp)</label><input name="price" type="number" min="1" required value="${r.price}"></div><div class="field"><label>Alamat</label><input name="address" required value="${esc(r.address)}"></div><div class="field"><label>Status</label><select name="status"><option ${r.status==='Tersedia'?'selected':''}>Tersedia</option><option ${r.status==='Disewa'?'selected':''}>Disewa</option></select></div><div class="field" style="grid-column:1/-1"><label>Deskripsi</label><input name="desc" value="${esc(r.desc||'')}"></div><div class="field" style="grid-column:1/-1"><label>Foto Ruko (jpg/png/webp)</label><input type="file" id="rukoImage" accept="image/*"><small class="muted">Foto disimpan di browser (LocalStorage).</small></div></form>`,`<button class="btn secondary" onclick="closeModal()">Batal</button><button class="btn primary" onclick="saveRuko(${id||0})">Simpan</button>`);
}
function saveRuko(id){const f=$('rukoForm');if(!f.reportValidity())return;const d=Object.fromEntries(new FormData(f));d.price=Number(d.price);const file=$('rukoImage')?.files?.[0];const apply=image=>{let a=get('ruko_data',[]);if(id)a=a.map(x=>x.id===id?{...x,...d,image:image||x.image}:x);else a.push({id:Date.now(),...d,image:image||'',owner:currentUser.username,status:'Tersedia'});save('ruko_data',a);closeModal();render(currentUser.role==='owner'?'owner-ruko':'ruko');};if(file){const reader=new FileReader();reader.onload=()=>apply(reader.result);reader.readAsDataURL(file);}else apply(null);}
function deleteRuko(id){if(!confirm('Hapus data ruko ini?'))return;save('ruko_data',get('ruko_data',[]).filter(x=>x.id!==id));render('ruko');}
function requestRent(id){
 const r=get('ruko_data',[]).find(x=>x.id===id);if(!r||r.status!=='Tersedia')return alert('Ruko tidak tersedia.');
 const exists=get('rent_data',[]).some(x=>x.rukoId===id&&x.tenant===currentUser.username&&x.status!=='Ditolak');
 if(exists)return alert('Anda sudah memiliki pengajuan untuk ruko ini.');
 modal('Ajukan Penyewaan',`<div class="notice">Anda akan mengajukan penyewaan <b>${esc(r.name)}</b> dengan harga ${money(r.price)} per tahun.</div><form id="rentForm"><div class="field"><label>Tanggal Mulai Sewa</label><input type="date" name="start" min="${todayISO()}" required value="${todayISO()}"></div><div class="field" style="margin-top:12px"><label>Durasi (tahun)</label><select name="years"><option value="1">1 tahun</option><option value="2">2 tahun</option><option value="3">3 tahun</option></select></div></form>`,`<button class="btn secondary" onclick="closeModal()">Batal</button><button class="btn primary" onclick="submitRent(${id})">Kirim Pengajuan</button>`);
}
function submitRent(id){const f=$('rentForm');if(!f.reportValidity())return;const d=Object.fromEntries(new FormData(f)),r=get('ruko_data',[]).find(x=>x.id===id);const rent={id:Date.now(),rukoId:id,ruko:r.name,tenant:currentUser.username,start:d.start,years:Number(d.years),amount:r.price*Number(d.years),owner:r.owner||'Pemilik Demo',status:'Menunggu Persetujuan',created:todayISO()};let a=get('rent_data',[]);a.push(rent);save('rent_data',a);closeModal();alert('Pengajuan penyewaan berhasil dikirim.');render('myrentals');}
function rentalsView(){
 const a=get('rent_data',[]).filter(x=>currentUser.role!=='owner'||x.owner===currentUser.username);return `<div class="panel"><div class="panel-head"><h3>Daftar Pengajuan Penyewaan</h3></div>${a.length?`<div class="table-wrap"><table><thead><tr><th>Penyewa</th><th>Ruko</th><th>Mulai</th><th>Durasi</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${a.map(x=>`<tr><td>${esc(x.tenant)}</td><td>${esc(x.ruko)}</td><td>${x.start}</td><td>${x.years} tahun</td><td>${money(x.amount)}</td><td><span class="status ${rentClass(x.status)}">${x.status}</span></td><td>${x.status==='Menunggu Persetujuan'?`<div class="actions"><button class="small-btn" onclick="approveRent(${x.id})">Setujui</button><button class="small-btn red" onclick="rejectRent(${x.id})">Tolak</button></div>`:x.status==='Menunggu Pembayaran'?'<small class="muted">Menunggu pembayaran</small>':'-'}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Belum ada pengajuan penyewaan.</div>'}</div>`;
}
function approveRent(id){let a=get('rent_data',[]);a=a.map(x=>x.id===id?{...x,status:'Menunggu Pembayaran'}:x);save('rent_data',a);render('rentals');}
function rejectRent(id){let a=get('rent_data',[]),item=a.find(x=>x.id===id);a=a.map(x=>x.id===id?{...x,status:'Ditolak'}:x);save('rent_data',a);save('ruko_data',get('ruko_data',[]).map(r=>r.id===item.rukoId?{...r,status:'Tersedia'}:r));render('rentals');}
function myRentalsView(){const a=get('rent_data',[]).filter(x=>x.tenant===currentUser.username);return `<div class="panel"><h3>Riwayat Penyewaan Saya</h3><br>${a.length?`<div class="table-wrap"><table><thead><tr><th>Ruko</th><th>Tanggal Mulai</th><th>Durasi</th><th>Total</th><th>Status</th></tr></thead><tbody>${a.map(x=>`<tr><td>${esc(x.ruko)}</td><td>${x.start}</td><td>${x.years} tahun</td><td>${money(x.amount)}</td><td><span class="status ${rentClass(x.status)}">${x.status}</span></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Anda belum mengajukan penyewaan.</div>'}</div>`;}
function rentClass(s){return s==='Disetujui'||s==='Berhasil'?'paid':s==='Ditolak'?'rejected':'pending';}
function paymentsView(){return `<div class="panel"><div class="panel-head"><h3>Daftar Tagihan Penyewa</h3></div>${paymentRows(get('rent_data',[]).filter(x=>x.status==='Menunggu Pembayaran'||x.status==='Disewa'),true)}</div><div class="panel"><h3>Riwayat Pembayaran</h3><br>${transactionTable(get('pay_data',[]).slice().reverse())}</div>`;}
function myPaymentsView(){const mine=get('rent_data',[]).filter(x=>x.tenant===currentUser.username&&x.status==='Menunggu Pembayaran');return `<div class="panel"><div class="panel-head"><h3>Tagihan Saya</h3></div>${paymentRows(mine,false)}</div><div class="panel"><h3>Riwayat Pembayaran Saya</h3><br>${transactionTable(get('pay_data',[]).filter(x=>x.tenant===currentUser.username).reverse())}</div>`;}
function paymentRows(a,admin){if(!a.length)return '<div class="empty">Tidak ada tagihan yang perlu dibayar.</div>';return `<div class="table-wrap"><table><thead><tr><th>Penyewa</th><th>Ruko</th><th>Jumlah</th><th>Aksi</th></tr></thead><tbody>${a.map(x=>`<tr><td>${esc(x.tenant)}</td><td>${esc(x.ruko)}</td><td>${money(x.amount)}</td><td><button class="small-btn" onclick="payRent(${x.id})">${admin?'Buat Pembayaran':'Bayar Sekarang'}</button></td></tr>`).join('')}</tbody></table></div>`;}
function payRent(id){
 const rent=get('rent_data',[]).find(x=>x.id===id);if(!rent)return;
 modal('Pembayaran Sewa',`<div class="notice">Tagihan: <b>${esc(rent.ruko)}</b><br>Total pembayaran: <b>${money(rent.amount)}</b><br>Mode demo: transaksi akan diproses secara simulasi, tanpa memotong saldo atau rekening.</div><form id="payForm"><div class="field"><label>Metode Pembayaran</label><select name="method"><option>Virtual Account (Simulasi)</option><option>QRIS (Simulasi)</option><option>Transfer Bank (Simulasi)</option></select></div></form><p class="muted">Integrasi pembayaran asli memerlukan backend dan akun payment gateway.</p>`,`<button class="btn secondary" onclick="closeModal()">Batal</button><button class="btn primary" onclick="confirmPay(${id})">Bayar & Konfirmasi</button>`);
}
function confirmPay(id){
 const rents=get('rent_data',[]),rent=rents.find(x=>x.id===id);if(!rent)return;
 const method=new FormData($('payForm')).get('method');
 const commission=Math.round(rent.amount*0.10);const payment={id:'INV-'+Date.now(),rentId:id,tenant:rent.tenant,ruko:rent.ruko,owner:rent.owner||'Pemilik Demo',amount:rent.amount,commission,ownerNet:rent.amount-commission,method,status:'Berhasil',date:todayISO(),time:new Date().toLocaleTimeString('id-ID')};
 let pays=get('pay_data',[]);pays.push(payment);save('pay_data',pays);
 save('rent_data',rents.map(x=>x.id===id?{...x,status:'Disewa'}:x));
 save('ruko_data',get('ruko_data',[]).map(x=>x.id===rent.rukoId?{...x,status:'Disewa'}:x));
 closeModal();receiptModal(payment);render(currentUser.role==='admin'?'payments':'mypayments');
}
function transactionTable(a){if(!a.length)return '<div class="empty">Belum ada transaksi.</div>';return `<div class="table-wrap"><table><thead><tr><th>No. Invoice</th><th>Tanggal</th><th>Penyewa</th><th>Ruko</th><th>Metode</th><th>Jumlah</th><th>Status</th><th>Struk</th></tr></thead><tbody>${a.map(p=>`<tr><td>${p.id}</td><td>${p.date}</td><td>${esc(p.tenant)}</td><td>${esc(p.ruko)}</td><td>${esc(p.method)}</td><td>${money(p.amount)}</td><td><span class="status paid">${p.status}</span></td><td><button class="small-btn" onclick="showReceipt('${p.id}')">Cetak</button></td></tr>`).join('')}</tbody></table></div>`;}
function receiptHTML(p){return `<div class="receipt" id="receiptPrint"><div class="brand-mark">R</div><h2>RukoSpace</h2><p>Bukti Pembayaran Sewa Ruko</p><hr><div class="receipt-line"><span>No. Invoice</span><b>${p.id}</b></div><div class="receipt-line"><span>Tanggal</span><b>${p.date} ${p.time||''}</b></div><div class="receipt-line"><span>Penyewa</span><b>${esc(p.tenant)}</b></div><div class="receipt-line"><span>Unit Ruko</span><b>${esc(p.ruko)}</b></div><div class="receipt-line"><span>Metode</span><b>${esc(p.method)}</b></div><div class="receipt-line receipt-total"><span>Total Dibayar</span><b>${money(p.amount)}</b></div><p style="margin-top:22px">Status: <b style="color:#16865d">LUNAS</b><br>Terima kasih atas pembayaran Anda.</p></div>`;}
function receiptModal(p){modal('Struk Pembayaran',receiptHTML(p),'<button class="btn secondary" onclick="closeModal()">Tutup</button><button class="btn primary" onclick="printReceipt()">Cetak Struk</button>');}
function showReceipt(id){const p=get('pay_data',[]).find(x=>x.id===id);if(p)receiptModal(p);}
function printReceipt(){const html=$('receiptPrint').outerHTML,win=window.open('','_blank','width=600,height=700');if(!win)return alert('Izinkan pop-up browser untuk mencetak struk.');win.document.write(`<html><head><title>Struk Pembayaran</title><style>body{font-family:Arial;padding:25px}.receipt{max-width:420px;margin:auto;border:1px dashed #aaa;padding:24px}.brand-mark{width:45px;height:45px;background:#eaf0ff;color:#2864dc;display:grid;place-items:center;margin:auto;font-size:24px;font-weight:bold}.receipt h2,.receipt p{text-align:center}.receipt p{font-size:12px;color:#666}.receipt-line{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px dashed #ddd;font-size:13px}.receipt-total{font-weight:bold;font-size:16px}</style></head><body>${html}<script>window.onload=()=>window.print()<\/script></body></html>`);win.document.close();}
function reportsView(){return `<div class="panel"><div class="panel-head"><h3>Filter Laporan Keuangan</h3></div><div class="toolbar no-print"><div class="field"><label>Dari Tanggal</label><input type="date" id="fromDate" value="${new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString().slice(0,10)}"></div><div class="field"><label>Sampai Tanggal</label><input type="date" id="toDate" value="${todayISO()}"></div><button class="btn primary" onclick="filterReport()">Tampilkan</button><button class="btn secondary" onclick="resetReport()">Reset</button><button class="btn secondary" onclick="exportPDF()">Cetak PDF</button></div><div id="reportResult">${reportContent(get('pay_data',[]))}</div></div>`;}
function reportContent(a){const total=a.reduce((s,p)=>s+(p.commission||Math.round(p.amount*.1)),0);return `<div class="stats">${stat('Jumlah Transaksi',a.length)}${stat('Komisi Admin (10%)',money(total))}${stat('Transaksi Berhasil',a.filter(x=>x.status==='Berhasil').length)}${stat('Rata-rata Transaksi',money(a.length?total/a.length:0))}</div><div class="panel"><div class="panel-head"><h3>Rincian Transaksi</h3><span class="muted">${a.length} data</span></div>${transactionTable(a)}</div>`;}
function filterReport(){const from=$('fromDate').value,to=$('toDate').value;if(from&&to&&from>to)return alert('Tanggal awal tidak boleh melebihi tanggal akhir.');const a=get('pay_data',[]).filter(p=>(!from||p.date>=from)&&(!to||p.date<=to));$('reportResult').innerHTML=reportContent(a);}
function resetReport(){$('fromDate').value=new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString().slice(0,10);$('toDate').value=todayISO();filterReport();}
function exportPDF(){
 const from=$('fromDate').value,to=$('toDate').value;if(from&&to&&from>to)return alert('Rentang tanggal tidak valid.');
 const a=get('pay_data',[]).filter(p=>(!from||p.date>=from)&&(!to||p.date<=to));
 if(!window.jspdf)return alert('Library PDF belum termuat. Periksa koneksi internet.');
 const {jsPDF}=window.jspdf,doc=new jsPDF();const total=a.reduce((s,p)=>s+p.amount,0);
 doc.setFontSize(18);doc.text('LAPORAN KEUANGAN RUKOSPACE',14,18);doc.setFontSize(10);doc.text(`Periode: ${from||'Semua'} sampai ${to||'Semua'}`,14,27);doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`,14,33);
 doc.setFontSize(11);doc.text(`Jumlah transaksi: ${a.length}`,14,44);doc.text(`Total komisi admin (10%): ${money(total)}`,14,51);
 let y=64;doc.setFontSize(9);doc.setFont(undefined,'bold');doc.text('No. Invoice',14,y);doc.text('Tanggal',55,y);doc.text('Penyewa',83,y);doc.text('Ruko',122,y);doc.text('Jumlah',165,y);doc.line(14,y+2,195,y+2);y+=10;doc.setFont(undefined,'normal');
 a.forEach(p=>{if(y>275){doc.addPage();y=20;}doc.text(String(p.id).slice(0,20),14,y);doc.text(p.date,55,y);doc.text(String(p.tenant).slice(0,17),83,y);doc.text(String(p.ruko).slice(0,18),122,y);doc.text(money(p.amount),165,y);y+=8;});
 doc.save(`Laporan-Keuangan-${from||'semua'}-${to||'semua'}.pdf`);
}

function ownerRukoView(){return rukoView();}
function ownerRentalsView(){const a=get('rent_data',[]).filter(x=>x.owner===currentUser.username);return `<div class="panel"><h3>Pengajuan & Penyewaan Ruko Saya</h3><br>${a.length?`<div class="table-wrap"><table><thead><tr><th>Penyewa</th><th>Ruko</th><th>Mulai</th><th>Durasi</th><th>Total</th><th>Status</th></tr></thead><tbody>${a.map(x=>`<tr><td>${esc(x.tenant)}</td><td>${esc(x.ruko)}</td><td>${x.start}</td><td>${x.years} tahun</td><td>${money(x.amount)}</td><td>${x.status}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Belum ada penyewaan untuk ruko Anda.</div>'}</div>`;}
function ownerIncomeView(){const p=get('pay_data',[]).filter(x=>x.owner===currentUser.username&&x.status==='Berhasil'),gross=p.reduce((s,x)=>s+x.amount,0),fee=p.reduce((s,x)=>s+(x.commission||Math.round(x.amount*.1)),0);return `<div class="stats">${stat('Pendapatan Kotor',money(gross))}${stat('Komisi Platform (10%)',money(fee))}${stat('Pendapatan Bersih',money(gross-fee))}${stat('Transaksi',p.length)}</div><div class="panel"><h3>Rincian Pendapatan</h3>${transactionTable(p)}</div>`;}

function modal(title,body,actions){let old=$('modalRoot');if(old)old.remove();const root=document.createElement('div');root.id='modalRoot';root.className='modal-backdrop';root.innerHTML=`<div class="modal"><div class="modal-head"><h3>${title}</h3><button class="close" onclick="closeModal()">✕</button></div>${body}<div class="modal-actions">${actions||''}</div></div>`;root.addEventListener('click',e=>{if(e.target===root)closeModal()});document.body.appendChild(root);}
function closeModal(){const m=$('modalRoot');if(m)m.remove();}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
