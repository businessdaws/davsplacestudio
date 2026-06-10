const NativeDOMException = globalThis.DOMException || class DOMException extends Error {
  constructor(message, name) {
    super(message);
    this.name = name || 'DOMException';
    this.code = 0;
  }
};

module.exports = NativeDOMException;
