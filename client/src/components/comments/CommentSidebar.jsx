import { X, Reply } from 'lucide-react';
import Button from '../ui/Button';

export default function CommentSidebar({ onClose }) {
    return (
        <div className="absolute top-0 right-0 w-96 h-full glass border-l border-white/10 p-8 overflow-auto">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold neon">Comments</h3>
                <X className="cursor-pointer" onClick={onClose} />
            </div>

            <div className="space-y-8">
                <div className="glass p-5 rounded-3xl">
                    <p className="font-medium">"Love the new pink/blue/green neon theme!"</p>
                    <div className="flex gap-2 mt-4">
                        <Button variant="ghost" size="sm"><Reply className="w-4 h-4" /> Reply</Button>
                        <Button variant="ghost" size="sm">Resolve</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}