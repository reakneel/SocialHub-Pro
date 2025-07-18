'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch('/api/docs')
      .then(res => res.json())
      .then(data => setSpec(data))
      .catch(err => console.error('Failed to load API spec:', err));
  }, []);

  if (!spec) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading API Documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-950 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">SocialHub Pro API Documentation</h1>
          <p className="text-gray-400">
            Comprehensive API documentation for the multi-platform social media management system
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <SwaggerUI 
          spec={spec} 
          docExpansion="list"
          defaultModelsExpandDepth={2}
          defaultModelExpandDepth={2}
        />
      </div>
    </div>
  );
}