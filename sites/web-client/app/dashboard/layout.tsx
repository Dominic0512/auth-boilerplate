export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      {`Dashboard Layout`}
      {children}
    </div>
  );
}
