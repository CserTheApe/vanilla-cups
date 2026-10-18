import { createMessageModal, createNormalModal } from "./script";

document.getElementById("msgModal")?.addEventListener("click", () => createMessageModal('You win'));
document.getElementById("normModal")?.addEventListener("click", () => createNormalModal('Hello', 'Hello there! Everybody is good. <br /> Hello there! Everybody is good. Hello there! Everybody is good.'));