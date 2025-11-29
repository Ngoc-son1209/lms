import React, { useEffect, useState } from "react";
import { authService } from "../../api/auth.service";

export default function AdminInstructorManagement() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInstructors = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/instructors",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const result = await response.json();
      setInstructors(result.data || []);
    } catch (error) {
      console.error("Error loading instructors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Instructor Management</h2>

      <div className="bg-white rounded-xl shadow p-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="p-4 text-center" colSpan="5">
                  Loading...
                </td>
              </tr>
            ) : instructors.length === 0 ? (
              <tr>
                <td className="p-4 text-center" colSpan="5">
                  No instructors found.
                </td>
              </tr>
            ) : (
              instructors.map((ins) => (
                <tr
                  key={ins.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3">{ins.id}</td>
                  <td className="p-3">{ins.name}</td>
                  <td className="p-3">{ins.email}</td>
                  <td className="p-3">{ins.phone}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm ${
                        ins.active ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {ins.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
