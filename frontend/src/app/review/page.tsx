"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Step,
  StepLabel,
  Stepper,
  Typography,
  TextField,
  Rating,
  MenuItem,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type ShoeOption = { id: number; label: string; brand: string; model: string };

const fitOptions = [
  { value: "SMALL", label: "Runs small" },
  { value: "TRUE_TO_SIZE", label: "True to size" },
  { value: "BIG", label: "Runs big" },
] as const;

const cushionOptions = [
  { value: "SOFT", label: "Soft" },
  { value: "BALANCED", label: "Balanced" },
  { value: "FIRM", label: "Firm" },
] as const;

const stabilityOptions = [
  { value: "NEUTRAL", label: "Neutral" },
  { value: "MODERATE_SUPPORT", label: "Moderate support" },
  { value: "HIGH_SUPPORT", label: "High support" },
] as const;

export default function ReviewWizardPage() {
  const router = useRouter();
  const { user } = useAuth() as any;

  // Step management
  const [activeStep, setActiveStep] = useState(0);

  // Step 1: shoe selection
  const [shoes, setShoes] = useState<ShoeOption[]>([]);
  const [shoeInput, setShoeInput] = useState("");
  const [selectedShoe, setSelectedShoe] = useState<ShoeOption | null>(null);

  // Step 2: qualitative fields
  const [fit, setFit] = useState<typeof fitOptions[number]["value"] | "TRUE_TO_SIZE">("TRUE_TO_SIZE");
  const [cushion, setCushion] = useState<typeof cushionOptions[number]["value"] | "BALANCED">("BALANCED");
  const [stability, setStability] = useState<typeof stabilityOptions[number]["value"] | "NEUTRAL">("NEUTRAL");

  // Step 3: mileage and pace
  const [mileage, setMileage] = useState<string>("");
  const [paceMinutes, setPaceMinutes] = useState<string>("");
  const [paceSeconds, setPaceSeconds] = useState<string>("");

  // Step 4: rating + text
  const [rating, setRating] = useState<number | null>(3);
  const [comment, setComment] = useState<string>("");

  // Load shoes once
  useEffect(() => {
    (async () => {
      const res = await fetch("http://localhost:3001/shoes");
      const data = await res.json();
      const options: ShoeOption[] = (data || []).map((s: any) => ({
        id: s.id,
        brand: s.brand,
        model: s.model,
        label: `${s.brand} ${s.model}`,
      }));
      setShoes(options);
    })();
  }, []);

  const canContinue = useMemo(() => {
    if (activeStep === 0) return Boolean(selectedShoe);
    if (activeStep === 1) return Boolean(fit && cushion && stability);
    if (activeStep === 2) return Boolean(mileage && (paceMinutes !== "") && (paceSeconds !== ""));
    if (activeStep === 3) return Boolean(rating && comment);
    return true;
  }, [activeStep, selectedShoe, fit, cushion, stability, mileage, paceMinutes, paceSeconds, rating, comment]);

  const handleNext = () => setActiveStep((s) => Math.min(s + 1, 4));
  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  async function submit() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      alert("Please login first");
      return;
    }

    const body = {
      shoeId: selectedShoe?.id!,
      rating,
      comment,
      fit,
      cushion,
      stability,
      mileage: mileage ? Number(mileage) : undefined,
      paceMinutes: paceMinutes === "" ? undefined : Number(paceMinutes),
      paceSeconds: paceSeconds === "" ? undefined : Number(paceSeconds),
    } as any;

    const res = await fetch("http://localhost:3001/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      alert(`Failed: ${err}`);
      return;
    }
    router.push(`/shoes/${selectedShoe?.id}`);
  }

  return (
    <Box sx={{ maxWidth: 820, mx: "auto", px: 2, pt: 10, pb: 6 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Review your shoe</Typography>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {[
          "Choose shoe",
          "Fit, cushion, stability",
          "Mileage & pace",
          "Rating & review",
          "Overview",
        ].map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Which shoe?</Typography>
          <Autocomplete
            options={shoes}
            value={selectedShoe}
            inputValue={shoeInput}
            onInputChange={(_, v) => setShoeInput(v)}
            onChange={(_, v) => setSelectedShoe(v)}
            renderInput={(params) => (
              <TextField {...params} label="Search shoes" placeholder="Type brand or model" />
            )}
            filterOptions={(opts, state) =>
              opts.filter((o) => o.label.toLowerCase().includes(state.inputValue.toLowerCase()))
            }
          />
        </Box>
      )}

      {activeStep === 1 && (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" } }}>
          <TextField select label="Fit" value={fit} onChange={(e) => setFit(e.target.value as any)}>
            {fitOptions.map((o) => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Cushion" value={cushion} onChange={(e) => setCushion(e.target.value as any)}>
            {cushionOptions.map((o) => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Stability" value={stability} onChange={(e) => setStability(e.target.value as any)}>
            {stabilityOptions.map((o) => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </TextField>
        </Box>
      )}

      {activeStep === 2 && (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" } }}>
          <TextField label="Mileage on shoe" type="number" inputProps={{ min: 0 }} value={mileage} onChange={(e) => setMileage(e.target.value)} helperText="Enter total miles or km" />
          <TextField label="Avg pace minutes" type="number" inputProps={{ min: 0 }} value={paceMinutes} onChange={(e) => setPaceMinutes(e.target.value)} />
          <TextField label="Avg pace seconds" type="number" inputProps={{ min: 0, max: 59 }} value={paceSeconds} onChange={(e) => setPaceSeconds(e.target.value)} />
        </Box>
      )}

      {activeStep === 3 && (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Star rating</Typography>
          <Rating value={rating} onChange={(_, v) => setRating(v)} size="large" />
          <TextField multiline minRows={4} sx={{ mt: 2 }} fullWidth label="Your review" value={comment} onChange={(e) => setComment(e.target.value)} />
        </Box>
      )}

      {activeStep === 4 && (
        <Box sx={{ display: "grid", gap: 1 }}>
          <Typography variant="subtitle1">Confirm your review</Typography>
          <Typography>shoe: {selectedShoe?.label}</Typography>
          <Typography>fit: {fit}</Typography>
          <Typography>cushion: {cushion}</Typography>
          <Typography>stability: {stability}</Typography>
          <Typography>mileage: {mileage || "-"}</Typography>
          <Typography>pace: {paceMinutes || "-"}m {paceSeconds || "-"}s</Typography>
          <Typography>rating: {rating}/5</Typography>
          <Typography>your weight: {user?.weight ?? "n/a"}</Typography>
          <Typography sx={{ mt: 1, opacity: 0.8 }}>{comment}</Typography>
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
        {activeStep < 4 && (
          <Button variant="contained" disabled={!canContinue} onClick={handleNext}>Continue</Button>
        )}
        {activeStep === 4 && (
          <Button variant="contained" color="primary" onClick={submit}>Submit review</Button>
        )}
      </Box>
    </Box>
  );
}


