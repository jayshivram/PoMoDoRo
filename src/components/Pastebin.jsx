import { useState, useCallback } from 'react';
import { FiClipboard, FiImage, FiLink, FiFileText, FiCopy, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

let idCounter = 0;
const nextId = () => `pb-${Date.now()}-${idCounter++}`;

function isLikelyUrl(text) {
  if (/\s/.test(text)) return false;
  try {
    const url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
    return url.hostname.includes('.');
  } catch {
    return false;
  }
}

export default function Pastebin() {
  // Deliberately plain component state, never persisted — items are meant
  // to disappear on refresh, per how a scratch pad/pastebin should behave.
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState('');

  const addItem = useCallback((type, content) => {
    setItems(prev => [{ id: nextId(), type, content }, ...prev]);
  }, []);

  const removeItem = (id) => {
    setItems(prev => {
      const target = prev.find(i => i.id === id);
      if (target?.type === 'image') URL.revokeObjectURL(target.content);
      return prev.filter(i => i.id !== id);
    });
  };

  const clearAll = () => {
    items.forEach(i => { if (i.type === 'image') URL.revokeObjectURL(i.content); });
    setItems([]);
  };

  const handlePaste = (e) => {
    const clipboard = e.clipboardData;
    if (!clipboard) return;

    const imageItem = Array.from(clipboard.items || []).find(i => i.type.startsWith('image/'));
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) addItem('image', URL.createObjectURL(file));
      return;
    }

    const text = clipboard.getData('text/plain');
    if (text && text.trim()) {
      e.preventDefault();
      addItem(isLikelyUrl(text.trim()) ? 'link' : 'text', text.trim());
    }
  };

  const commitDraft = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    addItem(isLikelyUrl(trimmed) ? 'link' : 'text', trimmed);
    setDraft('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commitDraft();
    }
  };

  const copyItem = (content) => {
    navigator.clipboard?.writeText(content).catch(() => {});
  };

  return (
    <div>
      <div className="pastebin-input-row">
        <textarea
          className="pastebin-textarea"
          placeholder="Paste text, an image, or a link (Ctrl+V) — or type and press Enter"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          rows={2}
          aria-label="Paste or type a note"
          id="pastebin-input"
        />
        <button
          type="button"
          className="pastebin-add-btn"
          onClick={commitDraft}
          aria-label="Add note"
          title="Add"
          id="pastebin-add-btn"
        >
          <FiClipboard />
        </button>
      </div>

      {items.length > 0 && (
        <div className="pastebin-toolbar">
          <span className="section-badge">{items.length} item{items.length > 1 ? 's' : ''}</span>
          <button
            type="button"
            className="task-filter-btn"
            onClick={clearAll}
            style={{ marginLeft: 'auto' }}
            id="pastebin-clear-btn"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="pastebin-list" id="pastebin-list">
        <AnimatePresence mode="popLayout">
          {items.length === 0 && (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FiClipboard className="empty-state-icon" />
              <div className="empty-state-text">Nothing pasted yet</div>
              <div className="empty-state-subtext">Copy something, then press Ctrl+V above — clears on refresh</div>
            </motion.div>
          )}

          {items.map(item => (
            <motion.div
              key={item.id}
              className="pastebin-item"
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              <div className="pastebin-item-icon">
                {item.type === 'image' && <FiImage />}
                {item.type === 'link' && <FiLink />}
                {item.type === 'text' && <FiFileText />}
              </div>

              <div className="pastebin-item-content">
                {item.type === 'image' && (
                  <img src={item.content} alt="Pasted content" className="pastebin-image" />
                )}
                {item.type === 'link' && (
                  <a href={item.content} target="_blank" rel="noopener noreferrer" className="pastebin-link">
                    {item.content}
                  </a>
                )}
                {item.type === 'text' && (
                  <p className="pastebin-text">{item.content}</p>
                )}
              </div>

              <div className="pastebin-item-actions">
                {item.type !== 'image' && (
                  <button
                    type="button"
                    className="task-action-btn"
                    onClick={() => copyItem(item.content)}
                    title="Copy"
                    aria-label="Copy to clipboard"
                  >
                    <FiCopy size={13} />
                  </button>
                )}
                <button
                  type="button"
                  className="task-action-btn delete"
                  onClick={() => removeItem(item.id)}
                  title="Remove"
                  aria-label="Remove item"
                >
                  <FiX size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
