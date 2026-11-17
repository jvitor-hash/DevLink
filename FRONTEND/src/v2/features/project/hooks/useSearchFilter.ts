import type { SearchFilterType } from "@/features/project/types/filter_type";
import { useSearchParams } from "react-router-dom";
import { useCallback, useState } from "react";

export default function useSearchFilter() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState<SearchFilterType>();

    const updateFilters = useCallback((key: string, value: string | string[] | undefined) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value
        }));
    }, [setFilters]);

    const applyFilters = useCallback(() => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((item) => {
            if (item) 
                params.append(key, item);
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

    return [ updateFilters, applyFilters, clearFilters ];
}