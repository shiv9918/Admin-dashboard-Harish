import { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Save, Eye, Plus, Trash2, Image, Type, Video, Columns3, Table2, Edit2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const PageEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = id && id !== 'new';

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    blocks: [],
  });
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [contentTables, setContentTables] = useState(null); // null = editor closed
  const [editorDismissed, setEditorDismissed] = useState(false); // track if user explicitly closed it
  // CRITICAL: Store raw HTML from Firebase separately — ReactQuill destroys <thead>/<th> tags
  const originalContentRef = useRef('');

  const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const createColumn = () => ({
    id: createId(),
    content: '',
  });

  const createRowBlock = () => ({
    id: createId(),
    type: 'row',
    columns: [createColumn(), createColumn()],
  });

  const createTableColumn = (label = '') => ({
    id: createId(),
    label,
  });

  const createTableCell = (content = '') => ({
    id: createId(),
    content,
  });

  const createTableRow = (columnCount = 1) => ({
    id: createId(),
    cells: Array.from({ length: Math.max(columnCount, 1) }, () => createTableCell()),
  });

  const createTableBlock = () => ({
    id: createId(),
    type: 'table',
    title: '',
    columns: [createTableColumn('Column 1'), createTableColumn('Column 2'), createTableColumn('Column 3')],
    rows: [createTableRow(3)],
  });

  useEffect(() => {
    if (isEditMode) {
      fetchPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Auto-open the content table editor when page data loads and has tables
  useEffect(() => {
    if (!loading && formData.content && !editorDismissed) {
      const div = document.createElement('div');
      div.innerHTML = formData.content;
      const tables = div.querySelectorAll('table');
      const hasBooksList = id === 'books' && !!div.querySelector('ul li, ol li');
      const hasContactLines = id === 'contact' && !!div.querySelector('p, div, br');
      if ((tables.length > 0 || hasBooksList || hasContactLines) && contentTables === null) {
        // Delay slightly to let the UI render first
        const timer = setTimeout(() => setContentTables(parseContentTables()), 300);
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, formData.content, editorDismissed]);

  // ── Sanitize table HTML: ensure ALL tables have proper <thead>/<th> ──
  // This fixes tables corrupted by ReactQuill (which strips <thead>/<th>)
  const sanitizeTableHtml = (html) => {
    if (!html) return html;
    const div = document.createElement('div');
    div.innerHTML = html;
    const tables = div.querySelectorAll('table');
    let changed = false;

    tables.forEach(table => {
      // Skip tables that already have a proper <thead>
      if (table.querySelector('thead')) return;

      // Find the tbody (or use table itself)
      const tbody = table.querySelector('tbody') || table;
      const rows = Array.from(tbody.querySelectorAll(':scope > tr'));
      if (rows.length < 2) return; // Need at least header + 1 data row

      // The first row is the header — extract it
      const firstRow = rows[0];
      const cells = Array.from(firstRow.querySelectorAll('td, th'));
      if (cells.length === 0) return;

      // Create proper <thead> with <th> cells
      const thead = document.createElement('thead');
      const headerTr = document.createElement('tr');
      cells.forEach(cell => {
        const th = document.createElement('th');
        th.innerHTML = cell.innerHTML;
        headerTr.appendChild(th);
      });
      thead.appendChild(headerTr);

      // Remove the first row from tbody
      firstRow.remove();

      // Insert <thead> before <tbody>
      table.insertBefore(thead, table.firstChild);
      changed = true;
    });

    return changed ? div.innerHTML : html;
  };

  const fetchPage = async () => {
    try {
      const pageDoc = await getDoc(doc(db, 'pages', id));
      if (pageDoc.exists()) {
        const data = pageDoc.data();
        // If this is web-links and it's corrupted (has 2 tables or broken headers), force reset it
        if (id === 'web-links' && (data.content.includes('Texmaker') && (!data.content.includes('<th>Name</th>') || (data.content.match(/<table/g) || []).length > 1))) {
          data.content = `
<h2>Web Links</h2><hr />
<table><thead><tr><th>Name</th><th>Link</th><th>Notes</th></tr></thead>
<tbody>
    <tr><td>SageMath</td><td><a href="http://www.sagemath.org/" target="_blank">http://www.sagemath.org/</a></td><td>-</td></tr>
    <tr><td>Texmaker</td><td><a href="http://www.xm1math.net/texmaker/" target="_blank">http://www.xm1math.net/texmaker/</a></td><td>-</td></tr>
    <tr><td>Damicon Open Software Resources</td><td><a href="http://www.damicon.com/resources/opensoftware.html" target="_blank">http://www.damicon.com/resources/opensoftware.html</a></td><td>-</td></tr>
    <tr><td>Popular Open Source Software (Tripwire Magazine)</td><td><a href="http://www.tripwiremagazine.com/2010/03/20-most-popular-open-source-software-ever-2.html" target="_blank">http://www.tripwiremagazine.com/2010/03/20-most-popular-open-source-software-ever-2.html</a></td><td>-</td></tr>
    <tr><td>crazyproject.wordpress.com</td><td><a href="https://crazyproject.wordpress.com/" target="_blank">https://crazyproject.wordpress.com/</a></td><td>Very useful site—it contains solutions to Dummit and Foote</td></tr>
    <tr><td>Bookfi</td><td><a href="http://en.bookfi.org/" target="_blank">http://en.bookfi.org/</a></td><td>-</td></tr>
    <tr><td>Bookboon</td><td><a href="http://www.bookboon.com/" target="_blank">http://www.bookboon.com/</a></td><td>-</td></tr>
    <tr><td>GetFreeEbooks</td><td><a href="http://www.getfreeebooks.com/" target="_blank">http://www.getfreeebooks.com/</a></td><td>-</td></tr>
    <tr><td>OnlineFreeEbooks</td><td><a href="http://www.onlinefreeebooks.net/" target="_blank">http://www.onlinefreeebooks.net/</a></td><td>-</td></tr>
    <tr><td>FreeBookSpot</td><td><a href="http://www.freebookspot.es/" target="_blank">http://www.freebookspot.es/</a></td><td>-</td></tr>
</tbody></table>`;
          try {
            await setDoc(doc(db, 'pages', id), data);
            console.log("Automatically repaired web-links structure in Database!");
          } catch(e) {}
        }

        // Sanitize the content — fix tables missing <thead>/<th>
        const sanitizedContent = sanitizeTableHtml(data.content || '');
        // Store the SANITIZED content as the original (Quill-safe)
        originalContentRef.current = sanitizedContent;
        setFormData({ ...data, content: sanitizedContent });

        // If sanitization changed the content, auto-save the fix to Firebase
        if (sanitizedContent !== (data.content || '')) {
          try {
            await setDoc(doc(db, 'pages', id), {
              ...data,
              content: sanitizedContent,
              updatedAt: serverTimestamp(),
            });
            console.log('Auto-fixed table structure in Firebase for page:', id);
          } catch (e) {
            console.warn('Could not auto-fix table structure:', e);
          }
        }
      } else {
        toast.error('Page not found');
        navigate('/admin/pages');
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      toast.error('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  // Merge Quill-edited content with preserved table structure
  // Quill destroys <thead>/<th> so we take tables from originalContentRef
  const getMergedContent = () => {
    const quillContent = formData.content || '';
    const origContent = originalContentRef.current || '';
    if (!origContent) return quillContent;

    const origDiv = document.createElement('div');
    origDiv.innerHTML = origContent;
    const origTables = origDiv.querySelectorAll('table');
    if (origTables.length === 0) return quillContent;

    const quillDiv = document.createElement('div');
    quillDiv.innerHTML = quillContent;
    const quillTables = quillDiv.querySelectorAll('table');

    // Surgically restore ONLY the <thead> that Quill stripped, PRESERVING all body changes
    quillTables.forEach((qt, i) => {
      if (origTables[i]) {
        const origThead = origTables[i].querySelector('thead');
        if (origThead && !qt.querySelector('thead')) {
          // If the original had a thead, and quill stripped it, append it back
          qt.insertBefore(origThead.cloneNode(true), qt.firstChild);
        }
      }
    });

    return quillDiv.innerHTML;
  };

  const handleSave = async (status = formData.status) => {
    console.log("Saving page... Status:", status);

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSaving(true);
    const loadingToast = toast.loading(`Saving page as ${status}...`);

    try {
      // Use merged content that preserves table structure
      const mergedContent = getMergedContent();

      const pageData = {
        ...formData,
        content: mergedContent,
        status,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
        updatedAt: serverTimestamp(),
      };

      console.log("Saving data:", pageData);

      if (isEditMode) {
        console.log("Updating existing page:", id);
        const savePromise = setDoc(doc(db, 'pages', id), pageData);
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 2000));

        const result = await Promise.race([savePromise, timeoutPromise]);

        if (result === 'timeout') {
          console.log("Save timed out (likely offline). Proceeding as queued.");
          toast.info("Saved offline. Will sync when online.");
        }
      } else {
        console.log("Creating new page");
        pageData.createdAt = serverTimestamp();
        const newPageRef = await addDoc(collection(db, 'pages'), pageData);

        if (user) {
          try {
            await addDoc(collection(db, 'activity_logs'), {
              action: `Created page: ${formData.title}`,
              userId: user.uid,
              timestamp: serverTimestamp(),
            });
          } catch (err) { console.warn("Failed to log activity:", err); }
        }
        navigate(`/admin/pages/edit/${newPageRef.id}`);
      }

      // Update the original content ref with what we saved
      originalContentRef.current = mergedContent;

      console.log("Save successful!");
      toast.dismiss(loadingToast);
      toast.success(`Page ${status === 'published' ? 'published' : 'saved'} successfully`);
    } catch (error) {
      console.error('Error saving page:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to save page: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const addBlock = (type) => {
    if (type === 'row') {
      setFormData({ ...formData, blocks: [...formData.blocks, createRowBlock()] });
      return;
    }

    if (type === 'table') {
      setFormData({ ...formData, blocks: [...formData.blocks, createTableBlock()] });
      return;
    }

    const newBlock = {
      id: createId(),
      type,
      content: type === 'text' ? '' : '',
      url: '',
    };
    setFormData({ ...formData, blocks: [...formData.blocks, newBlock] });
  };


  const updateBlock = (blockId, field, value) => {
    setFormData({
      ...formData,
      blocks: formData.blocks?.map((block) =>
        block.id === blockId ? { ...block, [field]: value } : block
      ) || [],
    });
  };

  const updateRowColumn = (blockId, columnId, field, value) => {
    setFormData({
      ...formData,
      blocks: formData.blocks?.map((block) => {
        if (block.id !== blockId || block.type !== 'row') {
          return block;
        }

        return {
          ...block,
          columns: (block.columns || []).map((column) =>
            column.id === columnId ? { ...column, [field]: value } : column
          ),
        };
      }) || [],
    });
  };

  const addRowColumn = (blockId) => {
    setFormData({
      ...formData,
      blocks: formData.blocks?.map((block) =>
        block.id === blockId && block.type === 'row'
          ? { ...block, columns: [...(block.columns || []), createColumn()] }
          : block
      ) || [],
    });
  };

  const updateTableBlock = (blockId, updater) => {
    setFormData({
      ...formData,
      blocks: formData.blocks?.map((block) => {
        if (block.id !== blockId || block.type !== 'table') {
          return block;
        }

        return updater(block);
      }) || [],
    });
  };

  const updateTableColumn = (blockId, columnId, field, value) => {
    updateTableBlock(blockId, (block) => ({
      ...block,
      columns: (block.columns || []).map((column) =>
        column.id === columnId ? { ...column, [field]: value } : column
      ),
    }));
  };

  const updateTableCell = (blockId, rowId, cellId, field, value) => {
    updateTableBlock(blockId, (block) => ({
      ...block,
      rows: (block.rows || []).map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        return {
          ...row,
          cells: (row.cells || []).map((cell) =>
            cell.id === cellId ? { ...cell, [field]: value } : cell
          ),
        };
      }),
    }));
  };

  const addTableRow = (blockId) => {
    updateTableBlock(blockId, (block) => {
      const columnCount = Math.max((block.columns || []).length, 1);

      return {
        ...block,
        rows: [...(block.rows || []), createTableRow(columnCount)],
      };
    });
  };

  const removeTableRow = (blockId, rowId) => {
    updateTableBlock(blockId, (block) => {
      const nextRows = (block.rows || []).filter((row) => row.id !== rowId);

      return {
        ...block,
        rows: nextRows.length > 0 ? nextRows : [createTableRow((block.columns || []).length || 1)],
      };
    });
  };

  const addTableColumn = (blockId) => {
    updateTableBlock(blockId, (block) => {
      const nextColumns = [...(block.columns || []), createTableColumn(`Column ${(block.columns || []).length + 1}`)];
      const nextRows = (block.rows || []).map((row) => ({
        ...row,
        cells: [...(row.cells || []), createTableCell()],
      }));

      return {
        ...block,
        columns: nextColumns,
        rows: nextRows.length > 0 ? nextRows : [createTableRow(nextColumns.length)],
      };
    });
  };

  const removeTableColumn = (blockId, columnId) => {
    updateTableBlock(blockId, (block) => {
      const nextColumns = (block.columns || []).filter((column) => column.id !== columnId);
      const safeColumns = nextColumns.length > 0 ? nextColumns : [createTableColumn('Column 1')];
      const nextRows = (block.rows || []).map((row) => {
        const cells = (row.cells || []).filter((cell, index) => (block.columns || [])[index]?.id !== columnId);

        return {
          ...row,
          cells: cells.length > 0 ? cells : [createTableCell()],
        };
      });

      return {
        ...block,
        columns: safeColumns,
        rows: nextRows.length > 0 ? nextRows.map((row) => ({
          ...row,
          cells: row.cells.slice(0, safeColumns.length),
        })) : [createTableRow(safeColumns.length)],
      };
    });
  };

  const removeRowColumn = (blockId, columnId) => {
    setFormData({
      ...formData,
      blocks: formData.blocks?.map((block) => {
        if (block.id !== blockId || block.type !== 'row') {
          return block;
        }

        const nextColumns = (block.columns || []).filter((column) => column.id !== columnId);

        return {
          ...block,
          columns: nextColumns.length > 0 ? nextColumns : [createColumn()],
        };
      }) || [],
    });
  };

  const deleteBlock = (blockId) => {
    setFormData({
      ...formData,
      blocks: formData.blocks?.filter((block) => block.id !== blockId) || [],
    });
  };

  // ── Content Table Editor ──────────────────────────────────────────────────────
  // CRITICAL: Always parse from originalContentRef (not formData.content)
  // because ReactQuill strips <thead> and <th> tags!
  const parseContentTables = () => {
    const rawHtml = originalContentRef.current || formData.content;
    if (!rawHtml) return [];
    const div = document.createElement('div');
    div.innerHTML = rawHtml;
    const tables = div.querySelectorAll('table');

    // Books page is authored as list content, so expose it in the same row editor UX.
    if (tables.length === 0 && id === 'books') {
      const list = div.querySelector('ul, ol');
      if (!list) return [];

      const rows = Array.from(list.querySelectorAll(':scope > li')).map((li) => {
        const link = li.querySelector('a');
        const value = (link?.getAttribute('href') || link?.textContent || li.textContent || '').trim();
        return [value];
      });

      return [{
        id: 'ct-books-list',
        tableIndex: -1,
        label: 'Books',
        headers: ['Link'],
        rows: rows.length > 0 ? rows : [['']],
        sourceType: 'books-list',
      }];
    }

    if (tables.length === 0 && id === 'contact') {
      const lines = [];
      const pushLine = (value = '') => {
        const line = String(value || '').replace(/\u00a0/g, ' ').trim();
        if (!line) return;
        if (/^contact\s*details$/i.test(line)) return;
        lines.push(line);
      };

      const blocks = Array.from(div.querySelectorAll('p'));
      if (blocks.length > 0) {
        blocks.forEach((block) => {
          const htmlParts = String(block.innerHTML || '').split(/<br\s*\/?>/i);
          htmlParts.forEach((part) => {
            const temp = document.createElement('div');
            temp.innerHTML = part;
            pushLine(temp.textContent || '');
          });
        });
      } else {
        const textParts = String(div.textContent || '').split(/\n+/);
        textParts.forEach(pushLine);
      }

      return [{
        id: 'ct-contact-lines',
        tableIndex: -1,
        label: 'Contact',
        headers: ['Details'],
        rows: lines.length > 0 ? lines.map((line) => [line]) : [['']],
        sourceType: 'contact-lines',
      }];
    }

    const normalizeCellText = (value = '') =>
      String(value)
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '');

    const isHeaderDuplicateRow = (headers = [], row = []) => {
      if (!headers.length || !row.length) return false;

      const normalizedHeaders = headers.map(normalizeCellText).filter(Boolean);
      if (!normalizedHeaders.length) return false;

      const normalizedRow = row.map(normalizeCellText).filter(Boolean);
      if (!normalizedRow.length) return false;

      // Handles malformed single-cell rows like "NameLinkNotes".
      if (normalizedRow.length === 1) {
        return normalizedRow[0] === normalizedHeaders.join('');
      }

      // Handles duplicated header rows like ["Name", "Link", "Notes"].
      if (normalizedRow.length >= normalizedHeaders.length) {
        return normalizedHeaders.every((header, index) => normalizedRow[index] === header);
      }

      return false;
    };

    return Array.from(tables).map((table, tableIndex) => {
      const thead = table.querySelector('thead');
      const tbody = table.querySelector('tbody');

      let headers = [];
      let dataRows = [];

      // Helper: extract clean display text from a cell
      // Preserves the text content from <a> tags but strips the HTML
      const getCellText = (el) => {
        const link = el.querySelector('a');
        if (link) return link.textContent.trim() || link.getAttribute('href') || '';
        return el.textContent.trim();
      };

      if (thead) {
        // Explicit <thead> — read headers from it
        const hRow = thead.querySelector('tr');
        if (hRow) {
          headers = Array.from(hRow.querySelectorAll('th, td'))
            .map(el => getCellText(el));
        }
        const bodyEl = tbody || table;
        dataRows = Array.from(bodyEl.querySelectorAll(':scope > tr'))
          .map(tr => Array.from(tr.querySelectorAll('td, th')).map(el => getCellText(el)))
          .filter(r => r.length > 0);

        if (dataRows.length > 0 && isHeaderDuplicateRow(headers, dataRows[0])) {
          dataRows = dataRows.slice(1);
        }
      } else {
        // No <thead> — collect all rows
        const allTrs = Array.from(table.querySelectorAll(':scope > tr, :scope > tbody > tr'));
        const seen = new Set();
        const uniqueTrs = allTrs.filter(tr => {
          if (seen.has(tr)) return false;
          seen.add(tr);
          return true;
        });

        const headerTr = uniqueTrs.find(r => r.querySelector('th'));
        if (headerTr) {
          headers = Array.from(headerTr.querySelectorAll('th, td'))
            .map(el => getCellText(el));
          dataRows = uniqueTrs
            .filter(r => r !== headerTr)
            .map(tr => Array.from(tr.querySelectorAll('td, th')).map(el => getCellText(el)))
            .filter(r => r.length > 0);
        } else if (uniqueTrs.length > 1) {
          const firstTr = uniqueTrs[0];
          headers = Array.from(firstTr.querySelectorAll('td'))
            .map(el => getCellText(el));
          dataRows = uniqueTrs.slice(1)
            .map(tr => Array.from(tr.querySelectorAll('td, th')).map(el => getCellText(el)))
            .filter(r => r.length > 0);
        } else {
          dataRows = uniqueTrs
            .map(tr => Array.from(tr.querySelectorAll('td, th')).map(el => getCellText(el)))
            .filter(r => r.length > 0);
        }
      }

      let label = `Table ${tableIndex + 1}`;
      let prev = table.previousElementSibling;
      while (prev) {
        if (/^H[1-6]$/.test(prev.tagName)) { label = prev.textContent.trim(); break; }
        prev = prev.previousElementSibling;
      }
      return { id: `ct-${tableIndex}`, tableIndex, label, headers, rows: dataRows, sourceType: 'table' };
    });
  };

  const openContentTableEditor = () => setContentTables(parseContentTables());
  const closeContentTableEditor = () => {
    setContentTables(null);
    setEditorDismissed(true);
  };

  // Helper: auto-wrap URLs in <a> tags for clickable links
  const autoLinkCell = (text, options = {}) => {
    const { linkLabel = null } = options;
    if (!text || typeof text !== 'string') return text || '';
    const trimmed = text.trim();

    // Already contains HTML <a> tag — optionally normalize label (e.g., "View").
    if (/<a\s/i.test(trimmed)) {
      if (!linkLabel) return trimmed;
      const container = document.createElement('div');
      container.innerHTML = trimmed;
      const anchor = container.querySelector('a');
      if (!anchor) return trimmed;
      anchor.textContent = linkLabel;
      if (!anchor.getAttribute('target')) anchor.setAttribute('target', '_blank');
      if (!anchor.getAttribute('rel')) anchor.setAttribute('rel', 'noopener noreferrer');
      return container.innerHTML;
    }

    // Looks like a URL — wrap in <a> tag
    if (/^https?:\/\//i.test(trimmed)) {
      const label = linkLabel || trimmed;
      return `<a href="${trimmed}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    }

    if (/^mailto:/i.test(trimmed)) {
      const email = trimmed.replace(/^mailto:/i, '').trim();
      const label = linkLabel || email;
      return `<a href="mailto:${email}">${label}</a>`;
    }

    if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(trimmed)) {
      const label = linkLabel || trimmed;
      return `<a href="mailto:${trimmed}">${label}</a>`;
    }

    const linkified = trimmed
      .replace(/(https?:\/\/[^\s<]+)/gi, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/(^|\s)([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})(?=\s|$)/gi, '$1<a href="mailto:$2">$2</a>');
    if (linkified !== trimmed) {
      return linkified;
    }

    return trimmed;
  };

  const applyContentTables = async () => {
    if (!contentTables) return;

    // CRITICAL: Use originalContentRef as the base (has intact <thead>/<th>)
    const rawHtml = originalContentRef.current || formData.content;
    const div = document.createElement('div');
    div.innerHTML = rawHtml;
    const domTables = div.querySelectorAll('table');

    const getNormalizedTbody = (table) => {
      const directRows = Array.from(table.querySelectorAll(':scope > tr'));
      const allBodies = Array.from(table.querySelectorAll(':scope > tbody'));
      let primaryBody = allBodies[0] || null;

      // Keep a single tbody so repeated Apply clicks never duplicate table rows.
      if (!primaryBody) {
        primaryBody = document.createElement('tbody');
        table.appendChild(primaryBody);
      }

      allBodies.slice(1).forEach((tbody) => {
        while (tbody.firstChild) {
          primaryBody.appendChild(tbody.firstChild);
        }
        tbody.remove();
      });

      directRows.forEach((row) => {
        primaryBody.appendChild(row);
      });

      return primaryBody;
    };

    const getColCount = (headers = [], rows = []) => Math.max(
      headers.length,
      ...rows.map((row) => row.length),
      1
    );

    const getLinkLabelForColumn = (header = '') => {
      const normalizedHeader = String(header || '').trim();
      if (id === 'publications' && /^(link|url)$/i.test(normalizedHeader)) return 'View';
      if (id === 'software' && /^(link|url|action)$/i.test(normalizedHeader)) return 'Visit Site';
      return null;
    };

    const rebuildTable = (table, headers = [], rows = []) => {
      const rebuiltTable = table.cloneNode(false); // preserve table attributes/classes/styles
      const caption = table.querySelector(':scope > caption');
      if (caption) {
        rebuiltTable.appendChild(caption.cloneNode(true));
      }

      const colCount = getColCount(headers, rows);
      const thead = document.createElement('thead');
      const headerTr = document.createElement('tr');
      for (let i = 0; i < colCount; i++) {
        const th = document.createElement('th');
        th.innerHTML = headers[i] ?? '';
        headerTr.appendChild(th);
      }
      thead.appendChild(headerTr);

      const tbody = document.createElement('tbody');
      rows.forEach((row) => {
        const tr = document.createElement('tr');
        for (let i = 0; i < colCount; i++) {
          const td = document.createElement('td');
          td.innerHTML = autoLinkCell(row[i] ?? '', {
            linkLabel: getLinkLabelForColumn(headers[i]),
          });
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      });

      rebuiltTable.appendChild(thead);
      rebuiltTable.appendChild(tbody);
      return rebuiltTable;
    };

    const tableSignature = (table) => {
      const extractRows = (root, selector) => Array.from(root.querySelectorAll(selector)).map((tr) =>
        Array.from(tr.querySelectorAll('th, td'))
          .map((cell) => (cell.textContent || '').replace(/\s+/g, ' ').trim())
          .join('|')
      );

      const headerRows = extractRows(table, ':scope > thead > tr');
      const bodyRows = extractRows(table, ':scope > tbody > tr');
      return `${headerRows.join('||')}###${bodyRows.join('||')}`;
    };

    contentTables.forEach(({ tableIndex, headers, rows, sourceType }) => {
      if (sourceType === 'books-list') {
        const list = div.querySelector('ul, ol');
        if (!list) return;

        list.innerHTML = '';
        rows.forEach((row) => {
          const value = String(row?.[0] ?? '').trim();
          if (!value) return;
          const li = document.createElement('li');
          li.innerHTML = autoLinkCell(value);
          list.appendChild(li);
        });
        return;
      }

      if (sourceType === 'contact-lines') {
        const heading = div.querySelector('h1, h2, h3, h4, h5, h6');
        const existingDetailsContainer = heading?.nextElementSibling?.tagName === 'DIV'
          ? heading.nextElementSibling
          : null;

        const nextContainer = existingDetailsContainer
          ? existingDetailsContainer.cloneNode(false)
          : document.createElement('div');

        nextContainer.innerHTML = '';
        rows.forEach((row) => {
          const value = String(row?.[0] ?? '').trim();
          if (!value) return;
          const p = document.createElement('p');
          p.innerHTML = autoLinkCell(value);
          nextContainer.appendChild(p);
        });

        div.innerHTML = '';
        if (heading) {
          div.appendChild(heading.cloneNode(true));
        }
        div.appendChild(nextContainer);
        return;
      }

      const origTable = domTables[tableIndex];
      if (!origTable) return;

      // Normalize first to avoid inheriting malformed mixed structures.
      getNormalizedTbody(origTable);

      // Rebuild table from current editor state so Apply is idempotent.
      const rebuiltTable = rebuildTable(origTable, headers, rows);
      origTable.replaceWith(rebuiltTable);
    });

    // Remove accidental duplicate copies when two adjacent tables have identical content.
    const allTables = Array.from(div.querySelectorAll('table'));
    for (let i = 1; i < allTables.length; i++) {
      const current = allTables[i];
      const previous = allTables[i - 1];
      if (!current || !previous) continue;
      if (tableSignature(current) === tableSignature(previous)) {
        current.remove();
      }
    }

    const newContent = div.innerHTML;
    // Update both the ref and formData
    originalContentRef.current = newContent;
    const updatedFormData = { ...formData, content: newContent };
    setFormData(updatedFormData);

    // Auto-save to Firebase if in edit mode
    if (isEditMode) {
      try {
        const pageData = {
          ...updatedFormData,
          slug: updatedFormData.slug || updatedFormData.title.toLowerCase().replace(/\s+/g, '-'),
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'pages', id), pageData);
        toast.success('Tables saved to Firebase successfully!');
      } catch (error) {
        console.error('Error auto-saving:', error);
        toast.error('Tables applied locally. Click Publish to save to Firebase.');
      }
    } else {
      toast.success('Tables updated. Click Save Draft or Publish to sync to Firebase.');
    }

    // Re-open the editor seamlessly with fresh data (using parseContentTables)
    setTimeout(() => {
      setContentTables(parseContentTables());
    }, 150);
  };

  const updateCTHeader = (tableId, colIdx, value) =>
    setContentTables(prev => prev.map(t =>
      t.id === tableId ? { ...t, headers: t.headers.map((h, i) => i === colIdx ? value : h) } : t
    ));

  const updateCTCell = (tableId, rowIdx, colIdx, value) =>
    setContentTables(prev => prev.map(t =>
      t.id === tableId
        ? { ...t, rows: t.rows.map((r, ri) => ri === rowIdx ? r.map((c, ci) => ci === colIdx ? value : c) : r) }
        : t
    ));

  const addCTRow = (tableId) =>
    setContentTables(prev => prev.map(t => {
      if (t.id !== tableId) return t;
      // colCount = max actual column count across all rows
      const colCount = Math.max(
        t.headers.length,
        ...t.rows.map(r => r.length),
        1
      );
      // Create a fresh empty row - NEVER touch existing rows
      const newRow = Array(colCount).fill('');
      // Auto-number first column if last row's first cell is a number
      const lastRow = t.rows[t.rows.length - 1];
      if (lastRow && /^\d+$/.test((lastRow[0] || '').trim())) {
        newRow[0] = String(parseInt(lastRow[0].trim(), 10) + 1);
      }
      // Spread existing rows as-is (no mutation), only append the new one
      return { ...t, rows: [...t.rows.map(r => [...r]), newRow] };
    }));

  const removeCTRow = (tableId, rowIdx) =>
    setContentTables(prev => prev.map(t => {
      if (t.id !== tableId) return t;
      // Simply remove the target row — do NOT modify any other row's data
      const newRows = t.rows
        .filter((_, i) => i !== rowIdx)
        .map(row => [...row]); // shallow copy each row to avoid mutation
      return { ...t, rows: newRows.length > 0 ? newRows : [Array(t.headers.length || 1).fill('')] };
    }));

  const addCTColumn = (tableId) =>
    setContentTables(prev => prev.map(t => {
      if (t.id !== tableId) return t;
      return {
        ...t,
        headers: [...t.headers, `Column ${t.headers.length + 1}`],
        rows: t.rows.map(r => [...r, ''])
      };
    }));

  const removeCTColumn = (tableId, colIdx) =>
    setContentTables(prev => prev.map(t => {
      if (t.id !== tableId) return t;
      const safeHeaders = t.headers.filter((_, i) => i !== colIdx);
      const safeRows = t.rows.map(r => {
        const next = r.filter((_, i) => i !== colIdx);
        return next.length > 0 ? next : [''];
      });
      return { ...t, headers: safeHeaders, rows: safeRows };
    }));
  // ─────────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-border/40">
          <h1
            className="text-4xl font-bold text-primary"
            style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.02em' }}
          >
            {isEditMode ? 'Edit Page' : 'New Page'}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              data-testid="toggle-preview-button"
              className="flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-secondary transition-colors"
            >
              <Eye size={18} />
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              data-testid="save-draft-button"
              className="flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-secondary transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              Save Draft
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              data-testid="publish-button"
              className="flex items-center gap-2 px-6 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              Publish
            </button>
          </div>
        </div>

        <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
          <div className="space-y-6">
            <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-primary mb-4">Page Content</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    data-testid="page-title-input"
                    className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Enter page title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    data-testid="page-slug-input"
                    className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="page-url-slug"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Content</label>
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    className="bg-white"
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['link', 'image'],
                        ['clean'],
                      ],
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ── Edit Content Tables Panel ─────────────────────────────── */}
            <div className="bg-white border-2 border-accent/30 rounded-lg p-6 shadow-md">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
                    <Table2 size={22} className="text-accent" />
                    Content Table Editor
                  </h2>
                  <p className="text-sm text-muted mt-0.5">Add, edit, or delete rows in your page tables. Changes are applied instantly.</p>
                </div>
                {contentTables === null ? (
                  <button
                    onClick={openContentTableEditor}
                    className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-all text-sm font-semibold shadow-sm hover:shadow-md"
                  >
                    <Edit2 size={16} />
                    Open Table Editor
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={closeContentTableEditor}
                      className="flex items-center gap-2 px-4 py-2.5 border border-input rounded-lg hover:bg-secondary transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={applyContentTables}
                      className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-semibold shadow-sm hover:shadow-md"
                    >
                      <Save size={16} />
                      Apply & Save Changes
                    </button>
                  </div>
                )}
              </div>

              {contentTables !== null && (
                <div className="mt-4">
                  {contentTables.length === 0 ? (
                    <p className="text-sm text-muted text-center py-8 border border-dashed border-border rounded-lg">
                      No HTML tables found in the content above. Seed default content or add tables via the ReactQuill editor first.
                    </p>
                  ) : (
                    <div className="space-y-8">
                      {contentTables.map((table) => {
                        const colCount = Math.max(table.headers.length, table.rows[0]?.length || 1);
                        return (
                          <div key={table.id} className="rounded-xl border-2 border-border overflow-hidden shadow-sm">
                            {/* Table label bar */}
                            <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-[#913c07]/10 to-[#913c07]/5 border-b-2 border-[#913c07]/20">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#913c07] animate-pulse"></div>
                                <span className="text-base font-bold text-[#913c07]">{table.label}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted bg-white px-2 py-1 rounded-full border">{table.rows.length} rows · {colCount} columns</span>
                                <button
                                  onClick={() => addCTRow(table.id)}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-semibold shadow-sm hover:shadow-md"
                                >
                                  <Plus size={16} strokeWidth={3} />
                                  New Row
                                </button>
                              </div>
                            </div>

                            <div className="overflow-x-auto">
                              <table
                                className="w-full border-collapse text-sm"
                                style={{ minWidth: `${Math.max(colCount * 160 + 120, 500)}px` }}
                              >
                                <thead>
                                  <tr className="bg-[#913c07]/10">
                                    {/* Row # header */}
                                    <th className="w-14 border-b-2 border-r border-[#913c07]/20 px-2 py-2.5 text-center text-xs font-semibold text-[#913c07] select-none">S.No.</th>
                                    {/* Column header inputs */}
                                    {Array.from({ length: colCount }).map((_, colIdx) => (
                                      <th key={colIdx} className="border-b-2 border-r border-[#913c07]/20 px-1 py-1.5 min-w-[150px] bg-[#913c07]/5">
                                        <div className="flex items-center gap-1 group">
                                          <input
                                            type="text"
                                            value={table.headers[colIdx] || ''}
                                            onChange={(e) => updateCTHeader(table.id, colIdx, e.target.value)}
                                            className="flex-1 px-2 py-1 text-sm font-bold bg-transparent focus:outline-none focus:bg-white focus:ring-2 focus:ring-accent rounded min-w-0 text-[#913c07]"
                                            placeholder={`Column ${colIdx + 1}`}
                                          />
                                          <button
                                            onClick={() => removeCTColumn(table.id, colIdx)}
                                            disabled={colCount === 1}
                                            title="Delete this column"
                                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 text-destructive disabled:opacity-0 flex-shrink-0 transition-opacity"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        </div>
                                      </th>
                                    ))}
                                    {/* + Add Column */}
                                    <th className="border-b-2 border-[#913c07]/20 w-10 px-1 py-1 bg-slate-50">
                                      <button
                                        onClick={() => addCTColumn(table.id)}
                                        title="Add column"
                                        className="w-full flex items-center justify-center p-1.5 rounded hover:bg-accent/20 text-accent border border-dashed border-accent/40 hover:border-accent transition-colors"
                                      >
                                        <Plus size={15} />
                                      </button>
                                    </th>
                                    {/* Actions header */}
                                    <th className="border-b-2 border-[#913c07]/20 w-16 px-1 py-1 bg-slate-50 text-center text-xs font-semibold text-muted">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {table.rows.map((row, rowIdx) => (
                                    <tr key={rowIdx} className={`border-b border-border hover:bg-amber-50/60 transition-colors ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                                      {/* Row number */}
                                      <td className="border-r border-border px-2 py-2 text-center w-14 bg-slate-50/60">
                                        <span className="text-sm text-primary font-semibold font-mono">{rowIdx + 1}</span>
                                      </td>
                                      {/* Cell inputs */}
                                      {Array.from({ length: colCount }).map((_, colIdx) => (
                                        <td key={colIdx} className="border-r border-border px-1 py-1 align-top min-w-[150px]">
                                          <textarea
                                            value={row[colIdx] ?? ''}
                                            onChange={(e) => updateCTCell(table.id, rowIdx, colIdx, e.target.value)}
                                            className="w-full px-2 py-1.5 text-sm border border-transparent bg-transparent focus:outline-none focus:bg-white focus:border-accent focus:ring-1 focus:ring-accent rounded resize-none leading-snug hover:bg-gray-50 transition-colors"
                                            rows="2"
                                            placeholder={table.headers[colIdx] || `Col ${colIdx + 1}`}
                                          />
                                        </td>
                                      ))}
                                      <td className="w-10" />
                                      {/* Delete action - always visible */}
                                      <td className="w-16 px-2 py-1 text-center">
                                        <button
                                          onClick={() => {
                                            if (window.confirm(`Delete row ${rowIdx + 1}?`)) {
                                              removeCTRow(table.id, rowIdx);
                                            }
                                          }}
                                          disabled={table.rows.length === 1}
                                          title={`Delete row ${rowIdx + 1}`}
                                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-medium border border-red-200 hover:border-red-300"
                                        >
                                          <Trash2 size={13} />
                                          Del
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                  {/* + Add Row - prominent button */}
                                  <tr>
                                    <td colSpan={colCount + 3} className="px-3 py-2 bg-green-50/50">
                                      <button
                                        onClick={() => addCTRow(table.id)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-green-700 hover:text-white bg-green-100 hover:bg-green-600 rounded-lg border-2 border-dashed border-green-300 hover:border-green-600 transition-all hover:shadow-md"
                                      >
                                        <Plus size={18} strokeWidth={3} />
                                        Add New Row
                                      </button>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Quick help */}
                            <div className="px-4 py-2 bg-blue-50/50 border-t border-blue-200/50 text-xs text-blue-600 flex items-center gap-2">
                              <span>💡</span>
                              <span>Click any cell to edit. Click <strong>"New Row"</strong> to add data. Click <strong>"Del"</strong> to remove a row. Don't forget to <strong>Apply & Save</strong>!</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* ──────────────────────────────────────────────────────────── */}

            <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-primary">Page Builder</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => addBlock('text')}
                    data-testid="add-text-block"
                    className="p-2 hover:bg-secondary rounded-md transition-colors"
                    title="Add Text Block"
                  >
                    <Type size={18} />
                  </button>
                  <button
                    onClick={() => addBlock('image')}
                    data-testid="add-image-block"
                    className="p-2 hover:bg-secondary rounded-md transition-colors"
                    title="Add Image Block"
                  >
                    <Image size={18} />
                  </button>
                  <button
                    onClick={() => addBlock('video')}
                    data-testid="add-video-block"
                    className="p-2 hover:bg-secondary rounded-md transition-colors"
                    title="Add Video Block"
                  >
                    <Video size={18} />
                  </button>
                  <button
                    onClick={() => addBlock('row')}
                    data-testid="add-row-block"
                    className="p-2 hover:bg-secondary rounded-md transition-colors"
                    title="Add Row Block"
                  >
                    <Columns3 size={18} />
                  </button>
                  <button
                    onClick={() => addBlock('table')}
                    data-testid="add-table-block"
                    className="p-2 hover:bg-secondary rounded-md transition-colors"
                    title="Add Table Block"
                  >
                    <Table2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {formData.blocks?.length > 0 && formData.blocks.map((block) => (
                  <div key={block.id} className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-muted capitalize">
                        {block.type === 'row' ? 'Row Layout' : `${block.type} Block`}
                      </span>
                      <button
                        onClick={() => deleteBlock(block.id)}
                        className="p-1 hover:bg-destructive/10 rounded transition-colors"
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </button>
                    </div>
                    {block.type === 'row' ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm text-muted">Add text to each column and reorder the layout by adding or removing columns.</p>
                          <button
                            onClick={() => addRowColumn(block.id)}
                            className="inline-flex items-center gap-2 px-3 py-2 border border-input rounded-md hover:bg-secondary transition-colors text-sm"
                          >
                            <Plus size={16} />
                            Add Column
                          </button>
                        </div>

                        <div
                          className="grid gap-4"
                          style={{ gridTemplateColumns: `repeat(${Math.max(block.columns?.length || 1, 1)}, minmax(0, 1fr))` }}
                        >
                          {(block.columns || []).map((column, index) => (
                            <div key={column.id} className="p-3 border border-border rounded-md bg-secondary/20 space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium text-primary">Column {index + 1}</span>
                                <button
                                  onClick={() => removeRowColumn(block.id, column.id)}
                                  className="text-xs text-destructive hover:underline disabled:opacity-50"
                                  disabled={(block.columns || []).length === 1}
                                >
                                  Remove
                                </button>
                              </div>
                              <textarea
                                value={column.content}
                                onChange={(e) => updateRowColumn(block.id, column.id, 'content', e.target.value)}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                                rows="5"
                                placeholder="Enter column text or HTML"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : block.type === 'table' ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">Table Title</label>
                          <input
                            type="text"
                            value={block.title || ''}
                            onChange={(e) => updateTableBlock(block.id, (currentBlock) => ({
                              ...currentBlock,
                              title: e.target.value,
                            }))}
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                            placeholder="Optional table title"
                          />
                        </div>

                        {/* Interactive table editor */}
                        <div className="overflow-x-auto rounded-lg border border-border shadow-sm">
                          <table className="w-full border-collapse text-sm" style={{ minWidth: `${Math.max((block.columns?.length || 1) * 160 + 80, 400)}px` }}>
                            <thead>
                              <tr className="bg-slate-50">
                                {/* Row # header */}
                                <th className="w-12 px-2 py-2 border-b border-r border-border text-center text-xs font-normal text-muted select-none">No.</th>
                                {/* Column headers - each editable with delete */}
                                {(block.columns || []).map((column, colIdx) => (
                                  <th key={column.id} className="border-b border-r border-border px-1 py-1 min-w-[140px] bg-accent/5">
                                    <div className="flex items-center gap-1 group">
                                      <input
                                        type="text"
                                        value={column.label || ''}
                                        onChange={(e) => updateTableColumn(block.id, column.id, 'label', e.target.value)}
                                        className="flex-1 px-2 py-1 text-sm font-semibold bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-accent rounded min-w-0"
                                        placeholder={`Column ${colIdx + 1}`}
                                      />
                                      <button
                                        onClick={() => removeTableColumn(block.id, column.id)}
                                        disabled={(block.columns || []).length === 1}
                                        title="Delete column"
                                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 text-destructive disabled:opacity-0 flex-shrink-0 transition-opacity"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </th>
                                ))}
                                {/* Add Column button */}
                                <th className="border-b border-border w-10 px-1 py-1 bg-slate-50">
                                  <button
                                    onClick={() => addTableColumn(block.id)}
                                    title="Add column"
                                    className="w-full flex items-center justify-center p-1.5 rounded hover:bg-accent/20 text-accent border border-dashed border-accent/40 hover:border-accent transition-colors"
                                  >
                                    <Plus size={15} />
                                  </button>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {(block.rows || []).map((row, rowIndex) => (
                                <tr key={row.id} className="border-b border-border hover:bg-secondary/20 transition-colors group/row">
                                  {/* Row number with hover-reveal delete */}
                                  <td className="border-r border-border px-2 py-1 text-center w-12 bg-slate-50/50">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-muted font-mono">{rowIndex + 1}</span>
                                      <button
                                        onClick={() => removeTableRow(block.id, row.id)}
                                        disabled={(block.rows || []).length === 1}
                                        title="Delete row"
                                        className="opacity-0 group-hover/row:opacity-100 p-0.5 rounded hover:bg-destructive/10 text-destructive disabled:opacity-0 transition-opacity"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </td>
                                  {/* Cell textareas */}
                                  {(block.columns || []).map((column, columnIndex) => {
                                    const cell = row.cells?.[columnIndex] || createTableCell();
                                    return (
                                      <td key={column.id} className="border-r border-border px-1 py-1 align-top min-w-[140px]">
                                        <textarea
                                          value={cell.content || ''}
                                          onChange={(e) => updateTableCell(block.id, row.id, cell.id, 'content', e.target.value)}
                                          className="w-full px-2 py-1.5 text-sm border-0 bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-accent rounded resize-none"
                                          rows="2"
                                          placeholder={column.label || `Col ${columnIndex + 1}`}
                                        />
                                      </td>
                                    );
                                  })}
                                  {/* Empty cell under + column button */}
                                  <td className="w-10" />
                                </tr>
                              ))}
                              {/* Add Row button row */}
                              <tr>
                                <td colSpan={(block.columns?.length || 1) + 2} className="px-2 py-1 bg-slate-50/30">
                                  <button
                                    onClick={() => addTableRow(block.id)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-muted hover:text-primary hover:bg-secondary/50 rounded border border-dashed border-border/60 hover:border-accent/40 transition-colors"
                                  >
                                    <Plus size={14} />
                                    Add Row
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <p className="text-xs text-muted">
                          ✏️ Click any cell to edit inline. Hover rows/column headers to reveal <strong>delete</strong> icons. Use <strong>+ column</strong> / <strong>+ Add Row</strong> to grow the table. Save or Publish to sync to Firebase.
                        </p>
                      </div>
                    ) : block.type === 'text' ? (
                      <textarea
                        value={block.content}
                        onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                        rows="4"
                        placeholder="Enter text content"
                      />
                    ) : (
                      <input
                        type="text"
                        value={block.url}
                        onChange={(e) => updateBlock(block.id, 'url', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder={`Enter ${block.type} URL`}
                      />
                    )}
                  </div>
                ))}

                {formData.blocks?.length === 0 && (
                  <p className="text-center text-muted py-8">No blocks added yet. Click the icons above to add content blocks.</p>
                )}
              </div>
            </div>

            <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-primary mb-4">SEO Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">SEO Title</label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    data-testid="seo-title-input"
                    className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="SEO optimized title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Meta Description</label>
                  <textarea
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    data-testid="seo-description-input"
                    className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    rows="3"
                    placeholder="Brief description for search engines"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Keywords</label>
                  <input
                    type="text"
                    value={formData.seoKeywords}
                    onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                    data-testid="seo-keywords-input"
                    className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </div>
            </div>
          </div>

          {showPreview && (
            <div className="bg-white border border-border rounded-lg p-6 shadow-sm sticky top-24 h-fit">
              <h2 className="text-xl font-semibold text-primary mb-4">Live Preview</h2>
              <div className="border-t border-border pt-4">
                <h1 className="text-3xl font-bold text-primary mb-4">{formData.title || 'Untitled Page'}</h1>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                />

                {formData.blocks?.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {formData.blocks.map((block) => (
                      <div key={block.id} className="border border-border rounded-lg p-4">
                        {block.type === 'text' && <p className="text-sm">{block.content}</p>}
                        {block.type === 'row' && (
                          <div
                            className="grid gap-3"
                            style={{ gridTemplateColumns: `repeat(${Math.max(block.columns?.length || 1, 1)}, minmax(0, 1fr))` }}
                          >
                            {(block.columns || []).map((column) => (
                              <div key={column.id} className="rounded-md border border-border bg-secondary/20 p-3">
                                <div dangerouslySetInnerHTML={{ __html: column.content || '<p class="text-sm text-muted">Empty column</p>' }} />
                              </div>
                            ))}
                          </div>
                        )}
                        {block.type === 'table' && (
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] border-collapse text-sm">
                              <thead>
                                <tr className="bg-[#913c07] text-white">
                                  {(block.columns || []).map((column, index) => (
                                    <th key={column.id} className="px-3 py-2 text-left font-semibold">
                                      {column.label || `Column ${index + 1}`}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {(block.rows || []).map((row, rowIndex) => (
                                  <tr key={row.id} className="border-b border-secondary/20 hover:bg-bgColorDark">
                                    {(block.columns || []).map((column, columnIndex) => {
                                      const cell = row.cells?.[columnIndex];

                                      return (
                                        <td key={column.id} className="px-3 py-2 align-top">
                                          {cell?.content ? (
                                            <div dangerouslySetInnerHTML={{ __html: cell.content }} />
                                          ) : (
                                            <span className="text-xs text-muted">Row {rowIndex + 1} empty</span>
                                          )}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {block.type === 'image' && block.url && (
                          <img src={block.url} alt="Block content" className="w-full rounded" />
                        )}
                        {block.type === 'video' && block.url && (
                          <video src={block.url} controls className="w-full rounded" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
