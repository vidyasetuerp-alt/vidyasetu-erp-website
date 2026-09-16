/* EDITABLE BUSINESS INFORMATION: update contact details and product links here. */
const PRODUCT_LINKS = {
  vidyasetuErp: "https://github.com/vidyasetuerp-alt/vidyasetu-erp-website/releases/download/v1.06/VidyaSetuERP_Setup_v1.06.exe",
  vidyasetuSrErp: "https://github.com/vidyasetuerp-alt/vidyasetu-erp-website/releases/download/v1.02/VidyaSetuERPSr_Setup_v1.02.exe",
  allReleases: "https://github.com/vidyasetuerp-alt/vidyasetu-erp-website/releases"
};
const CONTACT_CONFIG = {
  whatsappNumber: "913678260401",
  phoneNumber: "+918638663327",
  phoneDisplay: "+918638663327",
  salesEmail: "info@vidyasetuerptech.com",
  supportEmail: "vidyasetu.erp@gmail.com"
};

const page = document.body.dataset.page || "";
const navItems = [
  ["index.html","Home","home"],["products.html","Products","products"],["vidyasetu-erp.html","VidyaSetu ERP","erp"],
  ["vidyasetu-sr-erp.html","VidyaSetu ERP Sr.","sr"],["pricing.html","Pricing","pricing"],["downloads.html","Downloads","downloads"],
  ["about.html","About","about"],["contact.html","Contact","contact"]
];
const header = document.querySelector("[data-site-header]");
if(header){header.innerHTML=`<a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="container nav-wrap"><a class="brand" href="index.html" aria-label="VidyaSetu Tech home"><span class="brand-mark">VS</span><span>VidyaSetu Tech</span></a><nav class="nav-links" aria-label="Primary navigation">${navItems.map(([href,label,id])=>`<a href="${href}" class="${page===id?'active':''}">${label}</a>`).join('')}</nav><div class="nav-actions"><a class="btn btn-outline" href="downloads.html">Download</a><a class="btn btn-primary" href="contact.html#demo">Request a Demo</a></div><button class="menu-toggle" aria-label="Open navigation" aria-expanded="false">☰</button></div></header>`}
const footer = document.querySelector("[data-site-footer]");
if(footer){footer.innerHTML=`<footer class="site-footer"><div class="container"><div class="footer-grid"><div><a class="brand" href="index.html"><span class="brand-mark">VS</span><span style="color:#fff">VidyaSetu Tech</span></a><p>Smart School Management Solutions for Modern Institutions.</p><p class="muted">Focused offline-first Windows ERP software for real school administration needs.</p></div><div><h3>Products</h3><div class="footer-links"><a href="vidyasetu-erp.html">VidyaSetu ERP</a><a href="vidyasetu-sr-erp.html">VidyaSetu ERP Sr.</a><a href="pricing.html">Pricing</a><a href="downloads.html">Downloads</a></div></div><div><h3>Company</h3><div class="footer-links"><a href="about.html">About</a><a href="contact.html">Contact</a><a href="privacy-policy.html">Privacy Policy</a><a href="terms.html">Terms</a></div></div><div><h3>Contact</h3><div class="footer-links"><a href="mailto:${CONTACT_CONFIG.salesEmail}">${CONTACT_CONFIG.salesEmail}</a><a href="mailto:${CONTACT_CONFIG.supportEmail}">Support email</a><a href="${PRODUCT_LINKS.allReleases}" target="_blank" rel="noopener">GitHub Releases</a></div></div></div><div class="footer-bottom">© <span data-year></span> VidyaSetu Tech. All Rights Reserved.<br>VidyaSetu ERP and VidyaSetu ERP Sr. are software products of VidyaSetu Tech.</div></div></footer>`}
/* The company logo is shared by every page through the header and footer. */
document.querySelectorAll('.brand-mark').forEach(mark=>{
  const logo=document.createElement('img');
  logo.src='images/logo.png';
  logo.alt=''; // The adjacent brand text provides the accessible company name.
  logo.className=mark.closest('.site-footer')?'company-logo company-logo-footer':'company-logo';
  if(mark.closest('.site-footer')) logo.loading='lazy';
  mark.replaceWith(logo);
});
const footerContact=document.querySelector('.site-footer .footer-grid > div:last-child .footer-links');
if(footerContact){
  const alternateEmail=footerContact.querySelector(`a[href="mailto:${CONTACT_CONFIG.supportEmail}"]`);
  if(alternateEmail) alternateEmail.textContent=CONTACT_CONFIG.supportEmail;
  footerContact.insertAdjacentHTML('beforeend',`<a href="tel:${CONTACT_CONFIG.phoneNumber}">Call ${CONTACT_CONFIG.phoneDisplay}</a><a href="https://wa.me/${CONTACT_CONFIG.whatsappNumber}" target="_blank" rel="noopener">WhatsApp +913678260401</a>`);
}
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
const siteHeader=document.querySelector('.site-header');
document.querySelector('.menu-toggle')?.addEventListener('click',e=>{siteHeader.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',siteHeader.classList.contains('open'));});

document.querySelectorAll('[data-download]').forEach(button=>button.addEventListener('click',e=>{
  e.preventDefault(); const key=button.dataset.download; const isSr=key==='vidyasetuSrErp';
  const link=PRODUCT_LINKS[key]; const modal=document.querySelector('#downloadModal');
  if(!modal)return;
  modal.querySelector('[data-modal-product]').textContent=isSr?'VidyaSetu ERP Sr.':'VidyaSetu ERP';
  modal.querySelector('[data-modal-version]').textContent=isSr?'v1.02':'v1.06';
  const go=modal.querySelector('[data-confirm-download]'); go.dataset.url=link; go.textContent=isSr&&link.startsWith('VIDYASETU_')?'Installer link coming soon':'Continue to download';
  go.disabled=isSr&&link.startsWith('VIDYASETU_'); modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
}));
document.querySelectorAll('[data-close-modal]').forEach(b=>b.addEventListener('click',()=>{const m=document.querySelector('#downloadModal');m.classList.remove('open');m.setAttribute('aria-hidden','true')}));
document.querySelector('[data-confirm-download]')?.addEventListener('click',e=>{if(e.currentTarget.dataset.url)window.location.href=e.currentTarget.dataset.url;});

/* Official product logos supplied by VidyaSetu Tech. */
const PRODUCT_LOGOS = {
  erp: { src: 'images/vidyasetu-erp-logo.png', alt: 'VidyaSetu School ERP Software logo' },
  sr: { src: 'images/vidyasetu-sr-logo.png', alt: 'VidyaSetu Sr. School ERP Software logo' }
};
document.querySelectorAll('.product-card.erp, .product-card.sr').forEach(card=>{
  if(page==='pricing') return;
  if(card.querySelector('.product-logo, .download-product-logo')) return;
  const kind=card.classList.contains('sr')?'sr':'erp';
  const logo=document.createElement('img');
  logo.src=PRODUCT_LOGOS[kind].src;
  logo.alt=PRODUCT_LOGOS[kind].alt;
  logo.className=card.closest('body[data-page="downloads"]')?'download-product-logo':`product-logo ${kind==='sr'?'sr':''}`;
  card.prepend(logo);
});
if(page==='erp'||page==='sr'){
  const target=document.querySelector('.page-hero .placeholder');
  if(target){
    const kind=page==='sr'?'sr':'erp';
    target.className='product-logo-panel';
    target.innerHTML=`<img src="${PRODUCT_LOGOS[kind].src}" alt="${PRODUCT_LOGOS[kind].alt}">`;
  }
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelector('.modal.open')?.classList.remove('open')});

document.querySelectorAll('.faq-button').forEach(btn=>btn.addEventListener('click',()=>{const item=btn.closest('.faq-item');item.classList.toggle('open');btn.setAttribute('aria-expanded',item.classList.contains('open'));}));
const topButton=document.querySelector('.back-top'); window.addEventListener('scroll',()=>topButton?.classList.toggle('show',scrollY>500)); topButton?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

document.querySelectorAll('[data-compare]').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('[data-compare]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
  const mode=btn.dataset.compare; document.querySelectorAll('[data-product-col]').forEach(el=>{el.style.display=mode==='both'||el.dataset.productCol===mode?'table-cell':'none'});
}));

function formDataToMessage(form){const data=new FormData(form);return `VidyaSetu Tech Demo / Sales Enquiry\n\n${[...data.entries()].map(([k,v])=>`${k}: ${v}`).join('\n')}`}
document.querySelectorAll('[data-whatsapp-form]').forEach(form=>form.addEventListener('submit',e=>{
  e.preventDefault(); if(!form.reportValidity())return; const status=form.querySelector('.form-status');
  if(CONTACT_CONFIG.whatsappNumber.includes('X')){status.textContent='WhatsApp number is not configured yet. Opening an email enquiry instead.';window.location.href=`mailto:${CONTACT_CONFIG.salesEmail}?subject=${encodeURIComponent('VidyaSetu Tech Enquiry')}&body=${encodeURIComponent(formDataToMessage(form))}`;return;}
  window.open(`https://wa.me/${CONTACT_CONFIG.whatsappNumber}?text=${encodeURIComponent(formDataToMessage(form))}`,'_blank','noopener');
}));
document.querySelectorAll('[data-whatsapp-link]').forEach(a=>a.addEventListener('click',e=>{if(CONTACT_CONFIG.whatsappNumber.includes('X')){e.preventDefault();alert('WhatsApp number will be added soon. Please email '+CONTACT_CONFIG.salesEmail+'.');}else a.href=`https://wa.me/${CONTACT_CONFIG.whatsappNumber}`}));
document.querySelectorAll('[data-copy-email]').forEach(btn=>btn.addEventListener('click',async()=>{await navigator.clipboard.writeText(CONTACT_CONFIG.salesEmail);btn.textContent='Email copied';}));

if(page==='contact'){
  const pageLead=document.querySelector('.page-hero .lead');
  if(pageLead) pageLead.textContent='Request a demo, quotation or recommendation. The form prepares a professional WhatsApp message using the information you provide.';
  document.querySelectorAll('a[href="mailto:support@vidyasetuerptech.com"]').forEach(a=>{a.href=`mailto:${CONTACT_CONFIG.supportEmail}`;a.textContent=CONTACT_CONFIG.supportEmail;});
  document.querySelectorAll('.card p strong').forEach(label=>{
    if(label.textContent.trim()==='Mobile / WhatsApp') label.parentElement.innerHTML=`<strong>Call</strong><br><a href="tel:${CONTACT_CONFIG.phoneNumber}">${CONTACT_CONFIG.phoneDisplay}</a><br><strong>WhatsApp</strong><br><a href="https://wa.me/${CONTACT_CONFIG.whatsappNumber}" target="_blank" rel="noopener">+913678260401</a>`;
  });
  const contactActions=document.querySelector('.card .card-actions');
  if(contactActions){
    contactActions.insertAdjacentHTML('beforeend',`<a class="btn btn-outline" href="tel:${CONTACT_CONFIG.phoneNumber}">Call Now</a><a class="btn btn-outline" href="mailto:${CONTACT_CONFIG.supportEmail}">Gmail</a>`);
  }
  document.querySelectorAll('.notice').forEach(notice=>{if(notice.textContent.includes('Editable phone')) notice.remove();});
}

document.querySelector('[data-product-helper]')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.currentTarget);const residential=f.get('Residential Facility');const classes=f.get('Classes Offered')||'';const result=e.currentTarget.querySelector('.form-status');result.textContent=residential==='Yes'||/VI|VII|VIII|IX|X|XI|XII/i.test(classes)&&residential==='Yes'?'VidyaSetu ERP Sr. may be the better fit because you selected residential facilities. Please request guidance to confirm implemented modules.':'VidyaSetu ERP is likely the better starting point for general K–12 administration. Request guidance for a final recommendation.';});

document.body.insertAdjacentHTML('beforeend',`<button class="back-top" aria-label="Back to top">↑</button><div class="modal" id="downloadModal" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="downloadTitle"><div class="modal-card"><span class="badge">Windows installer</span><h2 id="downloadTitle" style="margin-top:14px"><span data-modal-product></span> <span data-modal-version></span></h2><p>This is a Windows desktop application. VidyaSetu ERP and VidyaSetu ERP Sr. use separate installation packages—confirm you have selected the correct product.</p><div class="notice">Back up existing data and contact support before replacing or upgrading an older installation.</div><div class="modal-actions"><button class="btn btn-outline" data-close-modal>Cancel</button><button class="btn btn-primary" data-confirm-download>Continue to download</button></div></div></div>`);
document.querySelector('.back-top')?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
window.addEventListener('scroll',()=>document.querySelector('.back-top')?.classList.toggle('show',scrollY>500));
document.querySelector('[data-close-modal]')?.addEventListener('click',()=>{const m=document.querySelector('#downloadModal');m.classList.remove('open');m.setAttribute('aria-hidden','true')});
document.querySelector('[data-confirm-download]')?.addEventListener('click',e=>{if(e.currentTarget.dataset.url)window.location.href=e.currentTarget.dataset.url;});
