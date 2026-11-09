import { useState } from "react"
import { Eye, EyeOff } from "react-feather";

function InputBase(props: any) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="relative">
          {props.children}
        </div>
      </div>
    </>
  )
}

function InputLabel(props: any) {
  return (
    <label htmlFor={props.name ?? props.label.toLowerCase()} className="block w-full">
      {props.label}
    </label>
  )
}

function InputIconComponent(props: any) {
  return (
    <>
      
    </>
  )
}

function InputPasswordButton(props: any, setShowPassword: (e: boolean) => void, ) {
  const styling = `
    absolute right-3 top-1/2 
    -translate-y-1/2 text-(--text-muted) 
    hover:text-white
  `;

  return (
    <button 
      type="button" 
      onClick={(prev) => setShowPassword(!prev)}
      className={styling}
      aria-label={props.showPassword}
    >
      {props.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  )
}