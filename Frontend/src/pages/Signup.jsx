

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import emailjs from "emailjs-com";

const BASE_URL = "https://localhost:7280/api";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobile: "",
    customerName: "",
    password: "",
    role: "Customer",
  });

  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const SERVICE_ID = "service_q8l3cse";
  const TEMPLATE_ID = "template_ds2x15q";
  const USER_ID = "UQ46qPVmUEnlkudqL";

  const usernameRegex = /^[a-zA-Z0-9]{5,50}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[987][0-9]{9}$/;
  const customerNameRegex = /^[a-zA-Z ]{5,50}$/; // ✅ Fixed to allow min 5 characters
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const roleRegex = /^(Customer|FieldOwner)$/; // Restrict to allowed roles

  const generateOtp = () => {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otpCode);
    return otpCode;
  };

  const sendOtpToEmail = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const otpCode = generateOtp();
    const templateParams = {
      to_email: formData.email,
      otp: otpCode,
    };

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID);
      toast.success(`OTP sent to ${formData.email}`);
      setStep(2);
    } catch (error) {
      toast.error("Failed to send OTP. Try again.");
    }
  };

  const validate = () => {
    const newErrors = {};
  
    if (!usernameRegex.test(formData.username)) {
      newErrors.username = "Username must be 5-50 alphanumeric characters.";
    }
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email.";
    }
    if (!mobileRegex.test(formData.mobile)) {
      newErrors.mobile = "Mobile must start with 9, 8, or 7 and be 10 digits.";
    }
    if (!customerNameRegex.test(formData.customerName)) {
      newErrors.customerName = "Customer name must be 5-50 alphabetic characters.";
    }
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Password must be atleast 8 chars, include uppercase, number, and special char.";
    }
    if (!roleRegex.test(formData.role)) {
      newErrors.role = "Invalid role selected.";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const registerUser = async (userData) => {
    try {
      const formattedData = {
        username: userData.username,
        email: userData.email,
        mobileNumber: userData.mobile, // ✅ Ensure correct field name
        customerName: userData.customerName,
        password: userData.password,
        role: userData.role,
      };
  
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });
  
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }
  
      return { success: true, message: "Signup successful" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };
  

  const verifyOtp = async (e) => {
    e.preventDefault();

    if (otp !== generatedOtp) {
      toast.error("Invalid OTP. Please check your email.");
      return;
    }

    const result = await registerUser(formData);
    if (result.success) {
      toast.success("Signup successful! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: "url('/images/signup.jpg')" }}
    >
      {/* Background Overlay for Better Readability */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <ToastContainer position="top-center" autoClose={2000} />

      <div className="relative w-full max-w-md bg-white min-h-[500px] bg-opacity-90 backdrop-blur-md p-9 rounded-lg shadow-lg flex flex-col justify-center">
        {step === 1 ? (
          <>
            <h1 className="text-2xl font-bold text-center mb-6">Sign Up</h1>
            <form onSubmit={sendOtpToEmail} className="space-y-4">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
              {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

              <input
                type="tel"
                name="mobile"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
              {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}

              <input
                type="text"
                name="customerName"
                placeholder="Full Name"
                value={formData.customerName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              >
                <option value="Customer">Customer</option>
                <option value="FieldOwner">Field Owner</option>
              </select>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold px-4 py-3 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Sign Up
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center mb-6">OTP Verification</h1>
            <form onSubmit={verifyOtp} className="space-y-4">
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={otp}
                onChange={handleOtpChange}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white font-semibold px-4 py-3 rounded-md hover:bg-green-700 transition duration-300"
              >
                Verify OTP
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Signup;





