import { useEffect, useState} from "react";

function load(setSpent, setWithdrawn){
    fetch('/api/overview')
    .then(res => res.json())
    .then(data => {
        setSpent(data.spent);
        setWithdrawn(data.withdrawn);
    })
}
function Overview() {
    const [withdrawn, setWithdrawn] = useState(0);
    const [spent, setSpent] = useState(0);
    useEffect(() => {load(setSpent, setWithdrawn)}, [])
    return (
        <div style={{ padding: "2rem" }}>
            <h1 style={{ marginBottom: "2rem", fontSize: "2rem", color: "#333" }}>
                Overview
            </h1>
            
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
            </div>
        </div>
    )
}

export default Overview