import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { PlanProvider } from './context/PlanContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/navbar'
import Playground from './pages/playground'
import Plan from './pages/plan'
import Breadcrumbs from './components/Breadcrumbs'
import { EntityProvider } from './context/EntityContext'
import CreateActivity from './pages/CreateActivity'
import EditActivity from './pages/EditActivity'
import StructuredPlan from './pages/StructuredPlan'
import EntityDetails from './pages/EntityDetails'
import Ledger from './pages/Ledger'
import BlockVisualization from './pages/BlockVisualization'
import PlanResults from './pages/PlanResults'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ActivitiesPage from './pages/ActivitiesPage';
import EntitiesPage from './pages/EntitiesPage';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import AddExpensePage from './pages/AddExpensePage';
import ViewExpensePage from './pages/ViewExpensePage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Footer from './components/Footer';

export default function App() {
    return (
        <AuthProvider>
            <EntityProvider>
                <BrowserRouter>
                    <AppContent />
                </BrowserRouter>
            </EntityProvider>
        </AuthProvider>
    );
}

function AppContent() {
    const { user } = useAuth();
    const location = useLocation();

    // Pages that have fixed action bars need bottom padding to avoid covering the footer
    const isPlanningPage = location.pathname.startsWith('/plan') ||
        location.pathname.startsWith('/visualize') ||
        location.pathname.startsWith('/entities');

    const isLandingPage = location.pathname === '/';

    return (
        <div className="flex flex-col h-full">
            {!isLandingPage && <Navbar />}
            <div className="flex-1 overflow-y-auto">
                {!isLandingPage && (
                    <div className="max-w-7xl mx-auto">
                        <Breadcrumbs />
                    </div>
                )}
                <Routes>
                    {/* Landing Page - Publicly Accessible, but redirects if logged in */}
                    <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />

                    {/* Auth-only Public Routes (Login/Signup) */}
                    <Route element={<PublicRoute />}>
                        <Route path='/login' element={<Login />} />
                        <Route path='/signup' element={<Signup />} />

                    </Route>


                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/entities" element={<EntitiesPage />} />
                        <Route path='/entities/:id' element={<EntityDetails />} />
                        <Route path="/activities" element={<ActivitiesPage />} />
                        <Route path='/activities/create' element={<CreateActivity />} />
                        <Route path='/activities/:id' element={<EditActivity />} />

                        <Route path='/visualize' element={<BlockVisualization />} />

                        <Route element={<PlanProvider />}>
                            <Route path='/plan' element={<Plan />} />
                            <Route path='/plan/constraints' element={<StructuredPlan />} />
                            <Route path='/plan/results' element={<PlanResults />} />
                        </Route>

                        <Route path='/ledgers' element={<Ledger />} />
                        <Route path='/ledgers/add' element={<AddExpensePage />} />
                        <Route path='/ledgers/:id' element={<ViewExpensePage />} />



                        <Route path='/playground' element={<Playground />} />
                    </Route>

                    {/* Catch-all 404 Route */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
                {!isLandingPage && <Footer className={isPlanningPage ? 'pb-32' : ''} />}
            </div>
        </div>
    );
}