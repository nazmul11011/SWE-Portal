"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginFormValues = {
  regNo: string;
  password: string;
};

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const { register, handleSubmit } = useForm<LoginFormValues>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // <-- Loading state
  const router = useRouter();

  const onSubmit = async (data: LoginFormValues) => {
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        regNo: data.regNo,
        password: data.password,
      });

      if (result?.error) {
        setError("Invalid registration number or password");
        setLoading(false);
        return;
      }

      const session = await getSession();
      const userId = session?.user?.id;

      if (userId) {
        router.push("/dashboard");
      } else {
        setError("Could not retrieve user session");
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your registration number and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="regNo">Registration Number</Label>
              <Input
                id="regNo"
                type="number"
                placeholder="202*****"
                {...register("regNo", { required: true })}
              />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="/auth/forget-password"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                {...register("password", { required: true })}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging In..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
