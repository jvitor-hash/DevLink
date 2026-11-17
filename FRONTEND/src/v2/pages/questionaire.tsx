export default function Questionaire() {
  return (
    <>
      <div className="flex gap-2">
        {/* Content */}
        <div>
          <div className="border border-(--border) p-4">
            
          </div>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="border border-(--border-subtle) p-4">
              <h4>01</h4>
            </div>
            <p></p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="border border-(--border-subtle) p-4">
              <h4>02</h4>
            </div>
            <p></p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="border border-(--border-subtle) p-4">
              <h4>03</h4>
            </div>
            <p></p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="border border-(--border-subtle) p-4">
              <h4>04</h4>
            </div>
            <p></p>
          </div>
        </div>
      </div>
    </>
  );
}