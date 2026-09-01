import { Routes, Route } from 'react-router-dom'
import { useRef } from 'react';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Home from './pages/home';
import Questionario from './pages/questionario'
import Projetos from './pages/projetos';
import LoginModal from './components/login_modal';
import APIPlayground from './pages/api-playground';
import Perfil from './pages/perfil';

function App() {
  const loginModalRef = useRef<HTMLDialogElement | null>(null);

  return (
    <>
      <Navbar onLoginClick={() => loginModalRef.current.show()} />

      <LoginModal ref={loginModalRef} onClose={() => loginModalRef.current.close()} />

      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/questionario" element={<Questionario/>} />
        <Route path="/projetos" element={<Projetos/>} />
        <Route path="/perfil" element={<Perfil/>} />
        <Route path="/playground" element={<APIPlayground/>} />
      </Routes>

      <Footer/>
    </>
  )
}

export default App
