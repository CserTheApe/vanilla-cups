// Accordion Logic
let accordions = document.getElementsByClassName("accordion");
let accordionBodies = document.getElementsByClassName("accordion-body");
for (let i = 0; i < accordions.length; i++) {
    let aBody = accordionBodies[i];
    let iSpan = document.createElement("span");
    if (aBody.classList.contains("closed")) {
        aBody.style.maxHeight = '0px';
        iSpan.innerText = "+";
    } else {
        aBody.style.maxHeight = aBody.scrollHeight + 'px';
        iSpan.innerText = "-";
    }
    accordions[i].appendChild(iSpan);

    accordions[i].addEventListener("click", () => {
        if (aBody.style.maxHeight == "0px") {
            aBody.classList.remove("closed");
            aBody.style.maxHeight = aBody.scrollHeight + 'px';
            iSpan.innerText = "-";
        }
        else {
            aBody.classList.add("closed");
            aBody.style.maxHeight = '0px';
            iSpan.innerText = "+";
        }
    });
}


// Link List Logic
let listedLinks = document.querySelectorAll("ul.link-list > li");
for (let link of listedLinks) {
    link.addEventListener("click", () => {
        window.location.href = link.getAttribute("href");
    });
}