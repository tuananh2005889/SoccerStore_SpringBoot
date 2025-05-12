import { useState } from "react";
import { FiUser, FiLock, FiMail, FiPhone } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({
    userName: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    userName: "",
    fullName: "",
    gmail: "",
    password: "",
    address: "",
    phone: "",
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
  };

  const switchTab = (tab: "login" | "signup") => {
    setDirection(tab === "login" ? "left" : "right");
    setActiveTab(tab);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/auth/login", loginForm);
      if (response.data?.token) {
        toast.success("Login successful!");
        localStorage.setItem("token", response.data.token);
        navigate("/");
      } else {
        toast.error("Invalid credentials!");
      }
    } catch (error) {
      toast.error("Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:8080/auth/signup", {
        userName: signupForm.userName,
        fullName: signupForm.fullName,   
        gmail:    signupForm.gmail,     
        password: signupForm.password,
        phone:    signupForm.phone,
        address: signupForm.address,
      });
      toast.success("Registration successful!");
      switchTab("login");
      setSignupForm({ userName: "", fullName: "", gmail: "", password: "", address: "", phone: "" });
    } catch (error: any) {
      console.error("Signup error:", error.response?.data || error.message);
      toast.error("Registration failed: " + (error.response?.data || ""));
    } finally {
      setLoading(false);
    }
  };
  

  const tabVariants = {
    hidden: (direction: "left" | "right") => ({
      x: direction === "right" ? 50 : -50,
      opacity: 0,
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: (direction: "left" | "right") => ({
      x: direction === "right" ? -50 : 50,
      opacity: 0,
      transition: { duration: 0.2 },
    }),
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.2, duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Tabs */}
          <div className="relative bg-gray-50">
            <div className="flex">
              {["login", "signup"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => switchTab(tab as "login" | "signup")}
                  className={`flex-1 py-5 text-center font-medium text-sm relative z-10 ${
                    activeTab === tab ? "text-green-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "login" ? "Login" : "Sign Up"}
                </button>
              ))}
            </div>
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-green-600"
              animate={{
                x: activeTab === "login" ? 0 : "100%",
                width: "50%",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          </div>

          {/* Forms */}
          <div className="p-8 relative h-[600px] overflow-hidden">
            <AnimatePresence custom={direction} mode="wait">
              {activeTab === "login" ? (
                <motion.div
                  key="login"
                  custom={direction}
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute inset-0 p-8"
                >
                  <motion.form
                    onSubmit={handleLogin}
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Welcome Back</h2>
                    <div className="space-y-4">
                      <InputField icon={<FiUser />} name="userName" placeholder="Username" value={loginForm.userName} onChange={handleLoginChange} />
                      <InputField icon={<FiLock />} name="password" type="password" placeholder="Password" value={loginForm.password} onChange={handleLoginChange} />
                    </div>
                    <SubmitButton loading={loading} text="Sign In" />
                    <BottomSwitchTab text="Don't have an account?" onClick={() => switchTab("signup")} />
                  </motion.form>
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  custom={direction}
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute inset-0 p-8"
                >
                  <motion.form
                    onSubmit={handleSignup}
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Create Account</h2>
                    <div className="space-y-4">
                      <InputField icon={<FiUser />} name="userName" placeholder="Username" value={signupForm.userName} onChange={handleSignupChange} />
                      <InputField icon={<FiUser />} name="fullName" placeholder="Full Name" value={signupForm.fullName} onChange={handleSignupChange} />
                      <InputField icon={<FiMail />} name="gmail" type="gmail" placeholder="Email" value={signupForm.gmail} onChange={handleSignupChange} />
                      <InputField icon={<FiLock />} name="password" type="password" placeholder="Password" value={signupForm.password} onChange={handleSignupChange} />
                      <InputField icon={<FiLock />} name="address" type="text" placeholder="Address" value={signupForm.address} onChange={handleSignupChange} />
                      <InputField icon={<FiPhone />} name="phone" placeholder="Phone Number" value={signupForm.phone} onChange={handleSignupChange} />
                    </div>
                    <SubmitButton loading={loading} text="Create Account" />
                    <BottomSwitchTab text="Already have an account?" onClick={() => switchTab("login")} />
                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Reusable input field
const InputField = ({
  icon,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  name: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      {icon}
    </div>
    <input
      name={name}
      type={type}
      required
      value={value}
      onChange={onChange}
      className="w-full pl-10 pr-4 py-3 border-b border-gray-300 focus:border-green-500 focus:outline-none bg-transparent transition-colors"
      placeholder={placeholder}
    />
  </div>
);

// Reusable submit button
const SubmitButton = ({ loading, text }: { loading: boolean; text: string }) => (
  <div className="pt-2">
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70"
    >
      {loading ? (
        <div className="flex justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        text
      )}
    </button>
  </div>
);

// Reusable switch-tab text
const BottomSwitchTab = ({ text, onClick }: { text: string; onClick: () => void }) => (
  <div className="text-center pt-4">
    <button
      type="button"
      className="text-sm text-gray-500 hover:text-green-600 transition-colors"
      onClick={onClick}
    >
      {text} <span className="font-medium">Click here</span>
    </button>
  </div>
);

export default Login;
