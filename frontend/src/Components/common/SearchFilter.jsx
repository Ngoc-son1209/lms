import React, { useEffect, useMemo, useState } from "react";
import { Input, Select, Button, ConfigProvider, theme, Tooltip } from "antd";
import { FilterFilled, CloseCircleFilled, DownOutlined, UpOutlined, SearchOutlined } from "@ant-design/icons";

export default function SearchFilter({
    fields = [],
    initialValues = {},
    onChange,
    debounce = 500,
    className,
}) {
    const { token } = theme.useToken();
    const [values, setValues] = useState(initialValues);
    const [expand, setExpand] = useState(false);

    // CẤU HÌNH
    // Mặc định hiện 3 ô (1 ô search to + 2 ô filter nhỏ)
    const SHOW_COUNT = 3;
    const hasCollapse = fields.length > SHOW_COUNT;
    const visibleFields = expand ? fields : fields.slice(0, SHOW_COUNT);
    const activeCount = Object.values(values).filter(v => v !== undefined && v !== "" && v !== null).length;

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

    const customTheme = {
        components: {
            Input: {
                controlHeight: 40, // Cao hơn chút cho giống thanh search bar xịn
                borderRadius: 6,
                colorBgContainer: '#fff',
                colorBorder: '#d9d9d9', // Viền xám nhẹ chuẩn
            },
            Select: {
                controlHeight: 40,
                borderRadius: 6,
            },
            Button: {
                controlHeight: 40,
                borderRadius: 6,
            }
        },
    };

    return (
        <ConfigProvider theme={customTheme}>
            {/* CONTAINER CHÍNH: Dùng flex để dàn ngang, w-full để chiếm hết màn hình */}
            <div className={`flex flex-col md:flex-row items-center gap-2 w-full ${className}`}>

                {/* --- PHẦN INPUTS --- */}
                <div className="flex-1 flex flex-wrap md:flex-nowrap items-center gap-2 w-full">

                    {visibleFields.map((f, index) => {
                        // LOGIC QUAN TRỌNG:
                        // Nếu là phần tử đầu tiên (index === 0) -> Cho class flex-1 để nó giãn hết cỡ
                        // Các phần tử sau -> Cho width cố định (vd: 180px) để gọn gàng
                        const isMainSearch = index === 0;
                        const itemClass = isMainSearch ? "flex-1 min-w-[200px]" : "w-full md:w-[180px] shrink-0";
                        const compactPlaceholder = f.label ? `${f.label}...` : (f.placeholder || "Tìm kiếm...");

                        return (
                            <div key={f.name} className={itemClass}>
                                {f.type === "select" ? (
                                    <Select
                                        allowClear={f.allowClear !== false}
                                        placeholder={compactPlaceholder}
                                        value={values[f.name] ?? undefined}
                                        onChange={(v) => handleInput(f.name, v)}
                                        options={f.options || []}
                                        style={{ width: "100%" }}
                                        showSearch
                                        suffixIcon={<DownOutlined className="text-[10px] text-gray-400" />}
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                    />
                                ) : (
                                    <Input
                                        placeholder={compactPlaceholder}
                                        value={values[f.name] ?? ""}
                                        onChange={(e) => handleInput(f.name, e.target.value)}
                                        allowClear
                                        // Nếu là ô search chính thì thêm icon kính lúp cho đẹp
                                        prefix={isMainSearch ? <SearchOutlined className="text-gray-400 mr-1" /> : null}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* --- PHẦN BUTTONS (Action) --- */}
                <div className="flex items-center gap-2 shrink-0 ml-auto md:ml-0 w-full md:w-auto justify-end">

                    {/* Nút Tìm kiếm */}
                    <Button type="primary" icon={<SearchOutlined />}>
                        Tìm
                    </Button>

                    {/* Nút Mở rộng */}
                    {hasCollapse && (
                        <Button
                            onClick={() => setExpand(!expand)}
                            icon={expand ? <UpOutlined /> : <DownOutlined />}
                        />
                    )}

                    {/* Nút Xóa lọc */}
                    {activeCount > 0 && (
                        <Tooltip title="Xóa bộ lọc">
                            <Button
                                danger
                                icon={<CloseCircleFilled />}
                                onClick={handleClear}
                                type="dashed"
                            >
                                {activeCount}
                            </Button>
                        </Tooltip>
                    )}
                </div>
            </div>
        </ConfigProvider>
    );
}