import { SignUp } from "@clerk/nextjs";

export default function ProductSignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white dark:bg-gray-800",
          }
        }}
        path="/auth/sign-up"
        routing="path"
        signInUrl="/auth/sign-in"
        afterSignUpUrl="/dashboard"
      />
    </div>
  );
} 