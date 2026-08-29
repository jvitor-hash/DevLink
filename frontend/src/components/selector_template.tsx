type OptionType = {
    name:     string
    value?:   string
};

type SelectorTemplateProps = {
    title:         string
    options:       OptionType[]
    defaultValue?: string,
    onChange?: React.ChangeEventHandler<HTMLSelectElement | null>
};

function SelectorTemplate({ title, options, defaultValue, onChange }: SelectorTemplateProps) {
    return (
        <div>
            <p className="text-base mb-2 dark:text-white">{title}</p>
            <select defaultValue={defaultValue === null ? "" : defaultValue} onChange={onChange === null ? null : onChange} className="select bg-white dark:bg-neutral-800 text-black dark:text-white w-full border border-black/25 dark:border-white/25">
                {options.map((opt) => (
                    <option value={opt.value === null ? opt.name : opt.value} >{opt.name}</option>
                ))}
            </select>
        </div>
    )
}

export default SelectorTemplate;
