import React, { useEffect, useState } from "react";
import axios from "axios";

export default function UserDashboard() {
    const [stores, setStores] = useState([]);
    const [filteredStores, setFilteredStores] = useState([]);
    const [search, setSearch] = useState("");
    const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "" });
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("token");

    const fetchStores = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/stores/all", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStores(res.data);
            setFilteredStores(res.data);
        } catch (err) {
            console.error("Error fetching stores:", err);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    useEffect(() => {
        const filtered = stores.filter(
            (s) =>
                s.name.toLowerCase().includes(search.toLowerCase()) ||
                s.address.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredStores(filtered);
    }, [search, stores]);

    const handleRatingSubmit = async (storeId, rating, comment) => {
        try {
            await axios.post(
                "http://localhost:5000/api/stores/rate",
                { storeId, rating, comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage(" Rating submitted successfully");
            fetchStores(); 
        } catch (err) {
            console.error(err);
            setMessage(" Failed to submit rating");
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            const decoded = JSON.parse(atob(token.split(".")[1]));
            await axios.put(
                "http://localhost:5000/api/auth/update-password",
                { userId: decoded.id, oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage("Password updated successfully");
            setPasswordData({ oldPassword: "", newPassword: "" });
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.message || " Failed to update password");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    return (
        <div className="p-6 min-h-screen bg-gray-50">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Welcome User Dashboard </h1>
                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                    Logout
                </button>
            </div>

            {message && <p className="mb-4 text-blue-600">{message}</p>}

            <div className="mb-6 p-4 bg-white rounded shadow-md">
                <h2 className="text-xl font-bold mb-3">Update Password</h2>
                <form className="flex gap-3" onSubmit={handlePasswordUpdate}>
                    <input
                        type="password"
                        placeholder="Old Password"
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                        className="border p-2 rounded"
                        required
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="border p-2 rounded"
                        required
                    />
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Update
                    </button>
                </form>
            </div>

            <input
                type="text"
                placeholder="Search stores by name or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border p-2 mb-4 rounded w-full"
            />

            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 bg-white rounded">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 border">Store Name</th>
                            <th className="p-2 border">Address</th>
                            <th className="p-2 border">Overall Rating</th>
                            <th className="p-2 border">Your Rating</th>
                            <th className="p-2 border">Comment</th>
                            <th className="p-2 border">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStores.map((store) => (
                            <tr key={store.id}>
                                <td className="p-2 border">{store.name}</td>
                                <td className="p-2 border">{store.address}</td>
                                <td className="p-2 border">
                                    {typeof store.averageRating === "number"
                                        ? store.averageRating.toFixed(1)
                                        : "No ratings"}
                                </td>

                                <td className="p-2 border">
                                    <input
                                        type="number"
                                        min={1}
                                        max={5}
                                        defaultValue={store.userRating?.rating || ""}
                                        className="border p-1 w-16 rounded"
                                        id={`rating-${store.id}`}
                                    />
                                </td>
                                <td className="p-2 border">
                                    <input
                                        type="text"
                                        defaultValue={store.userRating?.comment || ""}
                                        placeholder="Optional comment"
                                        className="border p-1 rounded w-full"
                                        id={`comment-${store.id}`}
                                    />
                                </td>
                                <td className="p-2 border">
                                    <button
                                        onClick={() =>
                                            handleRatingSubmit(
                                                store.id,
                                                Number(document.getElementById(`rating-${store.id}`).value),
                                                document.getElementById(`comment-${store.id}`).value
                                            )
                                        }
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                    >
                                        Submit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
