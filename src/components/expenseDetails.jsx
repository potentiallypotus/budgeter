import { useState, useEffect, useMemo } from 'react'

function ExpenseDetails({ entry, formatMoney, formatDate }) {
    const [loading, setLoading] = useState(false)
    const [loadError, setLoadError] = useState(false)
    const [blob, setBlob] = useState(false)
    useEffect((() => {
        const loadExpense = async () => {
            setLoading(true)
            setLoadError(null)
            try {
                const res = await fetch(`/api/budget/expenses/${entry.id}`)
                if (!res.ok) throw new Error('Failed To Load Details')
                setBlob(await res.blob())
            } catch (err) {
                setLoadError(err.message)
            } finally {
                setLoading(false)
            }
        }
        loadExpense()
    }), [entry])

    const imageUrl = useMemo(() => {
        if (!blob) return null
        return URL.createObjectURL(blob)
    }, [blob])



    if (loading) {
        return (
            <div>loading...</div>
        )
    }
    if (loadError) {
        return (
            <div className="text-red-500 border-red-500 border-2 rounded-2xl p-4"> ❗{loadError}</div>
        )
    }
    return (
        <div className="flex">
            <div className="bg-blue-200 rounded border-2 border-blue-400 m-5">
                <div className=" p-5 py-2">Ammount: {formatMoney(entry.cents)}</div>
                <div className=" p-5 py-2">Date: {formatDate(entry.created_at)}</div>
                <div className=" p-5 py-2">Description: {entry.description}</div>
            </div>
            <div>
                <img src={imageUrl} className="max-w-sm max-h-96 object-contain"></img>
                <a href={imageUrl} download={`receipt_${entry.created_at}`} 
                    className="bg-gray-300 rounded border shadow" >
                         ↓ download 
                </a>
            </div>
        </div>
    )

}

export default ExpenseDetails