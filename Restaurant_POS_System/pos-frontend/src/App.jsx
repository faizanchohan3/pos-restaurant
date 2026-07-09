import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  useEffect,
} from "react-router-dom";
import { Home, Auth, Orders, Tables, Menu, Dashboard, Stock, Delivery, Staff, Expenses, Financial, ShopManagement, Categories, Products, ShopLogin, SuperAdminLogin, SuperAdminDashboard, StaffLogin, StaffManagement, LoginOptions } from "./pages";
import Header from "./components/shared/Header";
import { useSelector, useDispatch } from "react-redux";
import useLoadData from "./hooks/useLoadData";
import FullScreenLoader from "./components/shared/FullScreenLoader"
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import { restoreUser } from "./redux/slices/userSlice";

function Layout() {
  const dispatch = useDispatch();
  const isLoading = useLoadData();
  const location = useLocation();
  const hideHeaderRoutes = ["/auth", "/superadmin-login", "/shop-login", "/staff-login"];
  const { isAuth } = useSelector(state => state.user);

  // Restore user state on app load
  useEffect(() => {
    const savedUser = localStorage.getItem("userSession");
    if (savedUser && !isAuth) {
      try {
        dispatch(restoreUser());
      } catch (error) {
        console.error("Error restoring user:", error);
      }
    }
  }, [dispatch, isAuth]);

  if(isLoading) return <FullScreenLoader />

  return (
    <>
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}
      <Routes>
        <Route
          path="/"
          element={
            isAuth ? (
              <ProtectedRoutes>
                <Home />
              </ProtectedRoutes>
            ) : (
              <LoginOptions />
            )
          }
        />
        <Route path="/auth" element={isAuth ? <Navigate to="/" /> : <Auth />} />
        <Route path="/shop-login" element={<ShopLogin />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/superadmin-login" element={<SuperAdminLogin />} />
        <Route
          path="/superadmin"
          element={
            localStorage.getItem("superAdminSession") ? (
              <SuperAdminDashboard />
            ) : (
              <Navigate to="/superadmin-login" />
            )
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoutes>
              <Orders />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/tables"
          element={
            <ProtectedRoutes>
              <Tables />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/menu"
          element={
            <ProtectedRoutes>
              <Menu />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoutes>
              <Dashboard />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/stock"
          element={
            <ProtectedAdminRoute>
              <Stock />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/delivery"
          element={
            <ProtectedRoutes>
              <Delivery />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedAdminRoute>
              <Staff />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedAdminRoute>
              <Expenses />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/financial"
          element={
            <ProtectedAdminRoute>
              <Financial />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/shop-management"
          element={
            <ProtectedAdminRoute>
              <ShopManagement />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedAdminRoute>
              <Categories />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedAdminRoute>
              <Products />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/staff-management"
          element={
            <ProtectedAdminRoute>
              <StaffManagement />
            </ProtectedAdminRoute>
          }
        />
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </>
  );
}

function ProtectedRoutes({ children }) {
  const { isAuth } = useSelector((state) => state.user);
  if (!isAuth) {
    return <Navigate to="/auth" />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
