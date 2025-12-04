import React, { useEffect, useState } from "react";

// Lightweight search/filter bar standardized to match Courses page UI
// Usage: fields=[{type:"input"|"select", name, label, placeholder, options:[{label,value}]}]
export default function SearchFilter({
    fields = [],
    initialValues = {},
    onChange,
    debounce = 500,
    className = "",
}) {
    const [values, setValues] = useState(initialValues);

    useEffect(() => {
        setValues(initialValues || {});
    }, [JSON.stringify(initialValues)]);

    useEffect(() => {
        const t = setTimeout(() => {
            onChange && onChange(values);
        }, debounce);
        return () => clearTimeout(t);
    }, [values, debounce]);

    const handleInput = (name, v) => setValues((s) => ({ ...s, [name]: v }));
    const handleClear = () => {
        setValues({});
        onChange && onChange({});
    };

    const hasActive = Object.values(values).some(
        (v) => v !== undefined && v !== null && String(v) !== ""
    );

    return (
        <div className={`w-full ${className}`}>
            <div className="flex flex-col md:flex-row gap-4 mb-3">
                {fields.map((f, index) => {
                    const isMain = index === 0; // main search expands
                    const baseClass =
                        "px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white";
                    const wrapperClass = isMain ? "flex-1" : "w-full md:w-[220px]";

                    if (f.type === "select") {
                        const opts = f.options || [];
                        const isBoolean = opts.some((o) => typeof o.value === "boolean");
                        const currentVal = values[f.name];
                        const selectValue = currentVal === undefined || currentVal === null || currentVal === ""
                            ? ""
                            : isBoolean
                                ? String(currentVal)
                                : currentVal;
                        return (
                            <div key={f.name} className={wrapperClass}>
                                <select
                                    value={selectValue}
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        const v = isBoolean ? (raw === "true" ? true : raw === "false" ? false : "") : raw;
                                        handleInput(f.name, v);
                                    }}
                                    className={`${baseClass} w-full`}
                                >
                                    <option value="">{f.placeholder || f.label || "Select"}</option>
                                    {opts.map((opt) => (
                                        <option key={String(opt.value)} value={isBoolean ? String(opt.value) : opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        );
                    }

                    return (
                        <div key={f.name} className={wrapperClass}>
                            <input
                                type="text"
                                placeholder={f.placeholder || f.label || "Search..."}
                                value={values[f.name] ?? ""}
                                onChange={(e) => handleInput(f.name, e.target.value)}
                                className={`${baseClass} w-full`}
                            />
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-end text-sm">
                {hasActive && (
                    <button
                        onClick={handleClear}
                        className="text-blue-600 hover:text-blue-800"
                        type="button"
                    >
                        Clear filters
                    </button>
                )}
            </div>
        </div>
    );
}
