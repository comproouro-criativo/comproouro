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

/* ========== DADOS DOS PROJETOS ========== */
const projetos = [
    {
        nome: 'Projeto 1',
        imagens: [
            'imagens/dd4.jpg',
            'imagens/back1.jpg',
            'imagens/back2.jpg',
            'imagens/back3.jpg'
        ]
    },
    {
        nome: 'Projeto 2',
        imagens: [
            'imagens/aa1.jpg',
            'imagens/elvis1.jpg',
            'imagens/elvis2.jpg',
            'imagens/elvis3.jpg'
        ]
    },
    {
        nome: 'Projeto 3',
        imagens: [
            'imagens/dd6.jpg',
            'imagens/mina2.png'
        ]
    }
];

/* ========== SISTEMA DE PASTAS ========== */
const galeriaCapas = document.getElementById('galeriaCapas');
const projetoInterno = document.getElementById('projetoInterno');
const projetoGrid = document.getElementById('projetoGrid');
const btnVoltar = document.getElementById('btnVoltar');
const capasImagens = document.querySelectorAll('.galeria-feed img');

// Abrir projeto ao clicar na capa
capasImagens.forEach((img, index) => {
    img.addEventListener('click', () => {
        abrirProjeto(index);
    });
});

function abrirProjeto(indiceProjeto) {
    const projeto = projetos[indiceProjeto];
    
    // Limpar grid
    projetoGrid.innerHTML = '';
    
    // Preencher com imagens do projeto
    projeto.imagens.forEach((imgSrc, index) => {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = `${projeto.nome} - Imagem ${index + 1}`;
        img.loading = 'lazy';
        img.addEventListener('click', () => {
            abrirLightboxProjeto(projeto.imagens, index);
        });
        projetoGrid.appendChild(img);
    });
    
    // Animação de saída das capas
    galeriaCapas.classList.add('fade-out');
    
    // Mostrar projeto interno após o fade-out
    setTimeout(() => {
        galeriaCapas.style.display = 'none';
        projetoInterno.style.display = 'block';
        projetoInterno.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
}

// Voltar para as capas
btnVoltar.addEventListener('click', voltarParaCapas);

function voltarParaCapas() {
    projetoInterno.style.display = 'none';
    galeriaCapas.style.display = '';
    
    setTimeout(() => {
        galeriaCapas.classList.remove('fade-out');
    }, 50);
}

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
    }, { threshold: 0.1 });
    fadeElements.forEach(el => observer.observe(el));
} else {
    fadeElements.forEach(el => el.classList.add('visible'));
}
document.querySelector('.header-center')?.classList.add('visible');

/* ========== Lightbox MODIFICADO ========== */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.querySelector('.lightbox-imagem');
const lightboxFechar = document.querySelector('.lightbox-fechar');
const setaEsquerda = document.querySelector('.lightbox-seta-esquerda');
const setaDireita = document.querySelector('.lightbox-seta-direita');

let imagensGaleriaGlobal = []; // Array global para o lightbox
let imagemAtualIndex = 0;

function blockScroll(e) { e.preventDefault(); }

// Função para abrir lightbox a partir das capas (sistema antigo)
function abrirLightboxCapas(imagens, index) {
    imagensGaleriaGlobal = imagens;
    imagemAtualIndex = index;
    atualizarImagemLightbox(true);
    lightbox.classList.add('ativa');
    document.body.style.overflow = 'hidden';
    document.addEventListener('touchmove', blockScroll, { passive: false });
}

// Função para abrir lightbox a partir do projeto interno
function abrirLightboxProjeto(imagens, index) {
    imagensGaleriaGlobal = imagens;
    imagemAtualIndex = index;
    atualizarImagemLightbox(true);
    lightbox.classList.add('ativa');
    document.body.style.overflow = 'hidden';
    document.addEventListener('touchmove', blockScroll, { passive: false });
}

// Inicializar com as capas (compatibilidade com código antigo)
const imagensCapasArray = Array.from(document.querySelectorAll('.galeria-feed img'));
imagensCapasArray.forEach((img, index) => {
    img.addEventListener('click', (e) => {
        // Só abre o lightbox se NÃO estiver no sistema de pastas
        // ou se for clicado com Ctrl (para debug)
        if (e.ctrlKey) {
            e.stopPropagation();
            abrirLightboxCapas(imagensCapasArray.map(i => i.src), index);
        }
    });
});

function atualizarImagemLightbox(instant = false) {
    if (instant || imagensGaleriaGlobal.length === 0) {
        const imgSrc = imagensGaleriaGlobal[imagemAtualIndex];
        lightboxImg.src = imgSrc;
        lightboxImg.alt = `Imagem ${imagemAtualIndex + 1}`;
        lightboxImg.style.opacity = '1';
        return;
    }

    lightboxImg.style.opacity = '0';
    setTimeout(() => {
        const imgSrc = imagensGaleriaGlobal[imagemAtualIndex];
        lightboxImg.src = imgSrc;
        lightboxImg.alt = `Imagem ${imagemAtualIndex + 1}`;
        lightboxImg.style.opacity = '1';
    }, 250);
}

function proximaImagem() {
    if (imagensGaleriaGlobal.length === 0) return;
    imagemAtualIndex = (imagemAtualIndex + 1) % imagensGaleriaGlobal.length;
    atualizarImagemLightbox();
}

function imagemAnterior() {
    if (imagensGaleriaGlobal.length === 0) return;
    imagemAtualIndex = (imagemAtualIndex - 1 + imagensGaleriaGlobal.length) % imagensGaleriaGlobal.length;
    atualizarImagemLightbox();
}

setaDireita?.addEventListener('click', proximaImagem);
setaEsquerda?.addEventListener('click', imagemAnterior);

function fecharLightbox() {
    lightbox.classList.remove('ativa');
    document.body.style.overflow = '';
    document.removeEventListener('touchmove', blockScroll);
    imagensGaleriaGlobal = [];
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

/* ========== Rodapé – Ticker contínuo (ajuste de loop) ========== */
(function() {
    const track = document.querySelector('.rodape-ticker-track');
    const items = track.querySelectorAll('.ticker-item');
    if (!items.length) return;

    const itemWidth = items[0].getBoundingClientRect().width;
    const totalItems = items.length;
    const setWidth = (itemWidth * totalItems) / 2;  

    track.style.setProperty('--scroll-distance', `-${setWidth}px`);
    track.style.animation = `rodape-ticker 286s linear infinite`;
})();