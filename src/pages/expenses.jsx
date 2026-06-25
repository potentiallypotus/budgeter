import { useEffect, useState } from "react";
//import Modal from '../components/modal'


function ExpenseList() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [done, setDone] = useState(null)
    const [list, setList] = useState(null)

    useEffect((() => {
        const loadExpenses = async () => {
            setLoading(true)
            setError(null)
            setDone(false)
            try {
                const res = await fetch("/api/expenses")
                if (!res.ok) throw new Error("failed to load overview")
                setList( await res.text())
                setDone(true)
            }catch (err){
                setError(err.message)
            }finally{
                setLoading(false)
            }
        }
        loadExpenses()
    }), [])

    return (
        <div>
            {done ? `list: ${list}` :
                error ? `error: ${error}` :
                    loading ? "loading..." : "eh"}
        </div>
    )
}

function Expenses(){
    return (
        <div>
            <ExpenseList></ExpenseList>
        </div>
    )
}

export default Expenses