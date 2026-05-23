const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Initialize DOMPurify with a server-side window environment from JSDOM
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Sanitizes an HTML string to prevent XSS (Cross-Site Scripting).
 * Uses DOMPurify to strip any malicious tags or attributes (e.g. <script>, onload).
 * 
 * @param {string} dirtyHtml - The untrusted HTML input from the user
 * @returns {string} - The sanitized, safe HTML string
 */
const sanitizeHtml = (dirtyHtml) => {
    if (!dirtyHtml) return '';
    
    return DOMPurify.sanitize(dirtyHtml, {
        ALLOWED_TAGS: [
            'b', 'i', 'em', 'strong', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
            'ul', 'ol', 'li', 'br', 'span', 'div', 'blockquote', 'code', 'pre', 's', 'u'
        ],
        ALLOWED_ATTR: ['href', 'target', 'class', 'style', 'rel'],
        // We can tighten or loosen this depending on the rich text editor's features
    });
};

module.exports = { sanitizeHtml };
