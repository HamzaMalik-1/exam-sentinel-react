import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast'; // ✅ Import Toast
import axiosInstance from '../api/axiosInstance'; // ✅ Import API

// --- VALIDATION SCHEMA ---
// Note: For Login, we usually don't enforce strict regex patterns (like uppercase/symbol)
// to prevent frustrating users who might have old passwords. We just check if it's not empty.
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address format" }),
  
  password: z
    .string()
    .min(1, { message: "Password is required" }),
});

const Login = () => {
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      // ✅ 1. Call API
      const response = await axiosInstance.post('/auth/login', {
        email: data.email,
        password: data.password
      });

      const { token, role, firstName, lastName, email } = response.data.data;

      // ✅ 2. Save Session Data
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', `${firstName} ${lastName}`);

      toast.success("Login Successful!");
if(role === 'admin')
{
  navigate('/admin/classes');

}
      // ✅ 3. Redirect based on Role
    else  if (role === 'teacher') {
        navigate('/teacher/exams');
      } else {
        navigate('/student/exams');
      }

    } catch (error) {
      console.error("Login Error:", error);
      const errorMsg = error.response?.data?.message || "Invalid email or password";
      
      // Show error toast
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card-box" style={{ maxWidth: '400px', width: '100%' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="text-brand" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            ExamSentinel
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Secure AI-Powered Examination</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Email Input */}
          <div>
            <label htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email" 
              placeholder="name@university.edu"
              {...register("email")} 
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
            {errors.email && (
              <p className="text-danger" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              placeholder="••••••••"
              {...register("password")} 
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
            {errors.password && (
              <p className="text-danger" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                {errors.password.message}
              </p>
            )}
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isLoading}
            style={{ marginTop: '10px' }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
          <span 
            onClick={() => navigate('/signup')} 
            className="link-text" 
            style={{ cursor: 'pointer', marginLeft: '5px' }}
          >
            Register
          </span>
        </div>

      </div>
    </div>
  );
};

export default Login;