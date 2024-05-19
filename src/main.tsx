import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import Desktop from './views/desktop';

const shouldRenderDesktopUI = () => {
	// TODO always return false if desktop env
	// is not explicitly indicated by something
	// like window.satellite
	return window.location.hash.startsWith('#desktop:');
};

ReactDOM.createRoot(document.getElementById('root')!).render(shouldRenderDesktopUI() ? <Desktop /> : <App />);
