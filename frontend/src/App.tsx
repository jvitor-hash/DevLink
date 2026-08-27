import { Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar';
import Home from './pages/home';
import Questionario from './pages/questionario'

function App() {
  return (
    <>
      <Navbar/>

      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/questionario" element={<Questionario/>} />
      </Routes>
    </>
  )
}

export default App
