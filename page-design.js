(() => {
    "use strict";

    const options = {
        radius: 0.45,
        softness: 1,

        scale: 1,
        spacing: 2.0,

        charset: "000001",

        // Color of the ASCII characters.
        color: [255, 255, 255],

        // Optional solid background behind the effect.
        background: [0, 0, 0],
        backgroundOpacity: 0,

        contrast: 1.25,
        brightness: 0,

        strength: 1,
        baseStrength: 0,

        followSpeed: 100,

        glow: 0.5,
        aberration: 1,

        // Animation.
        waveStrength: 0,
        waveSpeed: 1.8,
        distortion: 0.12,

        // Character animation.
        characterJitter: 0,
        characterSpeed: 5,

        textClearance: 10,
        textMaskUpdate: 250,
        textOpacity: 0.01,

        trailDuration: 500,
        trailAlphaThreshold: 5,


        /*
         * true:
         *   One viewport-sized canvas that stays fixed while scrolling.
         *
         * false:
         *   A full-document canvas that scrolls with the page.
         */
        fixedCanvas: false,
        parallaxValue: 0.75,
    };



    // const options = {
    //     radius: 0.3,
    //     softness: 1,

    //     scale: 1,
    //     spacing: 2.0,

    //     charset: " 001",

    //     // Color of the ASCII characters.
    //     color: [255, 255, 255],

    //     // Optional solid background behind the effect.
    //     background: [0, 0, 0],
    //     backgroundOpacity: 0,

    //     contrast: 1.25,
    //     brightness: 0,

    //     strength: 1,
    //     baseStrength: 0,

    //     followSpeed: 100,

    //     glow: 0.5,
    //     aberration: 1,

    //     // Animation.
    //     waveStrength: 0,
    //     waveSpeed: 1.8,
    //     distortion: 0.12,

    //     // Character animation.
    //     characterJitter: 0,
    //     characterSpeed: 5,

    //     textClearance: 10,
    //     textMaskUpdate: 250,
    //     textOpacity: 0.01,

    //     trailDuration: 5000,
    //     trailAlphaThreshold: 5,


    //     /*
    //      * true:
    //      *   One viewport-sized canvas that stays fixed while scrolling.
    //      *
    //      * false:
    //      *   A full-document canvas that scrolls with the page.
    //      */
    //     fixedCanvas: false,
    //     parallaxValue: 0.75,
    // };

    const canvas = document.createElement("canvas");

    const ctx = canvas.getContext("2d", {
        alpha: true
    });

    canvas.style.position =
        options.fixedCanvas ? "fixed" : "absolute";

    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "-1";
    canvas.style.opacity = "0.5";

    if (!options.fixedCanvas) {
        canvas.style.height = "100%";
        canvas.style.minHeight = "100%";
    } else {
        canvas.style.height = "100%";
    }

    document.documentElement.appendChild(canvas);

    let width = 0;
    let height = 0;
    let dpr = 1;

    /*
     * Position of the canvas in document coordinates.
     *
     * Fixed canvas:
     *   canvas starts at document Y = scrollY
     *
     * Full-document canvas:
     *   canvas starts at document Y = 0
     */
    function getCanvasDocumentTop() {
        return options.fixedCanvas
            ? window.scrollY
            : 0;
    }

    const mouse = {
        x: 0.5,
        y: 0.5,

        targetX: 0.5,
        targetY: 0.5,

        vx: 0,
        vy: 0
    };

    let lastTime = performance.now();

    function getDocumentSize() {
        return {
            width: window.innerWidth,

            height: Math.max(
                document.documentElement.scrollHeight,
                document.body?.scrollHeight || 0,
                window.innerHeight
            )
        };
    }

    function resize() {
        dpr = Math.min(
            window.devicePixelRatio || 1,
            2
        );

        if (options.fixedCanvas) {
            width = window.innerWidth;
            height = window.innerHeight;

            canvas.style.position = "fixed";
            canvas.style.height = "100%";
            canvas.style.top = "0";
            canvas.style.left = "0";
        } else {
            const size = getDocumentSize();

            width = size.width;
            height = size.height;

            canvas.style.position = "absolute";
            canvas.style.top = "0";
            canvas.style.left = "0";
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
        }

        canvas.style.maxWidth = "99vw";

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
    }

    resize();

    window.addEventListener("resize", () => {
        resize();
        scheduleTextMaskUpdate();
    });

    /*
     * Convert the pointer's viewport coordinates into
     * coordinates relative to the canvas.
     */
    window.addEventListener("pointermove", e => {
        const canvasTop =
            getCanvasDocumentTop();

        const documentX =
            e.clientX;

        const documentY =
            e.clientY +
            window.scrollY;

        const canvasX =
            documentX;

        const canvasY =
            documentY -
            canvasTop;

        mouse.targetX =
            canvasX / width;

        mouse.targetY =
            canvasY / height;
    });

    /*
     * Character brightness map.
     */
    function getGlyph(value) {
        const chars = options.charset;

        value =
            Math.max(
                0,
                Math.min(0.999999, value)
            );

        return chars[
            Math.floor(
                value * chars.length
            )
        ];
    }

    function smoothstep(a, b, x) {
        x =
            Math.max(
                0,
                Math.min(
                    1,
                    (x - a) / (b - a)
                )
            );

        return x * x * (3 - 2 * x);
    }

    function hash(x, y) {
        const n =
            Math.sin(
                x * 127.1 +
                y * 311.7
            ) *
            43758.5453123;

        return n - Math.floor(n);
    }

    function noise(x, y, time) {
        const ix = Math.floor(x);
        const iy = Math.floor(y);

        const fx = x - ix;
        const fy = y - iy;

        const a = hash(ix, iy);
        const b = hash(ix + 1, iy);
        const c = hash(ix, iy + 1);
        const d = hash(ix + 1, iy + 1);

        const ux =
            fx * fx * (3 - 2 * fx);

        const uy =
            fy * fy * (3 - 2 * fy);

        const n1 =
            a + (b - a) * ux;

        const n2 =
            c + (d - c) * ux;

        return n1 + (n2 - n1) * uy;
    }

    const textRects = [];

    function updateTextMask() {
        textRects.length = 0;

        const walker =
            document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode(node) {
                        if (!node.nodeValue.trim())
                            return NodeFilter.FILTER_REJECT;

                        const parent =
                            node.parentElement;

                        if (!parent)
                            return NodeFilter.FILTER_REJECT;

                        const style =
                            getComputedStyle(parent);

                        if (
                            style.display === "none" ||
                            style.visibility === "hidden" ||
                            parseFloat(style.opacity) === 0
                        ) {
                            return NodeFilter.FILTER_REJECT;
                        }

                        return NodeFilter.FILTER_ACCEPT;
                    }
                }
            );

        let node;

        /*
         * Text ranges are returned in viewport coordinates.
         *
         * Fixed canvas:
         *   Keep them as viewport coordinates.
         *
         * Full document canvas:
         *   Convert them to document/canvas coordinates.
         */
        const canvasTop =
            getCanvasDocumentTop();

        while ((node = walker.nextNode())) {
            const range =
                document.createRange();

            range.selectNodeContents(node);

            for (const rect of range.getClientRects()) {
                if (
                    rect.width <= 0 ||
                    rect.height <= 0
                ) {
                    continue;
                }

                const documentTop =
                    rect.top +
                    window.scrollY;

                const documentBottom =
                    rect.bottom +
                    window.scrollY;

                textRects.push({
                    left:
                        rect.left -
                        options.textClearance,

                    right:
                        rect.right +
                        options.textClearance*2,

                    top:
                        documentTop -
                        canvasTop -
                        options.textClearance,

                    bottom:
                        documentBottom -
                        canvasTop +
                        options.textClearance*1.5
                });
            }
        }
    }

    let lastTextMaskUpdate = 0;
    let textMaskDirty = true;

    function scheduleTextMaskUpdate() {
        textMaskDirty = true;
    }

    window.addEventListener(
        "scroll",
        scheduleTextMaskUpdate,
        {
            passive: true
        }
    );

    window.addEventListener(
        "resize",
        scheduleTextMaskUpdate,
        {
            passive: true
        }
    );

    function isUnderText(x, y) {
        for (const rect of textRects) {
            if (
                x >= rect.left &&
                x <= rect.right &&
                y >= rect.top &&
                y <= rect.bottom
            ) {
                return true;
            }
        }

        return false;
    }

    /*
     * Remove nearly invisible pixels.
     *
     * In fixed mode this operates on the entire canvas.
     *
     * In document mode we only need to process the current
     * viewport region. This avoids repeatedly scanning a
     * potentially enormous full-page canvas.
     */
    function removeFaintTrailPixels(
        regionX = 0,
        regionY = 0,
        regionWidth = width,
        regionHeight = height
    ) {
        regionX =
            Math.max(
                0,
                Math.floor(regionX)
            );

        regionY =
            Math.max(
                0,
                Math.floor(regionY)
            );

        regionWidth =
            Math.min(
                width - regionX,
                Math.ceil(regionWidth)
            );

        regionHeight =
            Math.min(
                height - regionY,
                Math.ceil(regionHeight)
            );

        if (
            regionWidth <= 0 ||
            regionHeight <= 0
        ) {
            return;
        }

        const image =
            ctx.getImageData(
                regionX * dpr,
                regionY * dpr,
                regionWidth * dpr,
                regionHeight * dpr
            );

        const data = image.data;
        const threshold =
            options.trailAlphaThreshold;

        for (
            let i = 3;
            i < data.length;
            i += 4
        ) {
            if (
                data[i] < threshold
            ) {
                data[i] = 0;
            }
        }

        ctx.putImageData(
            image,
            regionX * dpr,
            regionY * dpr
        );
    }

    function draw(time) {
        const dt =
            Math.min(
                (time - lastTime) / 1000,
                0.05
            );

        lastTime = time;

        /*
         * Keep the full-document canvas synchronized
         * with the page if the document's height changes.
         */
        if (!options.fixedCanvas) {
            const documentSize =
                getDocumentSize();

            if (
                documentSize.width !== width ||
                documentSize.height !== height
            ) {
                resize();
                scheduleTextMaskUpdate();
            }
        }

        if (
            textMaskDirty ||
            time - lastTextMaskUpdate >
            options.textMaskUpdate
        ) {
            updateTextMask();

            lastTextMaskUpdate = time;
            textMaskDirty = false;
        }

        /*
         * Smooth cursor following.
         */
        const follow =
            1 -
            Math.exp(
                -options.followSpeed * dt
            );

        const oldX = mouse.x;
        const oldY = mouse.y;

        mouse.x +=
            (mouse.targetX - mouse.x) *
            follow;

        mouse.y +=
            (mouse.targetY - mouse.y) *
            follow;

        mouse.vx =
            mouse.x - oldX;

        mouse.vy =
            mouse.y - oldY;

        /*
         * Mouse position in canvas coordinates.
         */
        const mx =
            mouse.x * width;

        const my =
            mouse.y * height;

        /*
         * Visible viewport in canvas coordinates.
         *
         * Fixed canvas:
         *   The whole canvas is visible.
         *
         * Full-document canvas:
         *   Only the current document viewport is visible.
         */
        let visibleX = 0;
        let visibleY = 0;
        let visibleWidth = width;
        let visibleHeight = height;

        if (!options.fixedCanvas) {
            visibleY =
                window.scrollY;

            visibleHeight =
                window.innerHeight;

            /*
             * The canvas begins at document Y = 0,
             * so scrollY directly gives the visible region.
             */
        }

        /*
         * Fade the previous frame instead of clearing it.
         *
         * In document mode only fade the visible viewport.
         * This means pixels outside the viewport remain stored
         * while the user scrolls elsewhere, preventing the canvas
         * from becoming blank when they scroll back.
         */
        if (options.trailDuration > 0) {
            const fade =
                1 -
                Math.exp(
                    -dt * 6 /
                    (options.trailDuration / 1000)
                );

            ctx.save();

            ctx.globalCompositeOperation =
                "destination-out";

            ctx.fillStyle =
                `rgba(0, 0, 0, ${fade})`;

            ctx.fillRect(
                visibleX,
                visibleY,
                visibleWidth,
                visibleHeight
            );

            ctx.restore();

            removeFaintTrailPixels(
                visibleX,
                visibleY,
                visibleWidth,
                visibleHeight
            );
        } else {
            if (options.fixedCanvas) {
                ctx.clearRect(
                    0,
                    0,
                    width,
                    height
                );
            } else {
                /*
                 * Only clear the visible portion of the
                 * document canvas.
                 */
                ctx.clearRect(
                    visibleX,
                    visibleY,
                    visibleWidth,
                    visibleHeight
                );
            }
        }

        const radiusPx =
            Math.min(
                window.innerWidth,
                window.innerHeight
            ) *
            options.radius;

        /*
         * Character size.
         */
        const fontSize =
            Math.max(
                7,
                Math.min(
                    window.innerWidth,
                    window.innerHeight
                ) /
                (55 * options.scale)
            );

        const cell =
            Math.max(
                4,
                fontSize *
                0.95 *
                options.spacing
            );

        ctx.font =
            `${fontSize}px monospace`;

        /*
         * Keep the effect reasonably cheap on large screens.
         */
        const startX =
            Math.floor(
                (
                    mx -
                    radiusPx * 1.25
                ) / cell
            );

        const endX =
            Math.ceil(
                (
                    mx +
                    radiusPx * 1.25
                ) / cell
            );

        const startY =
            Math.floor(
                (
                    my -
                    radiusPx * 1.25
                ) / cell
            );

        const endY =
            Math.ceil(
                (
                    my +
                    radiusPx * 1.25
                ) / cell
            );

        /*
         * Background layer.
         *
         * Only draw it in the visible area in document mode.
         */
        if (options.backgroundOpacity > 0) {
            ctx.fillStyle =
                `rgba(${options.background[0]},` +
                `${options.background[1]},` +
                `${options.background[2]},` +
                `${options.backgroundOpacity})`;

            if (options.fixedCanvas) {
                ctx.fillRect(
                    0,
                    0,
                    width,
                    height
                );
            } else {
                ctx.fillRect(
                    visibleX,
                    visibleY,
                    visibleWidth,
                    visibleHeight
                );
            }
        }

        /*
         * Draw a soft, animated ASCII field.
         */
        for (
            let gy = startY;
            gy <= endY;
            gy++
        ) {
            for (
                let gx = startX;
                gx <= endX;
                gx++
            ) {
                const baseX =
                    gx * cell +
                    cell * 0.5;

                const baseY =
                    gy * cell +
                    cell * 0.5;

                /*
                 * Don't draw outside the actual canvas.
                 */
                if (
                    baseX < 0 ||
                    baseX > width ||
                    baseY < 0 ||
                    baseY > height
                ) {
                    continue;
                }

                const dx =
                    baseX - mx;

                const dy =
                    baseY - my;

                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );

                /*
                 * Soft lens.
                 */
                let lens =
                    1 -
                    smoothstep(
                        radiusPx * 0.35,
                        radiusPx,
                        distance
                    );

                if (lens <= 0.001)
                    continue;

                lens =
                    Math.pow(
                        lens,
                        options.softness
                    );

                /*
                 * Distance-normalized coordinates.
                 */
                const nx =
                    dx / radiusPx;

                const ny =
                    dy / radiusPx;

                /*
                 * Animated radial waves.
                 */
                const radial =
                    Math.sqrt(
                        nx * nx +
                        ny * ny
                    );

                const wave =
                    Math.sin(
                        radial * 18 -
                        time *
                        0.001 *
                        options.waveSpeed *
                        6
                    ) *
                    options.waveStrength *
                    lens;

                /*
                 * Cursor velocity creates a directional distortion.
                 */
                const velocity =
                    mouse.vx * dx +
                    mouse.vy * dy;

                const velocityWave =
                    Math.sin(
                        distance * 0.045 -
                        velocity * 300
                    ) *
                    options.distortion;

                /*
                 * Organic noise.
                 */
                const n =
                    noise(
                        gx * 0.22 +
                        time *
                        0.00015 *
                        options.characterSpeed,

                        gy * 0.22 +
                        time *
                        0.00012 *
                        options.characterSpeed,

                        time
                    );

                /*
                 * Several overlapping patterns.
                 */
                const pattern1 =
                    Math.sin(
                        (gx * 0.45 +
                            gy * 0.18) +
                        time * 0.0012
                    );

                const pattern2 =
                    Math.cos(
                        (gy * 0.31 -
                            gx * 0.22) -
                        time * 0.0009
                    );

                let intensity =
                    0.5 +

                    pattern1 * 0.16 +
                    pattern2 * 0.13 +

                    (n - 0.5) * 0.32 +

                    wave +

                    velocityWave;

                /*
                 * Make the center significantly brighter.
                 */
                intensity +=
                    lens * 0.48;

                /*
                 * Contrast.
                 */
                intensity =
                    (intensity - 0.5) *
                    options.contrast +
                    0.5;

                intensity +=
                    options.brightness;

                intensity =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            intensity
                        )
                    );

                const amount =
                    options.baseStrength +
                    lens *
                    options.strength;

                intensity *=
                    Math.min(
                        1,
                        amount
                    );

                const underText =
                    isUnderText(
                        baseX,
                        baseY
                    );

                if (underText) {
                    intensity *=
                        options.textOpacity;
                }

                if (intensity < 0.025)
                    continue;

                /*
                 * Tiny character movement gives the field life.
                 */
                const jitter =
                    options.characterJitter *
                    lens;

                const jx =
                    (
                        noise(
                            gx * 0.7,
                            gy * 0.7,
                            time * 0.001
                        ) - 0.5
                    ) *
                    jitter *
                    cell;

                const jy =
                    (
                        noise(
                            gx * 0.7 + 100,
                            gy * 0.7 + 100,
                            time * 0.001
                        ) - 0.5
                    ) *
                    jitter *
                    cell;

                const x =
                    baseX +
                    jx +
                    nx *
                    wave *
                    cell *
                    2;

                const y =
                    baseY +
                    jy +
                    ny *
                    wave *
                    cell *
                    2;

                const glyph =
                    getGlyph(intensity);

                /*
                 * Glow.
                 */
                if (options.glow > 0) {
                    const glowAmount =
                        intensity *
                        lens *
                        options.glow;

                    ctx.shadowBlur =
                        glowAmount *
                        fontSize *
                        2.5;

                    ctx.shadowColor =
                        `rgba(${options.color[0]},` +
                        `${options.color[1]},` +
                        `${options.color[2]},` +
                        `${glowAmount * 0.55})`;
                } else {
                    ctx.shadowBlur = 0;
                }

                /*
                 * RGB aberration around the lens.
                 */
                const aberration =
                    options.aberration *
                    lens *
                    (1 + intensity);

                const offset =
                    aberration * 1.8;

                if (options.aberration > 0) {
                    ctx.fillStyle =
                        `rgba(255,60,60,` +
                        `${intensity * 0.28})`;

                    ctx.fillText(
                        glyph,
                        x - offset,
                        y
                    );

                    ctx.fillStyle =
                        `rgba(60,255,120,` +
                        `${intensity * 0.20})`;

                    ctx.fillText(
                        glyph,
                        x,
                        y + offset * 0.35
                    );

                    ctx.fillStyle =
                        `rgba(80,140,255,` +
                        `${intensity * 0.35})`;

                    ctx.fillText(
                        glyph,
                        x + offset,
                        y
                    );
                }

                /*
                 * Main glyph.
                 */
                ctx.shadowBlur =
                    intensity *
                    options.glow *
                    fontSize *
                    2;

                ctx.fillStyle =
                    `rgba(${options.color[0]},` +
                    `${options.color[1]},` +
                    `${options.color[2]},` +
                    `${Math.min(
                        1,
                        intensity * 0.95
                    )})`;

                ctx.fillText(
                    glyph,
                    x,
                    y
                );
            }
        }

        ctx.shadowBlur = 0;

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);

    /*
     * Public API.
     */
    window.AsciifyBackground = {
        canvas,

        options,

        setOptions(newOptions) {
            const wasFixed =
                options.fixedCanvas;

            Object.assign(
                options,
                newOptions
            );

            /*
             * Allow fixedCanvas to be changed
             * dynamically through setOptions().
             */
            if (
                options.fixedCanvas !==
                wasFixed
            ) {
                resize();
                scheduleTextMaskUpdate();
            }
        },

        destroy() {
            canvas.remove();
            delete window.AsciifyBackground;
        }
    };
})();