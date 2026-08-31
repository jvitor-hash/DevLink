import { Routes, Route } from 'react-router-dom'
import { useRef } from 'react';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Home from './pages/home';
import Questionario from './pages/questionario'
import Projetos from './pages/projetos';
import LoginModal from './components/login_modal';

function App() {
  const loginModalRef = useRef<HTMLDialogElement | null>(null);

  return (
    <>
      <Navbar onLoginClick={() => loginModalRef.current.showModal()} />

      <LoginModal ref={loginModalRef} onClose={() => loginModalRef.current.close()} />

      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/questionario" element={<Questionario/>} />
        <Route path="/projetos" element={<Projetos/>} />
      </Routes>

      <Footer/>
    </>
  )
}

export default App
