import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast'; // ✅ Import Toast
import axiosInstance from '../api/axiosInstance'; // Ensure path is correct

// --- VALIDATION SCHEMA ---
const signupSchema = z.object({
  firstName: z.string().min(2, { message: "First Name required" }),
  lastName: z.string().min(2, { message: "Last Name required" }),
  email: z.string().email({ message: "Invalid email address" }),
  role: z.enum(["student", "teacher"], { message: "Please select a role" }),
  password: z
    .string()
    .min(8, { message: "Min 8 chars" })
    .regex(/[A-Z]/, { message: "Needs uppercase" })
    .regex(/[a-z]/, { message: "Needs lowercase" })
    .regex(/[0-9]/, { message: "Needs number" })
    .regex(/[\W_]/, { message: "Needs symbol" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

const Signup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "student"
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      // 1. Call the API
      const response = await axiosInstance.post('/auth/signup', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role
      });

      console.log("Registered User:", response.data);
      const { token, role, firstName, lastName, email } = response.data.data;

      // 2. Save Data to LocalStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', `${firstName} ${lastName}`);

      // ✅ 3. Success Toast & Redirect
      toast.success("Account created successfully!");
      navigate('/'); 
      
    } catch (error) {
      console.error("Signup Error:", error);
      
      const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
      
      // ✅ 4. Error Toast
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', padding: '20px' }}>
      <div className="card-box" style={{ maxWidth: '500px', width: '100%' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="text-brand" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Join ExamSentinel today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* --- ROW 1: First Name & Last Name --- */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label htmlFor="firstName">First Name</label>
              <input 
                id="firstName"
                placeholder="John"
                {...register("firstName")}
              />
              {errors.firstName && <p className="text-danger" style={{ fontSize: '0.8rem', marginTop: '4px' }}>{errors.firstName.message}</p>}
            </div>

            <div>
              <label htmlFor="lastName">Last Name</label>
              <input 
                id="lastName"
                placeholder="Doe"
                {...register("lastName")}
              />
              {errors.lastName && <p className="text-danger" style={{ fontSize: '0.8rem', marginTop: '4px' }}>{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email"
              placeholder="name@university.edu"
              {...register("email")}
            />
            {errors.email && <p className="text-danger" style={{ fontSize: '0.85rem', marginTop: '4px' }}>{errors.email.message}</p>}
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="role">I am a...</label>
            <select id="role" {...register("role")} style={{ cursor: 'pointer' }}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
            {errors.role && <p className="text-danger" style={{ fontSize: '0.85rem', marginTop: '4px' }}>{errors.role.message}</p>}
          </div>

          {/* --- ROW 2: Password & Confirm Password --- */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label htmlFor="password">Password</label>
              <input 
                id="password"
                type="password"
                placeholder="••••••"
                {...register("password")}
              />
              {errors.password && <p className="text-danger" style={{ fontSize: '0.8rem', marginTop: '4px' }}>{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword">Confirm</label>
              <input 
                id="confirmPassword"
                type="password"
                placeholder="••••••"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && <p className="text-danger" style={{ fontSize: '0.8rem', marginTop: '4px' }}>{errors.confirmPassword.message}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isLoading}
            style={{ marginTop: '10px' }}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Footer Link */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
          <span 
            className="link-text" 
            style={{ cursor: 'pointer', marginLeft: '5px' }}
            onClick={() => navigate('/')}
          >
            Sign In
          </span>
        </div>

      </div>
    </div>
  );
};

export default Signup;