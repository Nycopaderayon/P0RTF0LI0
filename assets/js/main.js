document.addEventListener('DOMContentLoaded', function () {

    /* ==========================================
       LIGHTBOX PREVIEW SYSTEM
       ========================================== */
    const overlay      = document.getElementById('lightbox-overlay');
    const lbContent    = document.getElementById('lightbox-content');
    const lbTitle      = document.getElementById('lightbox-title');
    const lbClose      = document.getElementById('lightbox-close');
    const lbDownload   = document.getElementById('lightbox-download');
    const isTouchPreviewDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
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
        btn.addEventListener('click', (event) => {
            const card = btn.closest('.portfolio-card');
            if (isTouchPreviewDevice && card && !card.classList.contains('preview-active')) {
                event.preventDefault();
                card.dispatchEvent(new CustomEvent('portfolio:show-preview'));
                return;
            }

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

        card.addEventListener('portfolio:show-preview', showPortfolioPreview);
        card.addEventListener('mouseenter', showPortfolioPreview);
        card.addEventListener('mouseleave', hidePortfolioPreview);
        card.addEventListener('focusin', showPortfolioPreview);
        card.addEventListener('focusout', event => {
            if (!card.contains(event.relatedTarget)) {
                hidePortfolioPreview();
            }
        });

        card.addEventListener('pointerup', event => {
            if (!isTouchPreviewDevice || event.pointerType === 'mouse') return;
            if (event.target.closest('.preview-btn') || event.target.closest('.portfolio-hover-preview')) return;
            if (!card.classList.contains('preview-active')) {
                showPortfolioPreview();
            }
        });

        document.addEventListener('pointerdown', event => {
            if (!isTouchPreviewDevice || event.pointerType === 'mouse') return;
            if (!card.contains(event.target)) {
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
        const resumeDownload = resumeActions.querySelector('.resume-download');
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

        if (resumeDownload) {
            resumeDownload.addEventListener('click', event => {
                if (isTouchPreviewDevice && !resumeActions.classList.contains('preview-active')) {
                    event.preventDefault();
                    showResumePreview();
                }
            });
        }

        document.addEventListener('pointerdown', event => {
            if (!isTouchPreviewDevice || event.pointerType === 'mouse') return;
            if (!resumeActions.contains(event.target)) {
                hideResumePreview();
            }
        });
    }

    /* ==========================================
       CONTACT FORM SUBMISSION
       ========================================== */
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const statusMessage = contactForm.querySelector('.form-status');
        const emailInput = contactForm.querySelector('input[name="email"]');
        const recipientEmail = contactForm.dataset.recipient || 'Nycopaderayon@gmail.com';
        const defaultButtonHtml = submitButton ? submitButton.innerHTML : '';
        const blockedEmailDomains = new Set([
            'example.com',
            'example.net',
            'example.org',
            'fake.com',
            'mailinator.com',
            'test.com'
        ]);

        function setFormStatus(message, state) {
            if (!statusMessage) return;
            statusMessage.textContent = message;
            statusMessage.className = `form-status ${state || ''}`.trim();
        }

        function getEmailValidationError(rawEmail) {
            const email = rawEmail.trim().toLowerCase();
            const parts = email.split('@');
            const local = parts[0] || '';
            const domain = parts[1] || '';

            if (!email) return 'email address is required';
            if (/\s/.test(email) || parts.length !== 2) return 'email format is invalid';
            if (local.length > 64 || domain.length > 253) return 'email address is too long';
            if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return 'email format is invalid';
            if (!/^[^\s@]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email)) return 'email domain is invalid';
            if (domain.includes('..')) return 'email domain is invalid';
            if (blockedEmailDomains.has(domain)) return 'please use a real email address';

            const labels = domain.split('.');
            const hasInvalidLabel = labels.some(label => (
                !label ||
                label.startsWith('-') ||
                label.endsWith('-') ||
                !/^[a-z0-9-]+$/i.test(label)
            ));

            return hasInvalidLabel ? 'email domain is invalid' : '';
        }

        function getAbstractEmailError(data) {
            if (!data) return 'email verification failed';
            const deliverability = data.email_deliverability || {};
            const quality = data.email_quality || {};
            const risk = data.email_risk || {};

            if (deliverability.status && deliverability.status !== 'deliverable') return 'email address does not receive mail';
            if (deliverability.is_format_valid === false) return 'email format is invalid';
            if (deliverability.is_mx_valid === false) return 'email domain cannot receive mail';
            if (deliverability.is_smtp_valid === false) return 'email mailbox could not be verified';
            if (quality.is_disposable === true) return 'temporary emails are not allowed';
            if (quality.is_role === true) return 'please use a personal email address';
            if (quality.is_username_suspicious === true) return 'email address looks suspicious';
            if (risk.address_risk_status === 'high' || risk.domain_risk_status === 'high') return 'email address looks risky';
            if (quality.score && Number(quality.score) < 0.7) return 'email quality score is too low';

            if (data.deliverability === 'UNDELIVERABLE') return 'email address does not receive mail';
            if (data.is_valid_format && data.is_valid_format.value === false) return 'email format is invalid';
            if (data.is_mx_found && data.is_mx_found.value === false) return 'email domain cannot receive mail';
            if (data.is_smtp_valid && data.is_smtp_valid.value === false) return 'email mailbox could not be verified';
            if (data.is_disposable_email && data.is_disposable_email.value === true) return 'temporary emails are not allowed';
            if (data.is_role_email && data.is_role_email.value === true) return 'please use a personal email address';
            if (data.quality_score && Number(data.quality_score) < 0.7) return 'email quality score is too low';

            return '';
        }

        async function verifyEmailWithAbstract(email, apiKey) {
            const endpoint = new URL('https://emailreputation.abstractapi.com/v1/');
            endpoint.searchParams.set('api_key', apiKey);
            endpoint.searchParams.set('email', email);

            const response = await fetch(endpoint.toString(), {
                method: 'GET',
                headers: { Accept: 'application/json' }
            });
            const data = await response.json();

            if (!response.ok) {
                const message = data.error?.message || data.message || 'email verification unavailable';
                throw new Error(message);
            }

            return getAbstractEmailError(data);
        }

        if (emailInput) {
            emailInput.addEventListener('input', () => {
                emailInput.setCustomValidity('');
            });
            emailInput.addEventListener('invalid', () => {
                const emailError = getEmailValidationError(emailInput.value) || 'email format is invalid';
                setFormStatus(`[ error transmitting: ${emailError} ]`, 'error');
            });
        }

        contactForm.addEventListener('submit', async event => {
            event.preventDefault();

            const emailError = getEmailValidationError(emailInput ? emailInput.value : '');
            if (emailError) {
                if (emailInput) {
                    emailInput.setCustomValidity(emailError);
                    emailInput.reportValidity();
                    emailInput.focus();
                }
                setFormStatus(`[ error transmitting: ${emailError} ]`, 'error');
                return;
            }

            if (!contactForm.action) {
                setFormStatus('[ error: form endpoint missing ]', 'error');
                return;
            }

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>transmitting...';
            }
            setFormStatus('[ sending secure message... ]', 'sending');

            try {
                const formData = new FormData(contactForm);
                const accessKey = formData.get('access_key');
                if (!accessKey || accessKey === 'PASTE_WEB3FORMS_ACCESS_KEY_HERE') {
                    setFormStatus('[ setup needed: add your Web3Forms access key ]', 'error');
                    return;
                }

                const senderEmail = formData.get('email');
                const abstractApiKey = formData.get('abstract_api_key');
                if (!abstractApiKey || abstractApiKey === 'PASTE_ABSTRACT_EMAIL_API_KEY_HERE') {
                    setFormStatus('[ setup needed: add your Abstract Email API key ]', 'error');
                    return;
                }

                setFormStatus('[ verifying email address... ]', 'sending');
                const abstractEmailError = await verifyEmailWithAbstract(senderEmail, abstractApiKey);
                if (abstractEmailError) {
                    if (emailInput) {
                        emailInput.setCustomValidity(abstractEmailError);
                        emailInput.reportValidity();
                        emailInput.focus();
                    }
                    setFormStatus(`[ error transmitting: ${abstractEmailError} ]`, 'error');
                    return;
                }

                if (senderEmail) {
                    formData.set('replyto', senderEmail);
                }
                formData.delete('abstract_api_key');
                const payload = Object.fromEntries(formData);

                setFormStatus('[ sending secure message... ]', 'sending');
                const response = await fetch(contactForm.action, {
                    method: contactForm.method || 'POST',
                    body: JSON.stringify(payload),
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();

                if (response.ok && data.success !== false) {
                    contactForm.reset();
                    setFormStatus(`[ success: message transmitted to ${recipientEmail} ]`, 'success');
                    return;
                }

                const errorMessage = data.message || data.body?.message || 'message failed to send';
                setFormStatus(errorMessage, 'error');
            } catch (error) {
                setFormStatus('[ network error: please try again ]', 'error');
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = defaultButtonHtml;
                }
            }
        });
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
            { type: 'output', text: 'Nyco Paderayon\nRole: IT System and Web Development, Web Designer, VA & Photo/Video Editor\nLocation: Davao City, Philippines\nExperience: 3+ Years' },
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
