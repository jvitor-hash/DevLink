export function Card({children, style}) {
  return (
    <div className="border border-(--border-subtle) p-5 transition-shadow hover:shadow-lg" style={style}>
      {children}
    </div>
  );
}

export function Card3D({children, onClick}) {
  return (
    <div onClick={onClick} className="[perspective:1000px]">
      <div className="transition-transform duration-150 hover:[transform:rotateX(2deg)_rotateY(-2deg)_scale(1.02)]">
        {children}
      </div>
    </div>
  );
}
