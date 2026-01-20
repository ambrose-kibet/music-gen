import CardWrapper from "@/components/auth/card-wrapper";
import LoginForm from "@/components/auth/login-form";
import RegistrationForm from "@/components/auth/registration-form";
import ToggleAuth from "@/components/auth/toggle-auth";
import { useState } from "react";

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const toggleAuth = () => setIsLogin((prev) => !prev);

  return (
    <div className="min-w-screen flex min-h-screen flex-col items-center justify-center px-2">
      <CardWrapper
        toggleAuth={<ToggleAuth isLogin={isLogin} toggleAuth={toggleAuth} />}
        headerLabel={
          isLogin
            ? "Welcome back"
            : isVerifying
            ? "Verify your account"
            : "Create an account"
        }
      >
        {isLogin ? (
          <LoginForm />
        ) : (
          <RegistrationForm
            isVerifying={isVerifying}
            setIsVerifying={setIsVerifying}
          />
        )}
      </CardWrapper>
    </div>
  );
};
export default AuthPage;
