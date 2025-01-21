import { SignIn } from "@clerk/nextjs";

export default function ProductSignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white dark:bg-gray-800",
          }
        }}
        path="/auth/sign-in"
        routing="path"
        signUpUrl="/auth/sign-up"
        afterSignInUrl="/dashboard"
      />
    </div>
  );
} 