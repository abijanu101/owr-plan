import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar'
import Playground from './pages/playground'
import TimePicker from './components/TimePicker'
import DateTimePicker from './components/DateTimePicker'
import DateTimeRangePicker from './components/DateTimeRangePicker'

export default function App() {
    return <>
        <div className="h-full">
            <Navbar />
            <div className="overflow-y-scroll h-full ">
                <BrowserRouter>
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

                        <Route path='/playground' element={<Playground />} />

                        {/* Individual Component Routes */}
                        <Route path='/time-picker' element={<div className="p-12 max-w-5xl mx-auto"><TimePicker /></div>} />
                        <Route path='/date-time-picker' element={<div className="p-12 max-w-5xl mx-auto"><DateTimePicker /></div>} />
                        <Route path='/date-time-range-picker' element={<div className="p-12 max-w-5xl mx-auto"><DateTimeRangePicker /></div>} />
                    </Routes>
                </BrowserRouter>
            </div>
        </div>
    </>
}