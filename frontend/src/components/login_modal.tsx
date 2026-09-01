import type { RefObject } from "react";

type LoginModalProps = {
    onClose?: () => void
    ref?: RefObject<HTMLDialogElement>
}

export default function LoginModal({ onClose, ref } : LoginModalProps) {
    return (
        <dialog ref={ref} className="modal ">
            <div className="modal-box bg-white">
                <div className="flex flex-row-reverse">
                    <button 
                        className="px-1 bg-transparent cursor-pointer border-none dark:text-white" 
                        onClick={onClose}><i className="bi bi-x text-2xl"></i></button>
                </div>
                <p>Test</p>
            </div>
        </dialog>
    )
}