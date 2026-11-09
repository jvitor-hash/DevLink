function selectBase(props: any, onChange?: (e: any) => void) {
  
  const styling = `
    border py-2 px-4 rounded-sm 
    ${props.error ? "border-(--error)" : "border-(--border-subtle"} 
    ${props.className}
  `;
  
  return (
    <>
      <select 
        onChange={onChange} 
        name={props.name} 
        className={styling} 
        data-test-id={props.dataTestId}
      >
        {props.children}
      </select>
    </>
  )
}

function selectItem(props: any) {
  const styling = `bg-(--surface-1) text-(--text-primary)`;
  return (
    <option key={props.key} className={styling}>
      {props.label}
    </option>
  )
} 