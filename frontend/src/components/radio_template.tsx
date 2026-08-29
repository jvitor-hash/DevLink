type RadioTemplateOptions = {
  label: string
  value: string
}

type RadioTemplateProps = {
  title: string
  options: RadioTemplateOptions,
  name: string
}


function RadioTemplate({ title, options, name }: RadioTemplateProps) {
  return (
    <div>
      <div>
        <p className="text-base dark:text-white mb-2">{title}</p>
        <div className="flex gap-3 dark:text-white">
          {options.map((opt) => (
            <label key={opt.label} className="flex gap-3">
              <input type="radio" className="radio" name={name} value={opt.value} />
              <span className="text-base">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RadioTemplate;
