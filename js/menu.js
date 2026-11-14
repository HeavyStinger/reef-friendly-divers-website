const toggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".site-menu");

function setOpen(open) {
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open);
}

toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
});

menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
        setOpen(false);
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        setOpen(false);
    }
});
