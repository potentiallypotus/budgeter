import { useEffect, useState } from "react";
import Modal from '../components/modal'
import ExpenseDetails from "../components/expenseDetails"
import DataTable from "../components/dataTable"

function formatMoney(cents){
    return "$" + (cents / 100).toFixed(2)
}
const columns = [
    {
        key: 'cents',
        label: 'Amount',
        render: (entry) => formatMoney(entry.cents)
    },
    {
        key: 'description',
        label: 'Description'
    },
    {
        key: 'created_at',
        label: 'Date'
    }
]

const CreateExpenseList = ({ jsonList }) => {
    const [showDetails, setShowDetails] = useState(false)
    const [selectedEntry, setSelectedEntry] = useState(null)

    const handleRowClick = (entry) => {
        setShowDetails(true)
        setSelectedEntry(entry)
    }
    const list = JSON.parse(jsonList)
    let sum = 0;
    if (!list) return <div>No Data</div>
    list.forEach((t) => { sum += t.cents })
    return (
        <div>

            <DataTable
                cols = {columns}
                list={list}
                onRowClick={handleRowClick}
                lastRow={{data: formatMoney(sum),label: "Sum"}}
            />
            <Modal open={showDetails} onClose={() => setShowDetails(false)}>
                <ExpenseDetails entry={selectedEntry} formatMoney={formatMoney} formatDate={(a=> a)}></ExpenseDetails>
            </Modal>
        </div>

    )
}
// {
//     <table className="border-2">
//                 <thead>
//                     <tr className="bg-blue-300">
//                         <th className="p-3">Amount</th>
//                         <th className="p-3">description</th>
//                         <th className="p-3">date</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {list.map((entry) => {
//                         return (

//                             <tr key={entry.id} onClick={() => { handleRowClick(entry) }} className='border hover:border-2 hover:bg-amber-100'>
//                                 <td className="text-right pr-2 ph-2">{"$" + (entry.cents / 100).toFixed(2)}</td>
//                                 <td className="text-right pr-5 ph-5">{entry.description}</td>
//                                 <td className="text-right pr-5 ph-5">{entry.created_at}</td>
//                             </tr>
//                         )
//                     })}
//                     <tr className="bg-blue-400">
//                         <th className="text-right pr-2 ph-2">{"$" + (sum / 100).toFixed(2)}</th>
//                         <th className="pr-2 ph-2">Sum</th>
//                         <th className="pr-2 ph-2"></th>
//                     </tr>
//                 </tbody>
//             </table>
// }

function ExpenseList() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [list, setList] = useState(null)

    useEffect((() => {
        const loadExpenses = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch("/api/budget/expenses")
                if (!res.ok) throw new Error("failed to load overview")
                setList(await res.text())
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        loadExpenses()
    }), [])

    if (error) {
        return (
            <div>{error}</div>
        )
    }
    if (loading) {
        return (
            <div>Loading...</div>
        )
    }
    if (!list) {
        return (
            <div>No expenses found</div>
        )
    }

    return <CreateExpenseList jsonList={list} />
}

function Expenses() {

    return (
        <div>
            <ExpenseList></ExpenseList>

        </div>
    )
}

export default Expenses