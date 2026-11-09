function TextAreaBase(props: any) {
  return (
    <>
      <div>
        {props.children}
      </div>
    </>
  )
}

function TextAreaLabel(props: any) {
  const styling_label = `block w-full mb-2`;
  const styling_span = `text-(--primary) px-1`;

  return (
    <label htmlFor={props.name} className={styling_label}>
      {props.validInput ? <span className={styling_span}>*</span> : ""}
      {props.label}
    </label>
  )
}

function TextareaEntry(props: any) {
  const styling = `
    border placeholder:text(--text-muted) 
    ${props.isFocused === false ? "hover:border-gray-400" : ""} 
    ${props.validInput ? "border-(--error)" : ""} 
    resize-none p-2 rounded-sm transition-colors w-full outline-none
  `;
  return (
    <textarea>

    </textarea>
  )
}