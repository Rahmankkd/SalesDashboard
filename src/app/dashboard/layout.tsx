// DashboardLayout is now just a pass-through because RootLayout handles the Shell/Nav
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
        </>
    );
}
