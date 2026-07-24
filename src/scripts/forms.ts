// Mapa de normalização: name do campo → label legível (padrão n8n/Elementor)
const FIELD_LABEL: Record<string, string> = {
  nome:       'Nome',
  sobrenome:  'Sobrenome',
  telefone:   'WhatsApp',
  whatsapp:   'WhatsApp',
  email:      'E-mail',
  tipo:       'Tipo de evento',
  data:       'Data do evento',
  convidados: 'Convidados',
  empresa:    'Empresa',
  mensagem:   'Mensagem',
  fonte:      'Fonte',
  horario:    'Horário',
  assunto:    'Assunto',
  cargo:      'Cargo',
  cidade:     'Cidade',
};

function normalizeField(raw: string): string {
  const key = raw.replace(/^form_fields\[(.+)\]$/, '$1').toLowerCase();
  return FIELD_LABEL[key] ?? raw;
}

function getCookie(name: string): string {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : '';
}

// Coleta parâmetros de atribuição — mesma lógica do script Elementor:
// lê UTMs de cookies próprios e click IDs/pixel cookies
function collectAttribution(): Record<string, string> {
  const out: Record<string, string> = {};

  // UTMs dos cookies individuais (gravados pelo UTMCapture)
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(k => {
    const v = getCookie(k); if (v) out[k] = v;
  });

  // Click IDs
  const gclid  = getCookie('gclid')  || getCookie('__gclid');  if (gclid)  out['gclid']  = gclid;
  const fbclid = getCookie('fbclid');                           if (fbclid) out['fbclid'] = fbclid;
  const ttclid = getCookie('ttclid');                           if (ttclid) out['ttclid'] = ttclid;
  const gbraid = getCookie('gbraid') || getCookie('__gbraid'); if (gbraid) out['gbraid'] = gbraid;
  const wbraid = getCookie('wbraid') || getCookie('__wbraid'); if (wbraid) out['wbraid'] = wbraid;

  // Cookies de pixel
  const fbp = getCookie('_fbp'); if (fbp) out['fbp'] = fbp;
  const fbc = getCookie('_fbc'); if (fbc) out['fbc'] = fbc;
  const ga  = getCookie('_ga');  if (ga)  out['_ga'] = ga;

  // Fallback: sessionStorage (merge com o que o UTMCapture capturou)
  try {
    const ss = sessionStorage.getItem('dmove_tracking');
    if (ss) {
      const parsed = JSON.parse(ss);
      ['utm_source','utm_medium','utm_campaign','utm_content','utm_term',
       'gclid','fbclid','ttclid','fbp','fbc','_ga','referrer'].forEach(k => {
        if (parsed[k] && !out[k]) out[k] = parsed[k];
      });
    }
  } catch {}

  return out;
}

// Constrói query string decodificada (igual ao padrão Elementor)
function buildQueryString(params: Record<string, string>): string {
  return Object.entries(params)
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
}

// Popula o campo Fonte de um formulário com: "prefixo?utm_source=...&utm_medium=..."
function populateFonteFields(form: HTMLFormElement) {
  const attribution = collectAttribution();
  const qs = buildQueryString(attribution);
  if (!qs) return;

  const selectors = [
    'input[name="form_fields[fonte]"]',
    'input[name="fonte"]',
    'input[name$="[fonte]"]',
    'textarea[name="form_fields[fonte]"]',
  ];

  form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(selectors.join(', ')).forEach(el => {
    const base  = el.value || '';
    const qpos  = base.indexOf('?');
    const prefix = qpos === -1 ? base : base.slice(0, qpos);
    el.value = prefix + (qs ? '?' + qs : '');
  });
}

export function initForms() {
  const forms = document.querySelectorAll<HTMLFormElement>('form[data-form-id]');
  forms.forEach((form) => {
    let started = false;
    const formId     = form.dataset.formId!;
    const project    = form.dataset.project || window.location.hostname;
    const apiUrl     = form.dataset.apiUrl ?? '';
    const submitUrl  = form.dataset.submitUrl || (apiUrl ? `${apiUrl}/submit` : null);
    const redirectUrl = form.dataset.redirect;
    const gridId     = form.dataset.gridId;
    const successId  = form.dataset.successId;

    if (!submitUrl) {
      console.warn(`[Forms] Formulário "${formId}" sem data-submit-url.`);
      return;
    }

    // Pré-popula Fonte já no carregamento (UTMs visíveis no campo antes do submit)
    populateFonteFields(form);

    form.addEventListener('focusin', () => {
      if (!started) {
        started = true;
        (window as any).dataLayer?.push({ event: 'form_start', form_id: formId, project });
      }
    });

    async function handleSubmit() {
      // Honeypot
      const hp = form.querySelector<HTMLInputElement>('[name="website"]');
      if (hp?.value) return;

      // Atualiza Fonte no momento do submit (garante cookies atualizados)
      populateFonteFields(form);

      // Validação de obrigatórios
      let valid = true;
      form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[required]').forEach(el => {
        const empty = el.value.trim() === '';
        const group = el.closest('[class*="form-group"]') as HTMLElement | null;
        const err   = group?.querySelector<HTMLElement>('[class*="field-error"]');
        if (empty) {
          valid = false;
          el.classList.add('error');
          err?.classList.add('visible');
        } else {
          el.classList.remove('error');
          err?.classList.remove('visible');
        }
      });
      if (!valid) return;

      // Loading state
      const submitBtn  = form.querySelector<HTMLButtonElement>('.form-submit');
      const btnText    = submitBtn?.querySelector<HTMLElement>('.btn-text');
      const btnLoading = submitBtn?.querySelector<HTMLElement>('.btn-loading');
      const msgEl = gridId
        ? document.getElementById(gridId)?.querySelector<HTMLElement>('[id$="FormMsg"]')
        : form.querySelector<HTMLElement>('.form-error');

      if (submitBtn) submitBtn.disabled = true;
      if (btnText && btnLoading) {
        btnText.style.display    = 'none';
        btnLoading.style.display = 'inline-flex';
      } else if (submitBtn && !btnLoading) {
        submitBtn.dataset.originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Enviando...';
      }
      if (msgEl) msgEl.style.display = 'none';

      // Coleta campos com nomes normalizados
      const formData = new FormData(form);
      const fields: Record<string, string> = {};
      formData.forEach((v, k) => {
        if (k !== 'website') fields[normalizeField(k)] = v.toString();
      });

      // Atribuição completa para campos flat do payload
      const attribution = collectAttribution();
      const firstVisit  = localStorage.getItem('dmove_first_visit')
        || sessionStorage.getItem('dmove_first_visit')
        || '';

      // Payload flat — padrão Elementor/n8n
      const payload: Record<string, string> = {
        ...fields,                              // campos do form (Nome, WhatsApp, E-mail, Fonte com UTMs...)
        form_id:            formId,
        form_name:          project,
        'Desenvolvido por': 'Dmove Sites',
        'URL da página':    window.location.href,
        'Agente de usuário': navigator.userAgent,
        ...attribution,                         // utm_source, utm_medium, gclid, fbclid, fbp, fbc...
        first_visit:  firstVisit,
        submitted_at: new Date().toISOString(),
      };

      try {
        const res = await fetch(submitUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('http_' + res.status);

        let json: any = {};
        try { json = await res.json(); } catch {}

        (window as any).dataLayer?.push({ event: 'form_submit', form_id: formId, project, ...fields });

        const redir = redirectUrl || json.redirect;
        if (redir) { window.location.href = redir; return; }

        const gridEl    = gridId    ? document.getElementById(gridId)    : null;
        const successEl = successId ? document.getElementById(successId) : null;

        if (gridEl && successEl) {
          gridEl.style.display = 'none';
          successEl.classList.add('active');
        } else {
          form.innerHTML = `
            <div class="form-success" style="text-align:center;padding:2rem">
              <div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;background:#2563eb;border-radius:50%;font-size:1.5rem;color:#fff">✓</div>
              <h3 style="font-size:1.15rem;font-weight:600;margin-bottom:4px">Enviado com sucesso!</h3>
              <p style="color:#666;font-size:.9rem">Em breve entraremos em contato.</p>
            </div>`;
        }
      } catch (err: any) {
        (window as any).dataLayer?.push({ event: 'form_error', form_id: formId, error: err.message });

        if (msgEl) {
          msgEl.innerHTML = 'Erro ao enviar. Tente novamente mais tarde.';
          msgEl.style.display = 'block';
        } else {
          alert('Erro ao enviar o formulário. Tente novamente mais tarde.');
        }

        if (submitBtn) {
          submitBtn.disabled = false;
          if (btnText && btnLoading) {
            btnText.style.display    = 'inline';
            btnLoading.style.display = 'none';
          } else if (submitBtn.dataset.originalText) {
            submitBtn.innerHTML = submitBtn.dataset.originalText;
          }
        }
      }
    }

    form.querySelector<HTMLButtonElement>('.form-submit')?.addEventListener('click', handleSubmit);

    form.addEventListener('keydown', (e: KeyboardEvent) => {
      if (
        e.key === 'Enter' &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLButtonElement)
      ) {
        e.preventDefault();
        handleSubmit();
      }
    });
  });
}

