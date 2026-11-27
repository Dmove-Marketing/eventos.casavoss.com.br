/**
 * Slides com crossfade para os blocos gerados por CdnSlides.astro.
 * - Mostra as fotos em ordem numérica, em loop.
 * - Só roda enquanto o bloco está visível; pausa com a aba em segundo plano.
 * - Carrega a próxima foto antes de exibi-la (data-src → src).
 * - Respeita prefers-reduced-motion (fica na 1ª foto).
 */
function carregar(img: HTMLImageElement): Promise<void> {
  if (!img.dataset.src) return img.complete ? Promise.resolve() : img.decode().catch(() => {});
  if (img.dataset.srcset) img.srcset = img.dataset.srcset;
  img.src = img.dataset.src;
  delete img.dataset.src;
  delete img.dataset.srcset;
  return img.decode().catch(() => {});
}

function iniciar(bloco: HTMLElement, atrasoInicial: number) {
  const slides = Array.from(bloco.querySelectorAll<HTMLImageElement>('.cdn-slide'));
  if (slides.length < 2) return;
  const intervalo = Number(bloco.dataset.interval) || 4500;
  let atual = 0;
  let timer: number | undefined;
  let visivel = false;

  const agendar = (ms: number) => {
    window.clearTimeout(timer);
    if (!visivel || document.hidden) return;
    timer = window.setTimeout(avancar, ms);
  };

  async function avancar() {
    const prox = (atual + 1) % slides.length;
    await carregar(slides[prox]);
    if (!visivel || document.hidden) return;
    slides[atual].classList.remove('ativo');
    slides[prox].classList.add('ativo');
    atual = prox;
    carregar(slides[(atual + 1) % slides.length]); // pré-carrega a seguinte
    agendar(intervalo);
  }

  new IntersectionObserver((entries) => {
    visivel = entries.some((e) => e.isIntersecting);
    if (visivel) {
      carregar(slides[(atual + 1) % slides.length]);
      agendar(atual === 0 && atrasoInicial ? intervalo + atrasoInicial : intervalo);
      atrasoInicial = 0;
    } else {
      window.clearTimeout(timer);
    }
  }, { rootMargin: '200px 0px' }).observe(bloco);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.clearTimeout(timer);
    else agendar(intervalo);
  });
}

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // Defasagem entre blocos para as trocas não acontecerem todas ao mesmo tempo
  document.querySelectorAll<HTMLElement>('[data-cdn-slides]').forEach((bloco, i) => iniciar(bloco, i * 700));
}
