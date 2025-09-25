"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { requestOtpAction, verifyOtpAction } from "./actions";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "otp" | "done">("email");
  const [regNo, setRegNo] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);

  const handleRequestOtp = async () => {
    setIsOtpSent(true);
    const res = await requestOtpAction(regNo, email);
    if (res.success) {
      toast.success("OTP sent to your email");
      setStep("otp");
    } else {
      toast.error(res.message);
      setIsOtpSent(false); // re-enable if failed
    }
  };

  const handleVerifyOtp = async () => {
    const res = await verifyOtpAction(regNo, email, otp);
    if (res.success) {
      toast.success("New password sent to your email");
      setStep("done");
    } else toast.error(res.message);
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader>
              <CardTitle>Forgot Password</CardTitle>
              <CardDescription>
                {step === "email" &&
                  "Enter your registration number and email given during admission."}
                {step === "otp" &&
                  "We’ve sent a 6-digit OTP to your email. Enter it below to reset your password."}
                {step === "done" &&
                  "Your new password has been sent to your email."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === "email" && (
                <div className="flex flex-col gap-4">
                  <div>
                    <Label htmlFor="regNo" className="mb-2">Registration No</Label>
                    <Input
                      id="regNo"
                      placeholder="e.g. 20******01"
                      value={regNo}
                      onChange={(e) => setRegNo(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-2">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleRequestOtp}
                    disabled={isOtpSent}
                  >
                    {isOtpSent ? "OTP Sent" : "Send OTP"}
                  </Button>
                </div>
              )}

              {step === "otp" && (
                <div className="flex flex-col items-center gap-6">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  <Button className="w-full" onClick={handleVerifyOtp}>
                    Verify OTP
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRequestOtp}
                    disabled={isOtpSent}
                  >
                    {isOtpSent ? "Please wait ..." : "Resend OTP"}
                  </Button>
                </div>
              )}

              {step === "done" && (
                <div className="text-center space-y-2">
                  <p className="text-green-600 font-medium">
                    Password Reset Successful
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your new password has been sent to your registered email.
                    Please check your inbox (and spam folder).
                  </p>
                  <Button className="w-full mt-2" onClick={() => window.location.href = "/auth/signin"}>
                    Back to Login
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}