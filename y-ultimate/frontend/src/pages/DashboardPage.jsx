import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
                <div className="mt-6">
                    <p>Welcome, <span className="font-semibold">{user?.role}</span>!</p>
                    <p>User ID: <span className="font-semibold">{user?.id}</span></p>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
