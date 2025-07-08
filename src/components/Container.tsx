export default function Container({ children }: { children: React.ReactNode }) {
    return (
        <div className="my-2 rounded-lg border border-gray-300 bg-white p-4 shadow">{children}</div>
    )
}
