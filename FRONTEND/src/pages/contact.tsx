export default function ContactPage() {
  return (
    <>
      <div>
        <span className="text-sm px-2.5 py-1 bg-(--surface-2) text-(--text-primary)">Nossa equipe</span>

        <div className="grid grid-cols-3 gap-4">
          <div className="py-5 relative flex flex-col">
            <h4 className="text-lg z-10">João Vitor Alves</h4>
            <p className="mt-2 text-sm z-10">Back-end & Front-end</p>
            <span className="absolute mask-[linear-gradient(to_left,white_35%,transparent_100%)] halftone h-[70%] w-full text-(--primary) z-0" aria-hidden="true"></span>
          </div>

          <div className="py-5 relative flex flex-col">
            <h4 className="text-lg z-10">Henrick Gualberto</h4>
            <p className="mt-2 text-sm z-10">Front-end</p>
            <span className="absolute mask-[linear-gradient(to_left,white_35%,transparent_100%)] halftone h-[70%] w-full text-(--primary) z-0" aria-hidden="true"></span>
          </div>
          
          <div className="py-5 relative flex flex-col">
            <h4 className="text-lg z-10">Eduardo Reis</h4>
            <p className="mt-2 text-sm z-10">Front-end</p>
            <span className="absolute mask-[linear-gradient(to_left,white_35%,transparent_100%)] halftone h-[70%] w-full text-(--primary) z-0" aria-hidden="true"></span>
          </div>
          
          <div className="py-5 relative flex flex-col">
            <h4 className="text-lg z-10">Nicolas Motas</h4>
            <p className="mt-2 text-sm z-10">Back-end</p>
            <span className="absolute mask-[linear-gradient(to_left,white_35%,transparent_100%)] halftone h-[70%] w-full text-(--primary) z-0" aria-hidden="true"></span>
          </div>
          
          <div className="py-5 relative flex flex-col">
            <h4 className="text-lg z-10">Fabricio Sacramento</h4>
            <p className="mt-2 text-sm z-10">Banco de dados</p>
            <span className="absolute mask-[linear-gradient(to_left,white_35%,transparent_100%)] halftone h-[70%] w-full text-(--primary) z-0" aria-hidden="true"></span>
          </div>
        </div>
      </div>

      <div>
        <div>

        </div>

        <div>
          
        </div>
      </div>
    </>
  );
}