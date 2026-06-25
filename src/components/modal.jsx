import {useEffect} from 'react'

function Modal({ open, onClose, children, className = "" }) {
    useEffect(() => {
    if (!open) return

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose])
    if (!open) return null;
    return (
        <div onClick={onClose} className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ${className}`}>
            <div onClick={(e) => e.stopPropagation()} className="relative rounded bg-white p-6 shadow-lg overflow-auto">
                <button type="button" onClick={onClose} className="rounded-sm hover:bg-red-300 w-5 h-5 items-center justify-center inline-flex">×</button>
                {children}
            </div>
        </div>
    )
}

export default Modal