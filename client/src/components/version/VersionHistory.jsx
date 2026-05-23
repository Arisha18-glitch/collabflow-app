import { X } from 'lucide-react';
import Button from '../ui/Button';

export default function VersionHistory({ onClose }) {
    const versions = [
        { time: "2 hours ago", label: "Auto-save", by: "You" },
        { time: "Yesterday", label: "v1.2 Final", by: "Alex" },
        { time: "3 days ago", label: "Initial draft", by: "Sara" },
    ];

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="glass w-full max-w-2xl rounded-3xl p-10">
                <div className="flex justify-between mb-8">
                    <h2 className="text-3xl font-bold neon">Version History</h2>
                    <X className="cursor-pointer" onClick={onClose} />
                </div>

                {versions.map((v, i) => (
                    <div key={i} className="flex justify-between items-center p-6 hover:bg-white/10 rounded-2xl mb-4">
                        <div>
                            <p className="font-medium">{v.label}</p>
                            <p className="text-white/50 text-sm">{v.time} • {v.by}</p>
                        </div>
                        <Button variant="secondary">Restore</Button>
                    </div>
                ))}
            </div>
        </div>
    );
}