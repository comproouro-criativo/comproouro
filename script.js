// ========== Compro Ouro – script.js ==========

// Garante que a página sempre abra no topo
window.addEventListener('load', () => {
    window.scrollTo(0, 0);
});

/* ========== Autoplay do vídeo — fallback mobile ========== */
(function () {
    const video = document.querySelector('.video-destaque video');
    if (!video) return;

    video.muted = true;
    video.playsInline = true;

    function tentarPlay() {
        const promise = video.play();
        if (promise !== undefined) {
            promise.catch(() => {
                const desbloqueio = () => {
                    video.play().catch(() => {});
                    document.removeEventListener('touchstart', desbloqueio);
                    document.removeEventListener('click', desbloqueio);
                };
                document.addEventListener('touchstart', desbloqueio, { once: true, passive: true });
                document.addEventListener('click', desbloqueio, { once: true });
            });
        }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        tentarPlay();
    } else {
        document.addEventListener('DOMContentLoaded', tentarPlay, { once: true });
    }
})();

/* ========== Scroll centralizado + Modo Foco ========== */
document.querySelectorAll('.header-center nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const id = this.getAttribute('href').substring(1);
        const secao = document.getElementById(id);
        if (!secao) return;

        document.body.classList.remove('foco');
        if (window.scrollHandler) {
            window.removeEventListener('scroll', window.scrollHandler);
            window.scrollHandler = null;
        }

        const topo = secao.getBoundingClientRect().top + window.pageYOffset;
        let destino;

        if (id === 'portfolio') {
            const videoSection = document.querySelector('.video-destaque');
            if (videoSection) {
                const rect = videoSection.getBoundingClientRect();
                destino = rect.top + window.pageYOffset + rect.height;
            } else {
                destino = topo;
            }
        } else {
            const alturaSecao = secao.offsetHeight;
            const centralizar = (window.innerHeight - alturaSecao) / 2;
            destino = topo - centralizar;
        }

        window.scrollTo({ top: destino, behavior: 'smooth' });

        setTimeout(() => {
            document.body.classList.add('foco');
            window.secaoAtiva = secao;
            window.scrollHandler = () => {
                if (!window.secaoAtiva) return;
                const rect = window.secaoAtiva.getBoundingClientRect();
                const alturaVisivel = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
                const visivel = alturaVisivel / window.secaoAtiva.offsetHeight;
                if (visivel < 0.8) {
                    document.body.classList.remove('foco');
                    window.removeEventListener('scroll', window.scrollHandler);
                    window.scrollHandler = null;
                    window.secaoAtiva = null;
                }
            };
            window.addEventListener('scroll', window.scrollHandler, { passive: true });
        }, 400);
    });
});

/* ========== Animação de fade-in ========== */
const fadeElements = document.querySelectorAll('.fade-in');
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });
    fadeElements.forEach(el => observer.observe(el));
} else {
    fadeElements.forEach(el => el.classList.add('visible'));
}
document.querySelector('.header-center')?.classList.add('visible');

/* ========== Lightbox ========== */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.querySelector('.lightbox-imagem');
const lightboxFechar = document.querySelector('.lightbox-fechar');
const setaEsquerda = document.querySelector('.lightbox-seta-esquerda');
const setaDireita = document.querySelector('.lightbox-seta-direita');

const imagensGaleria = Array.from(document.querySelectorAll('.galeria-feed img'));
let imagemAtualIndex = 0;

// Bloqueia touchmove sem position:fixed — sem piscada, sem salto
function blockScroll(e) { e.preventDefault(); }

imagensGaleria.forEach((img, index) => {
    let touchStartX = 0;
    let touchStartY = 0;

    const abrirLightbox = () => {
        imagemAtualIndex = index;
        atualizarImagem(true);
        lightbox.classList.add('ativa');
        document.body.style.overflow = 'hidden';
        document.addEventListener('touchmove', blockScroll, { passive: false });
    };

    img.addEventListener('click', abrirLightbox); // desktop

    img.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    img.addEventListener('touchend', (e) => {
        const diffX = Math.abs(e.changedTouches[0].screenX - touchStartX);
        const diffY = Math.abs(e.changedTouches[0].screenY - touchStartY);

        // Se moveu mais de 10px em qualquer direção, era scroll — ignora
        if (diffX > 10 || diffY > 10) return;

        e.preventDefault(); // cancela o click sintético
        abrirLightbox();
    }, { passive: false });
});

function atualizarImagem(instant = false) {
    if (instant) {
        const img = imagensGaleria[imagemAtualIndex];
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxImg.style.opacity = '1';
        return;
    }
    lightboxImg.style.opacity = '0';
    setTimeout(() => {
        const img = imagensGaleria[imagemAtualIndex];
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxImg.style.opacity = '1';
    }, 250);
}

function proximaImagem() {
    imagemAtualIndex = (imagemAtualIndex + 1) % imagensGaleria.length;
    atualizarImagem();
}

function imagemAnterior() {
    imagemAtualIndex = (imagemAtualIndex - 1 + imagensGaleria.length) % imagensGaleria.length;
    atualizarImagem();
}

setaDireita?.addEventListener('click', proximaImagem);
setaEsquerda?.addEventListener('click', imagemAnterior);

function fecharLightbox() {
    lightbox.classList.remove('ativa');
    document.body.style.overflow = '';                          // desktop
    document.removeEventListener('touchmove', blockScroll);    // mobile
    // Scroll position nunca foi alterada — não há nada para restaurar
}

lightboxFechar?.addEventListener('click', fecharLightbox);

lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) fecharLightbox();
});

document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('ativa')) return;
    if (e.key === 'Escape') fecharLightbox();
    else if (e.key === 'ArrowRight') proximaImagem();
    else if (e.key === 'ArrowLeft') imagemAnterior();
});

let touchStartX = 0;
let touchEndX = 0;

lightbox?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

lightbox?.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (diff > 50) proximaImagem();
    else if (diff < -50) imagemAnterior();
}, { passive: true });