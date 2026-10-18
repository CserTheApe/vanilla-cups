import logoUrl from './assets/logo.png';
import cupUrl from './assets/cup.png';

// Header logic
let header = document.getElementsByTagName("header")[0];
let headerDiv = document.createElement("div");
let homeLink = document.createElement("a");
homeLink.setAttribute("href","/");
homeLink.classList.add("nostyle");
homeLink.classList.add("header-title-link");
let headerImage = document.createElement("img");
headerImage.src = logoUrl;
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



// Link List Logic
let listedLinks = document.querySelectorAll("ul.link-list");
for (let listedLink of listedLinks) {
    let anchorLinks = listedLink.querySelectorAll(":scope > a");
    for (let link of anchorLinks) {
        let linkItem = document.createElement("li");

        let linkImage = document.createElement("img");
        linkImage.src = cupUrl;
        linkImage.setAttribute("width","24px");
        linkImage.setAttribute("height","24px");

        let linkText = document.createElement("span");
        linkText.innerHTML = link.innerHTML;

        link.innerHTML = "";
        link.appendChild(linkImage);
        link.appendChild(linkText);
        linkItem.appendChild(link);
        listedLink.appendChild(linkItem);

        // link.innerHTML = `<img src='/assets/cup.png' width='24px' height='24px' /><span>${link.innerHTML}</span>`;
        // link.addEventListener("click", () => {
        //     window.location.href = link.getAttribute("href");
        // });
    }
}


// Accordion Logic
let accordions = document.getElementsByClassName("accordion");
let accordionBodies = document.getElementsByClassName("accordion-body");
for (let i = 0; i < accordions.length; i++) {
    let aBody = accordionBodies[i];
    let iSpan = document.createElement("span");
    accordions[i].appendChild(iSpan);
    if (aBody.classList.contains("closed")) {
        aBody.style.maxHeight = '0px';
        iSpan.innerText = "+";
    } else {
        aBody.style.maxHeight = aBody.scrollHeight + 'px';
        iSpan.innerText = "-";
    }

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
