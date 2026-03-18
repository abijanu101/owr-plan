import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Test from './components/test'

export default function App(){
    return <>
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Test />}/>
                <Route path='/test' element={<>bye</>}/>
            </Routes>
        </BrowserRouter>
    </>
}