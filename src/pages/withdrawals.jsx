import { useEffect, useState } from "react";
//import Modal from '../components/modal'

const createWithdrawalList = (jsonList) => {
    const list = JSON.parse(jsonList)
    let sum = 0;
    if (!list) return (<div>No Data</div>)
    list.forEach((t) => {sum+= t.cents})
    return (
        <table>
            <thead>
                <tr className="bg-blue-300">
                    <th className="p-3">Amount</th>
                    <th className="p-3">date</th>
                </tr>
            </thead>
            <tbody>
                {list.map((entry) => {
                    return (
                    <tr key={entry.id}>
                        <td className="text-right pr-2 ph-2">{"$" + (entry.cents/100).toFixed(2)}</td>
                        <td className="text-right pr-2 ph-2">{entry.created_at}</td>
                    </tr>
                )})}
                <tr className="bg-blue-400">
                    <th className="text-right pr-2 ph-2">{"$" + (sum/100).toFixed(2)}</th>
                    <th className="pr-2 ph-2">Sum</th>
                </tr>
            </tbody>
        </table>
    )
}

function WithdrawalList() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [done, setDone] = useState(null)
    const [list, setList] = useState(null)

    useEffect((() => {
        const loadWithdrawals = async () => {
            setLoading(true)
            setError(null)
            setDone(false)
            try {
                const res = await fetch("/api/budget/withdrawals")
                if (!res.ok) throw new Error("failed to load overview")
                setList( await res.text())
                setDone(true)
            }catch (err){
                setError(err.message)
            }finally{
                setLoading(false)
            }
        }
        loadWithdrawals()
    }), [])

    if (done) return (
        createWithdrawalList(list)
    )
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
}

function Withdrawals(){
    return (
        <div>
            <WithdrawalList></WithdrawalList>
        </div>
    )
}

export default Withdrawals