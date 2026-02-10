import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Save, Eye, Plus, Trash2, Image, Type, Video } from 'lucide-react';
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

  useEffect(() => {
    if (isEditMode) {
      fetchPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPage = async () => {
    try {
      const pageDoc = await getDoc(doc(db, 'pages', id));
      if (pageDoc.exists()) {
        setFormData({ ...pageDoc.data() });
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

  const handleSave = async (status = formData.status) => {
    console.log("Saving page... Status:", status);

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSaving(true);
    // Show a loading toast so user sees action immediately
    const loadingToast = toast.loading(`Saving page as ${status}...`);

    try {
      const pageData = {
        ...formData,
        status,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
        updatedAt: serverTimestamp(),
      };

      console.log("Saving data:", pageData);


      if (isEditMode) {
        console.log("Updating existing page:", id);
        // Optimistic UI: Don't wait forever for server ack if network is bad
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

        // Only log activity if user exists
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
    const newBlock = {
      id: Date.now().toString(),
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

  const deleteBlock = (blockId) => {
    setFormData({
      ...formData,
      blocks: formData.blocks?.filter((block) => block.id !== blockId) || [],
    });
  };

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
                </div>
              </div>

              <div className="space-y-4">
                {formData.blocks?.length > 0 && formData.blocks.map((block) => (
                  <div key={block.id} className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-muted capitalize">{block.type} Block</span>
                      <button
                        onClick={() => deleteBlock(block.id)}
                        className="p-1 hover:bg-destructive/10 rounded transition-colors"
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </button>
                    </div>
                    {block.type === 'text' ? (
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
