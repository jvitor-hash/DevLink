import type { SearchFilterType } from "@/features/project/types/filter_type";
import { useSearchParams } from "react-router-dom";
import { useCallback, useState } from "react";

export default function useSearchFilter() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState<SearchFilterType>(() => {
        const initial: SearchFilterType = {};
        searchParams.forEach((val, key) => {
            if (initial[key]) {
                if (Array.isArray(initial[key])) {
                    (initial[key] as string[]).push(val);
                } else {
                    initial[key] = [initial[key] as string, val];
                }
            } else {
                initial[key] = val;
            }
        });
        return initial;
    });

    const updateFilters = useCallback((key: string, value: string | string[] | undefined) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value
        }));
    }, []);

    const applyFilters = useCallback(() => {
        const params = new URLSearchParams();

        Object.entries(filters || {}).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((item) => {
                    if (item) params.append(key, item);
                });
            } else if (value != null && value !== "") {
                params.set(key, value);
            }
        });

        setSearchParams(params);
    }, [filters, setSearchParams]);

    const clearFilters = useCallback(() => {
        setFilters({});
        setSearchParams({}, { replace: true });
    }, [setSearchParams]);

    return { filters, updateFilters, applyFilters, clearFilters } as const;
}
