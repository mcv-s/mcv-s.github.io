
// ========================================
// LOAD PROJECTS
// ========================================

async function loadProjects() {

    const portfolio = document.querySelector(".portfolio");

    try {

        // ========================================
        // LOAD PROJECTS.JSON
        // ========================================

        const response = await fetch("projects.json");

        if (!response.ok) {
            throw new Error("Could not load projects.json");
        }

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

        closeButton.setAttribute(
            "aria-label",
            "Close project"
        );


        // ========================================
        // MODAL CONTENT
        // ========================================

        const modalImageLink = document.createElement("a");

        modalImageLink.className =
            "project-modal-image-link";

        modalImageLink.target = "_blank";

        modalImageLink.rel =
            "noopener noreferrer";


        const modalImage = document.createElement("img");

        modalImage.className =
            "project-modal-image";


        modalImageLink.appendChild(
            modalImage
        );


        const modalName = document.createElement("h2");

        modalName.className =
            "project-modal-name";


        const modalLinks = document.createElement("div");

        modalLinks.className =
            "project-modal-links";


        // ========================================
        // AI PERCENTAGE
        // ========================================

        const aiPercentage = document.createElement("h3");

        aiPercentage.className =
            "project-modal-ai-percent";


        // ========================================
        // MODAL DESCRIPTION
        // ========================================

        const modalDescription =
            document.createElement("div");

        modalDescription.className =
            "project-modal-description";


        // ========================================
        // ADD EVERYTHING TO MODAL
        // ========================================

        modal.appendChild(
            closeButton
        );

        modal.appendChild(
            modalImageLink
        );

        modal.appendChild(
            modalName
        );

        modal.appendChild(
            modalLinks
        );

        modal.appendChild(
            aiPercentage
        );

        modal.appendChild(
            modalDescription
        );


        // Add modal to overlay
        modalOverlay.appendChild(
            modal
        );


        // Add overlay to page
        document.body.appendChild(
            modalOverlay
        );


        // ========================================
        // CLOSE MODAL
        // ========================================

        function closeModal() {

            modalOverlay.classList.remove(
                "visible"
            );

            document.body.classList.remove(
                "modal-open"
            );

        }


        // Close button
        closeButton.addEventListener(
            "click",
            closeModal
        );


        // Click outside modal
        modalOverlay.addEventListener(
            "click",
            closeModal
        );


        // ========================================
        // RENDER PROJECTS
        // ========================================

        function renderProjects(projectsToRender) {

            // Clear current cards
            projectList.innerHTML = "";


            projectsToRender.forEach(project => {

                // ========================================
                // PROJECT CARD
                // ========================================

                const projectElement =
                    document.createElement("article");

                projectElement.className =
                    "project";


                // ========================================
                // PROJECT IMAGE
                // ========================================

                const image =
                    document.createElement("img");

                const gridImageSrc =
                    project["image-cover"] ||
                    project.image;

                image.src =
                    gridImageSrc;

                image.alt =
                    project.name;

                image.className =
                    "project-image";


                // ========================================
                // PROJECT NAME
                // ========================================

                const name =
                    document.createElement("h3");

                name.textContent =
                    project.name;

                name.className =
                    "project-name";


                // ========================================
                // PROJECT DESCRIPTION
                // ========================================

                const description =
                    document.createElement("p");

                description.textContent =
                    project.shortDescription;

                description.className =
                    "project-description";


                // ========================================
                // ADD CARD CONTENT
                // ========================================

                projectElement.appendChild(
                    image
                );

                projectElement.appendChild(
                    name
                );

                projectElement.appendChild(
                    description
                );


                // ========================================
                // OPEN PROJECT MODAL
                // ========================================

                projectElement.addEventListener(
                    "click",
                    () => {

                        // ========================================
                        // MODAL IMAGE
                        // ========================================

                        modalImage.src =
                            project.image;

                        modalImage.alt =
                            project.name;


                        // ========================================
                        // IMAGE WEBSITE LINK
                        // ========================================

                        if (
                            project.website &&
                            project.website !== "null"
                        ) {

                            modalImageLink.href =
                                project.website;

                            modalImageLink.style.pointerEvents =
                                "auto";

                            modalImageLink.style.cursor =
                                "pointer";

                        } else {

                            modalImageLink.removeAttribute(
                                "href"
                            );

                            modalImageLink.style.pointerEvents =
                                "none";

                            modalImageLink.style.cursor =
                                "default";

                        }


                        // ========================================
                        // PROJECT NAME
                        // ========================================

                        modalName.textContent =
                            project.name;


                        // ========================================
                        // DESCRIPTION
                        // ========================================

                        if (
                            typeof marked !== "undefined"
                        ) {

                            modalDescription.innerHTML =
                                marked.parse(
                                    project.longDescription || ""
                                );

                        } else {

                            modalDescription.textContent =
                                project.longDescription || "";

                        }


                        // ========================================
                        // AI PERCENTAGE
                        // ========================================

                        if (
                            project.aiPercentage != null
                        ) {

                            if (
                                project.aiPercentage == 0
                            ) {

                                aiPercentage.innerHTML =
                                    '<i class="ph ph-seal-check"></i> ' +
                                    project.aiPercentage +
                                    '% AI';

                            } else {

                                aiPercentage.innerHTML =
                                    project.aiPercentage +
                                    '% AI ';

                            }


                            aiPercentage.setAttribute(
                                "data-tooltip",
                                project.aiExplanation || ""
                            );

                        } else {

                            aiPercentage.innerHTML =
                                "";

                            aiPercentage.removeAttribute(
                                "data-tooltip"
                            );

                        }


                        // ========================================
                        // CLEAR OLD LINKS
                        // ========================================

                        modalLinks.innerHTML =
                            "";


                        // ========================================
                        // GITHUB LINK
                        // ========================================

                        if (
                            project.github &&
                            project.github !== "null"
                        ) {

                            const githubLink =
                                document.createElement("a");

                            githubLink.href =
                                project.github;

                            githubLink.textContent =
                                "GitHub";

                            githubLink.target =
                                "_blank";

                            githubLink.rel =
                                "noopener noreferrer";


                            modalLinks.appendChild(
                                githubLink
                            );

                        }


                        // ========================================
                        // WEBSITE LINK
                        // ========================================

                        if (
                            project.website &&
                            project.website !== "null"
                        ) {

                            const websiteLink =
                                document.createElement("a");

                            websiteLink.href =
                                project.website;

                            websiteLink.textContent =
                                "Website";

                            websiteLink.target =
                                "_blank";

                            websiteLink.rel =
                                "noopener noreferrer";


                            modalLinks.appendChild(
                                websiteLink
                            );

                        }


                        // ========================================
                        // SHOW MODAL
                        // ========================================

                        modalOverlay.classList.add(
                            "visible"
                        );

                        document.body.classList.add(
                            "modal-open"
                        );

                    }
                );


                // Add card to grid
                projectList.appendChild(
                    projectElement
                );

            });

        }


        // ========================================
        // INITIAL PROJECTS
        // ========================================

        renderProjects(projects);


        // ========================================
        // SEARCH BOX
        // ========================================

        const searchBox =
            document.querySelector(".search-box");


        if (searchBox) {

            searchBox.addEventListener(
                "input",
                () => {

                    const search =
                        searchBox.value
                            .toLowerCase()
                            .trim();


                    // ========================================
                    // EMPTY SEARCH
                    // ========================================

                    if (!search) {

                        renderProjects(
                            projects
                        );

                        return;

                    }


                    // ========================================
                    // SEARCH TERMS
                    // ========================================

                    const searchTerms =
                        search.split(/\s+/);


                    // ========================================
                    // FILTER PROJECTS
                    // ========================================

                    const filteredProjects =
                        projects.filter(
                            project => {

                                const tags =
                                    (
                                        project.tags ||
                                        ""
                                    ).toLowerCase();


                                const name =
                                    (
                                        project.name ||
                                        ""
                                    ).toLowerCase();


                                const description =
                                    (
                                        project.shortDescription ||
                                        ""
                                    ).toLowerCase();


                                // Every search word must
                                // match at least one field
                                return searchTerms.every(
                                    term =>
                                        tags.includes(term) ||
                                        name.includes(term) ||
                                        description.includes(term)
                                );

                            }
                        );


                    // ========================================
                    // DISPLAY RESULTS
                    // ========================================

                    renderProjects(
                        filteredProjects
                    );

                }
            );

        }


        // ========================================
        // ADD PROJECT GRID TO PORTFOLIO
        // ========================================

        portfolio.appendChild(
            projectList
        );


    } catch (error) {

        console.error(
            "Error loading projects:",
            error
        );

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

        backdrop-filter: blur(4px);

        border: 2px solid rgba(255, 255, 255, 0.05);

        transition:
            transform 0.2s ease,
            background-color 0.2s ease;

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

        box-shadow:
            0 10px 24px rgba(0, 0, 0, 0.25);

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

        margin-bottom: 5px;

        flex-wrap: wrap;

    }


    /* ========================================
       AI PERCENTAGE
    ======================================== */

    .project-modal-ai-percent {

        display: flex;

        justify-content: flex-start;

        gap: 15px;

        margin-bottom: 20px;

        width: fit-content;

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

        white-space: pre-line;

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


    i {

        margin-top: 3%;

    }

`;


document.head.appendChild(style);


// ========================================
// START
// ========================================

loadProjects();
