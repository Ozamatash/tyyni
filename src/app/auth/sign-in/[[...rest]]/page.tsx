import { SignIn } from "@clerk/nextjs";

export default function ProductSignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white dark:bg-gray-800",
            formButtonPrimary: 'bg-black hover:bg-gray-800 text-sm normal-case',
          }
        }}
        path="/auth/sign-in"
        routing="path"
        signUpUrl="/auth/sign-up"
      />
    </div>
  );
} 