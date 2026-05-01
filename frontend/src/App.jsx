import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar'
import LoginPg from './pages/LoginPg'
import SignupPg from './pages/SignupPg'
import EntitiesPg from './pages/EntitiesPg'
import EntityDetailPg from './pages/EntityDetailPg'
import HomePage from './pages/HomePage'
import { AuthProvider } from './contexts/AuthContext'

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div className="h-full">
                    <Navbar />
                    <div className="overflow-y-scroll h-full ">
                        <Routes>
                            <Route path='/login' element={<LoginPg />} />
                            <Route path='/signup' element={<SignupPg />} />

                            <Route path='/' element={<HomePage />} />
                            <Route path='/entities' element={<EntitiesPg />} />
                            <Route path='/entities/:id' element={<EntityDetailPg />} />
                            <Route path='/activities' element={<>activities</>} />
                            <Route path='/activities/:id' element={<>activity typeshi</>} />

                            <Route path='/visualize' element={<>schedule visualization here</>} />
                            <Route path='/plan' element={<>best-time algo here</>} />
                            <Route path='/ledgers' element={<>list of expense ledgers page</>} />
                            <Route path='/ledgers/:id' element={<>ledger typeshi</>} />
                        </Routes>
                    </div>
                </div>
            </AuthProvider>
        </BrowserRouter>
    )
}