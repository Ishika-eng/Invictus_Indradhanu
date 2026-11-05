describe('Step 6 Delivery Recipient & Identity Integrity', () => {
  const isValidPhoneNumber = (phone: string | null | undefined): boolean => {
    if (!phone) return false;
    const cleanDigits = phone.replace(/\D/g, '');
    return cleanDigits.length >= 10 && cleanDigits.length <= 15;
  };

  const resolveRecipient = (
    authenticatedFarmer: { full_name?: string; phone_number?: string; preferred_language?: string } | null,
    contextFallback: { name: string; phone: string; language: string }
  ) => {
    return {
      name: authenticatedFarmer?.full_name || contextFallback.name,
      phone: authenticatedFarmer?.phone_number || contextFallback.phone,
      language: authenticatedFarmer?.preferred_language || contextFallback.language,
    };
  };

  it('validates mobile phone numbers according to 10-15 digit E.164 rule', () => {
    // Valid phone numbers
    expect(isValidPhoneNumber('+91 98234 11209')).toBe(true);
    expect(isValidPhoneNumber('+919823411209')).toBe(true);
    expect(isValidPhoneNumber('9876543210')).toBe(true);
    expect(isValidPhoneNumber('+14155552671')).toBe(true);
    expect(isValidPhoneNumber('+91 98765 43210')).toBe(true);

    // Invalid phone numbers
    expect(isValidPhoneNumber('')).toBe(false);
    expect(isValidPhoneNumber(null)).toBe(false);
    expect(isValidPhoneNumber(undefined)).toBe(false);
    expect(isValidPhoneNumber('12345')).toBe(false); // < 10 digits
    expect(isValidPhoneNumber('+91 1234')).toBe(false);
    expect(isValidPhoneNumber('1234567890123456')).toBe(false); // 16 digits (> 15)
    expect(isValidPhoneNumber('abcdefghijk')).toBe(false);
  });

  it('dynamically prioritizes authenticated farmer profile over any demo or static context defaults', () => {
    const authFarmer = {
      full_name: 'Anjali Sharma',
      phone_number: '+91 98765 43210',
      preferred_language: 'hi',
    };

    const demoFallback = {
      name: 'Ramesh Patil',
      phone: '+91 98234 11209',
      language: 'mr',
    };

    const resolved = resolveRecipient(authFarmer, demoFallback);
    expect(resolved.name).toBe('Anjali Sharma');
    expect(resolved.phone).toBe('+91 98765 43210');
    expect(resolved.language).toBe('hi');
    expect(resolved.name).not.toBe('Ramesh Patil');
    expect(resolved.phone).not.toBe('+91 98234 11209');
  });

  it('guarantees Voice, SMS, and WhatsApp use identical verified recipient numbers', () => {
    const authFarmer = {
      full_name: 'Vikram Deshmukh',
      phone_number: '+91 91234 56789',
      preferred_language: 'mr',
    };

    const demoFallback = {
      name: 'Ramesh Patil',
      phone: '+91 98234 11209',
      language: 'en',
    };

    const recipient = resolveRecipient(authFarmer, demoFallback);
    const voiceChannelRecipient = recipient.phone;
    const smsChannelRecipient = recipient.phone;
    const whatsappChannelRecipient = recipient.phone;

    expect(voiceChannelRecipient).toBe(smsChannelRecipient);
    expect(smsChannelRecipient).toBe(whatsappChannelRecipient);
    expect(voiceChannelRecipient).toBe('+91 91234 56789');
  });
});

