// Header logic
let header = document.getElementsByTagName("header")[0];
let headerDiv = document.createElement("div");
let homeLink = document.createElement("a");
homeLink.setAttribute("href","/");
homeLink.classList.add("nostyle");
homeLink.classList.add("header-title-link");
let headerImage = document.createElement("img");
headerImage.setAttribute("src","/assets/logo.png");
headerImage.setAttribute("width","50px");
headerImage.setAttribute("height","50px");
let headerTitle = document.createElement("h1");
headerTitle.style.display = "inline-block";
headerTitle.innerText = "Vanilla Cups";
homeLink.appendChild(headerImage);
homeLink.appendChild(headerTitle);
headerDiv.appendChild(homeLink);
header.appendChild(headerDiv);

// Footer logic
let footer = document.getElementsByTagName("footer")[0];
let footerDiv = document.createElement("div");
let footerTitle = document.createElement("p");
footerTitle.innerText = "Like it? Don't let me know.";
footerDiv.appendChild(footerTitle);
footer.appendChild(footerDiv);


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
    link.innerHTML = `<img src='/assets/cup.png' width='24px' height='24px' /><span>${link.innerHTML}</span>`;
    link.addEventListener("click", () => {
        window.location.href = link.getAttribute("href");
    });
}