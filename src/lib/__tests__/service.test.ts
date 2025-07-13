import { toZonedTime } from 'date-fns-tz';
import { determineRefundEligibility, getEffectiveRequestTime, isNewTOS } from '../service';
import { ReversalRequest } from '@/types';

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
