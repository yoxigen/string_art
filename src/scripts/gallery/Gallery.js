import patternTypes from "../pattern_types.js";

const THUMBNAIL_WIDTH = 250;

export function renderGallery() {
    const elements = {
        gallery: document.querySelector('#pattern_gallery'),
        pages: {
            home: document.querySelector("#home"),
            editor: document.querySelector("#editor")
        }
    };

    createThumbnails();

    window.addEventListener('popstate', ({state}) => {
        setPage(state?.pattern ? 'editor' : 'home');
    });

    const queryParams = new URLSearchParams(document.location.search);
    const queryPattern = queryParams.get('pattern');
    if (queryPattern) {
        setPage('editor');
    }

    elements.gallery.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();

        const link = e.target.closest('[data-pattern]');
        const pattern = link.dataset.pattern;
        history.pushState({ pattern }, pattern, `?pattern=${pattern}`);
        setPage('editor');
    });

    function createThumbnails() {
        const galleryFragment = document.createDocumentFragment();
        const patterns = [];

        patternTypes.forEach(PatternType => {
            const canvas = document.createElement('canvas');
            canvas.style.width = canvas.style.height = `${THUMBNAIL_WIDTH}px`;

            const pattern = new PatternType(canvas);
            patterns.push(pattern);

            const li = document.createElement('li');
            galleryFragment.appendChild(li);
            const patternLink = document.createElement('a');
            patternLink.href = `?pattern=${pattern.id}`;
            patternLink.setAttribute('data-pattern', pattern.id);
            patternLink.appendChild(canvas);
            li.appendChild(patternLink);
        });

        elements.gallery.appendChild(galleryFragment);
        patterns.forEach(pattern => pattern.draw());
    }

    function setPage(pageId) {
        Object.entries(elements.pages).forEach(([page, element]) => {
            if (page === pageId) {
                element.removeAttribute('hidden');
            } else {
                element.setAttribute('hidden', 'hidden');
            }
        })
    }
}