import { createAccessControl } from "better-auth/plugins";

export const statement = {
    projects:         ["create", "update", "read", "delete", "list"],
    message:          ["create", "update", "read", "delete", "list"],
    notification:     ["create", "update", "read", "delete", "list"],
    reviews:          ["create", "update", "read", "delete", "list"],
    saved_tickets:    ["create", "update", "read", "delete", "list"],
    user_preferences: ["create", "update", "read", "delete", "list"]
} as const;

export const ac = createAccessControl(statement);

export const clientRole = ac.newRole({
    projects:         ["create", "read", "update", "list"],
    message:          ["create", "read", "update", "list"],
    notification:     ["read",   "list"                  ],
    reviews:          ["create", "read", "update", "list"],
    saved_tickets:    ["read"                            ],
    user_preferences: ["read",   "update",         "list"],
});

export const programmerRole = ac.newRole({
    projects:         ["read",   "list"                    ],
    message:          ["create", "read",   "update", "list"],
    notification:     ["read",   "list"                    ],
    reviews:          ["read",   "list"                    ],
    saved_tickets:    ["create", "read",   "update", "list"],
    user_preferences: ["read",   "update", "list"          ],
});

export const adminRole = ac.newRole({
    projects:         ["create", "update", "read", "delete", "list"],
    message:          ["create", "update", "read", "delete", "list"],
    notification:     ["create", "update", "read", "delete", "list"],
    reviews:          ["create", "update", "read", "delete", "list"],
    saved_tickets:    ["create", "update", "read", "delete", "list"],
    user_preferences: ["create", "update", "read", "delete", "list"],
});