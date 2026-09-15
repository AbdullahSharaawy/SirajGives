const apiBase = import.meta.env.VITE_API_BASE_URL || "";

const config = {
	baseUrl: import.meta.env.VITE_BASE_URL || window.location.origin,
	backendUrl: import.meta.env.VITE_BACKEND_URL
		|| (apiBase ? apiBase.replace(/\/api\/?$/, "") : "https://localhost:44319"),
};

export default config;
