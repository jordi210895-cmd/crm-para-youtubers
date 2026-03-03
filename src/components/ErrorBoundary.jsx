import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Actualiza el estado para que la siguiente renderización muestre la interfaz de repuesto
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // También puedes registrar el error en un servicio de reporte de errores
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // Puedes renderizar cualquier interfaz de repuesto
            return (
                <div className="p-8 space-y-4 bg-red-900/10 border border-red-500/30 text-white rounded">
                    <h2 className="text-xl font-bold text-red-400">Algo salió mal en este componente.</h2>
                    <pre className="text-xs bg-black/50 p-4 rounded overflow-auto">
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-sm font-bold mt-4"
                    >
                        Reintentar
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
