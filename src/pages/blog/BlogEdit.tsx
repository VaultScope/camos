import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

// For TipTap rich text editing, similar to other places in Admin
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

export default function BlogEdit() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('draft');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        autolink: true,
      })
    ],
    content: '',
  });

  useEffect(() => {
    if (!isNew && id) {
      api.get<any>(`/admin/blog/${id}`).then(post => {
        setTitle(post.title);
        setSlug(post.slug);
        setExcerpt(post.excerpt || '');
        setImageUrl(post.image_url || '');
        setStatus(post.status);
        if (editor) editor.commands.setContent(post.content);
      }).catch(console.error);
    }
  }, [id, isNew, editor]);

  const save = async () => {
    if (!editor) return;
    const payload = {
      title,
      slug,
      excerpt,
      image_url: imageUrl || null,
      content: editor.getHTML(),
      status,
    };
    try {
      if (isNew) {
        await api.post('/admin/blog', payload);
      } else {
        await api.put(`/admin/blog/${id}`, payload);
      }
      navigate('/blog');
    } catch (err) {
      alert('Error saving post');
    }
  };

  const addImage = () => {
    const url = window.prompt('URL of the image');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) {
      return;
    }
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{isNew ? 'New Post' : 'Edit Post'}</h1>
        <div className="flex gap-4">
          <button onClick={() => navigate('/blog')} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={save} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>

      <div className="space-y-4 bg-card p-6 border rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input 
            value={title} onChange={e => setTitle(e.target.value)}
            className="w-full border p-2 rounded" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input 
            value={slug} onChange={e => setSlug(e.target.value)}
            className="w-full border p-2 rounded" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Excerpt (Description)</label>
          <textarea
            value={excerpt} onChange={e => setExcerpt(e.target.value)}
            className="w-full border p-2 rounded"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hero Image URL</label>
          <input 
            value={imageUrl} onChange={e => setImageUrl(e.target.value)}
            className="w-full border p-2 rounded" 
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select 
            value={status} onChange={e => setStatus(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          
          {editor && (
            <div className="mb-2 flex gap-2">
              <button 
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()} 
                className={`px-2 py-1 border rounded text-sm ${editor.isActive('bold') ? 'bg-gray-200 text-black' : ''}`}
              >
                Bold
              </button>
              <button 
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()} 
                className={`px-2 py-1 border rounded text-sm ${editor.isActive('italic') ? 'bg-gray-200 text-black' : ''}`}
              >
                Italic
              </button>
              <button 
                type="button"
                onClick={setLink} 
                className={`px-2 py-1 border rounded text-sm ${editor.isActive('link') ? 'bg-gray-200 text-black' : ''}`}
              >
                Link
              </button>
              <button 
                type="button"
                onClick={addImage} 
                className="px-2 py-1 border rounded text-sm"
              >
                Image
              </button>
            </div>
          )}

          <div className="border rounded-lg min-h-[300px] p-2 bg-white text-black prose max-w-none focus-within:outline-none focus:outline-none">
            <EditorContent editor={editor} className="outline-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
