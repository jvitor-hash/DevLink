import { BASE_URL } from "../types/database";

interface WebSocketClientOptions {
    ip_addr?: string;
    socket_route?: string;
    onOpen?: () => void;
    onClose?: (event: CloseEvent) => void;
    onError?: (event: Event) => void;
}

export class WebSocketClient {
    private ip_addr: string = BASE_URL;
    private isConnected: boolean = false;
    private retryAttempts: number = 0;
    private socket_route: string = "/ws";
    private socket: WebSocket | null = null;
    private callback: (e: unknown) => void = () => {};
    private onOpenCallback: () => void = () => {};
    private onCloseCallback: (event: CloseEvent) => void = () => {};
    private onErrorCallback: (event: Event) => void = () => {};
    private disposed: boolean = false;

    constructor(options: WebSocketClientOptions = {}) {
        this.ip_addr = options.ip_addr ?? BASE_URL;
        this.socket_route = options.socket_route ?? "/ws";
        this.onOpenCallback = options.onOpen ?? this.onOpenCallback;
        this.onCloseCallback = options.onClose ?? this.onCloseCallback;
        this.onErrorCallback = options.onError ?? this.onErrorCallback;
        this.connect();
    }

    broadcast(callback: (e: MessageEvent) => unknown): void {
        this.callback = callback;
    }

    send(msg_data: unknown): boolean {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return false;

        this.socket.send(JSON.stringify(msg_data));

        return true;
    }

    close(): void {
        this.disposed = true;
        this.socket?.close();
    }

    private connect(): void {
        if (this.disposed) return;

        console.log(`Websocket connecting | ip: ${this.format_url()}`);

        const socket = new WebSocket(this.format_url());

        this.socket = socket;

        socket.onopen = () => {
            this.isConnected = true;
            this.retryAttempts = 0;

            console.log(`Websocket connected | ip: ${this.format_url()}`);

            this.onOpenCallback();
        };

        socket.onmessage = (event: MessageEvent) => {
            this.callback(event);
        };

        socket.onerror = (event: Event) => {
            console.error(`Websocket connection error | ${event.type}`);

            this.onErrorCallback(event);
        };

        socket.onclose = (event: CloseEvent) => {
            this.isConnected = false;

            console.log(`Websocket connection closed | code: ${event.code}`);

            if (this.disposed) return;

            const attempt = this.retryAttempts++;
            const delay = Math.min(30_000, 500 * 2 ** attempt);

            console.warn(`Websocket attempting to reconnect | attempt: ${attempt + 1} | delay: ${delay}ms`);

            this.onCloseCallback(event);

            setTimeout(() => {
                this.connect();
            }, delay);
        };
    }

    /**Formats text based on the private (ip_addr, socket_route). If port is set it will also use it. */
    private format_url(): string {
        // Expected result: ws://www.google.com/ws
        return `${this.ip_addr.replace(/^https?:\/\//, "ws://")}${this.socket_route}`;
    }

    get getSocketRoute(): string {
        return this.socket_route;
    }

    get getsConnected(): boolean {
        return this.isConnected;
    }

    set setIPAddress(new_ip_addr: string) {
        this.ip_addr = new_ip_addr;
    }

    set setSocketRoute(new_socket_route: string) {
        this.socket_route = new_socket_route;
    }
}