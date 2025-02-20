

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminApproval = () => {
  const [fields, setFields] = useState([]);

  // ✅ Fetch pending fields from the database
  useEffect(() => {
    fetch("https://localhost:7280/api/fields/my-fields", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setFields(data))
      .catch((error) => console.error("Error fetching fields:", error));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-cover bg-center py-8"
      style={{ backgroundImage: "url('/images/admin_approval_background.jpg')" }}
    >
      <div className="bg-white bg-opacity-70 backdrop-blur-md rounded-lg shadow-lg p-6 w-11/12 max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Admin Approvals</h1>
        {fields.length === 0 ? (
          <p className="text-gray-600 text-center">No approvals to display.</p>
        ) : (
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                <th className="p-4 text-left">Field Name</th>
                <th className="p-4 text-left">Location</th>
                <th className="p-4 text-left">Price</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field.id} className="even:bg-gray-50 odd:bg-white hover:bg-gray-100 transition duration-200">
                  <td className="p-4 border border-gray-300">{field.name}</td>
                  <td className="p-4 border border-gray-300">{field.location}</td>
                  <td className="p-4 border border-gray-300">₹{field.pricePerHour}</td>
                  <td className="p-4 border border-gray-300 font-semibold text-yellow-600">{field.approvalStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminApproval;
