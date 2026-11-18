const packages = document.querySelector(".packages");
const steps = [...packages.querySelectorAll(".step")];
const targets = packages.querySelectorAll("[data-package]");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const slideDuration = 300;

function select(id) {
    const tops = steps.map((step) => step.getBoundingClientRect().top);

    for (const target of targets) {
        const active = target.dataset.package === id;
        target.classList.toggle("is-active", active);
        if (target.matches("button")) {
            target.setAttribute("aria-pressed", active);
        }
    }

    if (reducedMotion.matches) {
        return;
    }

    const shifts = steps.map((step, index) => tops[index] - step.getBoundingClientRect().top);
    steps.forEach((step, index) => {
        if (shifts[index]) {
            step.animate(
                { transform: [`translateY(${shifts[index]}px)`, "none"] },
                { duration: slideDuration, easing: "ease" }
            );
        }
    });
}

packages.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-package]");
    if (button) {
        select(button.dataset.package);
    }
});
