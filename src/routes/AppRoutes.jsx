import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import BasketPage from '../pages/BasketPage'
import HomePage from '../pages/HomePage'
import NotFoundPage from '../pages/NotFoundPage'
import OrdersPage from '../pages/OrdersPage'
import ProductManagementPage from '../pages/ProductManagementPage'
import ProductsPage from '../pages/ProductsPage'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/manage" element={<ProductManagementPage />} />
          <Route path="/basket" element={<BasketPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
