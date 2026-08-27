import { Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar';
import Footer from './components/footer';
import Home from './pages/home';
import Questionario from './pages/questionario'
import Projetos from './pages/projetos';

function App() {
  return (
    <>
      <Navbar/>

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
