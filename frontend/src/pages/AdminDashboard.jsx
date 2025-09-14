import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
    const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
    const [users, setUsers] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", address: "", role: "normal" });
    const [newStore, setNewStore] = useState({ name: "", email: "", address: "", owner_id: "" });
    const [userFilters, setUserFilters] = useState({ name: "", email: "", address: "", role: "" });
    const [storeFilters, setStoreFilters] = useState({ name: "", email: "", address: "" });

    const fetchData = async () => {
        try {
            const [statsRes, usersRes, storesRes] = await Promise.all([
                axios.get("http://localhost:5000/api/admin/dashboard-stats"),
                axios.get("http://localhost:5000/api/admin/users", { params: userFilters }),
                axios.get("http://localhost:5000/api/admin/stores", { params: storeFilters }),
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setStores(storesRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching admin dashboard data:", err);
            setError("Failed to load data. Please check backend connection.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userFilters, storeFilters]); 

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!newUser.name || !newUser.email || !newUser.password || !newUser.address || !newUser.role) {
            setMessage("❌ Please fill all fields");
            return;
        }
        try {
            await axios.post("http://localhost:5000/api/admin/users", newUser);
            setMessage("✅ User added successfully");
            setNewUser({ name: "", email: "", password: "", address: "", role: "normal" });
            fetchData();
        } catch (err) {
            console.error("Error adding user:", err);
            setMessage("❌ Failed to add user");
        }
    };

    const handleAddStore = async (e) => {
        e.preventDefault();
        if (!newStore.name) {
            setMessage("❌ Store name is required");
            return;
        }
        try {
            await axios.post("http://localhost:5000/api/admin/stores", newStore);
            setMessage("✅ Store added successfully");
            setNewStore({ name: "", email: "", address: "", owner_id: "" });
            fetchData();
        } catch (err) {
            console.error("Error adding store:", err);
            setMessage("❌ Failed to add store");
        }
    };
//Logout functionality
    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        window.location.href = "/login"; 
    };

    if (loading) return <p className="text-center mt-5">Loading dashboard...</p>;
    if (error) return <p className="text-center mt-5 text-red-500">{error}</p>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-blue-100 rounded shadow">
                    <h2 className="text-xl font-semibold">Total Users</h2>
                    <p className="text-2xl">{stats.totalUsers}</p>
                </div>
                <div className="p-4 bg-green-100 rounded shadow">
                    <h2 className="text-xl font-semibold">Total Stores</h2>
                    <p className="text-2xl">{stats.totalStores}</p>
                </div>
                <div className="p-4 bg-yellow-100 rounded shadow">
                    <h2 className="text-xl font-semibold">Total Ratings</h2>
                    <p className="text-2xl">{stats.totalRatings}</p>
                </div>
            </div>

            <div className="mb-8 p-4 border rounded shadow">
                <h2 className="text-2xl font-bold mb-4">Add New User</h2>
                {message && <p className="mb-3 text-center text-sm text-blue-600">{message}</p>}
                <form onSubmit={handleAddUser} className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        className="border p-2 rounded"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        className="border p-2 rounded"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="border p-2 rounded"
                    />
                    <input
                        type="text"
                        placeholder="Address"
                        value={newUser.address}
                        onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                        className="border p-2 rounded"
                    />
                    <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        className="border p-2 rounded col-span-2"
                    >
                        <option value="normal">Normal User</option>
                        <option value="admin">Admin</option>
                        <option value="store_owner">Store Owner</option>
                    </select>
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded col-span-2 hover:bg-blue-600">
                        Add User
                    </button>
                </form>
            </div>

            <div className="mb-8 p-4 border rounded shadow">
                <h2 className="text-2xl font-bold mb-4">Add New Store</h2>
                <form onSubmit={handleAddStore} className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Store Name"
                        value={newStore.name}
                        onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                        className="border p-2 rounded"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={newStore.email}
                        onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                        className="border p-2 rounded"
                    />
                    <input
                        type="text"
                        placeholder="Address"
                        value={newStore.address}
                        onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                        className="border p-2 rounded"
                    />
                    <select
                        value={newStore.owner_id}
                        onChange={(e) => setNewStore({ ...newStore, owner_id: e.target.value })}
                        className="border p-2 rounded col-span-2"
                    >
                        <option value="">Select Owner</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name} ({user.role})
                            </option>
                        ))}
                    </select>
                    <button type="submit" className="bg-green-500 text-white p-2 rounded col-span-2 hover:bg-green-600">
                        Add Store
                    </button>
                </form>
            </div>

            <h2 className="text-2xl font-bold mb-4">Users</h2>

            {/* ✅ User Filters */}
            <div className="grid grid-cols-4 gap-2 mb-2">
                <input
                    type="text"
                    placeholder="Filter Name"
                    value={userFilters.name}
                    onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })}
                    className="border p-1 rounded"
                />
                <input
                    type="email"
                    placeholder="Filter Email"
                    value={userFilters.email}
                    onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })}
                    className="border p-1 rounded"
                />
                <input
                    type="text"
                    placeholder="Filter Address"
                    value={userFilters.address}
                    onChange={(e) => setUserFilters({ ...userFilters, address: e.target.value })}
                    className="border p-1 rounded"
                />
                <select
                    value={userFilters.role}
                    onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
                    className="border p-1 rounded"
                >
                    <option value="">All Roles</option>
                    <option value="normal">Normal User</option>
                    <option value="admin">Admin</option>
                    <option value="store_owner">Store Owner</option>
                </select>
            </div>

            <table className="min-w-full border border-gray-300 mb-8">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">Email</th>
                        <th className="p-2 border">Address</th>
                        <th className="p-2 border">Role</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td className="p-2 border">{u.name}</td>
                            <td className="p-2 border">{u.email}</td>
                            <td className="p-2 border">{u.address}</td>
                            <td className="p-2 border">{u.role}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2 className="text-2xl font-bold mb-4">Stores</h2>

            <div className="grid grid-cols-3 gap-2 mb-2">
                <input
                    type="text"
                    placeholder="Filter Name"
                    value={storeFilters.name}
                    onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })}
                    className="border p-1 rounded"
                />
                <input
                    type="email"
                    placeholder="Filter Email"
                    value={storeFilters.email}
                    onChange={(e) => setStoreFilters({ ...storeFilters, email: e.target.value })}
                    className="border p-1 rounded"
                />
                <input
                    type="text"
                    placeholder="Filter Address"
                    value={storeFilters.address}
                    onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })}
                    className="border p-1 rounded"
                />
            </div>

            <table className="min-w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2 border">Store Name</th>
                        <th className="p-2 border">Email</th>
                        <th className="p-2 border">Address</th>
                        <th className="p-2 border">Owner</th>
                        <th className="p-2 border">Average Rating</th>
                    </tr>
                </thead>
                <tbody>
                    {stores.map((s) => (
                        <tr key={s.id}>
                            <td className="p-2 border">{s.name}</td>
                            <td className="p-2 border">{s.email}</td>
                            <td className="p-2 border">{s.address}</td>
                            <td className="p-2 border">{s.owner_name || "N/A"}</td>
                            <td>
                                {s.avgRating !== null && s.avgRating !== undefined
                                    ? Number(s.avgRating).toFixed(1)
                                    : "No ratings"}
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
