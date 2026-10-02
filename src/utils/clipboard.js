/**
 * Robust clipboard utility with fallback support for non-HTTPS (HTTP) environments,
 * legacy browsers, and restricted mobile WebViews where navigator.clipboard might fail.
 *
 * @param {string} text The text to copy to clipboard
 * @returns {Promise<boolean>} True if copy was successful, false otherwise
 */
export async function copyToClipboard(text) {
  if (text === null || text === undefined) {
    return false;
  }

  const textToCopy = typeof text === 'string' ? text : String(text);

  // 1. Try modern navigator.clipboard API if available in secure context
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(textToCopy);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText error, attempting fallback execCommand:', err);
    }
  }

  // 2. Fallback using temporary textarea and document.execCommand('copy')
  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    let textArea = null;
    try {
      textArea = document.createElement('textarea');
      textArea.value = textToCopy;

      // Position out of visual field but keep focusable
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      textArea.style.opacity = '0';
      textArea.style.pointerEvents = 'none';
      textArea.setAttribute('readonly', '');

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, textToCopy.length);

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return Boolean(successful);
    } catch (fallbackErr) {
      if (textArea && textArea.parentNode) {
        textArea.parentNode.removeChild(textArea);
      }
      console.error('Clipboard fallback copy error:', fallbackErr);
      return false;
    }
  }

  return false;
}
