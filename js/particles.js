const canvas = document.querySelector(".particles");
const landing = canvas.parentElement;
const areaPerParticle = 9000;
const minFocalLength = 800;
const nearZ = 0.4;
const farZ = 2.2;
const forwardSpeed = 0.01;
const sinkSpeed = 6;
const swayAmount = 8;
const fadeInSeconds = 2;
const maxFrameSeconds = 0.1;
const tints = ["235 250 255", "200 230 235", "225 215 190"];

if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const context = canvas.getContext("2d");
    const sprites = tints.map(createSprite);
    const particles = [];
    let width = 0;
    let height = 0;
    let focalLength = minFocalLength;
    let lastTime = performance.now();

    function createSprite(tint) {
        const sprite = document.createElement("canvas");
        sprite.width = 32;
        sprite.height = 32;
        const spriteContext = sprite.getContext("2d");
        const glow = spriteContext.createRadialGradient(16, 16, 0, 16, 16, 16);
        glow.addColorStop(0, `rgb(${tint} / 1)`);
        glow.addColorStop(0.4, `rgb(${tint} / 0.5)`);
        glow.addColorStop(1, `rgb(${tint} / 0)`);
        spriteContext.fillStyle = glow;
        spriteContext.fillRect(0, 0, 32, 32);
        return sprite;
    }

    function place(particle) {
        particle.z = nearZ + Math.random() * (farZ - nearZ);
        particle.x = ((Math.random() - 0.5) * width * particle.z) / focalLength;
        particle.y = ((Math.random() - 0.5) * height * particle.z) / focalLength;
        particle.age = 0;
    }

    function createParticle() {
        const particle = {
            size: 0.003 + Math.random() * 0.005,
            phase: Math.random() * Math.PI * 2,
            sprite: sprites[Math.floor(Math.random() * sprites.length)],
        };
        place(particle);
        particle.age = fadeInSeconds;
        return particle;
    }

    function resize() {
        const ratio = Math.min(devicePixelRatio, 2);
        width = landing.clientWidth;
        height = landing.clientHeight;
        focalLength = Math.max(width, minFocalLength);
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);

        const count = Math.round((width * height) / areaPerParticle);
        while (particles.length < count) {
            particles.push(createParticle());
        }
        particles.length = count;
    }

    new ResizeObserver(resize).observe(landing);

    requestAnimationFrame(function frame(now) {
        const seconds = Math.min((now - lastTime) / 1000, maxFrameSeconds);
        lastTime = now;

        context.clearRect(0, 0, width, height);
        for (const particle of particles) {
            particle.z -= forwardSpeed * seconds;
            particle.y += (sinkSpeed / focalLength) * seconds;
            particle.x += (Math.sin(now / 2500 + particle.phase) * swayAmount * seconds) / focalLength;
            particle.age += seconds;

            const scale = focalLength / particle.z;
            const x = width / 2 + particle.x * scale;
            const y = height / 2 + particle.y * scale;
            const diameter = particle.size * scale;

            if (particle.z < nearZ || x < -diameter || x > width + diameter || y < -diameter || y > height + diameter) {
                place(particle);
                continue;
            }

            const nearness = 1 - (particle.z - nearZ) / (farZ - nearZ);
            const fadeIn = Math.min(particle.age / fadeInSeconds, 1);
            const fadeNearLens = Math.min((particle.z - nearZ) / 0.2, 1);
            const sunlight = 0.6 + 0.4 * (1 - Math.min(Math.max(y / height, 0), 1));

            context.globalAlpha = (0.05 + nearness * 0.25) * fadeIn * fadeNearLens * sunlight;
            context.drawImage(particle.sprite, x - diameter / 2, y - diameter / 2, diameter, diameter);
        }
        requestAnimationFrame(frame);
    });
}
