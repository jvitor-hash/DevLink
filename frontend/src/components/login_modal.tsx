function LoginModal() {
    return (
        <dialog className="modal bg-white">
            <div className="modal-box">
                <p>Test</p>
            </div>

            <form method="dialog" className="modal-backdrop">
                <button className="btn bg-neutral-50 dark:bg-neutral-800 dark:text-white">Fechar</button>
            </form>
        </dialog>
    )
}

export default LoginModal;