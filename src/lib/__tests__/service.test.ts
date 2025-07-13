import { toZonedTime } from 'date-fns-tz';
import { determineRefundEligibility, getEffectiveRequestTime, isNewTOS, isOutOfHours } from '../service';
import { ReversalRequest } from '@/types';

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
    
    const result = isNewTOS(mockRequest);
    expect(result).toEqual([new Error('Unknown timezone: Unknown'), undefined]);
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

    const result = isNewTOS(mockRequest);
    expect(result).toEqual([undefined, false]);
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

    const result = isNewTOS(mockRequest);
    expect(result).toEqual([undefined, true]);
  });
});

describe('determineRefundEligibility', () => {
  it('should return true for a valid phone-based request (New TOS)', () => {
    // This is a valid phone-based request
    const mockRequest: ReversalRequest = {
        "name": "Emma Smith",
        "customerTZ": "US (PST)",
        "signupDate": "1/2/2020",
        "source": "phone",
        "investmentDate": "1/2/2021",
        "investmentTime": "06:00",
        "requestDate": "1/2/2021",
        "requestTime": "09:00"
    };

    const result = determineRefundEligibility(mockRequest);
    expect(result).toBe(true);
  });
}); 
