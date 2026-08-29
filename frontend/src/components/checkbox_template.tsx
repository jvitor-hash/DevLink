import { useState } from "react"

type optionsType = {
  label: string
}

type CheckboxTemplateProps = {
  title: string
  options: OptionsType[]
}

function CheckboxTemplate({ title, options }: CheckboxTemplateProps) {
  return (
    <div>
      <p className="text-base mb-2 dark:text-white">{title}</p>
      <div className="flex gap-5">
        {options.map((opt) => (
          <div key={opt.label} className="flex gap-2 dark:text-white">
            <p>{opt.label}</p>
            <input type="checkbox" className="checkbox dark:bg-neutral-800 border border-black/50 dark:border-white/50"/>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CheckboxTemplate;
