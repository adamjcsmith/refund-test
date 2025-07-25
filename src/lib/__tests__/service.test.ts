import { toZonedTime } from 'date-fns-tz';
import { determineRefundEligibility, getEffectiveRequestTime, getNextBusinessDay9am, isNewTOS, isOutOfHours } from '../service';
import { ReversalRequest } from '@/types';

describe('getNextBusinessDay9am', () => {
  it('should return the next business day 9am for a date on a weekday', () => {
    const result = getNextBusinessDay9am(toZonedTime(new Date('2025-07-11 17:00'), 'Europe/London'));
    expect(result).toEqual([undefined, toZonedTime(new Date('2025-07-14 09:00'), 'Europe/London')]);
  });

  it('should return the next business day (Monday) 9am for a date on a weekend', () => {
    const result = getNextBusinessDay9am(toZonedTime(new Date('2025-07-13 17:00'), 'Europe/London'));
    expect(result).toEqual([undefined, toZonedTime(new Date('2025-07-14 09:00'), 'Europe/London')]);
  });

  it('should return the start of the business day (9am) for any weekday before 9am', () => {
    const result = getNextBusinessDay9am(toZonedTime(new Date('2025-07-11 08:00'), 'Europe/London'));
    expect(result).toEqual([undefined, toZonedTime(new Date('2025-07-11 09:00'), 'Europe/London')]);
  });

  it('should return the start of the next business day (9am) for any weekday after 5pm', () => {
    const result = getNextBusinessDay9am(toZonedTime(new Date('2025-07-09 20:00'), 'Europe/London'));
    expect(result).toEqual([undefined, toZonedTime(new Date('2025-07-10 09:00'), 'Europe/London')]);
  });
})

describe('isOutOfHours', () => {
  it('should return true for a request made after 5pm on a weekday', () => {
    const result = isOutOfHours(toZonedTime(new Date('2025-07-11 17:00'), 'Europe/London'));
    expect(result).toEqual([undefined, true]);
  })
  it('should return false for a request made after 9am on a weekday', () => {
    const result = isOutOfHours(toZonedTime(new Date('2025-07-11 10:00'), 'Europe/London'));
    expect(result).toEqual([undefined, false]);
  })

  it('should return true for a request made before 9am on a weekday', () => {
    const result = isOutOfHours(toZonedTime(new Date('2025-07-11 08:00'), 'Europe/London'));
    expect(result).toEqual([undefined, true]);
  })
  
  it('should return true for a request made on any weekend day', () => {
    const result = isOutOfHours(toZonedTime(new Date('2025-07-13 12:00'), 'Europe/London'));
    expect(result).toEqual([undefined, true]);
  })
})

describe('getEffectiveRequestTime', () => {
  it('should return the request time, as-is, but adjusted to UK time, for a web based request made out of hours', () => {
    const mockRequest: ReversalRequest = {
      name: 'Joe Bloggs',
      customerTZ: 'US (PST)',
      signupDate: '1/2/2020',
      source: 'web app',
      investmentDate: '7/13/2025',
      investmentTime: '18:00',
      requestDate: '7/13/2025',
      requestTime: '19:00' // out of hours UK time
    }

    const result = getEffectiveRequestTime(mockRequest);
    expect(result).toEqual([undefined, toZonedTime(new Date('2025-07-14 03:00'), 'Europe/London')]);
  })

  it('should return the request time, adjusted to the next business day 9am, for a phone-based request made out of hours', () => {
    const mockRequest: ReversalRequest = {
      name: 'Joe Bloggs',
      customerTZ: 'US (PST)',
      signupDate: '1/2/2020',
      source: 'phone',
      investmentDate: '7/13/2025',
      investmentTime: '18:00',
      requestDate: '7/13/2025',
      requestTime: '19:00' // out of hours UK time
    }
    
    const result = getEffectiveRequestTime(mockRequest);
    expect(result).toEqual([undefined, toZonedTime(new Date('2025-07-14 09:00'), 'Europe/London')]);
  })

  it('should return an error for an unsupported source', () => {
    const mockRequest: ReversalRequest = {
      name: 'Joe Bloggs',
      customerTZ: 'US (PST)',
      signupDate: '1/2/2020',
      source: 'unknown',
      investmentDate: '7/13/2025',
      investmentTime: '18:00',
      requestDate: '7/13/2025',
      requestTime: '19:00'
    }

    const result = getEffectiveRequestTime(mockRequest);
    expect(result).toEqual([new Error('Unknown source: unknown'), undefined]);
  })
})

describe('isNewTOS', () => {
  it('Unsupported timezones should be rejected', () => {
    const mockRequest: ReversalRequest = {
      name: 'Emma Smith',
      customerTZ: 'Unknown',
      signupDate: '1/2/2020',
      source: 'phone',
      investmentDate: '1/2/2021',
      investmentTime: '06:00',
      requestDate: '1/2/2021',
      requestTime: '09:00'
    };
    
    const [error, result] = isNewTOS(mockRequest);
    expect(error).toBeDefined();
    expect(result).toBeUndefined();
  });

  it('should return false for a user signup before the new TOS epoch date', () => {
    const mockRequest: ReversalRequest = {
      name: 'Emma Smith',
      customerTZ: 'US (PST)',
      signupDate: '1/2/2020',
      source: 'phone',
      investmentDate: '1/2/2021',
      investmentTime: '06:00',
      requestDate: '1/2/2021',
      requestTime: '09:00'
    };

    const [error, result] = isNewTOS(mockRequest);
    expect(error).toBeUndefined();
    expect(result).toBe(false);
  });

  it('should return true for a user signup after the new TOS epoch date', () => {
    const mockRequest: ReversalRequest = {
      name: 'Emma Smith',
      customerTZ: 'US (PST)',
      signupDate: '1/8/2020',
      source: 'phone',
      investmentDate: '1/8/2021',
      investmentTime: '06:00',
      requestDate: '1/8/2021',
      requestTime: '09:00'
    };

    const [error, result] = isNewTOS(mockRequest);
    expect(error).toBeUndefined();
    expect(result).toBe(true);
  });
});

describe('determineRefundEligibility', () => {
  it('should return false for a new TOS web app-based request made > 16 hours after investment', () => {
    const mockRequest: ReversalRequest = {
      name: 'Jannik Sinner',
      customerTZ: 'Europe (GMT)',
      signupDate: '8/1/2020', // new TOS
      source: 'web app',
      investmentDate: '10/07/2025',
      investmentTime: '08:00',
      requestDate: '11/07/2025',
      requestTime: '08:00'
    }

    const result = determineRefundEligibility(mockRequest);
    expect(result).toEqual([undefined, false]);
  })  

  it('should return false for a new TOS phone-based request made > 24 hours after investment', () => {
    const mockRequest: ReversalRequest = {
      name: 'Jannik Sinner',
      customerTZ: 'Europe (GMT)',
      signupDate: '8/1/2020', // new TOS
      source: 'phone',
      investmentDate: '09/07/2025',
      investmentTime: '08:00',
      requestDate: '10/07/2025',
      requestTime: '05:00' // out of hours
    }

    const result = determineRefundEligibility(mockRequest);
    expect(result).toEqual([undefined, false]);
  })
  
  it('should return false for an old TOS web app-based request made > 8 hours after investment', () => {
    const mockRequest: ReversalRequest = {
      name: 'Jannik Sinner',
      customerTZ: 'Europe (GMT)',
      signupDate: '31/12/2019', // old TOS
      source: 'web app',
      investmentDate: '10/07/2025',
      investmentTime: '12:30',
      requestDate: '10/07/2025',
      requestTime: '20:45'
    }

    const result = determineRefundEligibility(mockRequest);
    expect(result).toEqual([undefined, false]);
  })

  it('should return false for an Old TOS phone-based request made > 4 hours after investment', () => {
    const mockRequest: ReversalRequest = {
      name: 'Jannik Sinner',
      customerTZ: 'Europe (GMT)',
      signupDate: '31/12/2019', // old TOS
      source: 'phone',
      investmentDate: '10/07/2025',
      investmentTime: '12:30',
      requestDate: '10/07/2025',
      requestTime: '16:45'
    }

    const result = determineRefundEligibility(mockRequest);
    expect(result).toEqual([undefined, false]);
  })

  it('should return an error for an unsupported source', () => {
    const mockRequest: ReversalRequest = {
      name: 'Jannik Sinner',
      customerTZ: 'Europe (GMT)',
      signupDate: '31/12/2019', // old TOS
      source: 'unknown',
      investmentDate: '10/07/2025',
      investmentTime: '13:00',
      requestDate: '10/07/2025',
      requestTime: '16:00'
    }

    const result = determineRefundEligibility(mockRequest);
    expect(result).toEqual([new Error('Unknown source: unknown'), undefined]);
  })

  it('should return true for a valid phone-based request (Old TOS)', () => {
    const mockRequest: ReversalRequest = {
      name: 'Jannik Sinner',
      customerTZ: 'Europe (GMT)',
      signupDate: '31/12/2019', // old TOS
      source: 'phone',
      investmentDate: '10/07/2025',
      investmentTime: '13:00',
      requestDate: '10/07/2025',
      requestTime: '16:00'
    };

    const result = determineRefundEligibility(mockRequest);
    expect(result).toEqual([undefined, true]);
  })

  it('should return true for a valid phone-based request (New TOS)', () => {
    const mockRequest: ReversalRequest = {
      name: 'Jannik Sinner',
      customerTZ: 'Europe (GMT)',
      signupDate: '8/1/2020', // new TOS
      source: 'phone',
      investmentDate: '10/07/2025',
      investmentTime: '13:00',
      requestDate: '10/07/2025',
      requestTime: '23:00'
    };

    const result = determineRefundEligibility(mockRequest);
    expect(result).toEqual([undefined, true]);
  })

  it('should return true for a valid web app-based request (Old TOS)', () => {
    const mockRequest: ReversalRequest = {
      name: 'Carlos Alcaraz',
      customerTZ: 'Europe (GMT)',
      signupDate: '31/12/2019', // old TOS
      source: 'web app',
      investmentDate: '13/07/2025',
      investmentTime: '03:00',
      requestDate: '13/07/2025',
      requestTime: '08:00'
    };

    const result = determineRefundEligibility(mockRequest);
    expect(result).toEqual([undefined, true]);
  })
  
  it('should return true for a valid web app-based request (New TOS)', () => {
    // This is a valid web app request made out of hours
    const mockRequest: ReversalRequest = {
      name: 'Carlos Alcaraz',
      customerTZ: 'Europe (GMT)',
      signupDate: '8/1/2020', // new TOS
      source: 'web app',
      investmentDate: '13/07/2025',
      investmentTime: '11:00',
      requestDate: '13/07/2025',
      requestTime: '16:00'
    };

    const result = determineRefundEligibility(mockRequest);
    expect(result).toEqual([undefined, true]);
  });
}); 
