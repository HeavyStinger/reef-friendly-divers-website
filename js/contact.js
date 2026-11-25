const form = document.querySelector(".booking-form");
const steps = [...form.querySelectorAll(".form-step")];
const stepsBox = form.querySelector(".form-steps");
const detailsHeading = form.querySelector("#step-you");
const bookingFieldsets = form.querySelectorAll(".booking-fields");
const progress = form.querySelector(".form-progress");
const progressTrack = progress.querySelector(".progress-track");
const progressButtons = [...progress.querySelectorAll("button")];
const back = form.querySelector(".step-back");
const next = form.querySelector(".step-next");
const date = form.querySelector("#date");
const divers = form.querySelector("#divers");
const message = form.querySelector("#message");
const formPick = form.querySelector(".form-pick");
const formPickName = formPick.querySelector("strong");
const formPickTrip = formPick.querySelector("span");
const formStatus = form.querySelector(".form-status");
const photo = document.querySelector(".contact-photo");
const heading = document.querySelector(".contact-copy h1");
const greeting = heading.textContent;
const picked = document.querySelector(".picked-tour");
const pickedMeta = picked.querySelector(".picked-meta");
const pickedPrice = picked.querySelector(".picked-price");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const easing = "cubic-bezier(0.22, 1, 0.36, 1)";
let current = 0;

const isAsking = () => form.elements.topic.value === "ask";

// A question only needs the contact step.
const activeSteps = () => (isAsking() ? steps.filter((step) => !step.classList.contains("booking-step")) : steps);

// While booking, the photo is headed by the chosen dive. A general question keeps the greeting.
function showHeading() {
    heading.textContent = isAsking()
        ? greeting
        : form.querySelector('input[name="tour"]:checked').closest(".tour-card").querySelector(".tour-name").textContent;
}

function showTour() {
    const input = form.querySelector('input[name="tour"]:checked');
    const card = input.closest(".tour-card");
    const name = card.querySelector(".tour-name").textContent;
    const price = card.querySelector(".tour-price")?.textContent ?? "";

    pickedMeta.textContent = card.querySelector(".tour-meta").textContent;
    pickedPrice.textContent = price;
    formPickName.textContent = price ? `${name}, ${price}` : name;
    showHeading();

    if (photo.getAttribute("src") !== input.dataset.photo) {
        photo.src = input.dataset.photo;
    }
}

function showTrip() {
    if (!date.value || !divers.value) {
        formPickTrip.textContent = "";
        return;
    }

    const day = new Date(`${date.value}T00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    formPickTrip.textContent = `${divers.value} ${divers.value === "1" ? "diver" : "divers"} on ${day}`;
}

function render() {
    const list = activeSteps();
    const step = list[current];
    const isLast = current === list.length - 1;

    for (const other of steps) {
        other.hidden = other !== step;
    }

    back.hidden = current === 0;
    next.textContent = isLast ? (isAsking() ? "Send question" : "Send request") : step.dataset.next;

    progressButtons.forEach((button, index) => {
        button.disabled = index >= current;
        button.parentElement.classList.toggle("is-done", index < current);
        if (index === current) {
            button.setAttribute("aria-current", "step");
        } else {
            button.removeAttribute("aria-current");
        }
    });
    progressTrack.style.setProperty("--progress", (current + 0.5) / list.length);
}

function animateStep(startHeight, forward) {
    if (reducedMotion.matches) {
        return;
    }

    const step = activeSteps()[current];

    stepsBox.classList.add("is-animating");
    stepsBox
        .animate({ height: [`${startHeight}px`, `${stepsBox.offsetHeight}px`] }, { duration: 450, easing })
        .finished.then(() => stepsBox.classList.remove("is-animating"));
    step.animate(
        { opacity: [0, 1], translate: [forward ? "3rem 0" : "-3rem 0", "0 0"] },
        { duration: 450, easing }
    );
    step.querySelectorAll(".tour-card, .field, .form-pick").forEach((item, index) => {
        item.animate(
            { opacity: [0, 1], transform: ["translateY(1rem)", "none"] },
            { duration: 400, delay: 100 + index * 45, easing, fill: "backwards" }
        );
    });
}

function goTo(index) {
    const forward = index > current;
    const startHeight = stepsBox.offsetHeight;

    current = index;
    formStatus.textContent = "";
    progressTrack.style.setProperty("--facing", forward ? -1 : 1);
    render();
    activeSteps()[current].querySelector("h2").focus({ preventScroll: true });

    const { top } = progress.getBoundingClientRect();
    if (top < 0 || top > window.innerHeight * 0.4) {
        progress.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth" });
    }

    animateStep(startHeight, forward);
}

function showTopic() {
    const asking = isAsking();

    // Disabled fieldsets are skipped by validation and left out of the submission.
    for (const fieldset of bookingFieldsets) {
        fieldset.disabled = asking;
    }
    current = 0;
    progress.hidden = asking;
    picked.hidden = asking;
    formPick.hidden = asking;
    message.required = asking;
    detailsHeading.textContent = asking ? "What would you like to know?" : "Who should we reply to?";
    showHeading();
    render();
}

function reportInvalid(step) {
    const invalid = [...step.querySelectorAll("input, select, textarea")].find((control) => !control.checkValidity());
    invalid?.reportValidity();
    return Boolean(invalid);
}

form.addEventListener("change", (event) => {
    formStatus.textContent = "";
    if (event.target.name === "tour") {
        showTour();
    } else if (event.target.name === "topic") {
        const startHeight = stepsBox.offsetHeight;
        showTopic();
        animateStep(startHeight, true);
    } else if (event.target === date || event.target === divers) {
        showTrip();
    }
});

// Enter and the main button both submit; only the last step sends.
form.addEventListener("submit", (event) => {
    event.preventDefault();
    const list = activeSteps();

    if (reportInvalid(list[current])) {
        return;
    }
    if (current < list.length - 1) {
        goTo(current + 1);
        return;
    }

    // Replace with real sending once the email service is set up.
    formStatus.textContent = "Online sending is not set up yet, so this was not sent. Please contact us by WhatsApp, phone or email.";
});

back.addEventListener("click", () => goTo(current - 1));

progress.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (button) {
        goTo(progressButtons.indexOf(button));
    }
});

// Book buttons elsewhere on the site link here with ?tour= or ?topic=ask.
const params = new URLSearchParams(location.search);
const linkedTour = [...form.querySelectorAll('input[name="tour"]')].find((input) => input.value === params.get("tour"));

if (linkedTour) {
    linkedTour.checked = true;
}
if (params.get("topic") === "ask") {
    form.elements.topic.value = "ask";
}

// Validation runs one step at a time, so the browser's whole-form check is turned off.
form.noValidate = true;
date.min = new Date().toLocaleDateString("en-CA");
showTour();
showTrip();
showTopic();

// A visitor who already chose a tour starts on the date step.
if (linkedTour && !isAsking()) {
    current = 1;
    render();
}
