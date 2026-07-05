import type { FormState } from "@/types/retirement";
import { calculateAgeFromBirthDate } from "@/lib/fra";

export type StepErrors = Record<string, string>;

const num = (v: string) => (v === "" ? NaN : Number(v));

export function validateStep(step: number, form: FormState): StepErrors {
  const errors: StepErrors = {};

  if (step === 1) {
    if (!form.birthDate) {
      errors.birthDate = "Enter your birth date.";
    } else {
      const birth = new Date(form.birthDate);
      if (Number.isNaN(birth.getTime())) {
        errors.birthDate = "Enter a valid birth date.";
      } else if (birth > new Date()) {
        errors.birthDate = "Birth date cannot be in the future.";
      } else {
        const age = calculateAgeFromBirthDate(form.birthDate);
        if (age !== null && age < 18) errors.birthDate = "You must be at least 18.";
        if (age !== null && age > 100) errors.birthDate = "Age must be 100 or younger.";
      }
    }

    if (!form.maritalStatus) {
      errors.maritalStatus = "Select marital status.";
    }

    if (form.maritalStatus === "Married") {
      const spouseAge = num(form.spouseAge);
      if (Number.isNaN(spouseAge) || spouseAge < 18 || spouseAge > 100) {
        errors.spouseAge = "Enter spouse age between 18 and 100.";
      }
    }

    const age = form.birthDate ? calculateAgeFromBirthDate(form.birthDate) : num(form.yourAge);
    const targetAge = num(form.targetRetirementAge);
    if (Number.isNaN(targetAge)) {
      errors.targetRetirementAge = "Enter target retirement age.";
    } else if (targetAge < 50 || targetAge > 85) {
      errors.targetRetirementAge = "Target retirement age must be 50–85.";
    } else if (typeof age === "number" && !Number.isNaN(age) && targetAge < age) {
      errors.targetRetirementAge = "Cannot retire before your current age.";
    }

    const life = num(form.lifeExpectancy);
    if (Number.isNaN(life) || life < 65 || life > 110) {
      errors.lifeExpectancy = "Life expectancy must be 65–110.";
    } else if (!Number.isNaN(targetAge) && life <= targetAge) {
      errors.lifeExpectancy = "Must be greater than retirement age.";
    }
  }

  if (step === 3) {
    const spending = num(form.retirementSpending);
    const travel = num(form.travelBudget) || 0;
    if (Number.isNaN(spending) || spending + travel <= 0) {
      errors.retirementSpending = "Enter estimated annual retirement spending.";
    }
  }

  if (step === 4) {
    const claim = num(form.yourClaimAge);
    if (Number.isNaN(claim) || claim < 62 || claim > 70) {
      errors.yourClaimAge = "Claiming age must be 62–70.";
    }
    if (form.maritalStatus === "Married") {
      const spouseClaim = num(form.spouseClaimAge);
      if (Number.isNaN(spouseClaim) || spouseClaim < 62 || spouseClaim > 70) {
        errors.spouseClaimAge = "Spouse claiming age must be 62–70.";
      }
    }
  }

  if (step === 5) {
    const pre = num(form.expectedReturnPre);
    const post = num(form.expectedReturnPost);
    if (Number.isNaN(pre) || pre < -10 || pre > 20) {
      errors.expectedReturnPre = "Return must be between -10% and 20%.";
    }
    if (Number.isNaN(post) || post < -10 || post > 20) {
      errors.expectedReturnPost = "Return must be between -10% and 20%.";
    }
  }

  return errors;
}

export function hasErrors(errors: StepErrors): boolean {
  return Object.keys(errors).length > 0;
}
