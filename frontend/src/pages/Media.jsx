import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Upload, Trash2, Image as ImageIcon, File, Grid3x3, List } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const Media = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const { user } = useAuth();

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const mediaSnapshot = await getDocs(collection(db, 'media'));
      const mediaData = mediaSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMedia(mediaData.sort((a, b) => (b.uploadedAt?.toDate?.() || 0) - (a.uploadedAt?.toDate?.() || 0)));
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Failed to fetch media');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    
    try {
      for (const file of files) {
        const storageRef = ref(storage, `media/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              console.error('Upload error:', error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              await addDoc(collection(db, 'media'), {
                name: file.name,
                url: downloadURL,
                type: file.type,
                size: file.size,
                storagePath: storageRef.fullPath,
                uploadedAt: serverTimestamp(),
                uploadedBy: user.uid,
              });
              await addDoc(collection(db, 'activity_logs'), {
                action: `Uploaded media: ${file.name}`,
                userId: user.uid,
                timestamp: serverTimestamp(),
              });
              resolve();
            }
          );
        });
      }

      toast.success('Files uploaded successfully');
      fetchMedia();
      setUploadProgress(0);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (mediaItem) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      if (mediaItem.storagePath) {
        const storageRef = ref(storage, mediaItem.storagePath);
        await deleteObject(storageRef);
      }
      await deleteDoc(doc(db, 'media', mediaItem.id));
      toast.success('File deleted successfully');
      fetchMedia();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
      <div className="space-y-8">
        <div className="flex justify-between items-center pb-4 border-b border-border/40">
          <div>
            <h1
              className="text-4xl font-bold text-primary mb-2"
              style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.02em' }}
            >
              Media Library
            </h1>
            <p className="text-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
              Manage your images and files
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex border border-border rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                data-testid="view-mode-grid"
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-accent text-white' : 'hover:bg-secondary'}`}
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                data-testid="view-mode-list"
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-accent text-white' : 'hover:bg-secondary'}`}
              >
                <List size={18} />
              </button>
            </div>
            <label
              data-testid="upload-media-button"
              className="flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-md font-medium hover:bg-accent/90 transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              <Upload size={20} />
              Upload Files
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {uploading && (
          <div className="bg-white border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm text-muted">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {media.length === 0 ? (
          <div className="text-center py-16 bg-white border border-border rounded-lg">
            <ImageIcon size={48} className="mx-auto text-muted mb-4" strokeWidth={1.5} />
            <h3 className="text-xl font-semibold text-primary mb-2">No media files yet</h3>
            <p className="text-muted mb-6">Upload your first file to get started</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                data-testid={`media-item-${item.id}`}
                className="group relative bg-white border border-border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200"
              >
                <div className="aspect-square flex items-center justify-center bg-surface p-4">
                  {item.type?.startsWith('image/') ? (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <File size={48} className="text-muted" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-primary truncate" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-xs text-muted mt-1">{formatFileSize(item.size)}</p>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={() => copyToClipboard(item.url)}
                    className="p-2 bg-white rounded shadow-md hover:bg-secondary transition-colors"
                    title="Copy URL"
                  >
                    <File size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    data-testid={`delete-media-${item.id}`}
                    className="p-2 bg-white rounded shadow-md hover:bg-destructive/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} className="text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-primary">Preview</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-primary">Name</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-primary">Size</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-primary">Uploaded</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {media.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-surface transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-surface rounded">
                        {item.type?.startsWith('image/') ? (
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover rounded" />
                        ) : (
                          <File size={24} className="text-muted" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-primary">{item.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted">{formatFileSize(item.size)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted">
                        {new Date(item.uploadedAt?.toDate?.() || Date.now()).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => copyToClipboard(item.url)}
                          className="p-2 hover:bg-secondary rounded transition-colors"
                          title="Copy URL"
                        >
                          <File size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 hover:bg-destructive/10 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
