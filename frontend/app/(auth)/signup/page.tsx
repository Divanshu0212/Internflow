"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Zap, ArrowLeft, Check, Loader2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<"student" | "company">("student");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Student fields
    college: "",
    degree: "",
    branch: "",
    graduationYear: "",
    // Company fields
    companyName: "",
    website: "",
    industry: "",
    location: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { signup } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
    // Clear error for the current field as user types
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[id];
      return newErrors;
    });
    if (id === "password" || id === "confirmPassword") {
      deleteErrors(["password", "confirmPassword", "non_field_errors"]);
    }
  };

  const handleRoleChange = (value: "student" | "company") => {
    setRole(value);
    // Clear role-specific errors when changing role
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      if (value === "student") {
        delete newErrors.companyName;
        delete newErrors.website;
      } else {
        delete newErrors.college;
        delete newErrors.degree;
      }
      return newErrors;
    });
  };

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTermsAccepted(e.target.checked);
    if (e.target.checked) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.termsAccepted;
        return newErrors;
      });
    }
  };

  const deleteErrors = (keys: string[]) => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      keys.forEach((key) => delete newErrors[key]);
      return newErrors;
    });
  };

  const validateForm = () => {
    let newErrors: Record<string, string> = {};

    // Common fields validation
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!formData.username.trim()) newErrors.username = "Username is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    if (!termsAccepted) {
      newErrors.termsAccepted = "You must agree to the Terms of Service and Privacy Policy.";
    }

    // Role-specific validation
    if (role === "student") {
      if (!formData.college.trim()) newErrors.college = "College is required.";
      if (!formData.degree.trim()) newErrors.degree = "Degree is required.";
      if (!formData.graduationYear.trim()) newErrors.graduationYear = "Graduation year is required.";
    } else {
      if (!formData.companyName.trim()) newErrors.companyName = "Company name is required.";
      if (!formData.website.trim()) {
        newErrors.website = "Website is required.";
      } else if (!/^https?:\/\/.+\..+/.test(formData.website)) {
        newErrors.website = "Website URL is invalid.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    setSuccessMessage(null); // Clear previous success messages

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password2: formData.confirmPassword,
        role,
        // Include role-specific fields
        ...(role === "student" ? {
          college: formData.college,
          degree: formData.degree,
          branch: formData.branch,
          graduation_year: formData.graduationYear,
        } : {
          company_name: formData.companyName,
          website: formData.website,
          industry: formData.industry,
          location: formData.location,
        })
      };
      
      await signup(userData);
      setSuccessMessage(
        "Registration successful! Please check your email to verify your account."
      );
      // Clear form after successful submission
      setFormData({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        college: "",
        degree: "",
        branch: "",
        graduationYear: "",
        companyName: "",
        website: "",
        industry: "",
        location: "",
      });
      setTermsAccepted(false);
    } catch (err: any) {
      console.error("Signup error:", err);
      if (err) {
        if (typeof err === "string") {
          setErrors({ non_field_errors: err });
        } else if (err.detail) {
          setErrors({ non_field_errors: err.detail });
        } else if (err.message) {
          setErrors({ non_field_errors: err.message });
        } else {
          const newErrors: Record<string, string> = {};
          for (const key in err) {
            if (Array.isArray(err[key])) {
              newErrors[key] = err[key].join(" ");
            } else {
              newErrors[key] = err[key];
            }
          }
          setErrors(newErrors);
        }
      } else {
        setErrors({
          non_field_errors: "An unexpected error occurred during signup.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding (unchanged) */}
        <motion.div className="hidden lg:block space-y-8" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          {/* ... existing branding content ... */}
        </motion.div>

        {/* Right Side - Signup Form */}
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-2 text-center pb-6">
              <div className="lg:hidden flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  InternFlow
                </span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Create Account
              </CardTitle>
              <CardDescription className="text-gray-600">
                Fill in your details to get started
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Global Error Message */}
                {errors.non_field_errors && (
                  <p className="text-red-500 text-sm text-center">
                    {errors.non_field_errors}
                  </p>
                )}
                {successMessage && (
                  <p className="text-emerald-600 text-sm text-center font-medium">
                    {successMessage}
                  </p>
                )}

                {/* Role Selection */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    I am signing up as
                  </Label>
                  <Select value={role} onValueChange={handleRoleChange}>
                    <SelectTrigger className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-700 font-medium">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      className={`h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                        errors.firstName ? "border-red-500" : ""
                      }`}
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-700 font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className={`h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                        errors.lastName ? "border-red-500" : ""
                      }`}
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700 font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    placeholder="johndoe123"
                    className={`h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                      errors.username ? "border-red-500" : ""
                    }`}
                    value={formData.username}
                    onChange={handleChange}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm">{errors.username}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className={`h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                      errors.email ? "border-red-500" : ""
                    }`}
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create password"
                        className={`h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pr-12 ${
                          errors.password ? "border-red-500" : ""
                        }`}
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        className={`h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pr-12 ${
                          errors.confirmPassword ? "border-red-500" : ""
                        }`}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Role-specific fields */}
                {role === "student" ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="college" className="text-gray-700 font-medium">
                          College/University
                        </Label>
                        <Input
                          id="college"
                          placeholder="Stanford University"
                          className={`h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                            errors.college ? "border-red-500" : ""
                          }`}
                          value={formData.college}
                          onChange={handleChange}
                        />
                        {errors.college && (
                          <p className="text-red-500 text-sm">{errors.college}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="degree" className="text-gray-700 font-medium">
                          Degree
                        </Label>
                        <Input
                          id="degree"
                          placeholder="Bachelor of Science"
                          className={`h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                            errors.degree ? "border-red-500" : ""
                          }`}
                          value={formData.degree}
                          onChange={handleChange}
                        />
                        {errors.degree && (
                          <p className="text-red-500 text-sm">{errors.degree}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="branch" className="text-gray-700 font-medium">
                          Branch/Major (Optional)
                        </Label>
                        <Input
                          id="branch"
                          placeholder="Computer Science"
                          className={`h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                            errors.branch ? "border-red-500" : ""
                          }`}
                          value={formData.branch}
                          onChange={handleChange}
                        />
                        {errors.branch && (
                          <p className="text-red-500 text-sm">{errors.branch}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="graduationYear" className="text-gray-700 font-medium">
                          Graduation Year
                        </Label>
                        <Input
                          id="graduationYear"
                          type="number"
                          placeholder="2025"
                          min="2000"
                          max="2050"
                          className={`h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                            errors.graduationYear ? "border-red-500" : ""
                          }`}
                          value={formData.graduationYear}
                          onChange={handleChange}
                        />
                        {errors.graduationYear && (
                          <p className="text-red-500 text-sm">{errors.graduationYear}</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="text-gray-700 font-medium">
                        Company Name
                      </Label>
                      <Input
                        id="companyName"
                        placeholder="Tech Corp Inc."
                        className={`h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                          errors.companyName ? "border-red-500" : ""
                        }`}
                        value={formData.companyName}
                        onChange={handleChange}
                      />
                      {errors.companyName && (
                        <p className="text-red-500 text-sm">{errors.companyName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-gray-700 font-medium">
                          Website
                        </Label>
                        <Input
                          id="website"
                          type="url"
                          placeholder="https://yourcompany.com"
                          className={`h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                            errors.website ? "border-red-500" : ""
                          }`}
                          value={formData.website}
                          onChange={handleChange}
                        />
                        {errors.website && (
                          <p className="text-red-500 text-sm">{errors.website}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry" className="text-gray-700 font-medium">
                          Industry (Optional)
                        </Label>
                        <Input
                          id="industry"
                          placeholder="Technology"
                          className={`h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                            errors.industry ? "border-red-500" : ""
                          }`}
                          value={formData.industry}
                          onChange={handleChange}
                        />
                        {errors.industry && (
                          <p className="text-red-500 text-sm">{errors.industry}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-gray-700 font-medium">
                        Location (Optional)
                      </Label>
                      <Input
                        id="location"
                        placeholder="San Francisco, CA"
                        className={`h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                          errors.location ? "border-red-500" : ""
                        }`}
                        value={formData.location}
                        onChange={handleChange}
                      />
                      {errors.location && (
                        <p className="text-red-500 text-sm">{errors.location}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className={`mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 ${
                      errors.termsAccepted ? "border-red-500" : ""
                    }`}
                    checked={termsAccepted}
                    onChange={handleTermsChange}
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                    I agree to the{" "}
                    <Link href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {errors.termsAccepted && (
                  <p className="text-red-500 text-sm">{errors.termsAccepted}</p>
                )}

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </motion.div>
              </form>

              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500">
                    Or sign up with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" className="h-11 border-gray-200 hover:bg-gray-50">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" className="h-11 border-gray-200 hover:bg-gray-50">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </Button>
                </motion.div>
              </div>

              <div className="text-center">
                <span className="text-gray-600">Already have an account? </span>
                <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}