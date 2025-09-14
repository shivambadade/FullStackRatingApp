import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await axios.post("http://localhost:5000/api/auth/login", formData);

            if (res.data.token) {
                localStorage.setItem("token", res.data.token);

                const role = res.data.user.role;
                if (role === "admin") {
                    navigate("/admin-dashboard");
                } else if (role === "store_owner") {
                    navigate("/store-dashboard");
                } else {
                    navigate("/user-dashboard");
                }
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-100 to-gray-300 px-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
            >
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    Welcome Back 👋
                </h2>

                {error && (
                    <p className="text-red-500 bg-red-100 p-2 rounded mb-4 text-center">
                        {error}
                    </p>
                )}

                <div className="mb-4">
                    <label className="block text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Enter your email"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Enter your password"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition ${loading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p className="text-center text-gray-600 mt-4">
                    Don't have an account?{" "}
                    <Link
                        to="/signupbyuser"
                        className="text-blue-600 hover:underline font-medium"
                    >
                        Sign up here
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default Login;
