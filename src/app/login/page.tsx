import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/shared/logo";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LoginPage() {
  const loginBg = PlaceHolderImages.find(
    (img) => img.id === "login-background"
  );

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      {/* LEFT */}
      <div className="flex items-center justify-center py-12 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
        <div className="mx-auto grid w-[350px] gap-6 bg-white/90 backdrop-blur rounded-xl p-6 shadow-lg">
          <div className="grid gap-2 text-center">
            <Logo className="mb-4 justify-center" />
            <h1 className="text-3xl font-bold font-headline">
              Welcome Back
            </h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>

          <LoginForm />

          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="hidden lg:block relative">
        {loginBg && (
          <Image
            src={loginBg.imageUrl}
            alt={loginBg.description}
            fill
            className="object-cover"
            data-ai-hint={loginBg.imageHint}
          />
        )}
      </div>
    </div>
  );
}
