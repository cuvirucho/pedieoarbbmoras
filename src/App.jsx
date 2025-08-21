
import './App.css'

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Hom from './Hom'
import PaymentResult from './Respuestas/PaymentResult'



function App() {


  return (
  <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hom/>} />      
        <Route path="/pgos" element={<PaymentResult/>} />      

      </Routes>
    </BrowserRouter>
  )
}

export default App
