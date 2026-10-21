
document.addEventListener('DOMContentLoaded',()=>{
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.querySelector('.nav-links');
  if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});}
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}}),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));
  const year=document.querySelectorAll('[data-year]');year.forEach(el=>el.textContent=new Date().getFullYear());
  const cursor=document.querySelector('.cursor-glow');
  if(cursor&&matchMedia('(pointer:fine)').matches){window.addEventListener('pointermove',e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';},{passive:true});}
  document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    const group=btn.closest('[data-filter-group]');if(!group)return;
    group.querySelectorAll('[data-filter]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
    const filter=btn.dataset.filter;group.querySelectorAll('[data-filter-card]').forEach(card=>card.classList.toggle('hidden-card',filter!=='all'&&card.dataset.filterCard!==filter));
  }));
  document.querySelectorAll('form[data-demo-form]').forEach(form=>form.addEventListener('submit',e=>{
    e.preventDefault();const message=form.querySelector('[data-form-message]');if(message)message.textContent='Thanks! This demo form is working locally. Connect a form service or WordPress form plugin to receive real submissions.';form.reset();
  }));
  document.querySelectorAll('[data-current-year]').forEach(el=>el.textContent=new Date().getFullYear());
  document.querySelectorAll('form[data-contact-form]').forEach(form=>form.addEventListener('submit',async e=>{
    e.preventDefault();
    const msg=form.querySelector('[data-form-message]');const btn=form.querySelector('button[type=submit]');
    const data=Object.fromEntries(new FormData(form).entries());
    if(btn)btn.disabled=true;if(msg)msg.textContent='Sending...';
    try{
      const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const out=await r.json().catch(()=>({}));
      if(out.ok){if(msg)msg.textContent='Thank you! Your message has been sent. We will reply soon.';form.reset();}
      else{if(msg)msg.textContent=out.msg||'Sorry, something went wrong. Please email us at real.saqiii@gmail.com.';}
    }catch(err){if(msg)msg.textContent='Network error. Please try again.';}
    if(btn)btn.disabled=false;
  }));
});
