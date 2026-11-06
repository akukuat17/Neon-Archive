document.querySelectorAll('form[data-form]').forEach(f => f.addEventListener('submit', e => {
  e.preventDefault(); let ok = true;
  f.querySelectorAll('[required]').forEach(i => {
    const v = i.value.trim(); let m = '';
    if (!v) m = 'Wajib diisi';
    else if (i.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) m = 'Format email tidak valid';
    else if (+i.dataset.min && v.length < +i.dataset.min) m = 'Minimal ' + i.dataset.min + ' karakter';
    i.parentElement.querySelector('.err').textContent = m; if (m) ok = false;
  });
  if (ok) {
    f.querySelector('.sukses').hidden = false;
    showToast('Formulir berhasil dikirim', 'success');
    f.reset();
  }
}));