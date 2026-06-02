import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { PageBreak } from './extensions/PageBreak';
import { BorderExtension } from './extensions/BorderExtension';

import PageBorderFrame from '../../components/editor/PageBorderFrame';
import FormattingStatsBar from '../../components/editor/FormattingStatsBar';
import ProofreadingPanel from '../../components/editor/ProofreadingPanel';
import InviteCollaboratorPanel from '../../components/editor/InviteCollaboratorPanel';

import { useDocStore } from '../../store/useDocStore';
import { useAuthStore } from '../../store/useAuthStore';
import {
    Bold, Italic, Strikethrough, Code2, List, ListOrdered,
    Heading1, Heading2, Undo, Redo, ArrowLeft, Quote,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Image as ImageIcon, Table as TableIcon, Download,
    Square, FilePlus, Sparkles, UserPlus, Type
} from 'lucide-react';

import { saveAs } from 'file-saver';

function ToolbarButton({ onClick, isActive, title, children, disabled }) {
    return (
        <button
            className={`toolbar-btn${isActive ? ' is-active' : ''}`}
            onClick={onClick}
            title={title}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

export default function EditorPage() {
    const { docId }   = useParams();
    const navigate    = useNavigate();
    const { docs, updateDocument, setActiveDoc, fetchDocuments, loading } = useDocStore();
    const { user } = useAuthStore();

    // Determine role from the authenticated user
    const currentUserRole = user?.role || 'Viewer';

    const [showExport, setShowExport] = useState(false);
    const [showProofread, setShowProofread] = useState(false);
    const [showInvite, setShowInvite] = useState(false);

    // Fetch docs if not loaded yet
    useEffect(() => {
        if (docs.length === 0) {
            fetchDocuments();
        }
    }, []);

    const doc = docs.find(d => d.id === docId) ?? docs[0];
    const isReadOnly = currentUserRole === 'Viewer';

    // Debounced save — saves to MongoDB after 1 second of inactivity
    const saveTimerRef = useRef(null);
    const debouncedSave = useCallback((id, content) => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            updateDocument(id, content);
        }, 1000);
    }, [updateDocument]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: 'Start typing...' }),
            Image.configure({ inline: true, allowBase64: true }),
            Table.configure({ resizable: true }),
            TableRow, TableHeader, TableCell,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TextStyle, Color,
            PageBreak,
            BorderExtension
        ],
        content:  doc?.content ?? '',
        editable: !isReadOnly,
        onUpdate: ({ editor }) => {
            if (!isReadOnly && doc) {
                debouncedSave(doc.id, editor.getHTML());
            }
        },
    });

    useEffect(() => {
        if (editor && doc && editor.getHTML() !== doc.content) {
            editor.commands.setContent(doc.content || '', false);
        }
        if (doc) setActiveDoc(doc.id);
    }, [docId, doc?.id]); // eslint-disable-line

    useEffect(() => {
        if (editor) {
            editor.setEditable(!isReadOnly);
        }
    }, [isReadOnly, editor]);

    const handleExportPDF = async () => {
        const element = document.querySelector('.ProseMirror');
        if (!element) return;
        const opt = {
            margin:       1,
            filename:     `${doc.title.replace(/\s+/g, '_')}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        const html2pdf = (await import('html2pdf.js')).default;
        html2pdf().set(opt).from(element.innerHTML).save();
        setShowExport(false);
    };

    const handleExportWord = () => {
        const element = document.querySelector('.ProseMirror');
        if (!element) return;
        
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document</title></head><body>";
        const footer = "</body></html>";
        const html = header + element.innerHTML + footer;

        const blob = new Blob(['\ufeff', html], {
            type: 'application/msword'
        });
        saveAs(blob, `${doc.title.replace(/\s+/g, '_')}.doc`);
        setShowExport(false);
    };

    const addImage = () => {
        const url = window.prompt('URL of the image:');
        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    if (loading && docs.length === 0) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>Loading document...</p>
                </div>
            </div>
        );
    }

    if (!doc) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>Document not found.</p>
                    <button className="ghost-btn" onClick={() => navigate('/documents')}>← Back to Documents</button>
                </div>
            </div>
        );
    }

    return (
        <div className="editor-page">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <button
                    id="editor-back-btn"
                    className="ghost-btn"
                    onClick={() => navigate('/documents')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                    <ArrowLeft size={14} /> Documents
                </button>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                    {doc.title}
                </span>
            </div>

            <div className="editor-container">
                {/* Header */}
                <div className="editor-header">
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="editor-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {doc.title}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0, position: 'relative' }}>
                        {/* MS Word Download Options */}
                        <div style={{ position: 'relative' }}>
                            <button className="neon-btn" onClick={() => setShowExport(!showExport)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Download size={14} /> Export
                            </button>
                            {showExport && (
                                <div style={{
                                    position: 'absolute', top: '110%', right: 0, zIndex: 50,
                                    background: 'var(--panel)', border: '1px solid var(--border)',
                                    borderRadius: 12, padding: 8, display: 'flex', flexDirection: 'column', gap: 4,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)', minWidth: 160
                                }}>
                                    <button className="ghost-btn" onClick={handleExportPDF} style={{ textAlign: 'left', padding: '8px 12px' }}>Download as PDF</button>
                                    <button className="ghost-btn" onClick={handleExportWord} style={{ textAlign: 'left', padding: '8px 12px' }}>Download as MS Word</button>
                                </div>
                            )}
                        </div>

                        {isReadOnly ? (
                            <span className="readonly-badge">Read Only</span>
                        ) : (
                            <span className="status-badge">
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
                                Auto-Save
                            </span>
                        )}
                        {!isReadOnly && (
                            <>
                                <button className="neon-btn" onClick={() => setShowProofread(!showProofread)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'linear-gradient(135deg, var(--purple), var(--pink))', color: 'white', border: 'none' }}>
                                    <Sparkles size={14} /> AI Proofread
                                </button>
                                {(currentUserRole === 'Owner' || currentUserRole === 'Editor') && (
                                    <button className="ghost-btn" onClick={() => setShowInvite(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <UserPlus size={14} /> Invite
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Main Toolbar */}
                {!isReadOnly && editor && (
                    <div className="editor-toolbar" style={{ flexWrap: 'wrap' }}>
                        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo size={15} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo size={15} /></ToolbarButton>
                        <div className="toolbar-divider" />

                        {/* Text Styles */}
                        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1"><Heading1 size={15} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 size={15} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().setParagraph().run()} isActive={editor.isActive('paragraph')} title="Body Text"><Type size={15} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold"><Bold size={15} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic"><Italic size={15} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={15} /></ToolbarButton>
                        <div className="toolbar-divider" />

                        {/* Alignments */}
                        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left"><AlignLeft size={15} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center"><AlignCenter size={15} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right"><AlignRight size={15} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Justify"><AlignJustify size={15} /></ToolbarButton>
                        <div className="toolbar-divider" />

                        {/* Lists */}
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List"><List size={15} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List"><ListOrdered size={15} /></ToolbarButton>
                        <div className="toolbar-divider" />

                        {/* Inserts & Advanced */}
                        <ToolbarButton onClick={addImage} title="Insert Image"><ImageIcon size={15} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert Table"><TableIcon size={15} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBorder().run()} title="Toggle Block Border"><Square size={15} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().setPageBreak().run()} title="Insert Blank Page"><FilePlus size={15} /></ToolbarButton>
                    </div>
                )}
                
                {/* Secondary Table Toolbar (Only visible when table is active) */}
                {!isReadOnly && editor && editor.isActive('table') && (
                    <div className="editor-toolbar" style={{ background: 'rgba(34,211,238,0.05)', borderTop: 'none', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--blue)', paddingRight: 8 }}>Table Tools:</span>
                        <ToolbarButton onClick={() => editor.chain().focus().addColumnBefore().run()} title="Add Col Before">Col ←</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Col After">Col →</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete Col">Del Col</ToolbarButton>
                        <div className="toolbar-divider" />
                        <ToolbarButton onClick={() => editor.chain().focus().addRowBefore().run()} title="Add Row Before">Row ↑</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row After">Row ↓</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().deleteRow().run()} title="Delete Row">Del Row</ToolbarButton>
                        <div className="toolbar-divider" />
                        <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table" style={{ color: 'var(--pink)' }}>Delete Table</ToolbarButton>
                    </div>
                )}

                {/* Formatting Stats Bar */}
                {editor && <FormattingStatsBar editor={editor} />}

                {/* Editor Content wrapped in Page Border Engine */}
                <div className="editor-workspace">
                    <PageBorderFrame>
                        <EditorContent
                            editor={editor}
                            className={`prose-area${isReadOnly ? ' readonly' : ''}`}
                        />
                    </PageBorderFrame>
                    {showProofread && (
                        <div className="proofreading-sidebar-slot">
                            <ProofreadingPanel editor={editor} isOpen={showProofread} onClose={() => setShowProofread(false)} />
                        </div>
                    )}
                </div>
            </div>

            {/* Invitation Modal */}
            <InviteCollaboratorPanel
                docId={docId}
                isOpen={showInvite}
                onClose={() => setShowInvite(false)}
            />
        </div>
    );
}