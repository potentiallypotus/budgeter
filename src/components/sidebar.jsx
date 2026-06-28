import {Link} from 'react-router-dom'

function Sidebar({ isOpen }) {
    return (
        <aside
            className={`bg-white border-r border-gray-200 transition-all duration-200 overflow-hidden ${
                isOpen ? 'w-56' : 'w-0'
            }`}
        >
            <nav className="flex flex-col p-4 gap-2 w-full">
                <Link to="/" className="px-3 py-2 rounded hover:bg-gray-100">
                    Overview
                </Link>
                <Link to="/expenses" className="px-3 py-2 rounded hover:bg-gray-100">
                    Expenses
                </Link>
                <Link to="/withdrawals" className="px-3 py-2 rounded hover:bg-gray-100">
                    Withdrawals
                </Link>
            </nav>
        </aside>
    )
}

export default Sidebar