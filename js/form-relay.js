// Form-relay submit handler.
// Any <form class="form-relay-form"> gets intercepted, serialized to JSON,
// and POSTed to the agency form-relay service. Hidden inputs client_id and
// form_type drive routing on the relay side.

(function () {
  var ENDPOINT = 'https://form-relay-production.up.railway.app/submit';

  function showSuccess(form) {
    var msg = form.getAttribute('data-success-message') || "Got it. I'll reply within 24 hours.";
    var wrap = document.createElement('div');
    wrap.className = 'form-relay-success';
    wrap.style.padding = '32px 24px';
    wrap.style.textAlign = 'center';
    wrap.style.border = '1px solid var(--accent-soft, rgba(200,149,109,0.3))';
    wrap.style.background = 'rgba(200,149,109,0.05)';
    wrap.style.color = 'var(--text, #f4ede4)';
    wrap.style.fontSize = '17px';
    wrap.style.lineHeight = '1.5';
    wrap.textContent = msg;
    form.parentNode.replaceChild(wrap, form);
  }

  function showError(form, btn, originalText, message) {
    btn.textContent = originalText;
    btn.disabled = false;
    var note = form.querySelector('.form-relay-error');
    if (!note) {
      note = document.createElement('p');
      note.className = 'form-relay-error';
      note.style.color = '#d97560';
      note.style.fontSize = '14px';
      note.style.marginTop = '12px';
      form.appendChild(note);
    }
    note.textContent = message + ' If this keeps happening, email jeffrayshootsyou@gmail.com directly.';
  }

  function handle(e) {
    e.preventDefault();
    var form = e.target;
    var btn = form.querySelector('button[type="submit"]');
    var originalText = btn ? btn.textContent : '';

    if (btn) {
      btn.textContent = 'Sending…';
      btn.disabled = true;
    }

    var data = new FormData(form);
    var payload = {};
    data.forEach(function (value, key) {
      payload[key] = value;
    });

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().then(function (body) { return { status: res.status, body: body }; });
      })
      .then(function (result) {
        if (result.body && result.body.ok) {
          showSuccess(form);
        } else {
          var err = (result.body && result.body.error) || 'Submission failed.';
          showError(form, btn, originalText, 'Sorry — ' + err);
        }
      })
      .catch(function () {
        showError(form, btn, originalText, 'Network error.');
      });
  }

  function init() {
    var forms = document.querySelectorAll('form.form-relay-form');
    for (var i = 0; i < forms.length; i++) {
      forms[i].addEventListener('submit', handle);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
