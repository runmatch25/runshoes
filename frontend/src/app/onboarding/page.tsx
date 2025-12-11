"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, ArrowLeft, Activity, Ruler, Footprints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useUnitPreferences } from "@/context/UnitPreferencesContext";
import { useAuth } from "@/context/AuthContext";

const experienceOptions = [
  { value: "BEGINNER", label: "Beginner", description: "Just starting out or running occasionally" },
  { value: "INTERMEDIATE", label: "Intermediate", description: "Running regularly, maybe training for a race" },
  { value: "ADVANCED", label: "Advanced", description: "Competitive runner, high mileage" },
  { value: "ELITE", label: "Elite", description: "Professional or sub-elite performance" },
] as const;

const pronationOptions = [
  { value: "NEUTRAL", label: "Neutral", description: "Your foot lands on the outside of the heel and rolls inward slightly to absorb shock." },
  { value: "OVERPRONATION", label: "Overpronation", description: "Your foot rolls inward excessively, common in flat feet." },
  { value: "UNDERPRONATION", label: "Underpronation (Supination)", description: "Your foot rolls outward, common in high arches." },
] as const;

const paceRangeOptionsImperial = [
  { value: "pace-mile-faster-than-6-00", label: "<6:00/mile" },
  { value: "pace-mile-6-00-to-6-59", label: "6:00 – 6:59/mile" },
  { value: "pace-mile-7-00-to-7-59", label: "7:00 – 7:59/mile" },
  { value: "pace-mile-8-00-to-8-59", label: "8:00 – 8:59/mile" },
  { value: "pace-mile-9-00-to-9-59", label: "9:00 – 9:59/mile" },
  { value: "pace-mile-10-00-to-10-59", label: "10:00 – 10:59/mile" },
  { value: "pace-mile-11-00-to-11-59", label: "11:00 – 11:59/mile" },
  { value: "pace-mile-12-00-or-slower", label: "≥12:00/mile" },
] as const;

const paceRangeOptionsMetric = [
  { value: "pace-km-faster-than-3-45", label: "<3:45/km" },
  { value: "pace-km-3-45-to-4-19", label: "3:45 – 4:19/km" },
  { value: "pace-km-4-20-to-4-59", label: "4:20 – 4:59/km" },
  { value: "pace-km-5-00-to-5-39", label: "5:00 – 5:39/km" },
  { value: "pace-km-5-40-to-6-19", label: "5:40 – 6:19/km" },
  { value: "pace-km-6-20-to-6-59", label: "6:20 – 6:59/km" },
  { value: "pace-km-7-00-to-7-29", label: "7:00 – 7:29/km" },
  { value: "pace-km-7-30-or-slower", label: "≥7:30/km" },
] as const;

const weightRangeOptionsImperial = [
  { value: "weight-lbs-under-130", label: "<130 lbs" },
  { value: "weight-lbs-130-150", label: "130 – 150 lbs" },
  { value: "weight-lbs-150-170", label: "150 – 170 lbs" },
  { value: "weight-lbs-170-190", label: "170 – 190 lbs" },
  { value: "weight-lbs-190-210", label: "190 – 210 lbs" },
  { value: "weight-lbs-over-210", label: ">210 lbs" },
] as const;

const weightRangeOptionsMetric = [
  { value: "weight-kg-under-60", label: "<60 kg" },
  { value: "weight-kg-60-70", label: "60 – 70 kg" },
  { value: "weight-kg-70-80", label: "70 – 80 kg" },
  { value: "weight-kg-80-90", label: "80 – 90 kg" },
  { value: "weight-kg-90-100", label: "90 – 100 kg" },
  { value: "weight-kg-over-100", label: ">100 kg" },
] as const;

const steps = [
  { title: "About You", description: "Profile & experience", icon: Activity },
  { title: "Physical Stats", description: "Help us personalize", icon: Ruler },
  { title: "Biomechanics", description: "How you run", icon: Footprints },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, login } = useAuth(); // Need login to update local user state
  const { distanceUnit, weightUnit, weightLabel } = useUnitPreferences();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form State
  const [experience, setExperience] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [useNickname, setUseNickname] = useState<boolean>(false);
  const [paceRange, setPaceRange] = useState<string>("");
  const [weightRange, setWeightRange] = useState<string>("");
  const [pronation, setPronation] = useState<string>("");

  useEffect(() => {
    // If user is already onboarded, redirect to home
    if (user?.onboardingCompleted) {
      router.push("/");
    }
    
    // Autofill name if available (e.g. from Google login)
    if (user?.name && !firstName && !lastName) {
      const parts = user.name.split(" ");
      if (parts.length > 0) {
        setFirstName(parts[0]);
        if (parts.length > 1) {
          setLastName(parts.slice(1).join(" "));
        }
      }
    }
  }, [user, router]);

  const canContinue = useMemo(() => {
    if (activeStep === 0) return Boolean(experience) && Boolean(firstName) && Boolean(lastName);
    if (activeStep === 1) return true; // Optional step
    if (activeStep === 2) return true; // Optional step
    return true;
  }, [activeStep, experience, firstName, lastName]);

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  const isStepComplete = (stepIndex: number) => {
    if (stepIndex === 0) return Boolean(experience) && Boolean(firstName) && Boolean(lastName);
    if (stepIndex === 1) return Boolean(paceRange || weightRange);
    if (stepIndex === 2) return Boolean(pronation);
    return false;
  };

  const submit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const body = {
        name: (firstName && lastName) ? `${firstName} ${lastName}`.trim() : undefined,
        experience,
        nickname: nickname || undefined,
        useNickname,
        paceRange: paceRange || undefined,
        weightRange: weightRange || undefined,
        pronation: pronation || undefined,
        onboardingCompleted: true,
      };

      const res = await fetch("http://localhost:3001/auth/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await res.json();
      login(token, updatedUser);
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <div className="flex-1 container max-w-5xl mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <span className="tracking-widest text-[#007bff] block mb-2 text-sm font-semibold">WELCOME TO RUNSHOES</span>
          <h1 
            className="text-4xl lg:text-6xl leading-[0.9]" 
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}
          >
            LET'S BUILD YOUR<br />
            <span className="text-[#007bff]">RUNNER PROFILE</span>
          </h1>
          <p className="mt-4 text-neutral-600 max-w-2xl text-lg">
            Tell us a bit about yourself so we can recommend the best shoes and connect you with similar runners.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Sidebar Steps */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <div className="relative pl-6">
                <div className="absolute left-[43px] top-0 bottom-0 w-0.5 bg-gray-200" />
                <div 
                  className="absolute left-[43px] top-0 w-0.5 bg-[#007bff] transition-all duration-500"
                  style={{ height: `${(activeStep / (steps.length - 1)) * 100}%` }}
                />

                <div className="space-y-8">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === activeStep;
                    const isComplete = index < activeStep || (index === activeStep && isStepComplete(index));
                    
                    return (
                      <div key={index} className="relative flex items-center gap-4">
                        <div className={cn(
                          "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                          isActive
                            ? "border-[#007bff] bg-[#007bff] text-white shadow-lg scale-110"
                            : isComplete
                            ? "border-[#007bff] bg-white text-[#007bff]"
                            : "border-gray-200 bg-white text-gray-300"
                        )}>
                          {index < activeStep ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className={cn(
                            "text-sm font-bold uppercase tracking-wider transition-colors",
                            isActive ? "text-[#007bff]" : "text-gray-500"
                          )}>
                            {step.title}
                          </p>
                          <p className="text-xs text-gray-400">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Card className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white min-h-[400px]">
            <CardContent className="p-6 lg:p-10">
              {activeStep === 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Tell us about yourself</h2>
                    <p className="text-gray-500 mb-6">This helps us personalize your experience and connect you with others.</p>

                    <div className="space-y-4 mb-8">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block tracking-wider text-sm font-bold uppercase text-gray-500 mb-2">
                            FIRST NAME *
                          </label>
                          <Input
                            placeholder="First name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="border-2 border-gray-200 focus:border-black h-12"
                          />
                        </div>
                        <div>
                          <label className="block tracking-wider text-sm font-bold uppercase text-gray-500 mb-2">
                            LAST NAME *
                          </label>
                          <Input
                            placeholder="Last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="border-2 border-gray-200 focus:border-black h-12"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block tracking-wider text-sm font-bold uppercase text-gray-500 mb-2">
                          Nickname (Optional)
                        </label>
                        <Input
                          placeholder="How should we call you publicly?"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          className="border-2 border-gray-200 focus:border-black h-12"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="useNickname" 
                          checked={useNickname}
                          onCheckedChange={(checked) => setUseNickname(checked as boolean)}
                          disabled={!nickname}
                          className="border-2 border-gray-200 data-[state=checked]:bg-[#007bff] data-[state=checked]:border-[#007bff]"
                        />
                        <label
                          htmlFor="useNickname"
                          className={cn(
                            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                            !nickname ? "text-gray-400" : "text-gray-700"
                          )}
                        >
                          Display nickname for reviews (keeps full name private)
                        </label>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-3 uppercase tracking-wider text-gray-800">Running Experience</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {experienceOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setExperience(opt.value)}
                          className={cn(
                            "p-4 text-left border-2 rounded-lg transition-all hover:shadow-md",
                            experience === opt.value
                              ? "border-[#007bff] bg-blue-50/50 ring-1 ring-[#007bff]"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <div className="font-bold mb-1">{opt.label}</div>
                          <div className="text-sm text-gray-500">{opt.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Physical Stats</h2>
                    <p className="text-gray-500 mb-6">These help us suggest shoes with the right cushioning and stability.</p>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="block tracking-wider text-sm font-bold uppercase text-gray-500 mb-2">
                          Average Pace
                        </label>
                        <Select value={paceRange} onValueChange={setPaceRange}>
                          <SelectTrigger className="border-2 border-gray-200 h-12">
                            <SelectValue placeholder="Select your typical pace" />
                          </SelectTrigger>
                          <SelectContent>
                            {(distanceUnit === "kilometers" ? paceRangeOptionsMetric : paceRangeOptionsImperial).map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="block tracking-wider text-sm font-bold uppercase text-gray-500 mb-2">
                          Weight Range
                        </label>
                        <Select value={weightRange} onValueChange={setWeightRange}>
                          <SelectTrigger className="border-2 border-gray-200 h-12">
                            <SelectValue placeholder={`Select weight (${weightLabel})`} />
                          </SelectTrigger>
                          <SelectContent>
                            {(weightUnit === "kg" ? weightRangeOptionsMetric : weightRangeOptionsImperial).map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
                      <p className="flex items-start gap-2">
                        <Activity className="h-5 w-5 text-[#007bff] shrink-0" />
                        This data helps other runners with a similar build and pace find reviews that are relevant to them.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Biomechanics</h2>
                    <p className="text-gray-500 mb-6">Do you know how your foot lands?</p>

                    <div className="space-y-3">
                      {pronationOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setPronation(opt.value)}
                          className={cn(
                            "w-full p-4 text-left border-2 rounded-lg transition-all hover:shadow-md flex items-start gap-4",
                            pronation === opt.value
                              ? "border-[#007bff] bg-blue-50/50 ring-1 ring-[#007bff]"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <div className={cn(
                            "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                            pronation === opt.value ? "border-[#007bff] bg-[#007bff]" : "border-gray-300"
                          )}>
                            {pronation === opt.value && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <div>
                            <div className="font-bold mb-1">{opt.label}</div>
                            <div className="text-sm text-gray-500">{opt.description}</div>
                          </div>
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setPronation("")}
                        className={cn(
                          "w-full p-3 text-left text-sm text-gray-500 hover:text-[#007bff] transition-colors ml-10",
                          pronation === "" ? "font-semibold text-[#007bff]" : ""
                        )}
                      >
                        I'm not sure / Skip this step
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t-2 border-gray-100">
                <Button
                  variant="ghost"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  className="hover:bg-gray-100 text-gray-600"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                {activeStep < steps.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!canContinue}
                    className="bg-[#007bff] hover:bg-[#0069d9] text-white px-8 h-12 shadow-lg hover:shadow-xl transition-all"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={submit}
                    disabled={loading}
                    className="bg-black hover:bg-neutral-800 text-white px-8 h-12 shadow-lg hover:shadow-xl transition-all"
                  >
                    {loading ? "Saving..." : "Complete Profile"}
                    {!loading && <Check className="h-4 w-4 ml-2" />}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

