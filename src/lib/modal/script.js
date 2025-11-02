function createModal(showCloseButton = false) {
    const modalBg = document.createElement("div");
    modalBg.classList.add("modal-background");
    modalBg.addEventListener("click", (ev) => {
        if (ev.target.classList.contains("modal-background")) {
            ev.target.remove();
        }
    });
    const modal = document.createElement("div");
    modal.classList.add("modal");
    if (showCloseButton) {
        const modalCloser = document.createElement("span");
        modalCloser.innerHTML = "&#10006;";
        modalCloser.classList.add("close-button");
        modalCloser.addEventListener("click", (_ev) => {
            document.getElementsByClassName("modal-background")[0].remove();
        });
        modal.appendChild(modalCloser);
        modal.classList.add("has-close-button");
    }
    modalBg.appendChild(modal);
    return modalBg;
}

function createMessageModal(message) {
    const modal = createModal();
    const modalBody = modal.getElementsByClassName("modal")[0];
    const modalTitle = document.createElement("div");
    modalTitle.innerHTML = message;
    modalTitle.classList.add("modal-title");
    modalTitle.style.textAlign = 'center';
    modalBody.appendChild(modalTitle);
    document.getElementsByTagName("body")[0].appendChild(modal);
}

function createNormalModal(title, content) {
    const modal = createModal(true);
    const modalBody = modal.getElementsByClassName("modal")[0];
    if (title) {
        const modalTitle = document.createElement("div");
        modalTitle.innerHTML = title;
        modalTitle.classList.add("modal-title");
        modalBody.appendChild(modalTitle);
    }
    if (content) {
        const modalText = document.createElement("div");
        modalText.innerHTML = content;
        modalText.style.cssText += 'margin-top: 20px;';
        modalBody.appendChild(modalText);
    }
    document.getElementsByTagName("body")[0].appendChild(modal);
}