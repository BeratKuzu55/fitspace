import { useMemo } from 'react';

interface Params {
  password: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  fullName?: string;
}

export function usePasswordRules({
  password,
  firstName = '',
  lastName = '',
  email = '',
  fullName = '',
}: Params) {
  return useMemo(() => {
    const pwd = password;

    const lowerCaseRegex = /[a-z]/;
    const upperCaseRegex = /[A-Z]/;
    const numberRegex = /[0-9]/;
    const symbolRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
    const spaceRegex = /\s/;

    const commonPasswords = [
      'password',
      '12345678',
      'qwerty',
      'abc123',
      'password123',
    ];

    const personalInfo = [
      firstName.toLowerCase(),
      lastName.toLowerCase(),
      email.split('@')[0]?.toLowerCase(),
      fullName.toLowerCase(),
    ].filter(Boolean);

    const containsPersonalInfo = personalInfo.some(info =>
      pwd.toLowerCase().includes(info),
    );

    const isCommon = commonPasswords.some(common =>
      pwd.toLowerCase().includes(common),
    );

    return {
      minMaxLength: pwd.length >= 8 && pwd.length <= 64,
      lowercase: lowerCaseRegex.test(pwd),
      uppercase: upperCaseRegex.test(pwd),
      number: numberRegex.test(pwd),
      symbol: symbolRegex.test(pwd),
      noSpace: !spaceRegex.test(pwd),
      notCommon: !isCommon && pwd.length > 0,
      noPersonalInfo: !containsPersonalInfo || pwd.length === 0,
      isValid:
        pwd.length > 0 &&
        pwd.length >= 8 &&
        pwd.length <= 64 &&
        lowerCaseRegex.test(pwd) &&
        upperCaseRegex.test(pwd) &&
        numberRegex.test(pwd) &&
        symbolRegex.test(pwd) &&
        !spaceRegex.test(pwd) &&
        !isCommon &&
        !containsPersonalInfo,
    };
  }, [password, firstName, lastName, email, fullName]);
}
