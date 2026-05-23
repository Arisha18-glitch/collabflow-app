export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="glass w-full max-w-md rounded-3xl p-8">
                <h2 className="text-2xl font-bold mb-6 neon">{title}</h2>
                {children}
                <button onClick={onClose} className="mt-6 w-full py-3 glass rounded-2xl">Close</button>
            </div>
        </div>
    );
}