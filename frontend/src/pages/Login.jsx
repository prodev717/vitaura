import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const formRef = useRef(null);
  const inputRefs = useRef([]);
  const buttonRef = useRef(null);
  const footerRef = useRef(null);
  const badgeRefs = useRef([]);
  const iconRefs = useRef([]);
  const linksRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Logo animation with pulse
      gsap.from(logoRef.current, {
        scale: 0,
        rotation: -180,
        opacity: 0,
        duration: 1,
        ease: 'elastic.out(1, 0.5)',
      });

      gsap.to(logoRef.current, {
        scale: 1.05,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Title cascade animation
      gsap.from(titleRef.current, {
        y: -60,
        opacity: 0,
        duration: 0.8,
        delay: 0.4,
        ease: 'back.out(1.7)',
      });

      gsap.from(subtitleRef.current, {
        y: -40,
        opacity: 0,
        duration: 0.6,
        delay: 0.6,
      });

      // Stagger badges
      gsap.from(badgeRefs.current, {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        stagger: 0.15,
        delay: 0.8,
        ease: 'back.out(1.7)',
      });

      // Form card entrance
      gsap.from(containerRef.current, {
        scale: 0.85,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: 'power3.out',
      });

      // Stagger form inputs
      inputRefs.current.forEach((input, index) => {
        if (input) {
          gsap.from(input, {
            x: index % 2 === 0 ? -80 : 80,
            opacity: 0,
            duration: 0.6,
            delay: 1 + index * 0.15,
            ease: 'power2.out',
          });
        }
      });

      // Animate icons
      iconRefs.current.forEach((icon, index) => {
        if (icon) {
          gsap.from(icon, {
            scale: 0,
            rotation: 180,
            opacity: 0,
            duration: 0.5,
            delay: 1.1 + index * 0.15,
            ease: 'back.out(2)',
          });
        }
      });

      // Links animation
      gsap.from(linksRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        delay: 1.4,
      });

      // Button entrance with bounce
      gsap.from(buttonRef.current, {
        y: 50,
        scale: 0,
        opacity: 0,
        duration: 0.7,
        delay: 1.6,
        ease: 'elastic.out(1, 0.6)',
      });

      // Footer slide up
      gsap.from(footerRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.5,
        delay: 1.8,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      gsap.to(buttonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      });
      console.log('Form submitted:', { ...formData, rememberMe });
    } else {
      gsap.to(formRef.current, {
        x: -10,
        duration: 0.1,
        repeat: 5,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }
  };

  const handleInputFocus = (e) => {
    const input = e.currentTarget;
    gsap.to(input, {
      scale: 1.02,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleInputBlur = (e) => {
    const input = e.currentTarget;
    gsap.to(input, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card Container */}
        <div ref={containerRef} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Section with Civic Theme */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-10 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-4 right-4 w-32 h-32 border-4 border-white rounded-full" />
              <div className="absolute bottom-4 left-4 w-24 h-24 border-4 border-white rounded-full" />
            </div>
            
            <div className="relative text-center space-y-4">
              {/* Logo/Icon */}
              <div ref={logoRef} className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h1 ref={titleRef} className="text-3xl font-bold tracking-tight">
                  Welcome Back
                </h1>
                <p ref={subtitleRef} className="text-blue-100 text-sm font-medium">
                  Sign in to access your civic dashboard
                </p>
              </div>

              {/* Feature badges */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <div ref={(el) => (badgeRefs.current[0] = el)} className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secure Access
                </div>
                <div ref={(el) => (badgeRefs.current[1] = el)} className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  24/7 Available
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <form ref={formRef} onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Email Field */}
            <div ref={(el) => (inputRefs.current[0] = el)}>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div 
                  ref={(el) => (iconRefs.current[0] = el)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className={`relative w-full pl-12 pr-4 py-3.5 rounded-lg border-2 ${
                    errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  } focus:border-blue-500 focus:bg-white transition-all duration-300 outline-none text-gray-800 z-0`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div ref={(el) => (inputRefs.current[1] = el)}>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div 
                  ref={(el) => (iconRefs.current[1] = el)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className={`relative w-full pl-12 pr-12 py-3.5 rounded-lg border-2 ${
                    errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  } focus:border-blue-500 focus:bg-white transition-all duration-300 outline-none text-gray-800 z-0`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200 z-10"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div ref={linksRef} className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                  Remember me
                </span>
              </label>
              <a 
                href="#" 
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              ref={buttonRef}
              type="submit"
              className="relative w-full mt-6 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg transition-all duration-300 group-hover:from-blue-700 group-hover:to-indigo-800" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-blue-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative flex items-center justify-center gap-2 py-4 text-white font-bold text-base tracking-wide">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In to Portal
              </span>
            </button>

            {/* Info Box */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Access your dashboard to view, track, and manage all your civic reports in one place. Your reports make a difference.
                </p>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div ref={footerRef} className="px-8 pb-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200">
              Sign Up Here
            </a>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Secure & Verified by Municipal Authority
          </p>
        </div>
      </div>
    </div>
  );
}