document.addEventListener('DOMContentLoaded', function () {

    /* ==========================================
       LIGHTBOX PREVIEW SYSTEM
       ========================================== */
    const overlay      = document.getElementById('lightbox-overlay');
    const lbContent    = document.getElementById('lightbox-content');
    const lbTitle      = document.getElementById('lightbox-title');
    const lbClose      = document.getElementById('lightbox-close');
    const lbDownload   = document.getElementById('lightbox-download');
    let   currentSrc   = '';

    function openLightbox(src, type, title) {
        currentSrc = src;
        lbTitle.textContent = title || 'preview.sh';
        lbContent.innerHTML = `<div class="lb-spinner">[ loading... ]</div>`;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (type === 'image') {
            const img = new Image();
            img.onload = () => { lbContent.innerHTML = ''; lbContent.appendChild(img); };
            img.onerror = () => { lbContent.innerHTML = `<div class="lb-spinner" style="color:#f87171;">[ error: failed to load image ]</div>`; };
            img.src = src;
        } else if (type === 'pdf') {
            const iframe = document.createElement('iframe');
            iframe.src = src;
            iframe.title = title;
            iframe.onload = () => {}; // iframe handles loading itself
            lbContent.innerHTML = '';
            lbContent.appendChild(iframe);
        } else if (type === 'iframe') {
            const iframe = document.createElement('iframe');
            iframe.src = src;
            iframe.title = title;
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
            lbContent.innerHTML = '';
            lbContent.appendChild(iframe);
        }
    }

    function closeLightbox() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        lbContent.innerHTML = '';
        currentSrc = '';
    }

    // Attach preview-btn click handlers
    document.querySelectorAll('.preview-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const src   = btn.dataset.src;
            const type  = btn.dataset.type;
            const title = btn.dataset.title;
            openLightbox(src, type, title);
        });
    });

    /* ==========================================
       PORTFOLIO HOVER PREVIEWS
       ========================================== */
    document.querySelectorAll('.portfolio-card').forEach(card => {
        const btn = card.querySelector('.preview-btn');
        if (!btn) return;

        let hoverPreview = null;
        let hoverMedia = null;

        function buildPortfolioPreview() {
            if (hoverPreview) return;

            const src = btn.dataset.src;
            const type = btn.dataset.type;
            const title = btn.dataset.title || btn.textContent.trim() || 'preview';

            hoverPreview = document.createElement('div');
            hoverPreview.className = 'portfolio-hover-preview';
            hoverPreview.setAttribute('aria-hidden', 'true');

            const bar = document.createElement('div');
            bar.className = 'portfolio-hover-bar';
            bar.textContent = title;

            const content = document.createElement('div');
            content.className = 'portfolio-hover-content';

            if (type === 'image') {
                hoverMedia = new Image();
                hoverMedia.alt = title;
                hoverMedia.decoding = 'async';
                hoverMedia.src = src;
            } else {
                hoverMedia = document.createElement('iframe');
                hoverMedia.title = title;
                hoverMedia.dataset.src = src;
                if (type === 'iframe') {
                    hoverMedia.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
                }
            }

            content.appendChild(hoverMedia);
            hoverPreview.append(bar, content);
            card.appendChild(hoverPreview);
        }

        function showPortfolioPreview() {
            buildPortfolioPreview();
            if (hoverMedia && hoverMedia.tagName === 'IFRAME' && !hoverMedia.src) {
                hoverMedia.src = hoverMedia.dataset.src;
            }
            card.classList.add('preview-active');
            if (hoverPreview) hoverPreview.setAttribute('aria-hidden', 'false');
        }

        function hidePortfolioPreview() {
            card.classList.remove('preview-active');
            if (hoverPreview) hoverPreview.setAttribute('aria-hidden', 'true');
        }

        card.addEventListener('mouseenter', showPortfolioPreview);
        card.addEventListener('mouseleave', hidePortfolioPreview);
        card.addEventListener('focusin', showPortfolioPreview);
        card.addEventListener('focusout', event => {
            if (!card.contains(event.relatedTarget)) {
                hidePortfolioPreview();
            }
        });
    });

    // Close via red dot
    if (lbClose) lbClose.addEventListener('click', closeLightbox);

    // Close via clicking outside the box
    if (overlay) overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeLightbox();
    });

    // Close via ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });

    // Open in new tab button
    if (lbDownload) lbDownload.addEventListener('click', () => {
        if (currentSrc) window.open(currentSrc, '_blank');
    });

    /* ==========================================
       RESUME HOVER PREVIEW
       ========================================== */
    const resumeActions = document.querySelector('.resume-actions');
    if (resumeActions) {
        const resumePreview = resumeActions.querySelector('.resume-hover-preview');
        const resumeFrame = resumePreview ? resumePreview.querySelector('iframe') : null;
        let resumePreviewHideTimer = null;

        function showResumePreview() {
            clearTimeout(resumePreviewHideTimer);
            if (resumeFrame && !resumeFrame.src) {
                resumeFrame.src = resumeFrame.dataset.src;
            }
            resumeActions.classList.add('preview-active');
            if (resumePreview) resumePreview.setAttribute('aria-hidden', 'false');
        }

        function hideResumePreview() {
            resumePreviewHideTimer = setTimeout(() => {
                resumeActions.classList.remove('preview-active');
                if (resumePreview) resumePreview.setAttribute('aria-hidden', 'true');
            }, 220);
        }

        resumeActions.addEventListener('mouseenter', showResumePreview);
        resumeActions.addEventListener('mouseleave', hideResumePreview);
        resumeActions.addEventListener('focusin', showResumePreview);
        resumeActions.addEventListener('focusout', hideResumePreview);
    }

    /* ==========================================
       THEME TOGGLE SYSTEM
       ========================================== */
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
    
    // Check saved preference
    const savedTheme = localStorage.getItem('hacker-theme') || 'dark';
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeIcon) {
            themeIcon.className = 'bi bi-moon-stars';
        }
    } else {
        document.body.classList.remove('light-theme');
        if (themeIcon) {
            themeIcon.className = 'bi bi-sun';
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem('hacker-theme', isLight ? 'light' : 'dark');
            
            if (themeIcon) {
                themeIcon.className = isLight ? 'bi bi-moon-stars' : 'bi bi-sun';
            }
            
            // Re-init canvas colors if matrix is running
            initMatrixColors();
        });
    }

    /* ==========================================
       MATRIX CODE RAIN CANVAS
       ========================================== */
    const canvas = document.getElementById('matrix-canvas');
    let ctx = null;
    let columns = [];
    let fontSize = 14;
    let drops = [];
    let matrixColor = '#00ff66';
    let animationFrameId = null;

    function initMatrixColors() {
        const isLight = document.body.classList.contains('light-theme');
        matrixColor = isLight ? 'rgba(13, 148, 136, 0.15)' : 'rgba(0, 255, 102, 0.22)';
    }

    if (canvas) {
        ctx = canvas.getContext('2d');
        initMatrixColors();

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            columns = Math.floor(canvas.width / fontSize);
            drops = [];
            for (let x = 0; x < columns; x++) {
                drops[x] = Math.random() * -100; // randomize starting position
            }
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const katakana = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const alphabet = katakana.split('');

        function drawMatrix() {
            // Semi-transparent black to clear the canvas and create trail effect
            const isLight = document.body.classList.contains('light-theme');
            ctx.fillStyle = isLight ? 'rgba(241, 245, 249, 0.08)' : 'rgba(6, 9, 19, 0.06)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = matrixColor;
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = alphabet[Math.floor(Math.random() * alphabet.length)];
                
                // Randomize drawing to reduce load and look organic
                if (Math.random() > 0.05) {
                    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                }

                // If drops goes off screen, wrap it back with random offset
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                
                drops[i] += 0.8;
            }
        }

        function animateMatrix() {
            drawMatrix();
            animationFrameId = requestAnimationFrame(animateMatrix);
        }
        
        animateMatrix();
    }

    /* ==========================================
       TERMINAL TYPEWRITER SIMULATOR
       ========================================== */
    const terminalBody = document.getElementById('terminal-body-content');
    if (terminalBody) {
        const terminalSequence = [
            { type: 'command', text: 'whoami' },
            { type: 'output', text: 'Nyco Paderayon\nRole: IT Specialist, Web Designer, VA & Photo/Video Editor\nLocation: Davao City, Philippines\nExperience: 3+ Years' },
            { type: 'command', text: 'cat skills.txt' },
            { type: 'output', text: 'Languages: HTML, CSS, JavaScript, Java, Python\nFrameworks: Django, Bootstrap 5\nTools: Figma, Adobe XD, Photoshop, Illustrator, Premiere Pro\nServices: Virtual Assistance, Data Entry, SEO' },
            { type: 'command', text: 'ping -c 3 connections' },
            { type: 'output', text: 'PING connections (127.0.0.1) 56(84) bytes of data.\n64 bytes from local: icmp_seq=1 ttl=64 time=0.04 ms [SUCCESS]\n64 bytes from clients: icmp_seq=2 ttl=64 time=0.12 ms [ACTIVE]\n64 bytes from projects: icmp_seq=3 ttl=64 time=0.08 ms [DELIVERED]\n\n--- stats --- \n3 packets transmitted, 3 received, 0% packet loss' },
            { type: 'command', text: 'clear' }
        ];

        let seqIdx = 0;
        let charIdx = 0;

        function runTerminalSimulator() {
            if (seqIdx >= terminalSequence.length) {
                // Restart sequence
                seqIdx = 0;
                terminalBody.innerHTML = '';
            }

            const current = terminalSequence[seqIdx];

            if (current.type === 'command') {
                // Create a line if not exists
                let activeLine = terminalBody.querySelector('.active-prompt');
                if (!activeLine) {
                    activeLine = document.createElement('div');
                    activeLine.className = 'active-prompt mb-2';
                    activeLine.innerHTML = `<span class="terminal-prompt">~/nyco$</span><span class="command-text"></span><span class="terminal-cursor"></span>`;
                    terminalBody.appendChild(activeLine);
                }

                const cmdText = activeLine.querySelector('.command-text');
                
                if (charIdx < current.text.length) {
                    cmdText.textContent += current.text.charAt(charIdx);
                    charIdx++;
                    setTimeout(runTerminalSimulator, 80 + Math.random() * 50); // Natural typing speed
                } else {
                    // Command finished typing
                    const cursor = activeLine.querySelector('.terminal-cursor');
                    if (cursor) cursor.remove();
                    activeLine.className = 'mb-2'; // remove active class
                    charIdx = 0;
                    seqIdx++;
                    
                    if (terminalSequence[seqIdx - 1].text === 'clear') {
                        setTimeout(() => {
                            terminalBody.innerHTML = '';
                            runTerminalSimulator();
                        }, 800);
                    } else {
                        setTimeout(runTerminalSimulator, 400); // Wait before outputting
                    }
                }
            } else if (current.type === 'output') {
                const outputDiv = document.createElement('div');
                outputDiv.className = 'text-secondary mb-3 style-output';
                outputDiv.style.whiteSpace = 'pre-wrap';
                terminalBody.appendChild(outputDiv);

                // Split by character to print out with a fast ticker effect
                const outputText = current.text;
                let printIdx = 0;
                
                function printOutput() {
                    if (printIdx < outputText.length) {
                        outputDiv.textContent += outputText.charAt(printIdx);
                        printIdx++;
                        
                        // Scroll terminal body container to bottom
                        const container = terminalBody.closest('.terminal-body');
                        if (container) {
                            container.scrollTop = container.scrollHeight;
                        }
                        
                        setTimeout(printOutput, 6);
                    } else {
                        seqIdx++;
                        setTimeout(runTerminalSimulator, 1800); // Wait before next command
                    }
                }
                printOutput();
            }
        }

        setTimeout(runTerminalSimulator, 1000); // Initial delay before simulation starts
    }

    /* ==========================================
       SCROLL ACTIVE SECTION HIGHLIGHT
       ========================================== */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 120;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    /* ==========================================
       COLLAPSE MOBILE NAV ON LINK CLICK
       ========================================== */
    const navCollapse = document.querySelector('.navbar-collapse');
    const menuLinks = document.querySelectorAll('.nav-link');
    
    if (navCollapse) {
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 992) {
                    const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
                    if (bsCollapse) {
                        bsCollapse.hide();
                    }
                }
            });
        });
    }

    /* ==========================================
       SCROLL REVEAL INTEGRATION (optional fallback animation)
       ========================================== */
    if (typeof ScrollReveal !== 'undefined') {
        const sr = ScrollReveal({
            origin: 'bottom',
            distance: '20px',
            duration: 1000,
            delay: 100,
            reset: false
        });

        sr.reveal('.section-title', {});
        sr.reveal('.terminal-window', { delay: 200 });
        sr.reveal('.about-img', { delay: 200, origin: 'left' });
        sr.reveal('.stat-item', { interval: 100 });
        sr.reveal('.skill-pill', { interval: 30 });
        sr.reveal('.portfolio-card', { interval: 100 });
        sr.reveal('.contact-info-card', { delay: 200 });
        sr.reveal('.contact-form', { delay: 300 });
    }
});
