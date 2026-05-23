export default function Button({ children, variant = "primary", ...props }) {
    const base = "px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center gap-2";
    const styles = {
        primary: "bg-pinkNeon hover:bg-blueNeon text-white shadow-lg shadow-pinkNeon/50",
        secondary: "glass hover:bg-white/10",
        ghost: "hover:bg-white/10",
    };
    return (
        <button className={`${base} ${styles[variant]}`} {...props}>
            {children}
        </button>
    );
}