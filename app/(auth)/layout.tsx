export default function AuthGroupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex bg-white">
            {children}
        </div>
    );
}
