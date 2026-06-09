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
                    video.play().catch(() => { });
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

/* ========== DADOS DOS PROJETOS ========== */
const projetos = [
    // [Posição 0] - Seu primeiro projeto
    {
        nome: 'Projeto 1',
        imagens: [
            'imagens/back.jpg',
            'imagens/back1.jpg',
            'imagens/back2.jpg',
            'imagens/back3.jpg'
        ]
    },
    // [Posição 1] - Seu segundo projeto (Exemplo: Noiva)
    {
        nome: 'Projeto 2',
        imagens: [
            'imagens/elvis.jpg',
            'imagens/elvis1.jpg',
            'imagens/elvis2.jpg',
               'imagens/elvis3.jpg'
        ]
    },
    // [Posição 2] - O projeto do Vídeo (Deve ser o ÚLTIMO da lista)
    {
        nome: 'Cidades x Mezoil',
        imagens: [
            'videos/cidades.mp4'
        ]
    },

        {
        nome: 'Modelo',
        imagens: [
            'imagens/modelo.jpg',
            'imagens/modelo2.avif',
        ]
    },
];

/* ========== SISTEMA DE PASTAS – CLIQUE NAS CAPAS (IMG + VÍDEO) ========== */
let videoFullscreenAtual = null;

// Listener global para controlar mute ao entrar/sair do fullscreen
function onFullscreenChange() {
    // Entrou em fullscreen?
    if (document.fullscreenElement || document.webkitFullscreenElement) {
        // Se temos um vídeo registrado e ele entrou em fullscreen
        if (videoFullscreenAtual && 
            (document.fullscreenElement === videoFullscreenAtual || 
             document.webkitFullscreenElement === videoFullscreenAtual)) {
            // Agora sim, desmuta com segurança
            videoFullscreenAtual.muted = false;
        }
    } else {
        // Saiu do fullscreen
        if (videoFullscreenAtual) {
            videoFullscreenAtual.muted = true;
            // Pequeno delay para garantir que o navegador liberou o vídeo
            setTimeout(() => {
                if (videoFullscreenAtual.paused) {
                    videoFullscreenAtual.play().catch(err => 
                        console.warn('Falha ao retomar reprodução:', err)
                    );
                }
            }, 100);
            videoFullscreenAtual = null;
        }
    }
}

document.addEventListener('fullscreenchange', onFullscreenChange);
document.addEventListener('webkitfullscreenchange', onFullscreenChange);

document.querySelectorAll('.galeria-item').forEach(item => {
    item.addEventListener('click', function(e) {
        const video = item.querySelector('video');
        const img = item.querySelector('img');

        if (video) {
            e.preventDefault();

            // Pausa o autoplay atual para evitar vazamento de áudio
            video.pause();
            // Reinicia do começo
            video.currentTime = 0;
            // Mantém mudo por enquanto (será desmutado quando entrar em fullscreen)
            video.muted = true;
            videoFullscreenAtual = video;

            // Tenta fullscreen
            const requestPromise = video.requestFullscreen ? 
                video.requestFullscreen() : 
                video.webkitRequestFullscreen ? 
                    video.webkitRequestFullscreen() : 
                    video.webkitEnterFullscreen ? 
                        video.webkitEnterFullscreen() : 
                        video.msRequestFullscreen ? 
                            video.msRequestFullscreen() : 
                            Promise.reject('Fullscreen não suportado');

            // Após solicitar fullscreen, tenta dar play (ainda mudo)
            requestPromise
                .then(() => {
                    // O fullscreen foi aceito, agora podemos dar play (mudo ainda)
                    return video.play();
                })
                .catch(() => {
                    // Fallback para navegadores que não retornam promessa (webkitEnterFullscreen)
                    video.play().catch(() => {});
                });

            return;
        }

        if (img) {
            const idProjeto = parseInt(item.dataset.projeto, 10);
            const projeto = projetos[idProjeto];
            if (projeto && projeto.imagens.length > 0) {
                abrirLightboxProjeto(projeto.imagens, 0);
            }
        }
    });
});
/* ========== Scroll com blur (APENAS mobile) ========== */
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
        if (window._scrollAnimation) cancelAnimationFrame(window._scrollAnimation);

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
            const alturaJanela = window.innerHeight;
            if (alturaSecao > alturaJanela) {
                destino = id === 'quem-somos' ? topo - 0 : topo;
            } else {
                const centralizar = (alturaJanela - alturaSecao) / 2;
                destino = topo - centralizar;
            }
        }

        const isMobile = window.innerWidth <= 480;

        if (isMobile) {
            document.body.classList.add('scroll-transitioning', 'blur-ativo');
        }

        window.scrollTo({ top: destino, behavior: 'smooth' });

        if (!isMobile) {
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
            return;
        }

        const checkScrollEnd = () => {
            const posicaoAtual = window.pageYOffset;
            if (Math.abs(posicaoAtual - destino) <= 5) {
                document.body.classList.remove('blur-ativo');
                document.body.classList.add('scroll-resolving');

                setTimeout(() => {
                    document.body.classList.remove('scroll-transitioning', 'scroll-resolving');
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
                return;
            }
            window._scrollAnimation = requestAnimationFrame(checkScrollEnd);
        };

        requestAnimationFrame(() => {
            requestAnimationFrame(checkScrollEnd);
        });
    });
});

/* ========== Animação de fade-in ========== */
const fadeElements = document.querySelectorAll('.fade-in');
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { rootMargin: '0px 0px 300px 0px', threshold: 0 });
    fadeElements.forEach(el => observer.observe(el));
} else {
    fadeElements.forEach(el => el.classList.add('visible'));
}
document.querySelector('.header-center')?.classList.add('visible');

/* ========== Lightbox CORRIGIDO ========== */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.querySelector('.lightbox-imagem');
const lightboxVideo = document.querySelector('.lightbox-video'); /* NOVO */
const lightboxFechar = document.querySelector('.lightbox-fechar');
const setaEsquerda = document.querySelector('.lightbox-seta-esquerda');
const setaDireita = document.querySelector('.lightbox-seta-direita');

let imagensGaleriaGlobal = [];
let imagemAtualIndex = 0;

function blockScroll(e) {
    e.preventDefault();
    e.stopPropagation();
}

function abrirLightboxProjeto(imagens, index) {
    imagensGaleriaGlobal = [...imagens]; // Cria cópia do array
    imagemAtualIndex = index;
    atualizarImagemLightbox(true);
    criarMiniaturas(imagens, index);
    lightbox.classList.add('ativa');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('touchmove', blockScroll, { passive: false });
}

function criarMiniaturas(imagens, indexAtivo) {
    const container = document.getElementById('lightboxThumbnails');
    if (!container) return;

    container.innerHTML = '';

    imagens.forEach((src, idx) => {
        const thumb = document.createElement('img');
        thumb.src = src;
        thumb.alt = `Miniatura ${idx + 1}`;
        thumb.className = 'lightbox-thumb';
        if (idx === indexAtivo) {
            thumb.classList.add('active');
        }

        // CORRIGIDO: Agora usa instant=false para ter animação
        thumb.addEventListener('click', () => {
            if (idx === imagemAtualIndex) return; // Não faz nada se clicar na mesma

            imagemAtualIndex = idx;
            atualizarImagemLightbox(false); // ← MUDOU DE true PARA false
            sincronizarMiniaturas();
        });

        container.appendChild(thumb);
    });
}

function sincronizarMiniaturas() {
    const thumbs = document.querySelectorAll('.lightbox-thumb');
    thumbs.forEach((thumb, idx) => {
        if (idx === imagemAtualIndex) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
}

function atualizarImagemLightbox(instant = false) {
    if ((!lightboxImg && !lightboxVideo) || imagensGaleriaGlobal.length === 0) return;

    const imgSrc = imagensGaleriaGlobal[imagemAtualIndex];
    const isVideo = imgSrc.toLowerCase().endsWith('.mp4');

    if (instant) {
        if (isVideo) {
            lightboxImg.style.display = 'none';
            lightboxVideo.style.display = 'block';
lightboxVideo.querySelector('source').src = imgSrc;
lightboxVideo.load();            lightboxVideo.play().catch(() => { });
            lightboxVideo.style.opacity = '1';
        } else {
            if (lightboxVideo) {
                lightboxVideo.style.display = 'none';
                lightboxVideo.pause();
            }
            lightboxImg.style.display = 'block';
            lightboxImg.src = imgSrc;
            lightboxImg.alt = `Imagem ${imagemAtualIndex + 1}`;
            lightboxImg.style.opacity = '1';
        }
        return;
    }

    lightboxImg.style.opacity = '0';
    if (lightboxVideo) lightboxVideo.style.opacity = '0';

    setTimeout(() => {
        if (isVideo) {
            lightboxImg.style.display = 'none';
            lightboxVideo.style.display = 'block';
lightboxVideo.querySelector('source').src = imgSrc;
lightboxVideo.load();            lightboxVideo.play().catch(() => { });
            lightboxVideo.style.opacity = '1';
        } else {
            if (lightboxVideo) {
                lightboxVideo.style.display = 'none';
                lightboxVideo.pause();
            }
            lightboxImg.style.display = 'block';
            lightboxImg.src = imgSrc;
            lightboxImg.alt = `Imagem ${imagemAtualIndex + 1}`;
            lightboxImg.style.opacity = '1';
        }
    }, 200);
}

function proximaImagem() {
    if (imagensGaleriaGlobal.length === 0) return;
    imagemAtualIndex = (imagemAtualIndex + 1) % imagensGaleriaGlobal.length;
    atualizarImagemLightbox();
    sincronizarMiniaturas();
}

function imagemAnterior() {
    if (imagensGaleriaGlobal.length === 0) return;
    imagemAtualIndex = (imagemAtualIndex - 1 + imagensGaleriaGlobal.length) % imagensGaleriaGlobal.length;
    atualizarImagemLightbox();
    sincronizarMiniaturas();
}

// Eventos das setas
setaDireita?.addEventListener('click', (e) => {
    e.stopPropagation();
    proximaImagem();
});

setaEsquerda?.addEventListener('click', (e) => {
    e.stopPropagation();
    imagemAnterior();
});

function fecharLightbox() {
    lightbox.classList.remove('ativa');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.removeEventListener('touchmove', blockScroll);
    imagensGaleriaGlobal = [];
    imagemAtualIndex = 0;

    // NOVO: Pausa e descarrega o vídeo para economizar processamento e internet
    if (lightboxVideo) {
        lightboxVideo.pause();
        lightboxVideo.src = '';
    }

    const container = document.getElementById('lightboxThumbnails');
    if (container) container.innerHTML = '';
}
lightboxFechar?.addEventListener('click', (e) => {
    e.stopPropagation();
    fecharLightbox();
});

lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) fecharLightbox();
});

// Teclado
document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('ativa')) return;
    if (e.key === 'Escape') fecharLightbox();
    else if (e.key === 'ArrowRight') proximaImagem();
    else if (e.key === 'ArrowLeft') imagemAnterior();
});


/* ========== Swipe vertical (fechar) + horizontal (navegar) ========== */
let touchStartX = 0,
    touchStartY = 0;
let isSwipingVertical = false;
const VERTICAL_THRESHOLD = 70; // pixels mínimos para fechar

lightbox?.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    isSwipingVertical = false;
}, { passive: true });

lightbox?.addEventListener('touchmove', (e) => {
    if (!lightbox.classList.contains('ativa')) return;
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartY;
    const deltaX = touch.clientX - touchStartX;

    // Se o movimento vertical for claramente maior que o horizontal, ativa o swipe vertical
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
        isSwipingVertical = true;
        e.preventDefault(); // evita que a página role atrás
    }
}, { passive: false });

lightbox?.addEventListener('touchend', (e) => {
    if (!lightbox.classList.contains('ativa')) return;
    const touch = e.changedTouches[0];

    if (isSwipingVertical) {
        const deltaY = touch.clientY - touchStartY;
        if (Math.abs(deltaY) >= VERTICAL_THRESHOLD) {
            fecharLightbox();
        }
        return; // não processa horizontal se foi vertical
    }

    // Swipe horizontal normal (navegação)
    const deltaX = touchStartX - touch.clientX;
    if (deltaX > 50) {
        proximaImagem();
    } else if (deltaX < -50) {
        imagemAnterior();
    }
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

/* ========== Animação suave para troca de ícones (+ / −) ========== */
function animarIcone(icone, novoSimbolo) {
    if (!icone) return;

    icone.style.transition = 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), filter 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
    icone.style.opacity = '0';
    icone.style.filter = 'blur(3px)';

    setTimeout(() => {
        icone.style.transition = 'none';
        icone.textContent = novoSimbolo;

        requestAnimationFrame(() => requestAnimationFrame(() => {
            icone.style.transition = 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), filter 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
            icone.style.opacity = '1';
            icone.style.filter = 'blur(0px)';
            icone.style.transform = 'translateY(0)';
        }));
    }, 300);
}

/* ========== Acordeão FAQ ========== */
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-pergunta');
    if (!btn) return;

    const item = btn.closest('.faq-item');
    const icone = btn.querySelector('.faq-icone');
    const jaAberto = item.classList.contains('ativo');

    // Fecha os outros itens (com animação no ícone)
    document.querySelectorAll('.faq-item.ativo').forEach(aberto => {
        aberto.classList.remove('ativo');
        aberto.querySelector('.faq-pergunta').setAttribute('aria-expanded', 'false');
        animarIcone(aberto.querySelector('.faq-icone'), '+');
    });

    if (!jaAberto) {
        item.classList.add('ativo');
        btn.setAttribute('aria-expanded', 'true');
        animarIcone(icone, '−');
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
            const textoEl = btn.querySelector('.btn-expandir-texto');
            const iconeEl = btn.querySelector('.btn-expandir-icone');

            textoEl.style.opacity = '0';
            textoEl.style.filter = 'blur(3px)';
            textoEl.style.transform = 'translateY(-7px)';
            iconeEl.style.opacity = '0';
            iconeEl.style.filter = 'blur(3px)';

            setTimeout(() => {
                textoEl.style.transition = 'none';
                textoEl.style.transform = 'translateY(7px)';
                textoEl.textContent = 'Recolher';

                requestAnimationFrame(() => requestAnimationFrame(() => {
                    textoEl.style.transition = '';
                    textoEl.style.opacity = '1';
                    textoEl.style.filter = 'blur(0px)';
                    textoEl.style.transform = 'translateY(0)';
                    iconeEl.style.opacity = '1';
                    iconeEl.style.filter = 'blur(0px)';
                }));
            }, 450);
            requestAnimationFrame(() => {
                const btnRect = btn.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                const targetY = btnRect.top + window.pageYOffset - windowHeight * 0.2;
                window.scrollTo({ top: targetY, behavior: 'smooth' });
            });
        } else {
            // Recolher (agora com animação nos ícones das perguntas abertas)
            wrapper.querySelectorAll('.faq-item.ativo').forEach(aberto => {
                aberto.classList.remove('ativo');
                aberto.querySelector('.faq-pergunta').setAttribute('aria-expanded', 'false');
                animarIcone(aberto.querySelector('.faq-icone'), '+');
            });

            wrapper.style.maxHeight = wrapper.scrollHeight + 'px';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    wrapper.style.maxHeight = '0';
                });
            });

            btn.classList.remove('expandido');
            const textoEl = btn.querySelector('.btn-expandir-texto');
            const iconeEl = btn.querySelector('.btn-expandir-icone');

            textoEl.style.opacity = '0';
            textoEl.style.filter = 'blur(3px)';
            textoEl.style.transform = 'translateY(-7px)';
            iconeEl.style.opacity = '0';
            iconeEl.style.filter = 'blur(3px)';

            setTimeout(() => {
                textoEl.style.transition = 'none';
                textoEl.style.transform = 'translateY(7px)';
                textoEl.textContent = `Ver todos (${itens.length})`;

                requestAnimationFrame(() => requestAnimationFrame(() => {
                    textoEl.style.transition = '';
                    textoEl.style.opacity = '1';
                    textoEl.style.filter = 'blur(0px)';
                    textoEl.style.transform = 'translateY(0)';
                    iconeEl.style.opacity = '1';
                    iconeEl.style.filter = 'blur(0px)';
                }));
            }, 450);
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
document.addEventListener('touchstart', function () {
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

/* ========== Motor de Imersão Bidirecional (Scroll — Fluxo Completo com Vídeo Inicial) ========== */
(function () {
    function initImersaoBidirecional() {
        const portfolio = document.getElementById('portfolio');
        const servicos = document.getElementById('servicos');
        const quemSomos = document.getElementById('quem-somos');

        if (!portfolio || !servicos || !quemSomos) return;

        // --- GATILHOS CALIBRADOS ---
        const TRIGGER_PORTFOLIO = 0.8; // Controla a transição entre o Vídeo e os Projetos
        const TRIGGER_SERVICOS = 0.8;
        const TRIGGER_SOBRE_NOS = 0.8;
        // ---------------------------

        let ticking = false;

        function processarScroll() {
            const vh = window.innerHeight;
            const topPortfolio = portfolio.getBoundingClientRect().top;
            const topServicos = servicos.getBoundingClientRect().top;
            const topSobreNos = quemSomos.getBoundingClientRect().top;

            const triggerPortfolioPx = vh * TRIGGER_PORTFOLIO;
            const triggerServicosPx = vh * TRIGGER_SERVICOS;
            const triggerSobreNosPx = vh * TRIGGER_SOBRE_NOS;

            // — TRANSIÇÃO 0: VÍDEO INICIAL → PROJETOS (PORTFÓLIO) —
            // Ativa quando o utilizador está no topo (perto do vídeo) e começa a descer para os Projetos
            if (topPortfolio > 0 && topServicos >= triggerServicosPx) {
                // p vai de 0 (no topo do vídeo) a 1 (quando Projetos atinge o gatilho)
                const p = Math.max(0, Math.min(1, 1 - (topPortfolio / triggerPortfolioPx)));

                // Entrada suave do Portfólio (Smoothstep)
                const pSuaveIn = p * p * (3 - 2 * p);
                portfolio.style.opacity = String(pSuaveIn);
                portfolio.style.pointerEvents = pSuaveIn > 0.1 ? 'auto' : 'none';

                servicos.style.opacity = '0';
                servicos.style.pointerEvents = 'none';
                quemSomos.style.opacity = '0';
                quemSomos.style.pointerEvents = 'none';
            }

            // — TRANSIÇÃO 1: PROJETOS (PORTFÓLIO) → SERVIÇOS —
            else if (topServicos < triggerServicosPx && topSobreNos >= triggerSobreNosPx) {
                const p = Math.max(0, Math.min(1, 1 - (topServicos / triggerServicosPx)));

                // Entrada suave de Serviços
                const pSuaveIn = p * p * (3 - 2 * p);
                servicos.style.opacity = String(pSuaveIn);
                servicos.style.pointerEvents = pSuaveIn > 0.1 ? 'auto' : 'none';

                // Saída suave e acelerada do Portfólio (Cosseno)
                const pAcelerado = Math.max(0, Math.min(1, p * 1.6));
                const pSuaveOut = 0.5 * (1 + Math.cos(pAcelerado * Math.PI));
                portfolio.style.opacity = String(pSuaveOut);
                portfolio.style.pointerEvents = pSuaveOut < 0.1 ? 'none' : 'auto';

                quemSomos.style.opacity = '0';
                quemSomos.style.pointerEvents = 'none';
            }

            // — TRANSIÇÃO 2: SERVIÇOS → SOBRE NÓS (QUEM SOMOS) —
            else if (topSobreNos < triggerSobreNosPx) {
                const p = Math.max(0, Math.min(1, 1 - (topSobreNos / triggerSobreNosPx)));

                // Entrada suave do Sobre Nós
                const pSuaveIn = p * p * (3 - 2 * p);
                quemSomos.style.opacity = String(pSuaveIn);
                quemSomos.style.pointerEvents = pSuaveIn > 0.1 ? 'auto' : 'none';

                // Saída suave e acelerada de Serviços
                const pAcelerado = Math.max(0, Math.min(1, p * 1.6));
                const pSuaveOut = 0.5 * (1 + Math.cos(pAcelerado * Math.PI));
                servicos.style.opacity = String(pSuaveOut);
                servicos.style.pointerEvents = pSuaveOut < 0.1 ? 'none' : 'auto';

                portfolio.style.opacity = '0';
                portfolio.style.pointerEvents = 'none';
            }

            // — BLOQUEIOS DE SEGURANÇA (Estados Sólidos Estáveis) —
            else {
                if (topPortfolio <= 0 && topServicos >= triggerServicosPx) {
                    // Focado puramente nos Projetos
                    portfolio.style.opacity = '1';
                    portfolio.style.pointerEvents = 'auto';
                    servicos.style.opacity = '0';
                    servicos.style.pointerEvents = 'none';
                    quemSomos.style.opacity = '0';
                    quemSomos.style.pointerEvents = 'none';
                } else if (topSobreNos <= 0) {
                    // Focado puramente no Sobre Nós
                    portfolio.style.opacity = '0';
                    portfolio.style.pointerEvents = 'none';
                    servicos.style.opacity = '0';
                    servicos.style.pointerEvents = 'none';
                    quemSomos.style.opacity = '1';
                    quemSomos.style.pointerEvents = 'auto';
                }
            }

            document.body.style.backgroundColor = '#1c1c1c';
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(processarScroll);
                ticking = true;
            }
        }, { passive: true });

        processarScroll();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initImersaoBidirecional);
    } else {
        initImersaoBidirecional();
    }
})();

/* ========== Gerenciamento inteligente e otimizado do vídeo Sobre Nós ========== */
document.addEventListener('DOMContentLoaded', () => {
    const secaoSobre = document.getElementById('quem-somos');
    const videoSobre = document.getElementById('video-sobre');

    if (!secaoSobre || !videoSobre) return;

    // Monitora a visibilidade da seção no viewport do usuário
    const observerVideo = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Se os metadados do vídeo não foram inicializados, força o carregamento inicial
                if (videoSobre.readyState === 0) {
                    videoSobre.load();
                }
                // Executa a reprodução assíncrona de forma segura contra bloqueios de navegadores
                videoSobre.play().catch(() => {
                    /* Fallback silencioso - resolvido pelo uso mandatório da tag 'muted' */
                });
            } else {
                // Fora da tela? Pausa imediatamente o vídeo economizando processamento de hardware
                if (!videoSobre.paused) {
                    videoSobre.pause();
                }
            }
        });
    }, {
        root: null,        // Usa o viewport padrão do navegador
        rootMargin: '0px',
        threshold: 0.1     // Gatilho ativa assim que 10% da seção desponta na tela
    });

    observerVideo.observe(secaoSobre);
});