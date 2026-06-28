import { useEffect, useState } from "react";
import Modal from '../components/modal'
import EntryForm from "../components/entryForm";

function mToString(money) {
    const dollars = Math.floor(money / 100)
    const cents = money - (dollars * 100)
    return `${dollars}.${String(cents).padStart(2, '0')}`
}


function Overview() {
    const [withdrawn, setWithdrawn] = useState(0);
    const [spent, setSpent] = useState(0);
    const [diff, setDiff] = useState(0);
    const [loading, setLoading] = useState(false)
    const [loadError, setLoadError] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    
    useEffect(() => {
        const loadOverview = async () => {
            setLoading(true)
            setLoadError(null)
            try {
                const res = await fetch('/api/budget/overview')
                if (!res.ok) throw new Error('Failed to load overview')
                const data = await res.json()
                setSpent(mToString(data.spent))
                setWithdrawn(mToString(data.withdrawn))
                setDiff(mToString(data.withdrawn - data.spent))
            } catch (err) {
                setLoadError(err.message)
            } finally {
                setLoading(false)
            }
        }
        loadOverview()
    }, [ refreshKey ])
    const showOverview = () => {
        if (loadError) {
            return <div className="bg-red-400 text-gray-700">Failed to Load Overview</div>
        }
        if (loading) {
            return (<div>Loading Overview...</div>)
        }
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "600px" }}>
                <div style={{
                    padding: "1.5rem",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    border: "1px solid #ddd"
                }}>
                    <p style={{ margin: "0 0 0.5rem 0", color: "#666", fontSize: "0.9rem" }}>
                        Withdrawn
                    </p>
                    <p style={{ margin: 0, fontSize: "2rem", fontWeight: "bold", color: "#333" }}>
                        ${withdrawn}
                    </p>
                </div>

                <div style={{
                    padding: "1.5rem",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    border: "1px solid #ddd"
                }}>
                    <p style={{ margin: "0 0 0.5rem 0", color: "#666", fontSize: "0.9rem" }}>
                        Spent
                    </p>
                    <p style={{ margin: 0, fontSize: "2rem", fontWeight: "bold", color: "#333" }}>
                        ${spent}
                    </p>
                </div>

                <div style={{
                    padding: "1.5rem",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    border: "1px solid #ddd"
                }}>
                    <p style={{ margin: "0 0 0.5rem 0", color: "#666", fontSize: "0.9rem"}}>
                        Difference
                    </p>
                    <p style={{fontSize: "2rem"}} className={`m-0 font-bold ${(+diff) > 0 ? "text-green-500" : "text-red-500"}`}>
                        ${diff}
                    </p>
                </div>
                <button onClick={() => setModalOpen(true)} className="rounded bg-blue-200 hover:bg-blue-500">Add Entry</button>
                <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                    <EntryForm onSuccess={() => {
                            setModalOpen(false);
                            setRefreshKey((prev) => prev + 1)
                        }} 
                    />
                </Modal>
            </div>
        )
    }
    return (
        <div style={{ padding: "2rem" }}>
            <h1 style={{ marginBottom: "2rem", fontSize: "2rem", color: "#333" }}>
                Overview
            </h1>
            {showOverview()}
        </div>
    )
}

export default Overview