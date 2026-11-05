import { normalizePhoneNumber } from '../../src/utils/phone';

describe('Step 1 Farmer Registration Phone Error & State Management', () => {
  // Simulates Step 1 registration form state transitions
  interface FormState {
    regFullName: string;
    regPhone: string;
    regError: string | null;
    isSubmitting: boolean;
  }

  const createInitialState = (): FormState => ({
    regFullName: 'Ram Mahajan',
    regPhone: '+919665537301',
    regError: null,
    isSubmitting: false,
  });

  const handlePhoneChange = (state: FormState, newPhone: string): FormState => {
    return {
      ...state,
      regPhone: newPhone,
      regError: null, // Clear previous registration error when phone changes
    };
  };

  const handleStartSubmit = (state: FormState): { nextState: FormState; payload?: any } => {
    // Clear stale errors when a new registration attempt begins
    const cleanedState: FormState = {
      ...state,
      regError: null,
      isSubmitting: true,
    };

    const rawInput = cleanedState.regPhone.trim();
    if (!rawInput) {
      return {
        nextState: {
          ...cleanedState,
          regError: 'Please provide a contact phone number for climate advisory dispatches.',
          isSubmitting: false,
        },
      };
    }

    const formattedPhone = normalizePhoneNumber(rawInput);
    const cleanDigits = formattedPhone.replace(/\D/g, '');
    if (cleanDigits.length < 10 || cleanDigits.length > 15) {
      return {
        nextState: {
          ...cleanedState,
          regError: 'Please provide a valid 10-15 digit mobile phone number.',
          isSubmitting: false,
        },
      };
    }

    return {
      nextState: cleanedState,
      payload: {
        full_name: cleanedState.regFullName.trim(),
        phone_number: formattedPhone,
      },
    };
  };

  const handleApiResponse = (
    state: FormState,
    response: { success: boolean; status?: number; error?: string }
  ): FormState => {
    if (response.success) {
      return {
        ...state,
        isSubmitting: false,
        regError: null,
      };
    }

    return {
      ...state,
      isSubmitting: false,
      regError: response.error || 'Registration failed',
    };
  };

  // Test 1: Phone Normalization Rules
  it('normalizes mobile numbers across different user input formats', () => {
    expect(normalizePhoneNumber('9876543210')).toBe('+919876543210');
    expect(normalizePhoneNumber('+91 98765 43210')).toBe('+919876543210');
    expect(normalizePhoneNumber('09876543210')).toBe('+919876543210');
    expect(normalizePhoneNumber('+919665537301')).toBe('+919665537301');
    expect(normalizePhoneNumber('+1 (415) 555-2671')).toBe('+14155552671');
    expect(normalizePhoneNumber('')).toBe('');
    expect(normalizePhoneNumber('   ')).toBe('');
  });

  // Test 2: Change phone after a 409 response; old error disappears
  it('clears previous 409 registration error immediately when user edits the phone number', () => {
    let state = createInitialState();

    // 1. Initial attempt fails with 409 conflict on old phone
    state = handleApiResponse(state, {
      success: false,
      status: 409,
      error: "Farmer with phone '+919665537301' is already registered with another account.",
    });

    expect(state.regError).toContain('+919665537301');
    expect(state.regError).toContain('already registered with another account');

    // 2. User edits the phone number to +919876543210
    state = handlePhoneChange(state, '+919876543210');

    // 3. Old error banner MUST be cleared and null
    expect(state.regError).toBeNull();
    expect(state.regPhone).toBe('+919876543210');
  });

  // Test 3: Submit a new phone number; request payload contains the new value
  it('submits a new phone number and ensures request payload contains the new normalized value', () => {
    let state = createInitialState();

    // User updates the phone input with formatting (spaces and country code)
    state = handlePhoneChange(state, '+91 98765 43210');

    // Submit new registration attempt
    const { nextState, payload } = handleStartSubmit(state);

    expect(nextState.isSubmitting).toBe(true);
    expect(nextState.regError).toBeNull();
    expect(payload).toBeDefined();
    // Ensures backend receives the latest phone number from form state, not previously captured value
    expect(payload.phone_number).toBe('+919876543210');
    expect(payload.phone_number).not.toBe('+919665537301');
  });

  // Test 4: A new 409 displays the phone number from that latest response
  it('displays a conflict message only for the phone number returned by the latest failed API request', () => {
    let state = createInitialState();

    // First failed attempt
    state = handleApiResponse(state, {
      success: false,
      status: 409,
      error: "Farmer with phone '+919665537301' is already registered with another account.",
    });
    expect(state.regError).toContain('+919665537301');

    // User updates phone to +919876543210
    state = handlePhoneChange(state, '+919876543210');
    expect(state.regError).toBeNull();

    // Start submit clears any stale error
    const { nextState } = handleStartSubmit(state);
    state = nextState;
    expect(state.regError).toBeNull();

    // Second failed attempt returns 409 for the NEW phone number
    state = handleApiResponse(state, {
      success: false,
      status: 409,
      error: "Farmer with phone '+919876543210' is already registered with another account.",
    });

    // Error banner now strictly shows the new phone number, not the old one
    expect(state.regError).toContain('+919876543210');
    expect(state.regError).not.toContain('+919665537301');
  });

  // Test 5: Successful registration with new phone clears any errors
  it('successfully completes registration with unused phone without stale errors', () => {
    let state = createInitialState();

    state = handlePhoneChange(state, '9822334455');
    const { nextState, payload } = handleStartSubmit(state);
    expect(payload.phone_number).toBe('+919822334455');

    state = handleApiResponse(nextState, {
      success: true,
      status: 201,
    });

    expect(state.regError).toBeNull();
    expect(state.isSubmitting).toBe(false);
  });
});
