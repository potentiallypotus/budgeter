import { useState } from 'react'

function submitStatus(error, success) {
    if (error) {
        return (<div className="bg-red-400 text-gray-700">Error Submitting: {error}</div>)
    }
    if (success) {
        return (<div className="bg-green-500 text-gray-700">Submit Successful</div>)
    }
    return
}

async function postEntry(type, amount, description, file) {
    const data = new FormData()
    data.append("type", type)
    data.append("amount", amount)
    description && data.append("description", description)
    file && data.append("file", file)
    
    return await fetch("/api/new", {
        method: "POST",
        body: data,
    })
}

function EntryForm({onSuccess}) {
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)
    const [submitSuccess, setSuccess] = useState(false)
    const [type, setType] = useState("expense")
    const [amount, setAmount] = useState("")
    const [description, setDescription] = useState("")
    const [file, setFile] = useState(null)
    const handleSubmit = async () => {
        setSubmitting(true);
        setSubmitError(null);
        setSuccess(false);
        try {
            if (!amount || (!description && type == "expense")) {
                //handle no submission
                let message = "error: "
                if (!amount) message += "| no ammount |"
                if (!description) message += "| no description |"
                setSubmitting(false)
                setSubmitError(message)
                return
            }
            let parts = amount.split(".")
            let dollars = +parts[0]
            let cents = +parts[1]
            cents += dollars * 100
            const resp = await postEntry(type, cents, description, file);
            if (!resp.ok) throw new Error('Submit failed');
            setSuccess(true);
            onSuccess();
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setSubmitting(false);
        }
    };
    const handleAmountChange = (e) => {
        let value = e.target.value
        value = value.replace(/[^0-9.]/g, "")
        const parts = value.split(".")
        if (parts.length > 2) {
            value = `${parts[0]}.${parts[1]}`
        }
        if (parts[1]?.length > 2) {
            value = `${parts[0]}.${parts[1].slice(0, 2)}`
        }

        setAmount(value)
    }
    const handleAmountBlur = () => {
        if (!amount) return;
        let [whole, decimals = ""] = amount.split(".")
        if (decimals.length === 0) decimals = "00"
        if (decimals.length === 1) decimals = decimals + "0"
        setAmount(`${whole}.${decimals}`)
    }

    return (
        <div className="">
            <h2 className="text-center p-[5%] text-2xl"> Add Entry</h2>
            <div className="flex items-center gap-3">
                <div>
                    <p>Type</p>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="border rounded p-2 pl-4"
                    >
                        <option value="expense">Expense</option>
                        <option value="withdrawal">Withdrawal</option>
                    </select>
                </div>
                <div className="">
                    <p>Amount</p>
                    <div className='relative inline-flex items-center'>
                        {/* translate-y-2 translate-x-1 */}
                        <span className=" absolute pointer-events-none left-1 text-gray-500">
                            $
                        </span>
                        <input
                            type="text"
                            value={amount}
                            onChange={handleAmountChange}
                            onBlur={handleAmountBlur}
                            className="border rounded p-2 pl-4"
                            placeholder="0.00"
                        />
                    </div>
                </div>
                <div className={type != "expense" ? "invisible absolute" : ""}>
                    <p>Description</p>
                    <input
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="border rounded p-2"
                    />
                </div>
                <div className={type != "expense" ? "invisible absolute" : ""}>
                    <p>Receipt</p>
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={e => setFile(e.target.files[0])}
                        className="border rounded p-2"
                    />
                </div>
                <div className='items-center flex flex-col justify-center'>
                    <p className="invisible">placeholder</p>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="p-2 rounded w-full bg-blue-200 hover:bg-blue-500"
                    >
                        {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>
            {submitStatus(submitError, submitSuccess)}
            <div className="pb-[5%]"></div>
        </div>
    )
}


export default EntryForm