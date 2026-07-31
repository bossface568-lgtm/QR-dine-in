import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CustomerMenuPage } from './pages/CustomerMenuPage';
import { RestaurantNotFoundPage } from './pages/RestaurantNotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Restaurant Route: /r/{restaurant-slug} */}
        <Route path="/r/:slug" element={<CustomerMenuPage />} />

        {/* Public Table Route: /r/{restaurant-slug}/t/{table-token} */}
        <Route path="/r/:slug/t/:tableToken" element={<CustomerMenuPage />} />

        {/* Fallback 404 */}
        <Route path="*" element={<RestaurantNotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
