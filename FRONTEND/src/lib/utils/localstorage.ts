export function RetrieveSavedUserData() : JSON | null {
    return JSON.parse(
        localStorage.getItem("user") || "null"
    );
}

export function ClearSavedUserData() : void {
    localStorage.removeItem("user");
}
