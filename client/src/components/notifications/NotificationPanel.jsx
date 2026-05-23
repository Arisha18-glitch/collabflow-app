export default function NotificationPanel() {
    return (
        <div className="glass rounded-3xl p-6 w-80 absolute top-20 right-8 z-50">
            <h3 className="font-bold mb-4 neon">Notifications</h3>
            <div className="space-y-4 text-sm">
                <div className="flex gap-3"><span className="text-greenNeon">●</span> Alex edited the document</div>
                <div className="flex gap-3"><span className="text-blueNeon">●</span> Sara left a comment</div>
                <div className="flex gap-3"><span className="text-pinkNeon">●</span> You were invited to new workspace</div>
            </div>
        </div>
    );
}