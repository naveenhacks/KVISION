
import React from 'react';
import { Navigate } from 'react-router-dom';

const VerificationPage: React.FC = () => {
  // This page is deprecated as the verification flow has been removed.
  // Redirect any users who land here back to the homepage.
  return <Navigate to="/" replace />;
};

export default VerificationPage;
