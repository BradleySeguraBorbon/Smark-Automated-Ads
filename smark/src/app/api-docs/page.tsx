'use client';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import './swagger-theme.css';

export default function ApiDocsPage() {
    return (
        <div className="swagger-container">
            <SwaggerUI url="/api-docs/openapi.json" />
        </div>
    );
}
