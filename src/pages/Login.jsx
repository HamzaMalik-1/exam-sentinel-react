import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form'; 
import { z } from 'zod';                   
import { zodResolver } from '@hookform/resolvers/zod'; 

// --- UPDATED VALIDATION SCHEMA ---
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address format" }),
  
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Must contain at least one number" })
    .regex(/[\W_]/, { message: "Must contain at least one special character (!@#$)" }),
});

const Login = () => {
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    setIsLoading(true);

    setTimeout(() => {
      const { email } = data; 
      
      let detectedRole = 'student'; 
      if (email.includes('teacher') || email.includes('admin')) {
        detectedRole = 'teacher';
      }

      localStorage.setItem('userRole', detectedRole);
      localStorage.setItem('userEmail', email);

      if (detectedRole === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
      
      setIsLoading(false);
    }, 1000); 
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card-box" style={{ maxWidth: '400px', width: '100%' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="text-brand" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            ExamSentinel
          </h1>
          {/* Direct variable usage ensures this subtitle also switches correctly */}
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

          {serverError && (
            <div style={{ padding: '10px', background: 'rgba(220, 38, 38, 0.1)', borderRadius: '6px' }}>
              <p className="text-danger" style={{ fontSize: '0.9rem', textAlign: 'center', margin: 0 }}>
                {serverError}
              </p>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isLoading}
            style={{ marginTop: '10px' }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* --- THE FIX IS HERE --- */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
          {/* We use inline style to force the variable usage */}
          <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
          <span onClick={()=> navigate('/signup')} className="link-text" style={{ cursor: 'pointer', marginLeft: '5px' }}>Register</span>
        </div>

      </div>
    </div>
  );
};

export default Login;