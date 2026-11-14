const viewport = document.querySelector(".testimonials");
const track = viewport.querySelector(".testimonial-track");
const list = track.firstElementChild;
const desktopQuery = matchMedia("(min-width: 52rem)");
const pixelsPerMs = 0.03;
const fadeZone = 0.2;
const maxFrameMs = 100;

if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const copy = list.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    track.append(copy);

    const cards = track.querySelectorAll(".testimonial");
    let offset = 0;
    let lastTime = performance.now();
    let paused = false;

    viewport.addEventListener("mouseenter", () => {
        paused = true;
    });
    viewport.addEventListener("mouseleave", () => {
        paused = false;
    });

    requestAnimationFrame(function frame(now) {
        const horizontal = !desktopQuery.matches;

        if (!paused) {
            const loopLength = horizontal ? list.offsetWidth : list.offsetHeight;
            offset = (offset + Math.min(now - lastTime, maxFrameMs) * pixelsPerMs) % loopLength;
        }
        lastTime = now;
        track.style.transform = horizontal ? `translateX(${-offset}px)` : `translateY(${-offset}px)`;

        const box = viewport.getBoundingClientRect();
        for (const card of cards) {
            if (horizontal) {
                card.style.opacity = "";
                continue;
            }
            const rect = card.getBoundingClientRect();
            const position = (rect.top + rect.height / 2 - box.top) / box.height;
            card.style.opacity = Math.min(1, Math.max(0, Math.min(position, 1 - position) / fadeZone));
        }
        requestAnimationFrame(frame);
    });
}
