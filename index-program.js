
// ========================================
// LOAD PROJECTS
// ========================================

async function loadProjects() {

    const portfolio = document.querySelector(".portfolio");

    try {

        // Load projects.json
        const response = await fetch("projects.json");

        if (!response.ok) {
            throw new Error("Could not load projects.json");
        }

        // Convert JSON into JavaScript
        const projects = await response.json();


        // ========================================
        // PROJECT GRID
        // ========================================

        const projectList = document.createElement("div");

        projectList.className = "project-list";


        // ========================================
        // MODAL OVERLAY
        // ========================================

        const modalOverlay = document.createElement("div");

        modalOverlay.className = "project-modal-overlay";


        // ========================================
        // MODAL CARD
        // ========================================

        const modal = document.createElement("div");

        modal.className = "project-modal";


        // Prevent clicks inside the modal
        // from closing it
        modal.addEventListener("click", (event) => {

            event.stopPropagation();

        });


        // ========================================
        // CLOSE BUTTON
        // ========================================

        const closeButton = document.createElement("button");

        closeButton.className = "project-modal-close";

        closeButton.textContent = "×";

        closeButton.setAttribute("aria-label", "Close project");


        // Close modal when X is clicked
        closeButton.addEventListener("click", closeModal);


        // ========================================
        // MODAL CONTENT
        // ========================================

        const modalImageLink = document.createElement("a");

        modalImageLink.className = "project-modal-image-link";

        modalImageLink.target = "_blank";

        modalImageLink.rel = "noopener noreferrer";


        const modalImage = document.createElement("img");

        modalImage.className = "project-modal-image";

        modalImageLink.appendChild(modalImage);




        const modalName = document.createElement("h2");

        modalName.className = "project-modal-name";


        const modalLinks = document.createElement("div");

        modalLinks.className = "project-modal-links";


        const modalDescription = document.createElement("p");

        modalDescription.className = "project-modal-description";


        // Add everything to modal
        modal.appendChild(closeButton);

        modal.appendChild(modalImageLink);

        modal.appendChild(modalName);

        modal.appendChild(modalLinks);

        modal.appendChild(modalDescription);


        // Add modal to overlay
        modalOverlay.appendChild(modal);


        // Add overlay to page
        document.body.appendChild(modalOverlay);


        // ========================================
        // CLOSE WHEN CLICKING OUTSIDE
        // ========================================

        modalOverlay.addEventListener("click", closeModal);


        function closeModal() {

            modalOverlay.classList.remove("visible");

            document.body.classList.remove("modal-open");

        }


        // ========================================
        // CREATE PROJECT CARDS
        // ========================================

        projects.forEach(project => {

            // Create card
            const projectElement = document.createElement("article");

            projectElement.className = "project";


            // Project image
            const image = document.createElement("img");

            const gridImageSrc = project["image-cover"] || project.image;

            image.src = gridImageSrc;

            image.alt = project.name;

            image.className = "project-image";


            // Project name
            const name = document.createElement("h3");

            name.textContent = project.name;

            name.className = "project-name";


            // Short description
            const description = document.createElement("p");

            description.textContent = project.shortDescription;

            description.className = "project-description";


            // Add content to card
            projectElement.appendChild(image);

            projectElement.appendChild(name);

            projectElement.appendChild(description);


            // ========================================
            // OPEN PROJECT MODAL
            // ========================================

            projectElement.addEventListener("click", () => {

                // Set image
                modalImage.src = project.image;

                modalImage.alt = project.name;


                // Set project name
                modalName.textContent = project.name;


                // Set description
                modalDescription.textContent = project.longDescription;


                // Clear old links
                modalLinks.innerHTML = "";


                // ========================================
                // GITHUB LINK
                // ========================================

                if (
                    project.github &&
                    project.github !== "null"
                ) {

                    const githubLink = document.createElement("a");

                    githubLink.href = project.github;

                    githubLink.textContent = "GitHub";

                    githubLink.target = "_blank";

                    githubLink.rel = "noopener noreferrer";


                    modalLinks.appendChild(githubLink);

                }


                // ========================================
                // WEBSITE LINK
                // ========================================

                if (
                    project.website &&
                    project.website !== "null"
                ) {

                    const websiteLink = document.createElement("a");

                    websiteLink.href = project.website;

                    websiteLink.textContent = "Website";

                    websiteLink.target = "_blank";

                    websiteLink.rel = "noopener noreferrer";


                    modalLinks.appendChild(websiteLink);



                    modalImageLink.href = project.website;

                    modalImageLink.style.pointerEvents = "auto";
                    modalImageLink.style.cursor = "pointer";

                }


                // Show modal
                modalOverlay.classList.add("visible");

                document.body.classList.add("modal-open");

            });


            // Add card to grid
            projectList.appendChild(projectElement);

        });


        // Add project grid to portfolio
        portfolio.appendChild(projectList);


    } catch (error) {

        console.error("Error loading projects:", error);

    }

}


// ========================================
// STYLES
// ========================================

const style = document.createElement("style");

style.textContent = `

    /* ========================================
       PROJECT GRID
    ======================================== */

    .project-list {

        display: grid;

        grid-template-columns: repeat(2, 1fr);

        gap: 15px;

        width: 100%;

    }


    /* ========================================
       PROJECT CARD
    ======================================== */

    .project {

        background-color: #7b7b7b1a;

        border-radius: 15px;

        overflow: hidden;

        cursor: pointer;

        transition:
            transform 0.2s ease,
            background-color 0.2s ease;

    }

    

.project {
    backdrop-filter: blur(4px);
    border: 2px solid rgba(255, 255, 255, 0.05);
}




    .project:hover {

        transform: translateY(-4px);

        background-color: #7b7b7b2a;

    }


    /* ========================================
       CARD IMAGE
    ======================================== */

    .project-image {

        display: block;

        width: 100%;

        height: 150px;

        object-fit: cover;

        border-radius: inherit;

    }


    /* ========================================
       CARD NAME
    ======================================== */

    .project-name {

        margin: 12px 15px 6px;

        color: #E0E0E0;

        font-size: 18px;

    }


    /* ========================================
       CARD DESCRIPTION
    ======================================== */

    .project-description {

        margin: 0 15px 15px;

        color: #AAAAAA;

        line-height: 1.4;

        font-size: 14px;

    }


    /* ========================================
       MODAL OVERLAY
    ======================================== */

    .project-modal-overlay {

        position: fixed;

        inset: 0;

        z-index: 1000;

        display: flex;

        justify-content: center;

        align-items: center;

        padding: 20px;

        background-color: rgba(0, 0, 0, 0.75);

        opacity: 0;

        visibility: hidden;

        transition:
            opacity 0.2s ease,
            visibility 0.2s ease;

    }


    /* ========================================
       SHOW MODAL
    ======================================== */

    .project-modal-overlay.visible {

        opacity: 1;

        visibility: visible;

    }


    /* ========================================
       MODAL CARD
    ======================================== */

    .project-modal {

        position: relative;

        width: 100%;

        max-width: 680px;

        min-height: 70vh;

        max-height: 92vh;

        overflow-y: auto;

        padding: 32px 32px 36px;

        box-sizing: border-box;

        background-color: #111111b6;

        border: 1.5px solid rgba(255, 255, 255, 0.05);

        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);

        border-radius: 16px;

        box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.5);

        text-align: left;

    }


    /* ========================================
       CLOSE BUTTON
    ======================================== */

    .project-modal-close {

        position: absolute;

        top: 10px;

        right: 12px;

        width: 36px;

        height: 36px;

        padding: 0;

        border: none;

        border-radius: 50%;

        background-color: #7b7b7b1a;

        color: #E0E0E0;

        font-size: 26px;

        line-height: 36px;

        cursor: pointer;

        transition:
            background-color 0.2s ease;

    }


    .project-modal-close:hover {

        background-color: #7b7b7b2a;

    }


    /* ========================================
       MODAL IMAGE
    ======================================== */

    .project-modal-image {

        display: block;

        width: 92%;

        max-height: 320px;

        object-fit: cover;

        margin: 0 0 20px;

        border-radius: 18px;

        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);

    }


    /* ========================================
       MODAL NAME
    ======================================== */

    .project-modal-name {

        margin: 0 0 10px;

        color: #E0E0E0;

        text-align: left;

    }


    /* ========================================
       MODAL LINKS
    ======================================== */

    .project-modal-links {

        display: flex;

        justify-content: flex-start;

        gap: 15px;

        margin-bottom: 20px;

        flex-wrap: wrap;

    }


    /* ========================================
       MODAL DESCRIPTION
    ======================================== */

    .project-modal-description {

        margin: 0;

        color: #AAAAAA;

        line-height: 1.6;

        text-align: left;

    }


    /* ========================================
       MOBILE
    ======================================== */

    @media (max-width: 500px) {

        .project-list {

            grid-template-columns: 1fr;

        }


        .project-modal {

            padding: 20px;

        }

    }

`;

document.head.appendChild(style);


// ========================================
// START
// ========================================

loadProjects();

