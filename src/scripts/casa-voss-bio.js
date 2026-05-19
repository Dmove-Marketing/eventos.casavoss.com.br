/* Scripts extraídos automaticamente de Casa Voss - Bio.html */

var GTM_ID = 'GTM-XXXXXXX';

(function (w, d, s, l, i) {
            w[l] = w[l] || []; w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
            var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
            j.async = true; j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', GTM_ID);

var N8N_WEBHOOK_URL = 'https://server3n8n.dmove.com.br/webhook/casa-voss';
        var WPP_NUMBER = '5511912176072';
        window.dataLayer = window.dataLayer || [];

        (function () {
            var n = document.createElement('noscript'), i = document.createElement('iframe');
            i.src = 'https://www.googletagmanager.com/ns.html?id=' + GTM_ID;
            i.height = '0';
            i.width = '0';
            i.style.cssText = 'display:none;visibility:hidden';
            n.appendChild(i);
            document.body.insertBefore(n, document.body.firstChild)
        })();

        function getUTMs() {
            var p = new URLSearchParams(window.location.search);
            return {
                utm_source: p.get('utm_source') || '',
                utm_medium: p.get('utm_medium') || '',
                utm_campaign: p.get('utm_campaign') || '',
                utm_content: p.get('utm_content') || '',
                utm_term: p.get('utm_term') || ''
            }
        }
        var utms = getUTMs();
        if (utms.utm_source) sessionStorage.setItem('casavoss_utms', JSON.stringify(utms));

        var fpLocale = {
            weekdays: {
                shorthand: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
                longhand: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
            },
            months: {
                shorthand: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                longhand: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
            },
            firstDayOfWeek: 1,
            rangeSeparator: ' até ',
            ordinal: function () { return 'º' }
        };
        var fpOpts = { disableMobile: true, dateFormat: 'd/m/Y', locale: fpLocale, minDate: 'today', allowInput: false };
        var fpMain = flatpickr('#Data', fpOpts);

        function phoneMask(e) {
            var v = e.target.value.replace(/\D/g, '').substring(0, 11);
            if (v.length > 6) v = '(' + v.substring(0, 2) + ') ' + v.substring(2, 7) + '-' + v.substring(7);
            else if (v.length > 2) v = '(' + v.substring(0, 2) + ') ' + v.substring(2);
            else if (v.length > 0) v = '(' + v;
            e.target.value = v
        }
        document.getElementById('Telefone').addEventListener('input', phoneMask);

        document.addEventListener('input', function (e) {
            if (e.target.id === '_wConv') e.target.value = e.target.value.replace(/[^0-9]/g, '')
        });

        function bioValidate() {
            var ok = true;
            function err(iid, eid, c) {
                var el = document.getElementById(iid), er = document.getElementById(eid);
                if (c) { el.classList.add('error'); er.classList.add('visible'); ok = false }
                else { el.classList.remove('error'); er.classList.remove('visible') }
            }
            var n = document.getElementById('Nome').value.trim(),
                r = document.getElementById('Telefone').value.trim();
            if (r.slice(0, 3) === '+55') r = r.slice(3).trim();
            var t = r.replace(/\D/g, ''),
                em = document.getElementById('Email').value.trim(),
                cv = document.getElementById('Convidados').value.trim();
            err('Nome', 'errNome', n.length < 2);
            err('Telefone', 'errTelefone', t.length < 10 || t.length > 11);
            err('Email', 'errEmail', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em));
            err('Tipo', 'errTipo', document.getElementById('Tipo').value === '');
            err('Data', 'errData', !fpMain.selectedDates.length);
            err('Convidados', 'errConvidados', cv === '' || isNaN(Number(cv)) || Number(cv) < 1);
            return ok
        }

        function postRetry(url, jsonBody, retries) {
            retries = retries || 3;
            return new Promise(function (resolve, reject) {
                var att = 0;
                function go() {
                    att++;
                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Form-Token': 'casa-voss-secreta-123'
                        },
                        body: JSON.stringify(jsonBody),
                        signal: AbortSignal.timeout(8000)
                    }).then(function (r) {
                        if (r.ok) resolve(true);
                        else if (r.status === 429) reject(new Error('rate_limit'));
                        else reject(new Error('http_' + r.status))
                    }).catch(function (e) {
                        if (e.message === 'rate_limit') reject(e);
                        else if (att < retries) setTimeout(go, 1000 * att);
                        else reject(e)
                    })
                }
                go()
            })
        }

        document.getElementById('form_bio').addEventListener('submit', function (e) {
            e.preventDefault();
            if (document.getElementById('Website').value !== '') return;
            if (!bioValidate()) return;

            var btn = document.getElementById('bioSubmitBtn'),
                msg = document.getElementById('bioFormMsg');
            btn.disabled = true;
            btn.textContent = 'ENVIANDO...';
            msg.style.display = 'none';
            msg.className = 'bio-form-msg';

            var sU = JSON.parse(sessionStorage.getItem('casavoss_utms') || '{}'),
                r = document.getElementById('Telefone').value.trim();
            if (r.slice(0, 3) === '+55') r = r.slice(3).trim();

            var payload = {
                post_id: '168',
                form_id: '345d78ac',
                referer_title: 'BIO',
                queried_id: '168',
                form_fields: {
                    "Nome": document.getElementById('Nome').value.trim(),
                    "WhatsApp": r.replace(/\D/g, ''),
                    "Email": document.getElementById('Email').value.trim().toLowerCase(),
                    "Tipo de evento": document.getElementById('Tipo').value,
                    "Data do evento": document.getElementById('Data').value.trim(),
                    "Convidados": document.getElementById('Convidados').value.trim(),
                    "Mensagem": document.getElementById('Mensagem').value.trim(),
                    "Fonte": document.getElementById('Fonte').value
                }
            };

            Object.keys(sU).forEach(function (k) {
                if (sU[k]) payload.form_fields[k] = sU[k]
            });

            postRetry(N8N_WEBHOOK_URL, payload).then(function () {
                window.dataLayer.push({
                    event: 'bio_form_envio',
                    bio_form_name: 'form_bio',
                    bio_form_tipo: payload.form_fields["Tipo de evento"],
                    bio_form_convidados: Number(payload.form_fields["Convidados"]),
                    bio_form_data: payload.form_fields["Data do evento"] || ''
                });
                document.getElementById('bioFormGrid').style.display = 'none';
                document.getElementById('bioSuccess').classList.add('active')
            }).catch(function () {
                btn.disabled = false;
                btn.textContent = 'ENVIAR SOLICITAÇÃO';
                msg.innerHTML = 'Erro ao enviar. Tente novamente ou entre em contato pelo <a href="mailto:contato@casavoss.com.br">contato@casavoss.com.br</a>.';
                msg.className = 'bio-form-msg error';
                msg.style.display = 'block'
            })
        });

        document.querySelectorAll('.bio-input,.bio-select,.bio-textarea').forEach(function (el) {
            function cl() {
                this.classList.remove('error');
                var er = this.parentElement.querySelector('.bio-field-error');
                if (er) er.classList.remove('visible')
            }
            el.addEventListener('input', cl);
            el.addEventListener('change', cl)
        });

        /* POPUP WHATSAPP */
        var TIPOS = [
            'Aniversário', 'Aniversário debutante', 'Bodas', 'Casamento',
            'Confraternização corporativa', 'Confraternização social', 'Corporativo',
            'Feiras e Exposições', 'Formatura', 'Happy Hour',
            'Masterclass e Palestras', 'Mentorias e Treinamentos',
            'Offsite corporativo', 'Reuniões de Networking',
            'Shows e Festivais', 'Workshops, Conferências e Seminários', 'Outros'
        ];
        var chat = document.getElementById('wppChat'),
            bar = document.getElementById('wppBar'),
            overlay = document.getElementById('wppOverlay'),
            wrap = document.getElementById('wppWrap'),
            floatBtn = document.getElementById('wppFloatBtn'),
            isOpen = false,
            fpInst = null,
            dados = { tipo: '', data: '', convidados: '', nome: '', email: '', whatsapp: '' };

        function wppTime() {
            var n = new Date();
            return String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0')
        }
        function scrollChat() { chat.scrollTop = chat.scrollHeight }
        function addRecv(html, ph) {
            var d = document.createElement('div');
            d.className = 'wpp-m wpp-m--r';
            d.setAttribute('data-ph', ph);
            d.innerHTML = html;
            chat.appendChild(d);
            scrollChat();
            return d
        }
        function addSent(text, ph) {
            var d = document.createElement('div');
            d.className = 'wpp-m wpp-m--s';
            d.setAttribute('data-ph', ph);
            d.innerHTML = '<div class="wpp-m-text">' + text + '</div><div class="wpp-m-meta"><span class="wpp-m-chk">✓✓</span><span class="wpp-m-time">' + wppTime() + '</span></div>';
            chat.appendChild(d);
            scrollChat();
            return d
        }
        function showTyping(ph) {
            return new Promise(function (resolve) {
                var d = document.createElement('div');
                d.className = 'wpp-m wpp-m--r';
                d.setAttribute('data-ph', ph);
                d.id = 'wppTyping';
                d.innerHTML = '<div class="wpp-typing"><span></span><span></span><span></span></div>';
                chat.appendChild(d);
                scrollChat();
                setTimeout(function () { d.remove(); resolve() }, 700)
            })
        }
        function removePhase(n) {
            chat.querySelectorAll('[data-ph="' + n + '"]').forEach(function (el) { el.remove() })
        }
        function shake(el) {
            el.classList.remove('wpp-shake');
            void el.offsetWidth;
            el.classList.add('wpp-shake');
            setTimeout(function () { el.classList.remove('wpp-shake') }, 400)
        }
        function clearBar() {
            bar.innerHTML = '';
            if (fpInst) { fpInst.destroy(); fpInst = null }
        }

        var svgAR = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
        var svgAL = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>';

        function tipoOptsHTML() {
            return '<option value="" disabled selected>Tipo de evento</option>' + TIPOS.map(function (t) {
                return '<option value="' + t + '">' + t + '</option>'
            }).join('')
        }

        function barTipo() {
            clearBar();
            bar.innerHTML = '<select class="wpp-bar-sel" id="_wTipo">' + tipoOptsHTML() + '</select><button class="wpp-bar-send" id="_wSend">' + svgAR + '</button>';
            document.getElementById('_wSend').addEventListener('click', advanceTipo);
            document.getElementById('_wTipo').addEventListener('keydown', function (e) { if (e.key === 'Enter') advanceTipo() })
        }
        function barData() {
            clearBar();
            bar.innerHTML = '<input class="wpp-bar-inp" type="text" id="_wData" placeholder="Data do evento" readonly><button class="wpp-bar-send" id="_wSend">' + svgAR + '</button>';
            fpInst = flatpickr('#_wData', Object.assign({}, fpOpts, { position: 'above' }));
            document.getElementById('_wSend').addEventListener('click', advanceData)
        }
        function barConv() {
            clearBar();
            bar.innerHTML = '<input class="wpp-bar-inp" type="number" id="_wConv" placeholder="N° de Pessoas" min="1" max="9999"><button class="wpp-bar-send" id="_wSend">' + svgAR + '</button>';
            document.getElementById('_wSend').addEventListener('click', advanceConv);
            document.getElementById('_wConv').addEventListener('keydown', function (e) { if (e.key === 'Enter') advanceConv() })
        }
        function barSeguir() {
            clearBar();
            bar.innerHTML = '<button class="wpp-bar-full" id="_wSeguir"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><path d="M5 12h14M12 5l7 7-7 7"/></svg> Seguir</button>';
            document.getElementById('_wSeguir').addEventListener('click', goPhase2)
        }
        function barNome() {
            clearBar();
            bar.innerHTML = '<input class="wpp-bar-inp" type="text" id="_wNome" placeholder="Nome" autocomplete="off" maxlength="100"><button class="wpp-bar-send" id="_wSend">' + svgAR + '</button>';
            document.getElementById('_wSend').addEventListener('click', advanceNome);
            document.getElementById('_wNome').addEventListener('keydown', function (e) { if (e.key === 'Enter') advanceNome() })
        }
        function barEmail() {
            clearBar();
            bar.innerHTML = '<input class="wpp-bar-inp" type="email" id="_wEmail" placeholder="E-mail" autocomplete="off" maxlength="200"><button class="wpp-bar-send" id="_wSend">' + svgAR + '</button>';
            document.getElementById('_wSend').addEventListener('click', advanceEmail);
            document.getElementById('_wEmail').addEventListener('keydown', function (e) { if (e.key === 'Enter') advanceEmail() })
        }
        function barWpp() {
            clearBar();
            bar.innerHTML = '<input class="wpp-bar-inp" type="tel" id="_wWpp" placeholder="WhatsApp" autocomplete="off" maxlength="20"><button class="wpp-bar-send" id="_wSend">' + svgAR + '</button>';
            document.getElementById('_wWpp').addEventListener('input', phoneMask);
            document.getElementById('_wSend').addEventListener('click', advanceWpp);
            document.getElementById('_wWpp').addEventListener('keydown', function (e) { if (e.key === 'Enter') advanceWpp() })
        }
        function barActions() {
            clearBar();
            bar.innerHTML = '<div class="wpp-bar-acts"><button class="wpp-bar-abtn wpp-bar-ag" id="_wVoltar">' + svgAL + ' Voltar</button><button class="wpp-bar-abtn wpp-bar-ad" id="_wIniciar"><svg viewBox="0 0 1219.547 1225.016"><path fill="#fff" d="M1036.898 176.091C923.562 62.677 772.859.185 612.297.114 281.43.114 12.172 269.286 12.039 600.137 12 705.896 39.633 809.13 92.156 900.13L7 1211.067l318.203-83.438c87.672 47.812 186.383 73.008 286.836 73.047h.255.003c330.812 0 600.109-269.219 600.25-600.055.055-160.343-62.328-311.108-175.649-424.53zm-424.601 923.242h-.195c-89.539-.047-177.344-24.086-253.93-69.531l-18.227-10.805-188.828 49.508 50.414-184.039-11.875-18.867c-49.945-79.414-76.312-171.188-76.273-265.422.109-274.992 223.906-498.711 499.102-498.711 133.266.055 258.516 52 352.719 146.266 94.195 94.266 146.031 219.578 145.992 352.852-.118 274.999-223.923 498.749-498.899 498.749z"/><path fill="#fff" d="M27.875 1190.114l82.211-300.18c-50.719-87.852-77.391-187.523-77.359-289.602.133-319.398 260.078-579.25 579.469-579.25 155.016.07 300.508 60.398 409.898 169.891 109.414 109.492 169.633 255.031 169.57 409.812-.133 319.406-260.094 579.281-579.445 579.281-.023 0 .016 0 0 0 0h-.258c-96.977-.031-192.266-24.375-276.898-70.5l-307.188 80.548z"/><path fill-rule="evenodd" clip-rule="evenodd" fill="#1f2c2f" d="M462.273 349.294c-11.234-24.977-23.062-25.477-33.75-25.914-8.742-.375-18.75-.352-28.742-.352-10 0-26.25 3.758-39.992 18.766-13.75 15.008-52.5 51.289-52.5 125.078 0 73.797 53.75 145.102 61.242 155.117 7.5 10 103.758 166.266 256.203 226.383 126.695 49.961 152.477 40.023 179.977 37.523s88.734-36.273 101.234-71.297c12.5-35.016 12.5-65.031 8.75-71.305-3.75-6.25-13.75-10-28.75-17.5s-88.734-43.789-102.484-48.789-23.75-7.5-33.75 7.516c-10 15-38.727 48.773-47.477 58.773-8.75 10.023-17.5 11.273-32.5 3.773-15-7.523-63.305-23.344-120.609-74.438-44.586-39.75-74.688-88.844-83.438-103.859-8.75-15-.938-23.125 6.586-30.602 6.734-6.719 15-17.508 22.5-26.266 7.484-8.758 9.984-15.008 14.984-25.008 5-10.016 2.5-18.773-1.25-26.273s-32.898-81.67-46.234-111.326z"/></svg> Iniciar conversa</button></div></div>';
            document.getElementById('_wVoltar').addEventListener('click', goBack);
            document.getElementById('_wIniciar').addEventListener('click', openWhatsApp)
        }

        function advanceTipo() {
            var el = document.getElementById('_wTipo'), v = el.value;
            if (!v) { shake(el); return }
            dados.tipo = v;
            addSent(v, 1);
            barData()
        }
        function advanceData() {
            var el = document.getElementById('_wData');
            if (!fpInst || !fpInst.selectedDates.length) { shake(el); return }
            dados.data = el.value;
            addSent(el.value, 1);
            barConv()
        }
        function advanceConv() {
            var el = document.getElementById('_wConv'), v = el.value.trim();
            if (!v || isNaN(Number(v)) || Number(v) < 1) { shake(el); return }
            dados.convidados = v;
            addSent(v + ' pessoas', 1);
            barSeguir()
        }
        function goPhase2() {
            clearBar();
            bar.style.visibility = 'hidden';
            showTyping(2).then(function () {
                addRecv('<p>Perfeito! Agora me informe seus dados de contato para continuarmos.</p>', 2);
                barNome();
                bar.style.visibility = ''
            })
        }
        function advanceNome() {
            var el = document.getElementById('_wNome'), v = el.value.trim();
            if (v.length < 2) { shake(el); return }
            dados.nome = v;
            addSent(v, 2);
            barEmail()
        }
        function advanceEmail() {
            var el = document.getElementById('_wEmail'), v = el.value.trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { shake(el); return }
            dados.email = v;
            addSent(v, 2);
            barWpp()
        }
        function advanceWpp() {
            var el = document.getElementById('_wWpp'), r = el.value.trim();
            if (r.slice(0, 3) === '+55') r = r.slice(3).trim();
            var w = r.replace(/\D/g, '');
            if (w.length < 10 || w.length > 11) { shake(el); return }
            dados.whatsapp = r;
            addSent(r, 2);
            barActions()
        }
        function goBack() {
            removePhase(2);
            barSeguir()
        }
        function openWhatsApp() {
            var txt = 'Olá! Gostaria de saber mais sobre a Casa Voss.%0A%0A';
            txt += '*Tipo de evento:* ' + encodeURIComponent(dados.tipo) + '%0A';
            txt += '*Data do evento:* ' + encodeURIComponent(dados.data) + '%0A';
            txt += '*Convidados:* ' + encodeURIComponent(dados.convidados) + '%0A%0A';
            txt += '*Nome:* ' + encodeURIComponent(dados.nome) + '%0A';
            txt += '*E-mail:* ' + encodeURIComponent(dados.email) + '%0A';
            txt += '*WhatsApp:* ' + encodeURIComponent(dados.whatsapp);
            window.dataLayer.push({
                event: 'wpp_popup_iniciar',
                wpp_popup_tipo: dados.tipo,
                wpp_popup_data: dados.data,
                wpp_popup_convidados: dados.convidados,
                wpp_popup_nome: dados.nome,
                wpp_popup_email: dados.email,
                wpp_popup_whatsapp: dados.whatsapp.replace(/\D/g, '')
            });
            closePopup();
            window.open('https://wa.me/' + WPP_NUMBER + '?text=' + txt, '_blank', 'noopener,noreferrer')
        }

        function openPopup() {
            if (isOpen) return;
            isOpen = true;
            overlay.classList.add('open');
            wrap.classList.add('open');
            document.body.style.overflow = 'hidden';
            chat.innerHTML = '';
            dados = { tipo: '', data: '', convidados: '', nome: '', email: '', whatsapp: '' };
            addRecv('<p>Olá! 👋</p><p>Preencha as informações abaixo para iniciar a conversa e saber mais sobre o seu evento.</p>', 1);
            barTipo()
        }
        function closePopup() {
            if (!isOpen) return;
            isOpen = false;
            overlay.classList.remove('open');
            wrap.classList.remove('open');
            document.body.style.overflow = '';
            clearBar()
        }

        floatBtn.addEventListener('click', function (e) {
            e.preventDefault();
            isOpen ? closePopup() : openPopup()
        });
        document.getElementById('wppClose').addEventListener('click', closePopup);
        overlay.addEventListener('click', closePopup);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && isOpen) closePopup()
        });