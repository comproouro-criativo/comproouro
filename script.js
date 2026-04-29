// ========== Compro Ouro – script.js ==========

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

/* ========== Lightbox com navegação e fade ========== */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.querySelector('.lightbox-imagem');
const lightboxFechar = document.querySelector('.lightbox-fechar');
const setaEsquerda = document.querySelector('.lightbox-seta-esquerda');
const setaDireita = document.querySelector('.lightbox-seta-direita');

const imagensGaleria = Array.from(document.querySelectorAll('.galeria-feed img'));
let imagemAtualIndex = 0;

function blockScroll(e) { e.preventDefault(); }

imagensGaleria.forEach((img, index) => {
    img.addEventListener('click', () => {
        imagemAtualIndex = index;
        atualizarImagem(true);
        lightbox.classList.add('ativa');
        document.body.style.overflow = 'hidden';
        document.addEventListener('touchmove', blockScroll, { passive: false });
    });
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
    document.body.style.overflow = '';
    document.removeEventListener('touchmove', blockScroll);
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
lightbox?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

lightbox?.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (diff > 50) proximaImagem();
    else if (diff < -50) imagemAnterior();
}, { passive: true });

/* ========== Copiar telefone ========== */
function copiarTelefone() {
    const numero = document.getElementById('telefoneCopiar')?.textContent.trim();
    if (!numero) return;
    navigator.clipboard.writeText(numero).then(() => {
        alert('Número copiado!');
    }).catch(() => {
        const temp = document.createElement('input');
        temp.value = numero;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        alert('Número copiado!');
    });
}

/* ========== Abrir e-mail com efeito ========== */
function abrirEmail(botao) {
    const textoOriginal = botao.textContent.trim();
    const email = 'comproouro.criativo@gmail.com';
    botao.style.transform = 'scale(0.95)';
    botao.style.background = '#555';
    botao.textContent = 'Quase lá...';
    botao.style.pointerEvents = 'none';
    setTimeout(() => {
        window.location.href = 'mailto:' + email;
    }, 400);
    setTimeout(() => {
        botao.textContent = textoOriginal;
        botao.style.transform = '';
        botao.style.background = '';
        botao.style.pointerEvents = '';
    }, 1500);
}

/* ========== Acordeão FAQ ========== */
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-pergunta');
    if (!btn) return;

    const item = btn.closest('.faq-item');
    const icone = btn.querySelector('.faq-icone');
    const jaAberto = item.classList.contains('ativo');

    document.querySelectorAll('.faq-item.ativo').forEach(aberto => {
        aberto.classList.remove('ativo');
        aberto.querySelector('.faq-pergunta').setAttribute('aria-expanded', 'false');
        aberto.querySelector('.faq-icone').textContent = '+';
    });

    if (!jaAberto) {
        item.classList.add('ativo');
        btn.setAttribute('aria-expanded', 'true');
        icone.textContent = '−';
    }

    const wrapper = item.closest('.expandir-wrapper');
    if (wrapper && wrapper.style.maxHeight && wrapper.style.maxHeight !== '0px') {
        const resposta = item.querySelector('.faq-resposta p');
        const alturaResposta = !jaAberto && resposta ? resposta.closest('.faq-resposta').scrollHeight : 0;
        const novaAltura = wrapper.scrollHeight + alturaResposta;
        wrapper.style.maxHeight = novaAltura + 'px';
    }
});

/* ========== Mostrar LIMITE itens + botão expandir ========== */
const LIMITE = 8;

function configurarExpandir(itens, container) {
    if (itens.length <= LIMITE) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'expandir-wrapper';

    itens.forEach((item, i) => {
        if (i >= LIMITE) wrapper.appendChild(item);
    });

    const ultimoVisivel = itens[LIMITE - 1];
    ultimoVisivel.insertAdjacentElement('afterend', wrapper);

    const btn = document.createElement('button');
    btn.className = 'btn-expandir';
    btn.innerHTML = `<span class="btn-expandir-icone">+</span><span class="btn-expandir-texto">Ver todos (${itens.length})</span>`;
    container.appendChild(btn);

    btn.addEventListener('click', () => {
        const expandido = btn.classList.contains('expandido');

        if (!expandido) {
            wrapper.style.maxHeight = wrapper.scrollHeight + 'px';
            btn.classList.add('expandido');
            btn.querySelector('.btn-expandir-texto').textContent = 'Recolher';
        } else {
            wrapper.querySelectorAll('.faq-item.ativo').forEach(aberto => {
                aberto.classList.remove('ativo');
                aberto.querySelector('.faq-pergunta').setAttribute('aria-expanded', 'false');
                aberto.querySelector('.faq-icone').textContent = '+';
            });

            wrapper.style.maxHeight = wrapper.scrollHeight + 'px';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    wrapper.style.maxHeight = '0';
                });
            });

            btn.classList.remove('expandido');
            btn.querySelector('.btn-expandir-texto').textContent = `Ver todos (${itens.length})`;
        }
    });
}

// Aplica nos serviços
const listaServicos = document.querySelector('.lista-servicos');
if (listaServicos) {
    const itensServico = Array.from(listaServicos.querySelectorAll('li'));
    configurarExpandir(itensServico, listaServicos);
}

// Aplica no FAQ
const listaFaq = document.querySelector('.sf-faq');
if (listaFaq) {
    const itensFaq = Array.from(listaFaq.querySelectorAll('.faq-item'));
    configurarExpandir(itensFaq, listaFaq);
}

// Corrige o hover travado no mobile
document.addEventListener('touchstart', function() {
    document.querySelectorAll(':hover').forEach(el => {
        el.style.removeProperty('color');
        el.style.removeProperty('background-color');
        el.style.removeProperty('transform');
        setTimeout(() => {
            el.style.color = '';
            el.style.backgroundColor = '';
            el.style.transform = '';
        }, 0);
    });
}, { passive: true });