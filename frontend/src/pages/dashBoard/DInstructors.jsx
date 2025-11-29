import React, { useEffect, useState } from "react";
import { authService } from "../../api/auth.service";

export default function Instructors() {
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/admin/instructors", {
        headers: authService.getAuthHeader(),
      });
      const data = await response.json();
      setInstructors(data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-blue-900">
        Instructor Management
      </h2>

      <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {instructors.map((ins) => (
            <tr key={ins.id} className="border-b hover:bg-gray-100">
              <td className="p-3">{ins.id}</td>
              <td className="p-3">{ins.name}</td>
              <td className="p-3">{ins.email}</td>
              <td className="p-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    ins.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {ins.enabled ? "Active" : "Disabled"}
                </span>
              </td>
              <td className="p-3">
                <button className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mr-2">
                  Edit
                </button>
                <button className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600">
                  Disable
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {instructors.length === 0 && (
        <p className="text-center text-gray-600 py-4">No instructors found.</p>
      )}
    </div>
  );
}
