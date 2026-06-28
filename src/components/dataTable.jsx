

function DataTable({ cols, list, onRowClick, lastRow }) {
    return (
        <table className="border-2">
            <thead>
                <tr className="bg-blue-300">
                    {cols.map( (col) => (
                        <td key={`header-${col.key}`}className="p-3">
                            {col.label}
                        </td>
                    ))}
                </tr>
            </thead>
            <tbody>
                {list.map((entry) => (
                    <tr key={entry.id} onClick={() => { onRowClick ? onRowClick(entry) : undefined }} className='border hover:border-2 hover:bg-amber-100'>
                        {cols.map( (col) => (
                            <td key={`${entry.id}-${col.key}`} className="text-right pr-2 ph-2">
                                {col.render ? col.render(entry) : entry[col.key]}
                            </td>
                        ))}
                    </tr>
                ))}
                {lastRow && (
                    <tr className="bg-blue-400">
                        <td className="text-right pr-2 ph-2">{lastRow.data}</td>
                        <td className="pr-2 ph-2">{lastRow.label}</td>
                    </tr>
                )}

            </tbody>
        </table>
    )
}

export default DataTable