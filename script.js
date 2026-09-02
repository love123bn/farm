/* ==========================================================================
   ROMANTIC LOVE LETTER - JAVASCRIPT XỬ LÝ HIỆU ỨNG & TƯƠNG TÁC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- Lấy các phần tử DOM ---
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    const envelope = document.getElementById('envelope');
    const waxSeal = document.getElementById('wax-seal');
    const letterOverlay = document.getElementById('letter-overlay');
    const letter = document.getElementById('letter');
    const closeLetterBtn = document.getElementById('close-letter-btn');
    const topHint = document.getElementById('top-hint');
    const typewriterEl = document.getElementById('typewriter-text');
    const cursorEl = document.getElementById('cursor');
    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');
    const celebrationModal = document.getElementById('celebration-modal');
    const btnReplay = document.getElementById('btn-replay');
    const musicToggle = document.getElementById('music-toggle');
    const loveAudio = document.getElementById('love-audio');
    const currentDateEl = document.getElementById('current-date');
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');

    // Cập nhật ngày tháng hiện tại (Format: Ngày DD tháng MM, YYYY)
    const now = new Date();
    const formattedDate = `Ngày ${now.getDate()} tháng ${now.getMonth() + 1}, ${now.getFullYear()}`;
    if (currentDateEl) {
        currentDateEl.innerText = formattedDate;
    }

    // --- LỜI THƯ TÌNH CHÂN THÀNH (XƯNG HÔ ANH - EM, GỬI LƯƠNG) ---
    const loveLetterContent = 
`Chào Lương, người con gái đã làm trái tim anh rung động... ✨

Có lẽ đây là lần đầu tiên anh viết ra những dòng tâm sự chân thành và sâu lắng như thế này để gửi riêng đến Lương.

Từ khoảnh khắc đầu tiên bắt gặp nụ cười của em, anh nhận ra thế giới của mình dường như đã có thêm một mảng màu rực rỡ và ấm áp. Mỗi ngày trôi qua, anh luôn thấy mình bất giác mỉm cười khi nghĩ về Lương, luôn mong ngóng từng dòng tin nhắn và muốn được lắng nghe từng câu chuyện vui buồn trong ngày của em.

Anh nhận ra rằng mình không chỉ thích được trò chuyện cùng em, mà anh thực sự muốn trở thành một người luôn ở bên cạnh, chở che, cùng Lương chia sẻ những ước mơ và cùng nhau bước qua mọi thăng trầm của cuộc sống.

Anh không dám hứa hẹn một điều gì quá xa vời, nhưng anh xin hứa sẽ dành cho Lương trọn vẹn sự chân thành, tôn trọng và yêu thương dịu dàng nhất từ sâu thẳm trái tim mình.

Hôm nay, anh gom hết can đảm để gửi đến Lương lời tỏ tình này... ❤️`;

    let isTyping = false;
    let typeIndex = 0;
    let typingTimeout;

    // --- XỬ LÝ ÂM THANH (MUSIC) ---
    let isMusicPlaying = false;

    function playMusic() {
        if (!isMusicPlaying) {
            loveAudio.play().then(() => {
                isMusicPlaying = true;
                musicToggle.classList.add('playing');
            }).catch(e => {
                console.log("Audio autoplay prevented, user interaction required:", e);
            });
        }
    }

    function toggleMusic() {
        if (isMusicPlaying) {
            loveAudio.pause();
            isMusicPlaying = false;
            musicToggle.classList.remove('playing');
        } else {
            loveAudio.play().then(() => {
                isMusicPlaying = true;
                musicToggle.classList.add('playing');
            }).catch(e => console.log(e));
        }
    }

    musicToggle.addEventListener('click', toggleMusic);

    // --- HIỆU ỨNG GÕ CHỮ RANDOM GIẢI MÃ KÝ TỰ & BỤI SAO (SCRAMBLE STARDUST TYPEWRITER) ---
    const letterSignature = document.querySelector('.letter-signature');
    const actionArea = document.getElementById('action-area');
    const scrambleGlyphs = '✦✧★☆♡♥*~x#@$%&?abcdefghijklmnopqrstuvwxyz0123456789';
    let currentWordContainer = null;

    function getRandomGlyph() {
        return scrambleGlyphs[Math.floor(Math.random() * scrambleGlyphs.length)];
    }

    function spawnStardust(x, y) {
        const container = document.getElementById('cursor-trail-container');
        if (!container) return;
        const dust = document.createElement('div');
        dust.className = 'stardust-particle';
        const stars = ['✨', '✦', '✧', '★', '·', '💖'];
        dust.innerText = stars[Math.floor(Math.random() * stars.length)];
        
        const size = Math.random() * 8 + 12;
        const tx = (Math.random() - 0.5) * 40 + 'px';
        const ty = -(Math.random() * 30 + 15) + 'px';
        
        dust.style.fontSize = size + 'px';
        dust.style.left = x + 'px';
        dust.style.top = y + 'px';
        dust.style.setProperty('--tx', tx);
        dust.style.setProperty('--ty', ty);
        
        container.appendChild(dust);
        setTimeout(() => dust.remove(), 1000);
    }

    function typeWriter() {
        if (typeIndex < loveLetterContent.length) {
            const char = loveLetterContent.charAt(typeIndex);
            
            if (char === '\n') {
                typewriterEl.appendChild(document.createElement('br'));
                currentWordContainer = null;
            } else if (char === ' ') {
                const spaceText = document.createTextNode(' ');
                typewriterEl.appendChild(spaceText);
                currentWordContainer = null;
            } else {
                // Nếu chưa có word container cho từ hiện tại, tạo mới
                if (!currentWordContainer) {
                    currentWordContainer = document.createElement('span');
                    currentWordContainer.className = 'word-token';
                    typewriterEl.appendChild(currentWordContainer);
                }

                const span = document.createElement('span');
                span.className = 'char-scramble';
                span.textContent = getRandomGlyph();
                currentWordContainer.appendChild(span);

                // Tạo bụi sao li ti ngẫu nhiên
                if (typeIndex % 6 === 0 && cursorEl) {
                    const rect = cursorEl.getBoundingClientRect();
                    if (rect.top > 0) {
                        spawnStardust(rect.left + 4, rect.top + 6);
                    }
                }

                // Hiệu ứng nhấp nháy random chữ cái trước khi hiện chữ thật
                setTimeout(() => {
                    span.textContent = getRandomGlyph();
                }, 30);

                setTimeout(() => {
                    span.textContent = char;
                    span.className = 'char-revealed';
                }, 75);
            }
            
            typeIndex++;
            
            // Tốc độ gõ chậm rãi, sâu lắng và lãng mạn
            let delay = 60;
            if (char === '.' || char === '!' || char === '?') delay = 400;
            else if (char === ',' || char === '…') delay = 220;
            else if (char === '\n') delay = 320;

            typingTimeout = setTimeout(typeWriter, delay);
        } else {
            isTyping = false;
            currentWordContainer = null;
            if (cursorEl) {
                cursorEl.style.transition = 'opacity 0.5s ease';
                cursorEl.style.opacity = '0';
                setTimeout(() => { cursorEl.style.display = 'none'; }, 500);
            }

            // Hiện chữ ký sau khi gõ xong
            setTimeout(() => {
                if (letterSignature) letterSignature.classList.add('show');
            }, 400);

            // Hiện câu hỏi tỏ tình & các nút bấm tương tác sau cùng
            setTimeout(() => {
                if (actionArea) {
                    actionArea.classList.add('show');
                    // Tự động cuộn mượt đến câu hỏi để Lương dễ thấy và bấm
                    const letterBox = document.getElementById('letter');
                    if (letterBox) {
                        letterBox.scrollTo({
                            top: letterBox.scrollHeight,
                            behavior: 'smooth'
                        });
                    }
                }
            }, 1000);
        }
    }

    function startTypingEffect() {
        if (isTyping) return;
        typewriterEl.innerHTML = '';
        typeIndex = 0;
        isTyping = true;
        currentWordContainer = null;
        if (cursorEl) {
            cursorEl.style.display = 'inline-block';
            cursorEl.style.opacity = '1';
        }
        if (letterSignature) letterSignature.classList.remove('show');
        if (actionArea) actionArea.classList.remove('show');
        clearTimeout(typingTimeout);
        setTimeout(typeWriter, 500);
    }

    // --- MỞ LÁ THƯ 3D VÀ HIỂN THỊ NỘI DUNG ĐỘC LẬP ---
    let isEnvelopeOpen = false;

    function openEnvelope() {
        if (isEnvelopeOpen) return;
        isEnvelopeOpen = true;

        // Bật nhạc
        playMusic();

        // Thêm class mở nắp phong bì
        envelopeWrapper.classList.add('open');

        // Bắn hiệu ứng trái tim mini mừng mở thư
        triggerHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 30);

        // Hiển thị lá thư tràn khung hình êm ái sau khi nắp phong bì mở
        setTimeout(() => {
            letterOverlay.classList.add('active');
            startTypingEffect();
        }, 500);
    }

    function closeEnvelope() {
        if (!isEnvelopeOpen) return;
        isEnvelopeOpen = false;
        letterOverlay.classList.remove('active');
        envelopeWrapper.classList.remove('open');
        if (letterSignature) letterSignature.classList.remove('show');
        if (actionArea) actionArea.classList.remove('show');
        clearTimeout(typingTimeout);
        isTyping = false;
    }

    // Sự kiện mở thư
    waxSeal.addEventListener('click', (e) => {
        e.stopPropagation();
        openEnvelope();
    });

    envelope.addEventListener('click', (e) => {
        if (!isEnvelopeOpen) {
            openEnvelope();
        }
    });

    closeLetterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeEnvelope();
    });

    // --- NÚT "TỪ CHỐI / SUY NGHĨ" NÉ TRÁNH TUYỆT ĐỐI (IMPOSSIBLE RUNAWAY BUTTON) ---
    const noButtonTexts = [
        "Ơ đừng từ chối mà 🥺",
        "Anh thương Lương mà 💕",
        "Lương nghĩ lại đi... 🥰",
        "Bấm 'Đồng Ý' kìa Lương ✨",
        "Nút này bị hỏng rồi 😆",
        "Không cho Lương chọn đâu 🙈",
        "Làm người anh thương nha 💖"
    ];
    let noClickCount = 0;
    let lastMoveTime = 0;

    function moveNoButton(cursorX, cursorY) {
        const nowTime = Date.now();
        if (nowTime - lastMoveTime < 120) return; // Debounce nhẹ để mượt
        lastMoveTime = nowTime;

        const actionArea = document.getElementById('action-area');
        const buttonsContainer = document.querySelector('.action-buttons');
        if (!actionArea || !buttonsContainer || !actionArea.classList.contains('show')) return;

        // Đổi câu chữ ngắn gọn, dễ thương
        noClickCount++;
        const randomText = noButtonTexts[noClickCount % noButtonTexts.length];
        const spanText = btnNo.querySelector('span');
        if (spanText) spanText.innerText = randomText;

        // Lấy thông số khung chứa
        const containerWidth = buttonsContainer.clientWidth;
        const btnWidth = btnNo.offsetWidth || 180;
        
        // Tính toán khoảng di chuyển an toàn tuyệt đối (trong khung)
        const maxOffset = Math.max(20, (containerWidth / 2) - (btnWidth / 2) - 15);
        
        // Random toạ độ X và Y mới
        let randomX = (Math.random() * 2 - 1) * maxOffset;
        let randomY = (Math.random() * 2 - 1) * 30; // lên/xuống tối đa 30px

        // Nếu có toạ độ chuột, ưu tiên né xa hướng chuột
        if (cursorX !== undefined && cursorY !== undefined) {
            const btnRect = btnNo.getBoundingClientRect();
            const btnCenterX = btnRect.left + btnRect.width / 2;
            if (cursorX > btnCenterX) {
                randomX = -Math.abs(randomX); // né sang trái
            } else {
                randomX = Math.abs(randomX); // né sang phải
            }
        }

        // Tránh đè lên nút Yes
        if (Math.abs(randomX) < 30) {
            randomX = randomX >= 0 ? randomX + 45 : randomX - 45;
        }

        randomX = Math.max(-maxOffset, Math.min(maxOffset, randomX));

        btnNo.style.transition = 'transform 0.15s cubic-bezier(0.1, 0.9, 0.2, 1)';
        btnNo.style.transform = `translate(${randomX}px, ${randomY}px) scale(0.95)`;

        // Tăng kích thước nút Yes dần lên
        const currentScale = Math.min(1 + (noClickCount * 0.04), 1.28);
        btnYes.style.transform = `scale(${currentScale})`;
    }

    // Cảm biến khoảng cách: Chuột đến gần trong bán kính 75px là tự động phóng đi ngay
    window.addEventListener('mousemove', (e) => {
        if (!actionArea || !actionArea.classList.contains('show')) return;
        const btnRect = btnNo.getBoundingClientRect();
        const btnCenterX = btnRect.left + btnRect.width / 2;
        const btnCenterY = btnRect.top + btnRect.height / 2;
        
        const distX = e.clientX - btnCenterX;
        const distY = e.clientY - btnCenterY;
        const distance = Math.sqrt(distX * distX + distY * distY);

        // Bán kính bảo vệ 75px
        if (distance < 75) {
            moveNoButton(e.clientX, e.clientY);
        }
    });

    // Chặn triệt để tất cả sự kiện chạm, hover, click trực tiếp
    const blockEvents = ['mouseenter', 'mouseover', 'mousedown', 'pointerdown', 'touchstart', 'touchmove', 'click'];
    blockEvents.forEach(evt => {
        btnNo.addEventListener(evt, (e) => {
            e.preventDefault();
            e.stopPropagation();
            moveNoButton();
        }, { passive: false });
    });

    // --- NÚT "EM ĐỒNG Ý" - CELEBRATION VÀ PHÁO HOA RỰC RỠ ---
    const cardGameOverlay = document.getElementById('card-game-overlay');
    const btnGoGame = document.getElementById('btn-go-game');
    const btnBackLetter = document.getElementById('btn-back-letter');
    const flipCards = document.querySelectorAll('.flip-card');
    const cardsUnlockedBox = document.getElementById('cards-unlocked-box');

    btnYes.addEventListener('click', () => {
        // Kích hoạt Modal chúc mừng
        celebrationModal.classList.add('active');

        // Bắn pháo hoa rực rỡ liên tục
        triggerCelebrationFireworks();
    });

    btnReplay.addEventListener('click', () => {
        celebrationModal.classList.remove('active');
        if (cardGameOverlay) cardGameOverlay.classList.remove('active');
    });

    // Chuyển sang Trang 2: Minigame Lật Thẻ Bài
    if (btnGoGame) {
        btnGoGame.addEventListener('click', () => {
            celebrationModal.classList.remove('active');
            cardGameOverlay.classList.add('active');
            triggerCelebrationFireworks();
        });
    }

    // Nút quay lại đọc thư từ trang thẻ bài
    if (btnBackLetter) {
        btnBackLetter.addEventListener('click', () => {
            cardGameOverlay.classList.remove('active');
            letterOverlay.classList.add('active');
        });
    }

    // Xử lý lật thẻ bài 3D
    let flippedCount = 0;
    flipCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const isFlipped = card.classList.contains('flipped');
            if (!isFlipped) {
                card.classList.add('flipped');
                flippedCount++;

                // Bắn hiệu ứng trái tim lấp lánh tại vị trí lá bài
                const rect = card.getBoundingClientRect();
                triggerHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);

                // Khi đã lật ít nhất 1 thẻ bài, mở hộp thông điệp siêu ngọt
                if (cardsUnlockedBox) {
                    setTimeout(() => {
                        cardsUnlockedBox.classList.add('show');
                    }, 400);
                }
            }
        });
    });

    // ================= HIỆU ỨNG PHÁO HOA VÀ CANVAS PARTICLES =================

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Các loại hạt nền
    const particles = [];
    const fireworks = [];
    const heartColors = ['#ff4d6d', '#ff758c', '#ff85a2', '#f72585', '#ffccd5', '#ffb703', '#ffffff'];

    // Khởi tạo trái tim trôi nổi nền
    class FloatingHeart {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = height + Math.random() * 50;
            this.size = Math.random() * 14 + 8;
            this.speedY = Math.random() * 1.2 + 0.6;
            this.speedX = Math.sin(Math.random() * Math.PI) * 0.8;
            this.opacity = Math.random() * 0.5 + 0.3;
            this.color = heartColors[Math.floor(Math.random() * heartColors.length)];
            this.rotation = (Math.random() - 0.5) * 45;
            this.rotSpeed = (Math.random() - 0.5) * 1.5;
        }

        update() {
            this.y -= this.speedY;
            this.x += Math.sin(this.y * 0.01) * 0.6 + this.speedX;
            this.rotation += this.rotSpeed;

            if (this.y < -30) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;

            // Vẽ hình trái tim
            const s = this.size / 15;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-5 * s, -7 * s, -12 * s, 0, 0, 10 * s);
            ctx.bezierCurveTo(12 * s, 0, 5 * s, -7 * s, 0, 0);
            ctx.fill();

            ctx.restore();
        }
    }

    // Khởi tạo 55 trái tim trôi lơ lửng nền
    for (let i = 0; i < 55; i++) {
        const h = new FloatingHeart();
        h.y = Math.random() * height; // Rải đều khắp màn hình lúc đầu
        particles.push(h);
    }

    // Hạt pháo hoa trái tim (Heart Firework Particle)
    class FireworkParticle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color || heartColors[Math.floor(Math.random() * heartColors.length)];
            
            // Phân bổ hạt tạo thành hình dáng trái tim khi nổ
            const t = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            
            // Phương trình hình trái tim
            const hx = 16 * Math.pow(Math.sin(t), 3);
            const hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));

            this.vx = (hx / 16) * speed;
            this.vy = (hy / 16) * speed;
            
            this.alpha = 1;
            this.decay = Math.random() * 0.015 + 0.01;
            this.size = Math.random() * 6 + 3;
            this.gravity = 0.05;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity;
            this.vx *= 0.98;
            this.vy *= 0.98;
            this.alpha -= this.decay;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(this.alpha, 0);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function triggerHeartBurst(x, y, count = 40) {
        for (let i = 0; i < count; i++) {
            fireworks.push(new FireworkParticle(x, y));
        }
    }

    function triggerCelebrationFireworks() {
        let count = 0;
        const interval = setInterval(() => {
            const rx = Math.random() * (width * 0.8) + (width * 0.1);
            const ry = Math.random() * (height * 0.5) + (height * 0.15);
            triggerHeartBurst(rx, ry, 50);
            count++;
            if (count > 10) clearInterval(interval);
        }, 350);
    }

    // Vòng lặp animation chính
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Vẽ và cập nhật trái tim nền
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Vẽ và cập nhật pháo hoa
        for (let i = fireworks.length - 1; i >= 0; i--) {
            const f = fireworks[i];
            f.update();
            f.draw();
            if (f.alpha <= 0) {
                fireworks.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }

    animate();

    // ================= HIỆU ỨNG VỆT SÁNG & TRÁI TIM NỞ RỘ KHI CLICK =================
    let lastTrailTime = 0;
    const trailContainer = document.getElementById('cursor-trail-container');

    function createSparkle(x, y) {
        const now = Date.now();
        if (now - lastTrailTime < 45) return;
        lastTrailTime = now;

        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-particle';
        
        const size = Math.random() * 8 + 4;
        const color = heartColors[Math.floor(Math.random() * heartColors.length)];
        const tx = (Math.random() - 0.5) * 40 + 'px';
        const ty = (Math.random() - 0.5) * 40 + 'px';

        sparkle.style.width = size + 'px';
        sparkle.style.height = size + 'px';
        sparkle.style.backgroundColor = color;
        sparkle.style.boxShadow = `0 0 10px ${color}`;
        sparkle.style.left = (x - size / 2) + 'px';
        sparkle.style.top = (y - size / 2) + 'px';
        sparkle.style.setProperty('--tx', tx);
        sparkle.style.setProperty('--ty', ty);

        trailContainer.appendChild(sparkle);

        setTimeout(() => {
            sparkle.remove();
        }, 1000);
    }

    // Hiệu ứng chùm trái tim bay lên mỗi khi bấm chuột hoặc chạm màn hình
    const clickHeartEmojis = ['💖', '💕', '🌸', '✨', '❤️', '💗'];
    function createClickHeart(x, y) {
        for (let i = 0; i < 4; i++) {
            const heart = document.createElement('div');
            heart.className = 'floating-click-heart';
            heart.innerText = clickHeartEmojis[Math.floor(Math.random() * clickHeartEmojis.length)];
            
            const size = Math.random() * 12 + 16;
            const tx = (Math.random() - 0.5) * 90 + 'px';
            const ty = -(Math.random() * 70 + 40) + 'px';
            const rot = (Math.random() - 0.5) * 50 + 'deg';

            heart.style.fontSize = size + 'px';
            heart.style.left = x + 'px';
            heart.style.top = y + 'px';
            heart.style.setProperty('--tx', tx);
            heart.style.setProperty('--ty', ty);
            heart.style.setProperty('--rot', rot);

            trailContainer.appendChild(heart);

            setTimeout(() => {
                heart.remove();
            }, 1200);
        }
    }

    window.addEventListener('click', (e) => {
        createClickHeart(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e) => {
        createSparkle(e.clientX, e.clientY);
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            createSparkle(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            createClickHeart(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

});
