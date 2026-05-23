export default function Input({ ...props }) {
    return (
        <input
            className="w-full px-5 py-4 bg-black/60 border border-white/20 focus:border-pinkNeon rounded-2xl outline-none text-white placeholder:text-white/50"
            {...props}
        />
    );
}