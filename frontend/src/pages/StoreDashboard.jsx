// frontend/pages/StoreDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function StoreDashboard() {
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "" });
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("token");

    // ---------------- Fetch Store Info & Ratings ----------------
    const fetchStoreData = async () => {
        try {
            const storeRes = await axios.get("http://localhost:5000/api/stores/dashboard", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const ratingsRes = await axios.get("http://localhost:5000/api/stores/ratings", {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStore(storeRes.data.store);
            setRatings(ratingsRes.data.ratings);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching store data:", err);
            setError("Failed to load store data. Please login again.");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) navigate("/login");
        fetchStoreData();
    }, []);

    // ---------------- Update Password ----------------
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            };

            await axios.put("http://localhost:5000/api/auth/update-password", payload, {
                headers: { Authorization: `Bearer ${token}` } // ✅ token is enough now
            });

            setMessage("✅ Password updated successfully");
            setPasswordData({ oldPassword: "", newPassword: "" });
        } catch (err) {
            console.error("Error updating password:", err);
            setMessage(err.response?.data?.message || "❌ Failed to update password");
        }
    };


    // ---------------- Logout ----------------
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    if (loading) return <p className="text-center mt-5">Loading dashboard...</p>;
    if (error) return <p className="text-center mt-5 text-red-500">{error}</p>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">🏪 Store Owner Dashboard</h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>

            {/* ---------------- Store Info & Average Rating ---------------- */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-blue-100 rounded shadow">
                    <h2 className="text-xl font-semibold">Store Name</h2>
                    <p className="text-2xl">{store.name}</p>
                </div>
                <div className="p-4 bg-green-100 rounded shadow">
                    <h2 className="text-xl font-semibold">Average Rating</h2>
                    <p className="text-2xl">{store.averageRating}</p>
                </div>
            </div>

            {/* ---------------- Update Password ---------------- */}
            <div className="mb-8 p-4 border rounded shadow">
                <h2 className="text-2xl font-bold mb-4">Update Password</h2>
                {message && <p className="mb-3 text-center text-sm text-blue-600">{message}</p>}
                <form onSubmit={handleUpdatePassword} className="grid grid-cols-2 gap-4">
                    <input
                        type="password"
                        placeholder="Old Password"
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                        className="border p-2 rounded"
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="border p-2 rounded"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded col-span-2 hover:bg-blue-600"
                    >
                        Update Password
                    </button>
                </form>
            </div>

            {/* ---------------- Ratings Table ---------------- */}
            <h2 className="text-2xl font-bold mb-4">User Ratings</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 border">User Name</th>
                            <th className="p-2 border">Rating</th>
                            <th className="p-2 border">Comment</th>
                            <th className="p-2 border">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ratings.map((r) => (
                            <tr key={r.id}>
                                <td className="p-2 border">{r.userName}</td>
                                <td className="p-2 border">{r.rating}</td>
                                <td className="p-2 border">{r.comment}</td>
                                <td className="p-2 border">{new Date(r.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
