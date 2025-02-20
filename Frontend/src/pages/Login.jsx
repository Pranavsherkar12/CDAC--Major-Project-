import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validate = () => {
    const newErrors = {};

    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format. Example: user@example.com";
    }

    if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters, include uppercase, number, and special char.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return; // Prevent API call if validation fails

    try {
      const response = await fetch("https://localhost:7280/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", data.role);
        toast.success(`Welcome back, ${data.role.toUpperCase()} 🎉`);

        setTimeout(() => {
          if (data.role.toLowerCase() === "admin") {
            navigate("/admin");
          } else if (["fieldowner", "field_owner"].includes(data.role.toLowerCase())) {
            navigate("/field-owner");
          } else {
            navigate("/customer/homepage");
          }
        }, 2000);
      } else {
        toast.error(data.message || "Login failed!");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: "url('/images/login.jpg')" }}
    >
      <ToastContainer />
      <div className="w-full max-w-md bg-white p-9 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-700">Login</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

          <button
            type="submit"
            className="w-full mt-4 px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;



