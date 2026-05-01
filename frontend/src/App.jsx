import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar'

export default function App() {
    return <>
        <BrowserRouter>
            <div className="flex flex-col h-full">
                <Navbar />
                <div className="flex-1 overflow-y-auto">
                    <Routes>
                        <Route path='/login' element={<>bye</>} />
                        <Route path='/signup' element={<>bye</>} />

                        <Route path='/' element={<>home</>} />
                        <Route path='/entities' element={<>entities</>} />
                        <Route path='/entities/:id' element={<>entity typeshi</>} />
                        <Route path='/activities' element={<>activities</>} />
                        <Route path='/activities/:id' element={<>activity typeshi</>} />

                        <Route path='/visualize' element={<>schedule visualization here</>} />
                        <Route path='/plan' element={<>best-time algo here</>} />
                        <Route path='/ledgers' element={<>list of expense ledgers page</>} />
                        <Route path='/ledgers/:id' element={<>ledger typeshi</>} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    </>
}