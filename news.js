/* NEWSLETTER SIGNUP MODAL */

"use strict";

// DOM elements
const modalOverlay = document.getElementById("modalOverlay");
const modal = modalOverlay.querySelector(".modal");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.getElementById("closeModal");
const newsletterForm = document.getElementById("newsletterForm");
const emailInput = document.getElementById("email");
const message = document.getElementById("message");
const subscribeBtn = newsletterForm.querySelector(".subscribe-btn");

// Timing settings
const MODAL_DELAY = 5000;
const SUCCESS_DELAY = 2200;

// State
let modalTimer;
let successTimer;
let isSubmitting = false;
let previousFocus = null;

// Safely read session storage
function wasDismissed() {
    try {
        return sessionStorage.getItem("newsletterDismissed") === "true";
    } catch (error) {
        return false;
    }
}

// Safely save dismissal state
function saveDismissed() {
    try {
        sessionStorage.setItem("newsletterDismissed", "true");
    } catch (error) {
        // The modal still works if storage is unavailable.
    }
}

// Open modal
function openModal(force = false) {
    if (modalOverlay.classList.contains("show")) return;

    if (!force && wasDismissed()) return;

    previousFocus = document.activeElement;

    clearTimeout(modalTimer);

    modalOverlay.inert = false;
    modalOverlay.setAttribute("aria-hidden", "false");
    modalOverlay.classList.add("show");

    // Focus the email field after the modal starts opening.
    emailInput.focus({ preventScroll: true });
}

// Close modal
function closeModal() {
    if (!modalOverlay.classList.contains("show")) return;

    modalOverlay.classList.remove("show");
    modalOverlay.setAttribute("aria-hidden", "true");
    modalOverlay.inert = true;

    saveDismissed();

    clearTimeout(modalTimer);
    clearTimeout(successTimer);

    // Restore the submit button and submission state.
    subscribeBtn.disabled = false;
    isSubmitting = false;

    // Return focus to the previous element.
    const target =
        previousFocus && previousFocus.isConnected
            ? previousFocus
            : openModalBtn;

    if (target) {
        target.focus({ preventScroll: true });
    }
}

// Open automatically after 5 seconds
if (!wasDismissed()) {
    modalTimer = setTimeout(() => {
        openModal();
    }, MODAL_DELAY);
}

// Open when the hero button is clicked
openModalBtn.addEventListener("click", () => {
    openModal(true);
});

// Close with the close button
closeModalBtn.addEventListener("click", closeModal);

// Close when the backdrop is clicked
modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
        closeModal();
    }
});

// Keyboard support
document.addEventListener("keydown", (event) => {
    if (!modalOverlay.classList.contains("show")) return;

    // Close using Escape
    if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
    }

    // Keep keyboard focus inside the modal
    if (event.key === "Tab") {
        const focusableElements = Array.from(
            modal.querySelectorAll(
                'button:not(:disabled), input:not(:disabled), ' +
                'a[href], [tabindex]:not([tabindex="-1"])'
            )
        ).filter((element) => element.getClientRects().length > 0);

        if (focusableElements.length === 0) {
            event.preventDefault();
            modal.focus();
            return;
        }

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
});

// Display a message to the user
function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
}

// Email form submission
newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    const email = emailInput.value.trim();

    // Validate the email
    if (!email || !emailInput.checkValidity()) {
        showMessage("Please enter a valid email address.", "error");
        emailInput.focus();
        return;
    }

    // Frontend demonstration only.
    // This does not send or store an actual subscription.
    isSubmitting = true;
    subscribeBtn.disabled = true;

    showMessage("✓ Thank you for subscribing!", "success");

    successTimer = setTimeout(() => {
        closeModal();
        newsletterForm.reset();
        message.textContent = "";
        message.className = "message";
    }, SUCCESS_DELAY);
});

// Initial accessibility state
modalOverlay.classList.remove("show");
modalOverlay.setAttribute("aria-hidden", "true");
modalOverlay.inert = true;